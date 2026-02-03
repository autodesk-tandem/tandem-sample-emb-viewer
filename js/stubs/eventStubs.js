/**
 * Event Stub Functions
 * 
 * Demonstrates Tandem SDK event handling.
 * Output goes to the browser console.
 */

import { getDtApp } from '../viewer.js';

// Track whether event listeners are currently active
let listenersActive = false;

/**
 * Helper to dump event info to console
 */
function dumpEventInfo(eventName, eventObj) {
    console.group(`EVENT: ${eventName}-->`);
    console.log(eventObj);
    console.groupEnd();
}

// Event handler functions
function event_DtFacilityChanged(e) { dumpEventInfo('DT_FACILITY_CHANGED_EVENT', e); }
function event_DtModelChanged(e) { dumpEventInfo('DT_MODEL_CHANGED_EVENT', e); }
function event_DtMetadataChanged(e) { dumpEventInfo('DT_MODEL_METADATA_CHANGED_EVENT', e); }
function event_DtFacetsUpdated(e) { dumpEventInfo('DT_FACETS_UPDATED', e); }
function event_DtFacetsLoaded(e) { dumpEventInfo('DT_FACETS_LOADED', e); }
function event_DtFacetsReset(e) { dumpEventInfo('DT_FACETS_RESET', e); }
function event_DtActiveTeamChanged(e) { dumpEventInfo('DT_ACTIVE_TEAM_CHANGED_EVENT', e); }
function event_DtTeamsChanged(e) { dumpEventInfo('DT_TEAMS_CHANGED_EVENT', e); }
function event_DtTeamUsersChanged(e) { dumpEventInfo('DT_TEAM_USERS_CHANGED_EVENT', e); }
function event_DtTeamFacilitiesChanged(e) { dumpEventInfo('DT_TEAM_FACILITIES_CHANGED_EVENT', e); }
function event_DtUserFacilitiesChanged(e) { dumpEventInfo('DT_USER_FACILITIES_CHANGED_EVENT', e); }
function event_DtTeamChanged(e) { dumpEventInfo('DT_TEAM_CHANGED_EVENT', e); }
function event_DtDocumentsChanged(e) { dumpEventInfo('DT_DOCUMENTS_CHANGED_EVENT', e); }
function event_DtPrimaryModelLoaded(e) { dumpEventInfo('DT_PRIMARY_MODEL_LOADED', e); }
function event_DtMsgWsReconnected(e) { dumpEventInfo('DT_MSG_WS_RECONNETED', e); }
function event_DtStreamMarkerClicked(e) { dumpEventInfo('DT_STREAM_MARKER_CLICKED', e); }
function event_DtStreamMarkerMouseOver(e) { dumpEventInfo('DT_STREAM_MARKER_MOUSE_OVER', e); }
function event_DtStreamMarkerMouseOut(e) { dumpEventInfo('DT_STREAM_MARKER_MOUSE_OUT', e); }
function event_DtStreamMarkerChangedEvent(e) { dumpEventInfo('DT_STREAM_MARKER_CHANGED_EVENT', e); }
function event_DtStreamsInfoChangedEvent(e) { dumpEventInfo('DT_STREAMS_INFO_CHANGED_EVENT', e); }
function event_DtStreamsLastReadingsChangedEvent(e) { dumpEventInfo('DT_STREAMS_LAST_READINGS_CHANGED_EVENT', e); }
function event_DtSystemsChangedEvent(e) { dumpEventInfo('DT_SYSTEMS_CHANGED_EVENT', e); }
function event_DtSystemConnectionsChangedEvent(e) { dumpEventInfo('DT_SYSTEM_CONNECTIONS_CHANGED_EVENT', e); }
function event_DtHeatmapChangedEvent(e) { dumpEventInfo('DT_HEATMAP_CHANGED_EVENT', e); }
function event_DtFloorPlanDoneEvent(e) { dumpEventInfo('DT_FLOOR_PLAN_DONE_EVENT', e); }
function event_DtCurrentViewChangedEvent(e) { dumpEventInfo('DT_CURRENT_VIEW_CHANGED_EVENT', e); }
function event_DtFacilityViewsChangedEvent(e) { dumpEventInfo('DT_FACILITY_VIEWS_CHANGED_EVENT', e); }
function event_DtTelemetryChangedEvent(e) { dumpEventInfo('DT_TELEMETRY_CHANGED_EVENT', e); }
function event_DtTelemetryTickEvent(e) { dumpEventInfo('DT_TELEMETRY_TICK_EVENT', e); }
function event_DtFacilityUserChangedEvent(e) { dumpEventInfo('DT_FACILITY_USER_CHANGED_EVENT', e); }

