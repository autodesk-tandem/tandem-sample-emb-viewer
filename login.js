import { getEnv } from './env.js';

// get our URL and Keys from the environment.js config file
const env = getEnv();

  // helper functions to get/show/hide HTML elements
const getElem = (id) => {return document.getElementById(id)};
const show = (id) => { getElem(id).style.display="block"};
const hide = (id) => { getElem(id).style.display="none"};


export function login(prompt) {
  const scope = 'data:read data:write user-profile:read';
  doRedirection(env.forgeKey, scope, prompt);
}

export function logout() {
  window.sessionStorage.removeItem('token');
  location.reload();
};

  // when HTML page opens up, attach callbacks for login.logout and set values for current state UI
export async function checkLogin(idStr_login, idStr_logout, idStr_userProfile, idStr_viewer) {

  getElem(idStr_login).addEventListener("click", () => login(true));
  getElem(idStr_logout).addEventListener("click", () => logout());

  if (!!location.hash)
      setTokenStorage();
  let isLoggedIn = false;
  let user = undefined;

  if (window.sessionStorage.token) {
    user = await checkUserProfile(window.sessionStorage.token);

    if (user) {
      isLoggedIn = true;
    }
  }
  if (isLoggedIn) {
    hide(idStr_login);
    show(idStr_logout);
    show(idStr_userProfile);
    loadUserProfileImg(idStr_userProfile, user);
    location.hash="";
  }
  else {
    hide(idStr_logout);
    hide(idStr_userProfile);
  }
  return isLoggedIn;
}

export function doRedirection(forge_clientID, scope, prompt) {
  const redirect_uri = location.href.split('#')[0];
  const url = new URL(`${env.forgeHost}/authentication/v2/authorize`);

  url.searchParams.append('response_type', 'token');
  url.searchParams.append('client_id', forge_clientID);
  url.searchParams.append('redirect_uri', redirect_uri);
  url.searchParams.append('scope', scope);
  if (prompt) {
    url.searchParams.append('prompt', 'login');
  }
  location.href = url.toString();
}

export function setTokenStorage() {
  const params = location.hash.slice(1).split('&').map(i=>{
    return i.split('=') });
  const token = params.find(i => i[0] === "access_token");

  if (token) {
    window.sessionStorage.setItem('token', token[1]);
  }
  const tokenExpiration = params.find(i => i[0] === "expires_in");

  if (tokenExpiration) {
    const timeout = parseInt(tokenExpiration[1]) - 60;

    setTimeout(() => {
      login(false);
    }, timeout * 1000);
  }
}

  // look up the profile image for this user's Autodesk ID and put in the specified <div> in the DOM
export async function checkUserProfile(token) {
    let result = undefined;

    try {
        const res = await fetch(`https://api.userprofile.autodesk.com/userinfo`, {
            headers : { "Authorization":`Bearer ${token}`}
        });
        const user = await res.json();

        result = user;
    }
    catch (err) {
        console.error(err);
    }
    return result;
}

export async function loadUserProfileImg(div, user) {
  getElem(div).src = user.picture;
}
