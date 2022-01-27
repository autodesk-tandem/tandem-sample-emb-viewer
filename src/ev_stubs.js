
/***************************************************
** FUNC: dumpEventInfo()
** DESC: simple utility func to dump event info to the console
**********************/

function dumpEventInfo(eventName, eventObj) {
  console.group(`EVENT: ${eventName}-->`);
  console.log(eventObj);
  console.groupEnd();
}

function event_DtFacilityChanged(e) {
  dumpEventInfo("DT_FACILITY_CHANGED_EVENT", e);
}

function event_DtModelChanged(e) {
  dumpEventInfo("DT_MODEL_CHANGED_EVENT", e);
}

function event_DtMetadataChanged(e) {
  dumpEventInfo("DT_MODEL_METADATA_CHANGED_EVENT", e);
}

function event_DtFacetsUpdated(e) {
  dumpEventInfo("DT_FACETS_UPDATED", e);
}

function event_DtFacetsLoaded(e) {
  dumpEventInfo("DT_FACETS_LOADED", e);
}

function event_DtActiveTeamChanged(e) {
  dumpEventInfo("DT_ACTIVE_TEAM_CHANGED_EVENT", e);
}

function event_DtTeamsChanged(e) {
  dumpEventInfo("DT_TEAMS_CHANGED_EVENT", e);
}

function event_DtTeamUsersChanged(e) {
  dumpEventInfo("DT_TEAM_USERS_CHANGED_EVENT", e);
}

function event_DtTeamFacilitiesChanged(e) {
  dumpEventInfo("DT_TEAM_FACILITIES_CHANGED_EVENT", e);
}

function event_DtUserFacilitiesChanged(e) {
  dumpEventInfo("DT_USER_FACILITIES_CHANGED_EVENT", e);
}

function event_DtTeamChanged(e) {
  dumpEventInfo("DT_TEAM_CHANGED_EVENT", e);
}

function event_DtDocumentsChanged(e) {
  dumpEventInfo("DT_DOCUMENTS_CHANGED_EVENT", e);
}

function event_DtPrimaryModelLoaded(e) {
  dumpEventInfo("DT_PRIMARY_MODEL_LOADED", e);
}


/***************************************************
** FUNC: addEventListeners()
** DESC: trap the events and pipe to console window
**********************/

export function addEventListeners() {
  const dtApp = window.DT_APP;  // this was stashed away for us by index.js when the viewer was initiated

  dtApp.addEventListener(Autodesk.Viewing.Private.DT_FACILITY_CHANGED_EVENT, event_DtFacilityChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_MODEL_CHANGED_EVENT, event_DtModelChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_MODEL_METADATA_CHANGED_EVENT, event_DtMetadataChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_FACETS_UPDATED, event_DtFacetsUpdated);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_FACETS_LOADED, event_DtFacetsLoaded);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_ACTIVE_TEAM_CHANGED_EVENT, event_DtActiveTeamChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAMS_CHANGED_EVENT, event_DtTeamsChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAM_USERS_CHANGED_EVENT, event_DtTeamUsersChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAM_FACILITIES_CHANGED_EVENT, event_DtTeamFacilitiesChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_USER_FACILITIES_CHANGED_EVENT, event_DtUserFacilitiesChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAM_CHANGED_EVENT, event_DtTeamChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_DOCUMENTS_CHANGED_EVENT, event_DtDocumentsChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_PRIMARY_MODEL_LOADED, event_DtPrimaryModelLoaded);

    // toggle the menu itme in the HTML
  document.getElementById("btn_addEventListeners").classList.add('disabled');
  document.getElementById("btn_removeEventListeners").classList.remove('disabled');

  alert("Event listeners addded. Info will come to debugger console window.");
}

/***************************************************
** FUNC: removeEventListeners()
** DESC: stop trapping the events
**********************/

export function removeEventListeners() {
  const dtApp = window.DT_APP;  // this was stashed away for us by index.js when the viewer was initiated

  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_FACILITY_CHANGED_EVENT, event_DtFacilityChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_MODEL_CHANGED_EVENT, event_DtModelChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_MODEL_METADATA_CHANGED_EVENT, event_DtMetadataChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_FACETS_UPDATED, event_DtFacetsUpdated);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_FACETS_LOADED, event_DtFacetsLoaded);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_ACTIVE_TEAM_CHANGED_EVENT, event_DtActiveTeamChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAMS_CHANGED_EVENT, event_DtTeamsChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAM_USERS_CHANGED_EVENT, event_DtTeamUsersChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAM_FACILITIES_CHANGED_EVENT, event_DtTeamFacilitiesChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_USER_FACILITIES_CHANGED_EVENT, event_DtUserFacilitiesChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAM_CHANGED_EVENT, event_DtTeamChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_PRIMARY_MODEL_LOADED, event_DtPrimaryModelLoaded);

    // toggle the menu itme in the HTML
  document.getElementById("btn_addEventListeners").classList.remove('disabled');
  document.getElementById("btn_removeEventListeners").classList.add('disabled');

  alert("Event listeners removed.");
}