/**
 * Add event listeners to trap DtApp events
 */
export function addEventListeners() {
    console.group('STUB: addEventListeners()');
    
    const dtApp = getDtApp();
    if (!dtApp) {
        console.warn('DtApp not initialized');
        console.groupEnd();
        return;
    }

    if (listenersActive) {
        console.log('Event listeners are already active');
        console.groupEnd();
        return;
    }

    dtApp.addEventListener(Autodesk.Tandem.DT_FACILITY_CHANGED_EVENT, event_DtFacilityChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_MODEL_CHANGED_EVENT, event_DtModelChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_MODEL_METADATA_CHANGED_EVENT, event_DtMetadataChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_FACETS_UPDATED, event_DtFacetsUpdated);
    dtApp.addEventListener(Autodesk.Tandem.DT_FACETS_LOADED, event_DtFacetsLoaded);
    dtApp.addEventListener(Autodesk.Tandem.DT_FACETS_RESET, event_DtFacetsReset);
    dtApp.addEventListener(Autodesk.Tandem.DT_ACTIVE_TEAM_CHANGED_EVENT, event_DtActiveTeamChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_TEAMS_CHANGED_EVENT, event_DtTeamsChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_TEAM_USERS_CHANGED_EVENT, event_DtTeamUsersChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_TEAM_FACILITIES_CHANGED_EVENT, event_DtTeamFacilitiesChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_USER_FACILITIES_CHANGED_EVENT, event_DtUserFacilitiesChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_TEAM_CHANGED_EVENT, event_DtTeamChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_DOCUMENTS_CHANGED_EVENT, event_DtDocumentsChanged);
    dtApp.addEventListener(Autodesk.Tandem.DT_PRIMARY_MODEL_LOADED, event_DtPrimaryModelLoaded);
    dtApp.addEventListener(Autodesk.Tandem.DT_MSG_WS_RECONNETED, event_DtMsgWsReconnected);
    dtApp.addEventListener(Autodesk.Tandem.DT_STREAM_MARKER_CLICKED, event_DtStreamMarkerClicked);
    dtApp.addEventListener(Autodesk.Tandem.DT_STREAM_MARKER_MOUSE_OVER, event_DtStreamMarkerMouseOver);
    dtApp.addEventListener(Autodesk.Tandem.DT_STREAM_MARKER_MOUSE_OUT, event_DtStreamMarkerMouseOut);
    dtApp.addEventListener(Autodesk.Tandem.DT_STREAM_MARKER_CHANGED_EVENT, event_DtStreamMarkerChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_STREAMS_INFO_CHANGED_EVENT, event_DtStreamsInfoChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_STREAMS_LAST_READINGS_CHANGED_EVENT, event_DtStreamsLastReadingsChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_SYSTEMS_CHANGED_EVENT, event_DtSystemsChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_SYSTEM_CONNECTIONS_CHANGED_EVENT, event_DtSystemConnectionsChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_HEATMAP_CHANGED_EVENT, event_DtHeatmapChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_FLOOR_PLAN_DONE_EVENT, event_DtFloorPlanDoneEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_CURRENT_VIEW_CHANGED_EVENT, event_DtCurrentViewChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_FACILITY_VIEWS_CHANGED_EVENT, event_DtFacilityViewsChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_TELEMETRY_CHANGED_EVENT, event_DtTelemetryChangedEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_TELEMETRY_TICK_EVENT, event_DtTelemetryTickEvent);
    dtApp.addEventListener(Autodesk.Tandem.DT_FACILITY_USER_CHANGED_EVENT, event_DtFacilityUserChangedEvent);

    listenersActive = true;
    console.log('Event listeners added. Info will come to debugger console window.');
    
    console.groupEnd();
}

