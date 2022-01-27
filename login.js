const avp = Autodesk.Viewing.Private;
const av = Autodesk.Viewing;

// these are for internal Adsk staging accounts
const forgeHost = 'developer-stg.api.autodesk.com';
const forgeKey = 'qGQp6HR6IRjSTPebAPYSC9DSzne8NEYS';

// these are for PROD
//const forgeHost = 'developer.api.autodesk.com';
//const forgeKey = 'RoeNvKJVPJoPr615usmL5RFSA5N81G39';

const redirect = encodeURIComponent('http://localhost:8080');
const scopes = encodeURIComponent(['data:read', 'data:write', 'data:create'].join(' '));

function isTokenExpired(token) {
  const { exp = 0 } = JSON.parse(atob(token.split('.')[1])) || {};
  const expirationMilliSeconds = exp * 1000;
  return expirationMilliSeconds < Date.now();
}

function parseHash() {
  let params = {},
    queryString = window.location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g,
    m;
  while ((m = regex.exec(queryString))) {
    params[m[1]] = m[2];
  }
  return params;
}

export function logMeIn() {
    const token = window.sessionStorage.token || parseHash().access_token;

    const loginUrl = `https://${forgeHost}/authentication/v1/authorize?response_type=token&client_id=${forgeKey}&redirect_uri=${redirect}&scope=${scopes}`;

    if (!token || isTokenExpired(token)) {
      window.location.href = loginUrl;
      return;
    } else {
      window.sessionStorage.token = token;
      window.location.hash = '';
    }

    let cookie;
    if (avp.useCookie) {
      cookie = new Promise((resolve, reject) => {
        av.refreshCookie(token, resolve, reject);
      });
    } else {
      //If cookie is not used, store the access token in the global authorization header var
      av.endpoint.HTTP_REQUEST_HEADERS['Authorization'] = 'Bearer ' + token;
      cookie = Promise.resolve();
    }

    return cookie;
}
