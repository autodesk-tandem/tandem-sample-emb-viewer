import { getEnv } from '../env.js';

const tdApp_baseURL = getEnv().tandemAppBaseURL;  // get PROD/STG from config file

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer " + window.sessionStorage.token); // use our login to the app

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

  // dump the result of the function to the Console debug window for the browser
function showResult(result) {
  const obj = JSON.parse(result);
  console.log("Result from TandemAppServer -->", obj);
}

/***************************************************
** FUNC: getSavedViews()
** DESC: Call the TandemAppServer and get the Saved Views associated with the current facility
**********************/

export async function getSavedViews() {
  console.group("STUB: getSavedViews()");

  const facilityURN = DT_APP.currentFacility.twinId;

  const requestPath = tdApp_baseURL + `/views/${facilityURN}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getSavedViewByUUID()
** DESC: Call the TandemAppServer and get the Saved View with the given ID
**********************/

export async function getSavedViewByUUID(viewUUID) {
  console.group("STUB: getSavedViews()");

  const facilityURN = DT_APP.currentFacility.twinId;

  const requestPath = tdApp_baseURL + `/views/${facilityURN}/${viewUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getClassifications()
** DESC: Call the TandemAppServer and get the Classifications associated with the current group
**********************/

export async function getClassifications() {
  console.group("STUB: getClassifications()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;

  const requestPath = tdApp_baseURL + `/groups/${groupId}/classifications`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getClassificationByUUID()
** DESC: Call the TandemAppServer and get the Classification with given UUID
**********************/

export async function getClassificationByUUID(classifUUID) {
  console.group("STUB: getClassificationByUUID()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;

  const requestPath = tdApp_baseURL + `/groups/${groupId}/classifications/${classifUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getFacilityTemplates()
** DESC: Call the TandemAppServer and get the FacilityTemplates associated with the current group
**********************/

export async function getFacilityTemplates() {
  console.group("STUB: getFacilityTemplates()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;

  const requestPath = tdApp_baseURL + `/groups/${groupId}/facility-templates`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getFacilityTemplateByUUID()
** DESC: Call the TandemAppServer and get the FacilityTemplate with the given UUID
**********************/

export async function getFacilityTemplateByUUID(templateUUID) {
  console.group("STUB: getFacilityTemplateByUUID()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;
  //const templateUUID = DT_APP.currentFacility.settings.template.uuid; // NOTE: you can look for a potential value here

  const requestPath = tdApp_baseURL + `/groups/${groupId}/facility-templates/${templateUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getParameters()
** DESC: Call the TandemAppServer and get the Parameters associated with the current group
**********************/

export async function getParameters() {
  console.group("STUB: getParameters()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;

  const requestPath = tdApp_baseURL + `/groups/${groupId}/params`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getParameterByUUID()
** DESC: Call the TandemAppServer and get the ParameterSet with the given UUID
**********************/

export async function getParameterByUUID(paramUUID) {
  console.group("STUB: getParameterByUUID()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;
  //const paramUUID = "c42548f5-ee6f-44c2-8cf7-395512ee83e4";  // NOTE: it will look something like this

  const requestPath = tdApp_baseURL + `/groups/${groupId}/params/${paramUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getPreferences()
** DESC: Call the TandemAppServer and get the Preferences associated with the current user
**********************/

export async function getPreferences() {
  console.group("STUB: getPreferences()");

  const requestPath = tdApp_baseURL + `/preferences`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};
