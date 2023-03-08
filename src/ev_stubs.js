
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

function event_DtFacetsReset(e) {
  dumpEventInfo("DT_FACETS_RESET", e);
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

function event_DtMsgWsReconnected(e) {
  dumpEventInfo("DT_MSG_WS_RECONNETED", e);
}

function event_DtStreamMarkerClicked(e) {
  dumpEventInfo("DT_STREAM_MARKER_CLICKED", e);
}

function event_DtStreamMarkerMouseOver(e) {
  dumpEventInfo("DT_STREAM_MARKER_MOUSE_OVER", e);
}

function event_DtStreamMarkerMouseOut(e) {
  dumpEventInfo("DT_STREAM_MARKER_MOUSE_OUT", e);
}

function event_DtStreamMarkerChangedEvent(e) {
  dumpEventInfo("DT_STREAM_MARKER_CHANGED_EVENT", e);
}

function event_DtStreamsInfoChangedEvent(e) {
  dumpEventInfo("DT_STREAMS_INFO_CHANGED_EVENT", e);
}

function event_DtStreamsLastReadingsChangedEvent(e) {
  dumpEventInfo("DT_STREAMS_LAST_READINGS_CHANGED_EVENT", e);
}

function event_DtStreamsDeletedEvent(e) {
  dumpEventInfo("DT_STREAMS_DELETED_EVENT", e);
}

function event_DtFloorPlanDoneEvent(e) {
  dumpEventInfo("DT_FLOOR_PLAN_DONE_EVENT", e);
}

function event_DtSystemsChangedEvent(e) {
  dumpEventInfo("DT_SYSTEMS_CHANGED_EVENT", e);
}

function event_DtSystemConnectionsChangedEvent(e) {
  dumpEventInfo("DT_SYSTEM_CONNECTIONS_CHANGED_EVENT", e);
}

function event_DtHeatmapChangedEvent(e) {
  dumpEventInfo("DT_HEATMAP_CHANGED_EVENT", e);
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
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_FACETS_RESET, event_DtFacetsReset);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_ACTIVE_TEAM_CHANGED_EVENT, event_DtActiveTeamChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAMS_CHANGED_EVENT, event_DtTeamsChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAM_USERS_CHANGED_EVENT, event_DtTeamUsersChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAM_FACILITIES_CHANGED_EVENT, event_DtTeamFacilitiesChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_USER_FACILITIES_CHANGED_EVENT, event_DtUserFacilitiesChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_TEAM_CHANGED_EVENT, event_DtTeamChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_DOCUMENTS_CHANGED_EVENT, event_DtDocumentsChanged);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_PRIMARY_MODEL_LOADED, event_DtPrimaryModelLoaded);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_MSG_WS_RECONNETED, event_DtMsgWsReconnected);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_CLICKED, event_DtStreamMarkerClicked);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_MOUSE_OVER, event_DtStreamMarkerMouseOver);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_MOUSE_OUT, event_DtStreamMarkerMouseOut);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_CHANGED_EVENT, event_DtStreamMarkerChangedEvent);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAMS_INFO_CHANGED_EVENT, event_DtStreamsInfoChangedEvent);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAMS_LAST_READINGS_CHANGED_EVENT, event_DtStreamsLastReadingsChangedEvent);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_STREAMS_DELETED_EVENT, event_DtStreamsDeletedEvent);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_SYSTEMS_CHANGED_EVENT, event_DtSystemsChangedEvent);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_SYSTEM_CONNECTIONS_CHANGED_EVENT, event_DtSystemConnectionsChangedEvent);
  dtApp.addEventListener(Autodesk.Viewing.Private.DT_HEATMAP_CHANGED_EVENT, event_DtHeatmapChangedEvent);

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
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_FACETS_RESET, event_DtFacetsReset);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_ACTIVE_TEAM_CHANGED_EVENT, event_DtActiveTeamChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAMS_CHANGED_EVENT, event_DtTeamsChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAM_USERS_CHANGED_EVENT, event_DtTeamUsersChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAM_FACILITIES_CHANGED_EVENT, event_DtTeamFacilitiesChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_USER_FACILITIES_CHANGED_EVENT, event_DtUserFacilitiesChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_TEAM_CHANGED_EVENT, event_DtTeamChanged);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_PRIMARY_MODEL_LOADED, event_DtPrimaryModelLoaded);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_MSG_WS_RECONNETED, event_DtMsgWsReconnected);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_CLICKED, event_DtStreamMarkerClicked);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_MOUSE_OVER, event_DtStreamMarkerMouseOver);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_MOUSE_OUT, event_DtStreamMarkerMouseOut);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAM_MARKER_CHANGED_EVENT, event_DtStreamMarkerChangedEvent);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAMS_INFO_CHANGED_EVENT, event_DtStreamsInfoChangedEvent);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAMS_LAST_READINGS_CHANGED_EVENT, event_DtStreamsLastReadingsChangedEvent);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_STREAMS_DELETED_EVENT, event_DtStreamsDeletedEvent);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_SYSTEMS_CHANGED_EVENT, event_DtSystemsChangedEvent);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_SYSTEM_CONNECTIONS_CHANGED_EVENT, event_DtSystemConnectionsChangedEvent);
  dtApp.removeEventListener(Autodesk.Viewing.Private.DT_HEATMAP_CHANGED_EVENT, event_DtHeatmapChangedEvent);

    // toggle the menu itme in the HTML
  document.getElementById("btn_addEventListeners").classList.remove('disabled');
  document.getElementById("btn_removeEventListeners").classList.add('disabled');

  alert("Event listeners removed.");
}
