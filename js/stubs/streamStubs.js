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

    const streamKeysArray = streamKeys.split(',').map(k => k.trim());

    const strmMgr = getCurrentFacility()?.getStreamManager();
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
    
    const streamKeysArray = streamKeys.split(',').map(k => k.trim());

    const strmMgr = getCurrentFacility()?.getStreamManager();
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

    const strmMgr = getCurrentFacility()?.getStreamManager();
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

