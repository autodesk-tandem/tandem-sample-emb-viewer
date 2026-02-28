/**
 * Stream Stub Functions
 * 
 * Demonstrates Tandem SDK stream/IoT-related operations.
 * Output goes to the browser console.
 */

import { getCurrentFacility } from '../viewer.js';
import { getSingleSelectedItemOptional } from './viewerStubs.js';

/**
 * Dump the Stream Manager object
 */
export function dumpStreamManager() {
    console.group('STUB: dumpStreamManager()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        console.log('facility.getStreamManager()', strmMgr);
    } else {
        console.log('No stream manager available');
    }

    console.groupEnd();
}

/**
 * Get stream IDs and convert to keys
 */
export async function getStreamIds() {
    console.group('STUB: getStreamIds()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const streamIds = await strmMgr.getStreamIds();

        if (streamIds.length) {
            console.log('getStreamIds()', streamIds);

            const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

            const tableObj = streamIds.map((id, i) => ({
                streamId: id,
                key: streamKeys[i]
            }));
            
            console.log('Converted to keys -->');
            console.table(tableObj);
        } else {
            console.log('No streams were found.');
        }
    }

    console.groupEnd();
}

/**
 * Pretty print stream values in human readable form
 */
function prettyPrintStreamValues(streamIds, streamKeys, streamDataObj) {
    console.log('Stream IDs', streamIds);
    if (streamIds.length !== streamDataObj.length) {
        console.warn('WARNING: streamIds.length does not match streamDataObj.length');
    }

    const timeseriesData = [];

    for (let i = 0; i < streamDataObj.length; i++) {
        if (streamDataObj[i] !== undefined) {
            for (const [propKey, propValues] of Object.entries(streamDataObj[i])) {
                const timestamp = parseInt(propValues.ts);
                const date = new Date(timestamp);
                timeseriesData.push({
                    streamId: streamIds[i],
                    streamKey: streamKeys[i],
                    propId: propKey,
                    value: propValues.val,
                    timestamp: timestamp,
                    date: date.toString()
                });
            }
        }
    }
    
    if (timeseriesData.length) {
        console.table(timeseriesData);
    }
}

/**
 * Get last readings for all streams
 */
export async function getLastReadings() {
    console.group('STUB: getLastReadings()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const streamIds = await strmMgr.getStreamIds();
        const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

        if (streamIds.length) {
            const lastReadings = await strmMgr.getLastReadings(streamIds);
            console.log('getLastReadings()', lastReadings);
            prettyPrintStreamValues(streamIds, streamKeys, lastReadings);
        } else {
            console.log('No streams were found.');
        }
    }

    console.groupEnd();
}

/**
 * Refresh streams last readings cache
 */
export async function refreshStreamsLastReadings() {
    console.group('STUB: refreshStreamsLastReadings()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const streamIds = await strmMgr.getStreamIds();
        if (streamIds && streamIds.length) {
            await strmMgr.refreshStreamsLastReadings(streamIds);
            console.log('Called refreshStreamsLastReadings()');
        } else {
            console.log('No streams were found.');
        }
    }

    console.groupEnd();
}

/**
 * Export streams to JSON
 */
export async function exportStreamsToJson() {
    console.group('STUB: exportStreamsToJson()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const jsonObj = await strmMgr.exportStreamsToJson();
        console.table(jsonObj);
    }

    console.groupEnd();
}

/**
 * Get all stream info objects
 */
export async function getAllStreamInfos() {
    console.group('STUB: getAllStreamInfos()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const jsonObj = await strmMgr.getAllStreamInfos();
        console.table(jsonObj);
    }

    console.groupEnd();
}

/**
 * Get all stream infos from cache
 */
export async function getAllStreamInfosFromCache() {
    console.group('STUB: getAllStreamInfosFromCache()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const jsonObj = await strmMgr.getAllStreamInfosFromCache();
        console.table(jsonObj);
    }

    console.groupEnd();
}

/**
 * Get all connected attributes
 */
export async function getAllConnectedAttributes() {
    console.group('STUB: getAllConnectedAttributes()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const jsonObj = await strmMgr.getAllConnectedAttributes();
        console.table(jsonObj);
    }

    console.groupEnd();
}

