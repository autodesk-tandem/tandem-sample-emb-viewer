
//const tdApp_token = "eyJFbXBsb3llZVNpZCI6MTE4MzU2NywiRXhwaXJlcyI6bnVsbCwiSXNzdWVkVGltZSI6MTYyMjU3MTAxNTk5MCwiTG9naW5OYW1lIjoiYXV0b2Rlc2siLCJTaWduYXR1cmUiOiJGQjBYd3A5RXFudFJITUs2VHl3N1NBMlc4OUd6ZmJNZkhoMmQxMCtzZStjPSIsIlRva2VuIjoiOXJPa0xyZldOSk42ZkNqV0FKajRBeG96V001SWlLSEoyZ3JzR1NuZFlLcz0ifQ==";
const tdApp_baseURL = "https://tandem-stg.autodesk.com/app/";

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer " + window.sessionStorage.token);

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

  const requestPath = tdApp_baseURL + `views/${facilityURN}`;
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

  const requestPath = tdApp_baseURL + `groups/${groupId}/classifications`;
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

  const requestPath = tdApp_baseURL + `groups/${groupId}/facility-templates`;
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

  const requestPath = tdApp_baseURL + `groups/${groupId}/facility-templates/${templateUUID}`;
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

  const requestPath = tdApp_baseURL + `groups/${groupId}/psets`;
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

  const requestPath = tdApp_baseURL + `groups/${groupId}/psets/${psetUUID}`;
  console.log(requestPath);

  await fetch(requestPath, requestOptions)
    .then(response => response.text())
    .then(result => showResult(result))
    .catch(error => console.log('error', error));

  console.groupEnd();
};
