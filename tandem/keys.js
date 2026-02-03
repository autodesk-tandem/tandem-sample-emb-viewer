/**
 * Utility functions for working with Tandem keys and xrefs
 */

import {
  kElementFlagsSize,
  kElementIdSize,
  kElementIdWithFlagsSize,
  kModelIdSize,
  kSystemIdSize,
  KeyFlags
} from './constants.js';

/**
 * Convert to websafe base64 (replace +/= with -_)
 * @param {string} urn 
 * @returns {string}
 */
function makeWebsafe(urn) {
  return urn.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert long key (with flags) to short key (without flags)
 * Long key is 24 bytes (4 bytes flags + 20 bytes element ID)
 * Short key is 20 bytes (just the element ID)
 * @param {string} fullKey - Full element key with flags
 * @returns {string} Short element key without flags
 */
export function toShortKey(fullKey) {
  // Convert from URL-safe base64 to standard base64
  const tmp = fullKey.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  let standardB64 = tmp;
  while (standardB64.length % 4) {
    standardB64 += '=';
  }
  
  const binData = new Uint8Array(atob(standardB64).split('').map(c => c.charCodeAt(0)));
  const shortKey = new Uint8Array(kElementIdSize);
  
  // Skip first 4 bytes (flags) and copy the remaining 20 bytes (element ID)
  shortKey.set(binData.subarray(kElementFlagsSize));
  return makeWebsafe(btoa(String.fromCharCode.apply(null, shortKey)));
}

export function toFullKey(shortKey, isLogical) {
  const tmp = shortKey.replace(/-/g, '+').replace(/_/g, '/');
  let standardB64 = tmp;
  while (standardB64.length % 4) {
    standardB64 += '=';
  }

  const binData = new Uint8Array(atob(standardB64).split('').map(c => c.charCodeAt(0)));
  const fullKey = new Uint8Array(kElementIdWithFlagsSize);

  const flagValue = isLogical ? KeyFlags.Logical : KeyFlags.Physical;
  fullKey[0] = (flagValue >>> 24) & 0xFF;
  fullKey[1] = (flagValue >>> 16) & 0xFF;
  fullKey[2] = (flagValue >>> 8) & 0xFF;
  fullKey[3] = flagValue & 0xFF;

  fullKey.set(binData, kElementFlagsSize);

  return makeWebsafe(btoa(String.fromCharCode.apply(null, fullKey)));
}

/**
 * Decode xref to extract model URN and element key
 * Xref format: base64 encoded binary [16 bytes modelId + 24 bytes elementKey with flags]
 * @param {string} xref - Base64 encoded xref (URL-safe format)
 * @returns {Object|null} Object with modelURN and elementKey, or null if invalid
 */
export function decodeXref(xref) {
  try {
    // Convert URL-safe base64 to standard base64
    let standardB64 = xref.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (standardB64.length % 4) {
      standardB64 += '=';
    }
    
    // Decode base64 to binary
    const decoded = atob(standardB64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    // Xref should be 16 bytes (model) + 24 bytes (element with flags) = 40 bytes
    if (bytes.length < kModelIdSize + kElementIdWithFlagsSize) {
      console.error('Xref too short after decoding:', bytes.length, 'expected', kModelIdSize + kElementIdWithFlagsSize);
      return null;
    }
    
    // Extract model ID (first 16 bytes)
    const modelIdBytes = bytes.slice(0, kModelIdSize);
    const modelIdStr = String.fromCharCode.apply(null, Array.from(modelIdBytes));
    const modelIdB64 = makeWebsafe(btoa(modelIdStr));
    
    // Extract element key with flags (next 24 bytes)
    const elementKeyBytes = bytes.slice(kModelIdSize, kModelIdSize + kElementIdWithFlagsSize);
    const elementKeyStr = String.fromCharCode.apply(null, Array.from(elementKeyBytes));
    const elementKeyB64 = makeWebsafe(btoa(elementKeyStr));
    
    // Construct full model URN
    const modelURN = `urn:adsk.dtm:${modelIdB64}`;
    
    return {
      modelURN: modelURN,
      elementKey: elementKeyB64  // This is the long key (24 bytes with flags)
    };
  } catch (error) {
    console.error('Error decoding xref:', error, xref);
    return null;
  }
}

/**
 * Make an Xref key for the database that is the modelURN + the element Key.
 * @param {string} modelURN 
 * @param {string} elemKey 
 * @returns {string}
 */
export function makeXrefKey(modelURN, elemKey) {
  const modelId = modelURN.slice(13);   // strip off the "urn:adsk.dtm:" prefix

  // convert from websafe to regular so it works with atob()
  const modelId_enc = modelId.replace(/-/g, '+').replace(/_/g, '/');
  const modelId_dec = atob(modelId_enc);

  const elemKey_enc = elemKey.replace(/-/g, '+').replace(/_/g, '/');
  const elemKey_dec = atob(elemKey_enc);

  const concatStr = modelId_dec + elemKey_dec;  // concat them together

  return makeWebsafe(btoa(concatStr));    // re-encode and make web-safe to get our xrefKey
}

/**
 * Converts encoded string of short keys to array of keys (either short or full).
 * 
 * @param {string} text 
 * @param {boolean} useFullKeys 
 * @param {boolean} [isLogical]
 * @returns {Array.<string>}
 */
export function fromShortKeyArray(text, useFullKeys, isLogical) {
  const tmp = text.replace(/-/g, '+').replace(/_/g, '/');
  const binData = new Uint8Array(atob(tmp).split('').map(c => c.charCodeAt(0)));
  const buffSize = useFullKeys ? kElementIdWithFlagsSize : kElementIdSize;
  const buff = new Uint8Array(buffSize);
  const result = [];
  let offset = 0;

  while (offset < binData.length) {
      const size = binData.length - offset;

      if (size < kElementIdSize) {
          break;
      }
      if (useFullKeys) {
        const keyFlags = isLogical ? KeyFlags.Logical : KeyFlags.Physical;

        writeInt32BE(buff, keyFlags);
        buff.set(binData.subarray(offset, offset + kElementIdSize), kElementFlagsSize);
      } else {
        buff.set(binData.subarray(offset, offset + kElementIdSize));
      }
      const elementKey = makeWebsafe(btoa(String.fromCharCode.apply(null, buff)));

      result.push(elementKey);
      offset += kElementIdSize;
  }
  return result;
}

/**
 * Converts xref key to model and element keys.
 * Returns arrays of model keys and element keys extracted from the xref array
 * @param {string} text - Base64 encoded xref(s)
 * @returns {Array<Array<string>>} [modelKeys, elementKeys]
 */
export function fromXrefKeyArray(text) {
  const modelKeys = [];
  const elementKeys = [];

  if (!text) {
    return [modelKeys, elementKeys];
  }
  
  const tmp = text.replace(/-/g, '+').replace(/_/g, '/');
  const binData = new Uint8Array(atob(tmp).split('').map(c => c.charCodeAt(0)));
  const modelBuff = new Uint8Array(kModelIdSize);
  const keyBuff = new Uint8Array(kElementIdWithFlagsSize);
  let offset = 0;

  while (offset < binData.length) {
    const size = binData.length - offset;

    if (size < (kModelIdSize + kElementIdWithFlagsSize)) {
      break;
    }
    
    modelBuff.set(binData.subarray(offset, offset + kModelIdSize));
    const modelKey = makeWebsafe(btoa(String.fromCharCode.apply(null, modelBuff)));
    modelKeys.push(modelKey);
    
    // element key
    keyBuff.set(binData.subarray(offset + kModelIdSize, offset + kModelIdSize + kElementIdWithFlagsSize));
    const elementKey = makeWebsafe(btoa(String.fromCharCode.apply(null, keyBuff)));
    elementKeys.push(elementKey);
    
    offset += (kModelIdSize + kElementIdWithFlagsSize);
  }
  
  return [modelKeys, elementKeys];
}

/**
 * This is "equivalent" to the Node.js Buffer.writeInt32BE() function.
 * 
 * @param {Array} array 
 * @param {any} value 
 * @param {number} [offset]
 */
function writeInt32BE(array, value, offset = 0) {
  array[offset] = (value >> 24) & 0xff;
  array[offset + 1] = (value >> 16) & 0xff;
  array[offset + 2] = (value >> 8) & 0xff;
  array[offset + 3] = (value >> 8) & 0xff;
}

/**
 * Write a variable-length integer (varint) to a buffer
 * @param {Uint8Array} buffer - Buffer to write to
 * @param {Array<number>} offset - Array with single offset value (for reference)
 * @param {number} value - Value to write
 * @returns {number} Number of bytes written
 */
function writeVarint(buffer, offset, value) {
  const startOffset = offset[0];

  do {
    let byte = 0 | (value & 0x7f);

    value >>>= 7;
    if (value) {
      byte |= 0x80;
    }
    buffer[offset[0]++] = byte;
  } while (value);
  return offset[0] - startOffset;
}

/**
 * Convert full key to system ID
 * Extracts the last 4 bytes from the full key and converts them to a varint-encoded base64 string
 * @param {string} fullKey - Full element key with flags (base64 encoded)
 * @returns {string} System ID (base64 encoded, URL-safe, no padding)
 */
export function toSystemId(fullKey) {
  try {
    // Convert from URL-safe base64 to standard base64
    const tmp = fullKey.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    let standardB64 = tmp;
    while (standardB64.length % 4) {
      standardB64 += '=';
    }
    
    // Decode base64 to binary
    const buff = new Uint8Array(atob(standardB64).split('').map(c => c.charCodeAt(0)));
    
    // Extract the last 4 bytes and build the ID
    let id = buff[buff.length - 4] << 24;
    id |= buff[buff.length - 3] << 16;
    id |= buff[buff.length - 2] << 8;
    id |= buff[buff.length - 1];
    
    // Create result buffer and write varint
    const res = new Uint8Array(kSystemIdSize);
    const offset = [0];
    
    const len = writeVarint(res, offset, id);
    const result = res.subarray(0, len);
    
    // Convert to base64 and make URL-safe, remove padding
    return makeWebsafe(btoa(String.fromCharCode.apply(null, result)));
  } catch (error) {
    console.error('Error converting to system ID:', error, fullKey);
    return fullKey; // Fallback to original key
  }
}

