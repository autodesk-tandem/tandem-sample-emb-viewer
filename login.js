import { getEnv } from './env.js';

// get our URL and Keys from the environment.js config file
const env = getEnv();

  // helper functions to get/show/hide HTML elements
const getElem = (id) => {return document.getElementById(id)};
const show = (id) => { getElem(id).style.display="block"};
const hide = (id) => { getElem(id).style.display="none"};

// remember timeoout handle for token refresh
let refreshHandle = null;

export async function login() {
  const scope = 'data:read data:write user-profile:read';

  await doRedirection(env.apsKey, scope);
}

export function logout() {
  delete(window.sessionStorage.token);
  delete(window.sessionStorage.refreshToken);
  delete(window.sessionStorage.tokenExpiry);
  
  if (refreshHandle) {
    clearTimeout(refreshHandle);
    refreshHandle = null;
  }
  location.reload();
};

  // when HTML page opens up, attach callbacks for login.logout and set values for current state UI
export async function checkLogin(idStr_login, idStr_logout, idStr_userProfile) {

  getElem(idStr_login).addEventListener("click", async () => {
    await login();
  });
  getElem(idStr_logout).addEventListener("click", logout);
  const url = new URL(location);

  if (url.searchParams.has('code')) {
    console.log('✅ OAuth callback received');
    const code = url.searchParams.get('code');
    const codeVerifier = window.localStorage.getItem('codeVerifier');

    if (code && codeVerifier) {
      try {
        console.log('🔄 Exchanging authorization code for token...');
        const payload = {
          'grant_type': 'authorization_code',
          'client_id': env.apsKey,
          'code_verifier': codeVerifier,
          'code': code,
          'redirect_uri': env.loginRedirect
        };
        const resp = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: Object.keys(payload).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])).join('&')
        });
        
        if (resp.ok) {
          const token = await resp.json();
          console.log('✅ Token received successfully');

          // save token
          window.sessionStorage.token = token['access_token'];
          window.sessionStorage.refreshToken = token['refresh_token'];
          
          // Store token expiry time for future reference
          const expiryTime = Date.now() + (token['expires_in'] * 1000);
          window.sessionStorage.tokenExpiry = expiryTime;
          
          // schedule token refresh
          const nextRefresh = token['expires_in'] - 60;
          console.log(`⏰ Scheduling token refresh in ${nextRefresh}s`);
          
          refreshHandle = setTimeout(() => refreshToken(), nextRefresh * 1000);
        }
      } catch (err) {
        console.error(err);
      }
      // remove code from URL
      url.searchParams.delete('code');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }
  let loggedIn = false;

  if (window.sessionStorage.token) {
    try {
      await loadUserProfileImg(idStr_userProfile);
      loggedIn = true;
      
      // Schedule token refresh if not already scheduled
      // This handles cases where the page was refreshed or reopened
      if (!refreshHandle && window.sessionStorage.refreshToken) {
        const tokenExpiry = parseInt(window.sessionStorage.tokenExpiry || '0');
        const now = Date.now();
        const timeUntilExpiry = tokenExpiry - now;
        
        // If token expires in more than 1 minute, schedule refresh 1 minute before expiry
        // Otherwise, refresh immediately
        const refreshDelay = timeUntilExpiry > 60000 ? timeUntilExpiry - 60000 : 0;
        
        console.log(`⏰ Scheduling token refresh in ${Math.round(refreshDelay / 1000)}s (restored session)`);
        refreshHandle = setTimeout(() => refreshToken(), refreshDelay);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  }
  if (loggedIn) {
    hide(idStr_login);
    show(idStr_logout);
    show(idStr_userProfile);
    return true;  // they are logged in
  }
  else {
    hide(idStr_logout);
    hide(idStr_userProfile);
    return false; // they are not logged in
  }
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    
    window.crypto.getRandomValues(array);
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }
    return result;
}

async function generateCodeChallenge(str) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  
    return window.btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function doRedirection(aps_clientID, scope) {
    const redirect_uri = env.loginRedirect;
    const codeVerifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(codeVerifier);

    window.localStorage.setItem('codeVerifier', codeVerifier);
    const url = new URL('https://developer.api.autodesk.com/authentication/v2/authorize');
      
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', aps_clientID);
    url.searchParams.append('redirect_uri', redirect_uri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('code_challenge', challenge);
    url.searchParams.append('code_challenge_method', 'S256');

    location.href = url.toString();
}

export function setTokenStorage() {
    const params = location.hash.slice(1).split('&').map(i=>{
        return i.split('=') });
    if (params[0][0]=="access_token") {
        window.sessionStorage.token = params[0][1];
    }
}

  // look up the profile image for this user's Autodesk ID and put in the specified <div> in the DOM
export async function loadUserProfileImg(div) {
    const res = await fetch(`https://api.userprofile.autodesk.com/userinfo`, {
        headers : { "Authorization":`Bearer ${window.sessionStorage.token}` }
    });
    const user = await res.json();
    getElem(div).src = user.picture;
}

async function refreshToken() {
    console.log('🔄 Refreshing token...');

    if (refreshHandle) {
        clearTimeout(refreshHandle);
        refreshHandle = null;
    }
    
    try {
        const token = window.sessionStorage.refreshToken;
        const payload = {
            'grant_type': 'refresh_token',
            'client_id': env.apsKey,
            'refresh_token': token,
        };
        const resp = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: Object.keys(payload).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])).join('&')
        });
        
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        
        const newToken = await resp.json();
        console.log('✅ Token refreshed successfully');

        window.sessionStorage.token = newToken['access_token'];
        window.sessionStorage.refreshToken = newToken['refresh_token'];
        
        // Store token expiry time for future reference
        const expiryTime = Date.now() + (newToken['expires_in'] * 1000);
        window.sessionStorage.tokenExpiry = expiryTime;
        
        // Schedule next token refresh
        const nextRefresh = newToken['expires_in'] - 60;
        console.log(`⏰ Scheduling next token refresh in ${nextRefresh}s`);

        refreshHandle = setTimeout(() => refreshToken(), nextRefresh * 1000);
    } catch (err) {
        console.error('❌ Token refresh error:', err);
        logout();
    }
}