/**
 * Get attribute candidates for each stream
 */
export async function getAttributeCandidates() {
    console.group('STUB: getAttributeCandidates()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const jsonObj = await strmMgr.getAllStreamInfos();
        for (let i = 0; i < jsonObj.length; i++) {
            const attrCandidates = await strmMgr.getAttrCandidates(jsonObj[i], null);
            console.log(`Candidate Attributes for [${jsonObj[i].dbId}, ${jsonObj[i].fullId}] -->`, attrCandidates);
        }
    }
    
    console.groupEnd();
}

/**
 * Get stream secrets
 */
export async function getStreamSecrets(streamKeys) {
    console.group('STUB: getStreamSecrets()');

    const facility = getCurrentFacility();
    // getStreamSecret() requires ALManage access level on the server side -
    // calling it with lower access returns 403 Forbidden.
    if (!facility?.canManage()) {
        console.log('(skipped - requires Manage or Owner access level)');
        console.groupEnd();
        return;
    }

    const streamKeysArray = streamKeys.split(',').map(k => k.trim());

    const strmMgr = facility.getStreamManager();
    if (strmMgr) {
        const streamSecrets = [];
        for (let i = 0; i < streamKeysArray.length; i++) {
            const secret = await strmMgr.getStreamSecret(streamKeysArray[i]);
            streamSecrets.push({ streamKey: streamKeysArray[i], streamSecret: secret });
        }
        console.table(streamSecrets);
    } else {
        console.log('No streams were found.');
    }

    console.groupEnd();
}

/**
 * Reset stream secrets
 */
export async function resetStreamSecrets(streamKeys) {
    console.group('STUB: resetStreamSecrets()');

    const facility = getCurrentFacility();
    // resetStreamSecrets() requires ALManage access level on the server side -
    // calling it with lower access returns 403 Forbidden.
    if (!facility?.canManage()) {
        console.log('(skipped - requires Manage or Owner access level)');
        console.groupEnd();
        return;
    }
    
    const streamKeysArray = streamKeys.split(',').map(k => k.trim());

    const strmMgr = facility.getStreamManager();
    if (strmMgr) {
        await strmMgr.resetStreamSecrets(streamKeysArray, true);
        console.log('resetStreamSecrets() called with hardReset=true');
    }

    console.groupEnd();
}

/**
 * Get stream ingestion URLs
 */
export async function getStreamIngestionUrls() {
    console.group('STUB: getStreamIngestionUrls()');

    const facility = getCurrentFacility();
    // getStreamIngestionUrl() calls getStreamSecret() internally, which requires
    // ALManage access level on the server side - calling it with lower access returns 403 Forbidden.
    if (!facility?.canManage()) {
        console.log('(skipped - requires Manage or Owner access level)');
        console.groupEnd();
        return;
    }

    const strmMgr = facility.getStreamManager();
    if (strmMgr) {
        const jsonObj = await strmMgr.getAllStreamInfos();
        const ingestUrls = [];
        
        for (let i = 0; i < jsonObj.length; i++) {
            const tmpStream = jsonObj[i];
            const tmpIngestUrl = await strmMgr.getStreamIngestionUrl(tmpStream);
            ingestUrls.push({
                streamId: tmpStream.dbId,
                fullId: tmpStream.fullId,
                ingestUrl: tmpIngestUrl
            });
        }
        console.table(ingestUrls);
    }
    
    console.groupEnd();
}

/**
 * Get streams bulk import template
 */
export async function getStreamsBulkImportTemplate() {
    console.group('STUB: getStreamsBulkImportTemplate()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        console.log('getStreamsBulkImportTemplate()', strmMgr.getStreamsBulkImportTemplate());
    }

    console.groupEnd();
}

/**
 * Create a new stream
 */