/**
 * Remove event listeners
 */
export function removeEventListeners() {
    console.group('STUB: removeEventListeners()');
    
    const dtApp = getDtApp();
    if (!dtApp) {
        console.warn('DtApp not initialized');
        console.groupEnd();
        return;
    }

    if (!listenersActive) {
        console.log('Event listeners are not currently active');
        console.groupEnd();
        return;
    }

    dtApp.removeEventListener(Autodesk.Tandem.DT_FACILITY_CHANGED_EVENT, event_DtFacilityChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_MODEL_CHANGED_EVENT, event_DtModelChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_MODEL_METADATA_CHANGED_EVENT, event_DtMetadataChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_FACETS_UPDATED, event_DtFacetsUpdated);
    dtApp.removeEventListener(Autodesk.Tandem.DT_FACETS_LOADED, event_DtFacetsLoaded);
    dtApp.removeEventListener(Autodesk.Tandem.DT_FACETS_RESET, event_DtFacetsReset);
    dtApp.removeEventListener(Autodesk.Tandem.DT_ACTIVE_TEAM_CHANGED_EVENT, event_DtActiveTeamChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_TEAMS_CHANGED_EVENT, event_DtTeamsChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_TEAM_USERS_CHANGED_EVENT, event_DtTeamUsersChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_TEAM_FACILITIES_CHANGED_EVENT, event_DtTeamFacilitiesChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_USER_FACILITIES_CHANGED_EVENT, event_DtUserFacilitiesChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_TEAM_CHANGED_EVENT, event_DtTeamChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_DOCUMENTS_CHANGED_EVENT, event_DtDocumentsChanged);
    dtApp.removeEventListener(Autodesk.Tandem.DT_PRIMARY_MODEL_LOADED, event_DtPrimaryModelLoaded);
    dtApp.removeEventListener(Autodesk.Tandem.DT_MSG_WS_RECONNETED, event_DtMsgWsReconnected);
    dtApp.removeEventListener(Autodesk.Tandem.DT_STREAM_MARKER_CLICKED, event_DtStreamMarkerClicked);
    dtApp.removeEventListener(Autodesk.Tandem.DT_STREAM_MARKER_MOUSE_OVER, event_DtStreamMarkerMouseOver);
    dtApp.removeEventListener(Autodesk.Tandem.DT_STREAM_MARKER_MOUSE_OUT, event_DtStreamMarkerMouseOut);
    dtApp.removeEventListener(Autodesk.Tandem.DT_STREAM_MARKER_CHANGED_EVENT, event_DtStreamMarkerChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_STREAMS_INFO_CHANGED_EVENT, event_DtStreamsInfoChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_STREAMS_LAST_READINGS_CHANGED_EVENT, event_DtStreamsLastReadingsChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_SYSTEMS_CHANGED_EVENT, event_DtSystemsChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_SYSTEM_CONNECTIONS_CHANGED_EVENT, event_DtSystemConnectionsChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_HEATMAP_CHANGED_EVENT, event_DtHeatmapChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_FLOOR_PLAN_DONE_EVENT, event_DtFloorPlanDoneEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_CURRENT_VIEW_CHANGED_EVENT, event_DtCurrentViewChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_FACILITY_VIEWS_CHANGED_EVENT, event_DtFacilityViewsChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_TELEMETRY_CHANGED_EVENT, event_DtTelemetryChangedEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_TELEMETRY_TICK_EVENT, event_DtTelemetryTickEvent);
    dtApp.removeEventListener(Autodesk.Tandem.DT_FACILITY_USER_CHANGED_EVENT, event_DtFacilityUserChangedEvent);

    listenersActive = false;
    console.log('Event listeners removed.');
    
    console.groupEnd();
}

/**
 * Check if event listeners are active
 */
export function areEventListenersActive() {
    return listenersActive;
}

