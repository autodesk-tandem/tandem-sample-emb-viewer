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

export async function getFacilityTemplateByUUID() {
  console.group("STUB: getFacilityTemplateByUUID()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;
  const templateUUID = DT_APP.currentFacility.settings.template.data.uuid;

  const requestPath = tdApp_baseURL + `/groups/${groupId}/facility-templates/${templateUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getParameterSets()
** DESC: Call the TandemAppServer and get the ParameterSets associated with the current group
**********************/

export async function getParameterSets() {
  console.group("STUB: getParameterSets()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;

  const requestPath = tdApp_baseURL + `/groups/${groupId}/psets`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};

/***************************************************
** FUNC: getParameterSetByUUID()
** DESC: Call the TandemAppServer and get the ParameterSet with the given UUID
**********************/

export async function getParameterSetByUUID() {
  console.group("STUB: getParameterSetByUUID()");

  const groupId = DT_APP.currentFacility.settings.accountGroup;
  const psetUUID = "U2qVqS3RSO-GYITwQfzSGg";  // NOTE: this is hardwired!!!

  const requestPath = tdApp_baseURL + `/groups/${groupId}/psets/${psetUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};