export async function createStream(streamName) {
    console.group('STUB: createStream()');

    let hostElemId = null;
    let modelUrnOfParent = null;
    const wantGeometry = false;

    // If a single element is selected, use it as the host
    const aggrSet = getSingleSelectedItemOptional();
    if (aggrSet) {
        hostElemId = aggrSet[0].selection[0];
        modelUrnOfParent = aggrSet[0].model.urn();
        console.log(`Single element selected, will use as Stream host: [${hostElemId}, ${modelUrnOfParent}]`);
    } else {
        console.log('No element selected in Viewer, will create Stream with un-assigned host.');
    }

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const streamKey = await strmMgr.createStream(streamName, modelUrnOfParent, hostElemId, null, wantGeometry);
        if (streamKey) {
            console.log('New stream key -->', streamKey);
        }
    }

    console.groupEnd();
}

// NOTE: createCalculatedStream is behind a feature flag in Tandem and is not
// yet generally available. The stub is preserved here for future use.
//
// /**
//  * Create a calculated stream and optionally attach it to a selected element.
//  *
//  * A calculated stream is a virtual sensor whose values come from programmatic
//  * computation rather than a real IoT device pushing data via HTTP ingestion.
//  * Use cases include derived metrics (averages, deltas, sums across real streams)
//  * or any value your application computes and wants to surface in Tandem.
//  *
//  * Key differences from createStream():
//  *   - Sets calculationSettings: {} in the stream settings object, signalling
//  *     to Tandem that data will come from internal calculation, not external push.
//  *   - Sets offlineTimeout to Never — a calculated stream is never flagged offline.
//  *   - Does NOT produce an ingestion URL (there is no HTTP endpoint to push to).
//  *
//  * Parameters:
//  *   name             — display name for the new stream
//  *   modelUrnOfParent — model URN of the host element (optional)
//  *   dbIdOfParent     — dbId of the host element (optional)
//  *   tandemCategory   — defaults to TC.Sensors
//  *
//  * Returns the dbId of the newly created stream element.
//  *
//  * Usage: select an element in the viewer to attach the stream to it, then
//  * enter a name and click Create. If nothing is selected, the stream is created
//  * without a host element.
//  */
// export async function createCalculatedStream(streamName) {
//     console.group('STUB: createCalculatedStream()');
//
//     const strmMgr = getCurrentFacility()?.getStreamManager();
//     if (!strmMgr) {
//         console.warn('No stream manager available');
//         console.groupEnd();
//         return;
//     }
//
//     if (!streamName?.trim()) {
//         console.warn('No stream name provided');
//         console.groupEnd();
//         return;
//     }
//
//     let dbIdOfParent = null;
//     let modelUrnOfParent = null;
//
//     const aggrSet = getSingleSelectedItemOptional();
//     if (aggrSet) {
//         dbIdOfParent = aggrSet[0].selection[0];
//         modelUrnOfParent = aggrSet[0].model.urn();
//         console.log(`Host element selected — dbId: ${dbIdOfParent} | modelUrn: ${modelUrnOfParent}`);
//     } else {
//         console.log('No element selected — stream will be created without a host element.');
//     }
//
//     const tandemCategory = Autodesk.Tandem.DtConstants.TC.Sensors;
//     console.log(`Creating calculated stream: "${streamName.trim()}" | category: ${tandemCategory}`);
//
//     const newDbId = await strmMgr.createCalculatedStream(
//         streamName.trim(),
//         modelUrnOfParent,
//         dbIdOfParent,
//         tandemCategory
//     );
//
//     console.log('Created! New stream dbId:', newDbId);
//
//     // Convert dbId → elementKey (stable external ID) for use in REST calls
//     const [elementKey] = await strmMgr.defaultModel.getElementIdsFromDbIds([newDbId]);
//     console.log('New stream elementKey:', elementKey);
//     console.log('NOTE: Use the elementKey (not dbId) for REST API calls and for data ingestion references.');
//
//     console.groupEnd();
// }

/**
 * Delete a stream
 */
export async function deleteStream(streamId) {
    console.group('STUB: deleteStream()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        const streamIds = [streamId];
        console.log('Deleting stream IDs', streamIds);
        await strmMgr.deleteStreams(streamIds);
    }

    console.groupEnd();
}

/**
 * Get thresholds
 */
export async function getThresholds() {
    console.group('STUB: getThresholds()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
        console.log('getThresholds()', await strmMgr.getThresholds());
    }

    console.groupEnd();
}

