import * as utils from './utils.js';

/***************************************************
** FUNC: getFacilityDocuments()
** DESC: dump out the documents assigned to this facility
**********************/

export async function getFacilityDocuments() {
  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  console.group("STUB: getFacilityDocuments()");

  const docs = facility.settings.docs;  // NOTE: there is no named function for this, they are just stashed in the settings object
  console.table(docs);

  console.groupEnd();
}

/***************************************************
** FUNC: getDocument()
** DESC: get a specific document by ID
**********************/

export async function getDocument(docURN) {
  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  // TBD: this function is a little whack.  If you pass in a bad docId, it will just crap out in the REST call,
  // when it should probably return NULL to javascript or something.
  console.group("STUB: getDocument()");

  const doc = await facility.getDocument(docURN);
  console.log("Document", doc);

  console.groupEnd();
}

/***************************************************
** FUNC: deleteDocument()
** DESC: get a specific document by ID
**********************/

export async function deleteDocument(docURN) {
  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  console.group("STUB: deleteDocument()");

  const doc = await facility.deleteDocument(docURN);

  console.groupEnd();
}
