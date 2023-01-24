
import * as vw_stubs from './vw_stubs.js';
import * as td_utils from './td_utils.js';
import { getEnv } from '../env.js';

const td_baseURL = getEnv().tandemDbBaseURL;  // get PROD/STG from config file
const td_baseURL_v2 = getEnv().tandemDbBaseURL_v2;  // get PROD/STG from config file

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer " + window.sessionStorage.token); // use our login to the app


  // dump the result of the function to the Console debug window for the browser
function showResult(obj) {
  console.log("Result from Tandem DB Server -->", obj);
}

/***************************************************
** FUNC: restGetFacilityInfo()
** DESC: get the information about a given Facility
**********************/

export async function restGetFacilityInfo() {

  console.group("STUB: restGetFacilityInfo()");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const facilityURN = DT_APP.currentFacility.twinId;  // here we will get it from the currently loaded Facility.

  const requestPath = td_baseURL + `/twins/${facilityURN}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then((response) => response.json())
    .then((obj) => {
      showResult(obj);
    })
    .catch(error => console.log('error', error));

  console.groupEnd();
}

/***************************************************
** FUNC: restGetGroups()
** DESC: Get the user groups (teams)
**********************/

export async function restGetGroups() {

  console.group("STUB: restGetGroups()");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const requestPath = td_baseURL + `/groups`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then((response) => response.json())
    .then((obj) => {
      showResult(obj);
    })
    .catch(error => console.log('error', error));

  console.groupEnd();
}

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

/***************************************************
** FUNC: utilGetSchema()
** DESC: given a modelURN, find the schema for this particular model.  This is a utilty function to retrieve it since
**  we need it in multiple other fucitons.
**********************/

export async function utilGetSchema(modelURN) {

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const requestPath = td_baseURL + `/modeldata/${modelURN}/schema`;
  console.log(requestPath);

  let response = await fetch(requestPath, requestOptions);
  return response;
}

/***************************************************
** FUNC: restGetSchema()
** DESC: get the schema information so we can look up qualified prop names
**********************/

export async function restGetSchema(modelURN) {

  console.group("STUB: restGetSchema()");

  await utilGetSchema(modelURN)
    .then((response) => response.json())
    .then((obj) => {
      showResult(obj);
    })
    .catch(error => console.log('error', error));

  console.groupEnd();
}

/***************************************************
** FUNC: restGetQualifiedProperty()
** DESC: lookup the qualified property info for a given [Category, Name] in a given model
**********************/

export async function restGetQualifiedProperty() {

  console.group("STUB: restGetQualifiedProperty()");

  const modelURN = "urn:adsk.dtm:fTIXhuewSxuROOMTHC5yUQ";
  const categoryName = "External IDs";
  const propName = "Maximo_ID";

  await utilGetSchema(modelURN)
    .then((response) => response.json())
    .then((obj) => {
      showResult(obj);  // dump intermediate result...
      const attrs = obj.attributes;
      let foundAttr = null;
      for (let i=0; i<attrs.length; i++) {
        if ((attrs[i].category === categoryName) && (attrs[i].name === propName)) {
          foundAttr = attrs[i];
          break;
        }
      }
      if (foundAttr)
        console.log(`Qualified Propname for [${categoryName} | ${propName}]:`, foundAttr)
      else
        console.log(`Could not find [${categoryName} | ${propName}]`);
    })
    .catch(error => console.log('error', error));

  console.groupEnd();
}

/***************************************************
** FUNC: restScanQualifiedProperty()
** DESC: scan the DB for elements with a given property
**********************/

export async function restScanQualifiedProperty() {

  console.group("STUB: restScanQualifiedProperty()");

  const modelURN = "urn:adsk.dtm:k5ZZZkIYQ9ixvxFDVBNoTg";
  //const categoryName = "External IDs";
  //const propName = "Maximo_ID";
  const qualProp = "z:5Ac";

  let raw = JSON.stringify({
    "qualifiedColumns": [
      qualProp
    ],
    "includeHistory": false
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  const requestPath = td_baseURL + `/modeldata/${modelURN}/scan`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then((response) => response.json())
    .then((obj) => {
      showResult(obj);
    })
    .catch(error => console.log('error', error));

// TBD: waiting on bugfix for V2 version of /scan
  /*const requestPath2 = td_baseURL_v2 + `/modeldata/${modelURN}/scan`;
  console.log(requestPath2);

  await fetch(requestPath2, requestOptions)
    .then((response) => response.json())
    .then((obj) => {
      showResult(obj);
    })
    .catch(error => console.log('error', error));*/

  console.groupEnd();
}
