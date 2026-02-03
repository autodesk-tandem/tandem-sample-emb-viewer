/**
 * Authentication Module
 * 
 * Handles OAuth 2.0 PKCE flow for Autodesk Platform Services.
 * Manages token storage, refresh, and session state.
 */

import { getEnv } from './config.js';

let refreshHandle = null;

/**
 * Generate a random string for PKCE code verifier
 */
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

/**
 * Generate SHA-256 code challenge from verifier
 */
async function generateCodeChallenge(verifier) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return window.btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Initiate OAuth login flow
 */
export async function login() {
    const env = getEnv();
    const scope = 'data:read data:write user-profile:read';
    const codeVerifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(codeVerifier);
    
    window.localStorage.setItem('codeVerifier', codeVerifier);
    
    const url = new URL('https://developer.api.autodesk.com/authentication/v2/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', env.apsKey);
    url.searchParams.append('redirect_uri', env.loginRedirect);
    url.searchParams.append('scope', scope);
    url.searchParams.append('code_challenge', challenge);
    url.searchParams.append('code_challenge_method', 'S256');
    
    window.location.href = url.toString();
}

/**
 * Clear session and reload page
 */
export function logout() {
    delete window.sessionStorage.token;
    delete window.sessionStorage.refreshToken;
    delete window.sessionStorage.tokenExpiry;
    
    if (refreshHandle) {
        clearTimeout(refreshHandle);
        refreshHandle = null;
    }
    
    window.location.reload();
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code, codeVerifier) {
    const env = getEnv();
    
    const payload = {
        'grant_type': 'authorization_code',
        'client_id': env.apsKey,
        'code_verifier': codeVerifier,
        'code': code,
        'redirect_uri': env.loginRedirect
    };
    
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Object.keys(payload)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
            .join('&')
    });
    
    if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Refresh the access token
 */
async function refreshToken() {
    console.log('Refreshing token...');
    
    if (refreshHandle) {
        clearTimeout(refreshHandle);
        refreshHandle = null;
    }
    
    try {
        const env = getEnv();
        const token = window.sessionStorage.refreshToken;
        
        const payload = {
            'grant_type': 'refresh_token',
            'client_id': env.apsKey,
            'refresh_token': token
        };
        
        const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: Object.keys(payload)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
                .join('&')
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const newToken = await response.json();
        console.log('Token refreshed successfully');
        
        storeToken(newToken);
        scheduleRefresh(newToken.expires_in);
        
    } catch (error) {
        console.error('Token refresh error:', error);
        logout();
    }
}

/**
 * Store token in session storage
 */
function storeToken(tokenData) {
    window.sessionStorage.token = tokenData.access_token;
    window.sessionStorage.refreshToken = tokenData.refresh_token;
    window.sessionStorage.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
}

/**
 * Schedule token refresh before expiry
 */
function scheduleRefresh(expiresIn) {
    const refreshDelay = (expiresIn - 60) * 1000; // Refresh 1 minute before expiry
    console.log(`Scheduling token refresh in ${Math.round(refreshDelay / 1000)}s`);
    refreshHandle = setTimeout(refreshToken, refreshDelay);
}

/**
 * Load user profile image
 */
async function loadUserProfile() {
    const response = await fetch('https://api.userprofile.autodesk.com/userinfo', {
        headers: { 'Authorization': `Bearer ${window.sessionStorage.token}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to load user profile');
    }
    
    return await response.json();
}

/**
 * Check login state and handle OAuth callback
 * Returns user info if logged in, null otherwise
 */
export async function checkLogin() {
    const url = new URL(window.location);
    
    // Handle OAuth callback
    if (url.searchParams.has('code')) {
        console.log('OAuth callback received');
        const code = url.searchParams.get('code');
        const codeVerifier = window.localStorage.getItem('codeVerifier');
        
        if (code && codeVerifier) {
            try {
                console.log('Exchanging authorization code for token...');
                const tokenData = await exchangeCodeForToken(code, codeVerifier);
                console.log('Token received successfully');
                
                storeToken(tokenData);
                scheduleRefresh(tokenData.expires_in);
                
            } catch (error) {
                console.error('Token exchange failed:', error);
            }
            
            // Clean up URL
            url.searchParams.delete('code');
            window.history.replaceState({}, document.title, url.pathname + url.search);
        }
    }
    
    // Check if we have a valid token
    if (window.sessionStorage.token) {
        try {
            const user = await loadUserProfile();
            
            // Schedule token refresh if not already scheduled
            if (!refreshHandle && window.sessionStorage.refreshToken) {
                const tokenExpiry = parseInt(window.sessionStorage.tokenExpiry || '0');
                const timeUntilExpiry = tokenExpiry - Date.now();
                const refreshDelay = timeUntilExpiry > 60000 ? timeUntilExpiry - 60000 : 0;
                
                console.log(`Scheduling token refresh in ${Math.round(refreshDelay / 1000)}s (restored session)`);
                refreshHandle = setTimeout(refreshToken, refreshDelay);
            }
            
            return user;
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            return null;
        }
    }
    
    return null;
}

/**
 * Get the current access token
 */
export function getAccessToken() {
    return window.sessionStorage.token;
}

/**
 * Check if user is currently logged in
 */
export function isLoggedIn() {
    return !!window.sessionStorage.token;
}

