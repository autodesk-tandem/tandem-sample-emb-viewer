
import * as vw_stubs from './vw_stubs.js';
import * as utils from './utils.js';

/***************************************************
** FUNC: dumpStreamManager()
** DESC: dump the Stream Manager object to the debugger window
**********************/

export function dumpStreamManager() {
  console.group("STUB: dumpStreamManager()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    console.log("facilty.getStreamManager()", strmMgr);
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getStreamIds()
** DESC: get the dbIds of the streams
**********************/

export async function getStreamIds() {
  console.group("STUB: getStreamIds()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();

      // TBD: currently you have to convert to Keys to get values from other calls
    if (streamIds.length) {
      console.log("getStreamIds()", streamIds);

      const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

        // make a nice table for the user showing both the ID and the DbKey
      const tableObj = [];
      for (let i=0; i<streamIds.length; i++) {
        tableObj.push( { streamId: streamIds[i], key: streamKeys[i]} );
      }
      console.log("Converted to keys -->");
      console.table(tableObj);
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: prettyPrintStreamValues()
** DESC: print out timeseries data in human readable form
**********************/

export function prettyPrintStreamValues(streamIds, streamKeys, streamDataObj) {

  console.log("Stream IDs", streamIds);
  if (streamIds.length != streamDataObj.length) {
    console.warning("WARNING: streamIds.length doesn't match streamDataObj.length");
  }

    // iterate over the map structure and make a nice, readable table
  let timeseriesData = [];

  for (let i=0; i<streamDataObj.length; i++) { // one entry for each parameter used to store timeseries data
    if (streamDataObj[i] != undefined) {  // undefined unless there are values for this index
      for (const [propKey, propValues] of Object.entries(streamDataObj[i])) { // one entry for each parameter used to store timeseries data
          const timestamp = parseInt(propValues.ts); // convert timestamp to human readable date
          const date = new Date(timestamp);
          timeseriesData.push( { streamId: streamIds[i], streamKey: streamKeys[i], propId: propKey, value: propValues.val, timestamp: timestamp, date: date.toString()} );
      }
    }
  }
  if (timeseriesData.length) {
    console.table(timeseriesData);
  }
}

/*export function prettyPrintStreamValues(streamIds, streamKeys, streamDataObj) {

  console.log("Stream IDs", streamIds);
  if (streamIds.length != streamDataObj.length) {
    console.warning("WARNING: streamIds.length doesn't match streamDataObj.length");
  }

    // iterate over the map structure and make a nice, readable table
  let timeseriesData = [];

  for (let i=0; i<streamDataObj.length; i++) { // one entry for each parameter used to store timeseries data
    if (streamDataObj[i] != undefined) {  // undefined unless there are values for this index
      for (const [propKey, propValues] of Object.entries(streamDataObj[i])) { // one entry for each parameter used to store timeseries data
        for (const [timestampKey, propVal] of Object.entries(propValues)) { // another map with all the timestamps and values
          const timestamp = parseInt(timestampKey); // convert timestamp to human readable date
          const date = new Date(timestamp);
          timeseriesData.push( { streamId: streamIds[i], streamKey: streamKeys[i], propId: propKey, value: propVal, timestamp: timestamp, date: date.toString()} );
        }
      }
    }
  }
  if (timeseriesData.length) {
    console.table(timeseriesData);
  }
}*/

/***************************************************
** FUNC: getLastReadings()
** DESC: get the last readings for a set of streams
**********************/

export async function getLastReadings() {
  console.group("STUB: getLastReadings()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();
    const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

    if (streamIds.length) {
      const lastReadings = await strmMgr.getLastReadings(streamIds);
      console.log("getLastReadings()", lastReadings);
      prettyPrintStreamValues(streamIds, streamKeys, lastReadings);
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: refreshStreamsLastReadings()
** DESC: refresh the cache
**********************/

export async function refreshStreamsLastReadings() {
  console.group("STUB: refreshStreamsLastReadings()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();
    if (streamIds && streamIds.length) {
      await strmMgr.refreshStreamsLastReadings(streamIds);
      console.log("Called refreshStreamsLastReadings()");
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: prettyPrintRollupStreamValues()
** DESC: print out timeseries data in human readable form
**********************/

export function prettyPrintRollupStreamValues(streamDataObj) {

    // iterate over the map structure and make a nice, readable table
  for (const [streamKey, streamValue] of Object.entries(streamDataObj)) { // one entry for each stream requested
    let timeseriesData = [];

    for (const [propKey, propValues] of Object.entries(streamValue)) { // one entry for each parameter used to store timeseries data
      for (const [timestampKey, propVal] of Object.entries(propValues)) { // another map with all the timestamps and values
        const timestamp = parseInt(timestampKey); // convert timestamp to human readable date
        const date = new Date(timestamp);
        timeseriesData.push( { streamKey: streamKey, propId: propKey, count: propVal.count, avg: propVal.avg, min: propVal.min, max: propVal.max, timestamp: timestamp, date: date.toString()} );
      }
    }
    if (timeseriesData.length) {
      console.table(timeseriesData);
    }
  }
}


/***************************************************
** FUNC: exportStreamsToJson()
** DESC: get all the stream info and export JSON object (first row is the "schema")
**********************/

export async function exportStreamsToJson() {
  console.group("STUB: exportStreamsToJson()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.exportStreamsToJson();
    //console.log("exportStreamsToJson()", jsonObj);
    console.table(jsonObj);
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAllStreamInfos()
** DESC: dump all the info about streams
**********************/

export async function getAllStreamInfos() {
  console.group("STUB: getAllStreamInfos()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.getAllStreamInfos();
    //console.log("getAllStreamInfos()", jsonObj);
    console.table(jsonObj);

  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAllStreamInfosFromCache()
** DESC: dump all the info about streams in the cache
**********************/

export async function getAllStreamInfosFromCache() {
  console.group("STUB: getAllStreamInfosFromCache()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.getAllStreamInfosFromCache();
    //console.log("getAllStreamInfos()", jsonObj);
    console.table(jsonObj);

  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAllConnectedAttributes()
** DESC: get info about all the connected attributes.
**********************/

export async function getAllConnectedAttributes() {
  console.group("STUB: getAllConnectedAttributes()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.getAllConnectedAttributes();
    //console.log("getAllStreamInfos()", jsonObj);
    console.table(jsonObj);

  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAttributeCandidates()
** DESC: get info about all the connected attributes.
**********************/

export async function getAttributeCandidates() {
  console.group("STUB: getAttributeCandidates()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
        // normally done one at a time, but we need to look up all the streamIds anyway, so lets get them
        // all and print out a nice table for the user.
    const jsonObj = await strmMgr.getAllStreamInfos();
    for (let i=0; i<jsonObj.length; i++) {
      const attrCandidates = await strmMgr.getAttrCandidates(jsonObj[i], null);
      console.log(`Candidate Attributes for [${jsonObj[i].dbId}, ${jsonObj[i].fullId}] -->`, attrCandidates);
    }
  }
  console.groupEnd();
}

/***************************************************
** FUNC: getStreamSecrets()
** DESC: dump out all the Stream secrets
**********************/

export async function getStreamSecrets() {
  console.group("STUB: getStreamSecrets()");

    // NOTE: the API call asks for only one, but let's just dump them all out for the user in a nice table
  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();
    if (streamIds && streamIds.length) {
      const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);
      const streamSecrets = [];

        // make an array for collecting the triple ID/KEY/SECRET
      for (let i=0; i<streamIds.length; i++) {
        const secret = await strmMgr.getStreamSecret(streamKeys[i]);
        streamSecrets.push( { streamId: streamIds[i], streamKey: streamKeys[i], streamSecret: secret});
      }
      console.table(streamSecrets);
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: resetStreamSecrets()
** DESC: reset the secret for the given keys (can be comma separated list)
** NOTE: this function should not be needed.  It is called automatically by createStream().
**    Only necessary in some kind of "emergency" for key rotation.
**********************/

export async function resetStreamSecrets(streamKeys) {
  console.group("STUB: resetStreamSecrets()");
  const streamKeysArray = streamKeys.split(',');

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    await strmMgr._resetStreamSecrets(streamKeysArray, true);
    console.log("_resetStreamSecrets()", "called with hardReset=true");
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getStreamIngestionUrls()
** DESC: get the ingestionURLs for the streams.  These can be used to pipe data into the Stream
**********************/

export async function getStreamIngestionUrls() {
  console.group("STUB: getStreamIngestionUrls()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
        // normally done one at a time, but we need to look up all the streamIds anyway, so lets get them
        // all and print out a nice table for the user.
    const jsonObj = await strmMgr.getAllStreamInfos();
    let ingestUrls = [];
    let tmpStream = null;
    let tmpIngestUrl = "";
    for (let i=0; i<jsonObj.length; i++) {
      tmpStream = jsonObj[i];
      tmpIngestUrl = await strmMgr.getStreamIngestionUrl(tmpStream);
      ingestUrls.push( { streamId: tmpStream.dbId, fullId: tmpStream.fullId, ingestUrl: tmpIngestUrl} );
    }
    console.table(ingestUrls);

  }
  console.groupEnd();
}

/***************************************************
** FUNC: getStreamsBulkImportTemplate()
** DESC: basically gets the "schema" for streams info
**********************/

export async function getStreamsBulkImportTemplate() {
  console.group("STUB: getStreamsBulkImportTemplate()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    console.log("getStreamsBulkImportTemplate()", strmMgr.getStreamsBulkImportTemplate());
  }

  console.groupEnd();
}

  /***************************************************
  ** FUNC: createStream()
  ** DESC: Create a new stream from just a name (and a host if an element is selected in viewer)
  **********************/

  export async function createStream(streamName) {
    console.group("STUB: createStream()");

    let hostElemId = null;
    let modelUrnOfParent = null;
    let wantGeometry = false;

      // if a single element is selected in the viewer, then we can assign it as the Host
    const aggrSet = vw_stubs.getSingleSelectedItemOptional();
    if (aggrSet) {
      hostElemId = aggrSet[0].selection[0];
      modelUrnOfParent = aggrSet[0].model.urn();
      //wantGeometry = true;    // TBD: revisit when this flag is ready
      console.log(`Single element selected, will use as Stream host: [${hostElemId}, ${modelUrnOfParent}]`);
    }
    else {
      console.log("No element selected in Viewer, will create Stream with un-assigned host.");
    }

    ///async createStream(name, modelUrnOfParent, dbIdOfParent, extraProps = {}, wantGeometry = false) {

    const strmMgr = utils.getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
      const streamKey = await strmMgr.createStream(streamName, modelUrnOfParent, hostElemId, null, wantGeometry);
      if (streamKey)
        console.log("New stream key -->", streamKey);
    }

    console.groupEnd();
  }

/***************************************************
** FUNC: deleteStream()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function deleteStream(streamId) {
  console.group("STUB: deleteStream()");

  const strmMgr = utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = [streamId]; // technically we could delete multiple in one shot
    console.log("Deleting stream IDs", streamIds);
    await strmMgr.deleteStreams(streamIds);
  }

  console.groupEnd();
}
