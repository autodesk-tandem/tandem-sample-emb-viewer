import { loadViewer } from './lmv.js';

const forge_clientID = "rZboPCXwdKnmxeByCWbX7Fz1YGmIjGja";    // TODO: use your own Forge ClientID
const defaultFacilityURN = "adsk.dtt:xtjxkHI-TZu58yBNTArt6A"; // TODO: use your own Facility

  // helper functions to get/show/hide HTML elements
const getElem = (id) => {return document.getElementById(id)};
const show = (id) => { getElem(id).style.display="block"};
const hide = (id) => { getElem(id).style.display="none"};


export function login() {
  doRedirection(forge_clientID, "data:read");
}

export function logout() {
  delete(window.sessionStorage.token);
  location.reload();
};

  // when HTML page opens up, attach callbacks for login.logout and set values for current state UI
export function checkLogin(idStr_login, idStr_logout, idStr_userProfile, idStr_viewer) {

  getElem(idStr_login).addEventListener("click", login);
  getElem(idStr_logout).addEventListener("click", logout);

  if (!!location.hash)
      setTokenStorage();

  if (window.sessionStorage.token) {
    hide(idStr_login);
    show(idStr_logout);
    show(idStr_userProfile);
    loadUserProfileImg(idStr_userProfile);
    location.hash="";
    //loadViewer(idStr_viewer, defaultFacilityURN);
  }
  else {
    hide(idStr_logout);
    hide(idStr_userProfile);
  }
}

export function doRedirection(forge_clientID, scope) {
    const redirect_uri = encodeURIComponent(location.href.split('#')[0]);
    location.href = `https://developer.api.autodesk.com/authentication/v1/authorize?response_type=token&client_id=${forge_clientID}&redirect_uri=${redirect_uri}&scope=${encodeURIComponent(scope)}`;
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
    const res = await fetch( 'https://developer.api.autodesk.com/userprofile/v1/users/@me', {
        headers : { "Authorization":`Bearer ${window.sessionStorage.token}`}
    });
    const user = await res.json();
    getElem(div).src = user.profileImages.sizeX40;
}
