
import * as td_utils from './td_utils.js';

/***************************************************
** FUNC: dumpStreamManager()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export function dumpStreamManager() {
  console.group("STUB: dumpStreamManager()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
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

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();

      // TBD: currently you have to convert to Keys to get values from other calls
    if (streamIds.length) {
      console.log("getStreamIds()", streamIds);

      const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);
      console.log("Converted to keys -->", streamKeys);
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getLastReadings()
** DESC: get the last readings for a set of streams
**********************/

export async function getLastReadings() {
  console.group("STUB: getLastReadings()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();

    if (streamIds.length) {
      const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

      const lastReadings = await strmMgr.getLastReadings(streamKeys);
      console.log("getLastReadings()", lastReadings);
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: refreshStreamsLastReadings()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function refreshStreamsLastReadings() {
  console.group("STUB: refreshStreamsLastReadings()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamIds = await strmMgr.getStreamIds();
    if (streamIds && streamIds.length) {
      const streamKeys = await strmMgr.defaultModel.getElementIdsFromDbIds(streamIds);

      await strmMgr.refreshStreamsLastReadings(streamKeys);
      console.log("Called refreshStreamsLastReadings()");
    }
    else {
      console.log("No streams were found.");
    }
  }

  console.groupEnd();
}

/***************************************************
** FUNC: exportStreamsToJson()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function exportStreamsToJson() {
  console.group("STUB: exportStreamsToJson()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.exportStreamsToJson();
    //console.log("exportStreamsToJson()", jsonObj);
    console.table(jsonObj);
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAllStreamInfos()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function getAllStreamInfos() {
  console.group("STUB: getAllStreamInfos()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.getAllStreamInfos();
    //console.log("getAllStreamInfos()", jsonObj);
    console.table(jsonObj);

  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAllStreamInfosFromCache()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function getAllStreamInfosFromCache() {
  console.group("STUB: getAllStreamInfosFromCache()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.getAllStreamInfosFromCache();
    //console.log("getAllStreamInfos()", jsonObj);
    console.table(jsonObj);

  }

  console.groupEnd();
}

/***************************************************
** FUNC: getAllConnectedAttributes()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function getAllConnectedAttributes() {
  console.group("STUB: getAllConnectedAttributes()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const jsonObj = await strmMgr.getAllConnectedAttributes();
    //console.log("getAllStreamInfos()", jsonObj);
    console.table(jsonObj);

  }

  console.groupEnd();
}

/***************************************************
** FUNC: getStreamSecrets()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function getStreamSecrets() {
  console.group("STUB: getStreamSecrets()");

    // NOTE: the API call asks for only one, but let's just dump them all out for the user in a nice table
  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
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
** DESC: reset the secretd for the given keys (can be comma separated list)
**********************/

export async function resetStreamSecrets(streamKeys) {
  console.group("STUB: resetStreamSecrets()");
  const streamKeysArray = streamKeys.split(',');

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    await strmMgr.resetStreamSecrets(streamKeysArray, true);
    console.log("resetStreamSecrets()", "called with hardReset=true");
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getStreamsBulkImportTemplate()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function getStreamsBulkImportTemplate() {
  console.group("STUB: getStreamsBulkImportTemplate()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    console.log("getStreamsBulkImportTemplate()", strmMgr.getStreamsBulkImportTemplate());
  }

  console.groupEnd();
}

  /***************************************************
  ** FUNC: createStream()
  ** DESC: Create a new stream from just a name (let the defaults work for everything else)
  **********************/

  export async function createStream(streamName) {
    console.group("STUB: createStream()");

    /// async createStream(name, modelToLinkTo, dbIdToLinkTo, extraProps = {}) {

    const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
    if (strmMgr) {
      const streamKey = await strmMgr.createStream(streamName, null, null);
      if (streamKey)
        console.log("New stream key -->", streamKey);
    }

    console.groupEnd();
  }

/***************************************************
** FUNC: deleteStream()
** DESC: dump the Stream Manager object ot the debugger window
**********************/

export async function deleteStream(streamKey) {
  console.group("STUB: deleteStream()");

  const strmMgr = td_utils.getCurrentFacility()?.getStreamManager();
  if (strmMgr) {
    const streamKeys = [streamKey]; // technically we could delete multiple in one shot
    await strmMgr.deleteStreams(streamKeys);
  }

  console.groupEnd();
}



/// TBD: this is temporary code extracted from Tandem SDK to allow for generation of Keys to be used for new streams.
/// We need to redo the API to make this encapsulated.

function uint6ToB64WebsafeGen(nUint6) {

	return nUint6 < 26 ?
		nUint6 + 65
		: nUint6 < 52 ?
			nUint6 + 71
			: nUint6 < 62 ?
				nUint6 - 4
				: nUint6 === 62 ?
					45
					: nUint6 === 63 ?
						95
						:
						65;
}

let uint6ToB64Websafe = new Uint8Array(64);
for (let i = 0; i < 64; i++) {
	uint6ToB64Websafe[i] = uint6ToB64WebsafeGen(i);
}

let arr22 = new Array(22);
let arr27 = new Array(27);
let arr32 = new Array(32);

//from https://cs.opensource.google/go/go/+/refs/tags/go1.18.2:src/encoding/base64/base64.go;l=125
function base64EncArr(src, offset, length) {

	let baseOffset = offset || 0;
	let nLen = length || src.length;

	//let paddingLen = (3 - (nLen % 3)) % 3; //padding length that we will ignore for web safe encoding
	let encodedLenNoPadding = ((nLen * 8 + 5) / 6) | 0;

	let dst;
	switch (encodedLenNoPadding) {
		case 22:
			dst = arr22;
			break; //for 16 byte input
		case 27:
			dst = arr27;
			break; //for 20 byte input
		case 32:
			dst = arr32;
			break; //for 24 byte input
		default:
			dst = new Array(encodedLenNoPadding);
			break;
	}

	let di = 0, si = baseOffset;
	let n = ((nLen / 3) | 0) * 3 + baseOffset;
	while (si < n) {
		// Convert 3x 8bit source bytes into 4 bytes
		let val = (src[si]) << 16 | (src[si + 1]) << 8 | (src[si + 2])

		dst[di] = uint6ToB64Websafe[val >> 18 & 0x3F]
		dst[di + 1] = uint6ToB64Websafe[val >> 12 & 0x3F]
		dst[di + 2] = uint6ToB64Websafe[val >> 6 & 0x3F]
		dst[di + 3] = uint6ToB64Websafe[val & 0x3F]

		si += 3
		di += 4
	}

	let remain = nLen - si + baseOffset
	if (remain === 0) {
		return String.fromCharCode.apply(null, dst);
	}
	// Add the remaining small block
	let val = (src[si]) << 16
	if (remain === 2) {
		val |= (src[si + 1]) << 8
	}

	dst[di] = uint6ToB64Websafe[val >> 18 & 0x3F]
	dst[di + 1] = uint6ToB64Websafe[val >> 12 & 0x3F]

	switch (remain) {
		case 2:
			dst[di + 2] = uint6ToB64Websafe[val >> 6 & 0x3F]
		//no padding
		case 1:
		//no padding
		//no padding
	}

	return String.fromCharCode.apply(null, dst);
}

/***************************************************
** FUNC: generateNewStreamKey()
** DESC: logic extracted from Tandem code that creates a key needed to make simple REST API call to create a stream
**********************/

export async function generateNewStreamKey() {
  console.group("STUB: generateNewStreamKey()");

  //const keyFlag = Autodesk.Tandem.ElementFlags.Stream;
  const keyFlag = Autodesk.Viewing.Private.DtConstants.ElementFlags.Stream;

    //Big-Endian flags
  let _tmpBuf24 = new Uint8Array(24);
  _tmpBuf24[0] = (keyFlag >> 24) & 0xff;
  _tmpBuf24[1] = (keyFlag >> 16) & 0xff;
  _tmpBuf24[2] = (keyFlag >> 8) & 0xff;
  _tmpBuf24[3] = keyFlag & 0xff;

    // generate binary uuid into buffer at offset 4
  //uuidV4({}, _tmpBuf24, 4);   // TBD: this is the official way to do it but can't get npm to use it, so doing the hack below
  for (let i=4; i<20; ++i) {
    _tmpBuf24[i] = (Math.random() * 256)|0;
  }

    // fill remaining bytes (>=20) with 0
  _tmpBuf24.fill(0, 20);

  const newStreamKey = base64EncArr(_tmpBuf24);
  console.log("New stream key-->", newStreamKey);

  console.groupEnd();
}




// 	formatStreamValue(stream, value, unit = undefined) {

// 	async getAttrCandidates(stream, attrs) {
// 	addStreamRefreshInterval(refreshInterval) {
//  removeStreamRefreshInterval(refreshInterval) {
// 	updateActiveRefreshInterval(refreshInterval) {