/**
 * Get the timestamp of the most recent data point received from any stream.
 *
 * Despite the name, getLatestReading() does NOT return stream values. It
 * returns a single Unix timestamp (in seconds) representing the most recent
 * moment any stream in the facility sent data. Internally it tracks the
 * rolling max timestamp across all readings: Math.max(latest, ts).
 *
 * Use this as a heartbeat/health check:
 *   - null  → no readings have been received yet (cache not populated)
 *   - a timestamp → streams are alive; this is when the last data arrived
 *
 * To get actual stream values, use the existing getLastReadings() stub which
 * calls strmMgr.getLastReadings(streamIds).
 */
export async function getLatestReading() {
    console.group('STUB: getLatestReading()');
    console.log('NOTE: Returns the timestamp of the most recent data point from any stream — not the values themselves.');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (!strmMgr) {
        console.warn('No stream manager available');
        console.groupEnd();
        return;
    }

    const latestTs = await strmMgr.getLatestReading();

    if (latestTs === null || latestTs === undefined) {
        console.warn('Result: null — no readings have been received yet (stream cache may not be populated).');
    } else {
        const date = new Date(latestTs * 1000); // ts is in seconds
        console.log('Most recent data point received at:');
        console.log('  Timestamp (s):', latestTs);
        console.log('  Date/time:    ', date.toISOString());
        console.log('  Local:        ', date.toString());
    }

    console.groupEnd();
}

/**
 * Get the latest readings for all streams together with their alert states.
 *
 * This is the most useful "current state" call for IoT monitoring — it returns
 * both the live values AND whether each channel is within its threshold bounds,
 * in a single round-trip.
 *
 * Returns a tuple: [lastByDbId, alerts]
 *
 *   lastByDbId — Map<dbId, { [attrId]: { ts, val } }>
 *                Most recent reading per channel, per stream.
 *
 *   alerts     — Map<dbId, { [attrId]: { currentState } }>
 *                Alert state per channel. currentState maps to one of:
 *                  Normal | Warning | Alert | Offline | NoData
 *
 * The optional filter.dbIds array narrows the query to specific streams.
 * Without it, all streams in the facility are included.
 */
export async function getLastReadingsWithAlerts() {
    console.group('STUB: getLastReadingsWithAlerts()');

    const strmMgr = getCurrentFacility()?.getStreamManager();
    if (!strmMgr) {
        console.warn('No stream manager available');
        console.groupEnd();
        return;
    }

    const streamIds = await strmMgr.getStreamIds();
    if (!streamIds.length) {
        console.warn('No streams found in this facility');
        console.groupEnd();
        return;
    }

    console.log(`Found ${streamIds.length} stream(s). Fetching readings + alert states...`);
    const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

    // Pass dbIds in the filter so the readings Map is scoped to our streams.
    // Without dbIds, the worker returns the full unfiltered byDbId Map.
    const [lastByDbId, alerts] = await strmMgr.getLastReadingsWithAlerts({ dbIds: streamIds });

    console.log('Raw lastByDbId:', lastByDbId);
    console.log('Raw alerts:', alerts);

    // Flatten into a table: one row per stream-channel combination
    const rows = [];
    for (let i = 0; i < streamIds.length; i++) {
        const dbId = streamIds[i];
        const key  = streamKeys[i] ?? '(unknown)';
        const readingsByAttr = lastByDbId?.get(dbId);

        if (!readingsByAttr || Object.keys(readingsByAttr).length === 0) {
            rows.push({ streamKey: key, dbId, attrId: '—', value: null, timestamp: null, date: '—', alertState: 'NoData' });
            continue;
        }

        for (const [attrId, attrReadings] of Object.entries(readingsByAttr)) {
            // Each attrReadings is { [ts]: val } — grab the latest entry
            let ts, val;
            for (const time in attrReadings) { ts = Number(time); val = attrReadings[time]; }

            const alertState = alerts?.get(dbId)?.[attrId]?.currentState ?? 'Normal';
            rows.push({
                streamKey:  key,
                dbId,
                attrId,
                value:      val,
                timestamp:  ts,
                date:       ts ? new Date(ts * 1000).toISOString() : '—',
                alertState
            });
        }
    }

    console.table(rows);
    console.groupEnd();
}

