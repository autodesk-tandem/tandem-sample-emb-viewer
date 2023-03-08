
import * as vw_stubs from './vw_stubs.js';
import * as utils from './utils.js';

/***************************************************
** FUNC: dumpSingleModel()
** DESC: helper function to dump out the info for a single model
**********************/

async function dumpSingleModel(model) {
  console.log("getInstanceTree()", model.getInstanceTree());
  console.log("getBoundingBox()", model.getBoundingBox());
  console.log("is2d()", model.is2d());
  console.log("is3d()", model.is3d());
  console.log("isOTG()", model.isOTG());
  console.log("isPdf()", model.isPdf());

  console.log("getQueryParams()", model.getQueryParams());
  console.log("urn()", model.urn());
  console.log("isDefault()", model.isDefault());
  console.log("getParentFacility()", model.getParentFacility());
  console.log("isPrimaryModel()", model.isPrimaryModel());
  console.log("isVisibleByDefault()", model.isVisibleByDefault());
  console.log("label()", model.label());
  console.log("accessLevel()", model.accessLevel());
  console.log("getData()", model.getData());
  console.log("getRootId()", model.getRootId());
  console.log("getRoot()", model.getRoot());
  console.log("getUnitScale()", model.getUnitScale());
  console.log("getUnitString()", model.getUnitString());
  console.log("getDisplayUnit()", model.getDisplayUnit());
  console.log("getDefaultCamera()", model.getDefaultCamera());
  console.log("getUpVector()", model.getUpVector());
  console.log("isLoadDone()", model.isLoadDone());

    // TBD: should fetchTopolgy() fail badly if hasTopology() is false.  Currently it does,
    // seems like it should just return null or something.
  const hasIt = model.hasTopology();
  console.log("hasTopology()", hasIt);
  if (hasIt)
    console.log("fetchTopology()", await model.fetchTopology());

  console.log("getBasePath()", model.getBasePath());

  console.log("getAlignment()", await model.getAlignment());
  console.log("getLevels()");
  console.table(await model.getLevels());

  console.log("hasRooms()", model.hasRooms());
  console.log("getRooms()");
  console.table(await model.getRooms());

  console.log("getHash2Attr()", await model.getHash2Attr());

  console.log("getModelProperties()", await model.getModelProperties());
  console.log("fileName()", model.fileName());
  console.log("displayName()", model.displayName());
  console.log("isLoaded()", model.isLoaded());
  console.log("getSeedUrn()", model.getSeedUrn());
  console.log("getAttributes()", await model.getAttributes());
  console.log("canEdit()", model.canEdit());
  //console.log("hasPhysicalElements()", model.hasPhysicalElements());
  console.log("getTaggedAssets()", await model.getTaggedAssets());
  console.log("getClassifiedAssets()", await model.getClassifiedAssets());
  console.log("isGeoReferenceSet()", model.isGeoReferenceSet());
  console.log("getElementCount()", model.getElementCount());
  console.log("getAllSystemClasses()", model.getAllSystemClasses());

  /* other functions...
  updateFromFile(fileName, urn, phaseNames);
  setPrimaryModel();
  setVisibleByDefault(visibleByDefault);
  setLabel(label);
  getMetadata(itemName, subitemName, defaultValue);
  getFragmentPointer(fragId);
  updateFacetInfo(facetInfo);
  createElement(elmData, linkTo);
  query(query);
  hasExternalRefs(urn);
  loadElements(ids);
  loadAllElements();
  unloadElements(ids);
  unloadAllElements();
  getElementsForLevel(levelDbId);
  loadElementsForLevel(levelDbId);
  invalidateModelProperties();
  getCustomFacet(attributeHash);
  getAttributes(options);
  getElementIdsFromDbIds();
  getDbIdsFromElementIds();
  getElementClass(dbId);
  getElementClassName(dbId);
  getUsageMetrics(startDate, endDate);
  getFuzzyBox(options = {});
  getElementIds(elementFlag = undefined);
  getVisibleIds();
  */
};


/***************************************************
** FUNC: dumpDtModelInfo()
** DESC: dump out as much info about the Model as we can (just to show what is available)
**********************/

export async function dumpDtModelInfo() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: dumpDtModelInfo()");

  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    await dumpSingleModel(models[i]);
    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getDtModelHistory()
** DESC: dump out the history for this model
**********************/

export async function getDtModelHistory() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getHistory()");

  const startDay = new Date(2020, 0, 1);  // arbitrarily the beginning of 2020
  const endDay = new Date();  // today

  for (let i=0; i<models.length; i++) {
    const hist = await models[i].getHistory([], startDay.getTime(), endDay.getTime(), true);

    console.group(`Model[${i}]--> ${models[i].label()}`);

    console.table(hist);
    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getDtModelUsageMetrics()
** DESC: dump out the history for this model
**********************/

export async function getDtModelUsageMetrics() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

    // TBD: doesn't work.  And isn't consistent with getHistory() in usage of the dates.
    // this one requires you to know to get the date into a specific format.  Probably should take
    // Date objects and then do that formatting inside the getUsageMetrics() function.
  const startDate = new Date(2020, 0, 1);  // arbitrarily the beginning of 2020
  const endDate = new Date();  // today

  //const start = utils.formatDateYYYYMMDD(startDate);
  //const end = utils.formatDateYYYYMMDD(endDate);
  const from = new Date().toISOString().split('T')[0].replace(/-/g, '');

  console.group("STUB: getUsageMetrics()");

  for (let i=0; i<models.length; i++) {
    //const usage = await models[i].getUsageMetrics(start, end);
    const usage = await models[i].getUsageMetrics(from);
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log('Received metrics', JSON.stringify(usage));

    //console.table(usage);
    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getLevels()
** DESC: dump out the levels for each model in the facility
**********************/

export async function getLevels() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getLevels()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for levels
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);

    const levelObjs = await models[i].getLevels();

      // extract the levelIds out of this object so we can highlight in the viewer
    const levelIds = [];
    for (let key in levelObjs)
      levelIds.push(levelObjs[key].dbId);

      // arbitrarily get the elements on the first level of first model in the array and then isolate them
    if (levelIds.length && i==0) {
      console.table(levelObjs);
      console.log("isolating levels[0] in viewer...");
      const levelElementIds = models[i].getElementsForLevel(levelIds[0]);

      NOP_VIEWER.isolate(levelElementIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("No levels found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: getRooms()
** DESC: dump out the rooms for each model in the facility
**********************/

export async function getRooms() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getRooms()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for rooms
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);

    const roomObjs = await models[i].getRooms();

      // extract the roomIds out of this object so we can highlight in the viewer
    const roomIds = [];
    for (let key in roomObjs)
      roomIds.push(roomObjs[key].dbId);

    if (roomIds.length) {
      console.table(roomObjs);
      console.log("isolating rooms in viewer...");
      NOP_VIEWER.isolate(roomIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("No rooms found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getElementsInRoom()
** DESC: find the elements that are part of a room. We have to look for elements
** that are part of the same model as the room, AND we have to look for elements
** that belong to an xref model, but reside in this room.
**********************/

function getElementsInRoom(roomModel, roomDbId) {

  let roomInfo = roomModel.getRooms()[roomDbId];
  console.log("roomInfo", roomInfo);

  let elementsInRoom = [];

    // walk through all the models that are part of this facility
  let models = utils.getLoadedModels();
  for (let i=0; i<models.length; i++) {
    let tmpModel = models[i];
    let dbIdsPerModel = []; // keeping track of dbIds for each model separately

    if (tmpModel === roomModel) {      // elements that are part of the same model as the room
      let dbIdToRoomId = tmpModel.getData().dbId2roomIds;

        // walk the list of entries and find ones with our roomId
        // NOTE: it can return either a single dbId, or an array of dbIds
      for (let dbId in dbIdToRoomId) {
        let elementRooms = dbIdToRoomId[dbId];
        if (typeof elementRooms === "number") {   // single dbId
          if (elementRooms === roomDbId) {
            dbIdsPerModel.push(parseInt(dbId));
          }
        }
        else {      // array of dbIds
          if (elementRooms.includes(roomDbId)) {
            dbIdsPerModel.push(parseInt(dbId));
          }
        }
      }
    }
    else {  // elements from an xref that are part or this room
      let xrefs = tmpModel.getData().xrefs[roomModel.urn()]; //find the local integer ID of this room in the current model
      let localRoomXref = xrefs[roomInfo.externalId];
      let dbIdToXRoomId = tmpModel.getData().dbId2xroomIds;

      for (let dbId in dbIdToXRoomId) {
        let elementRooms = dbIdToXRoomId[dbId];
        if (typeof elementRooms === "number") { // single dbId
          if (elementRooms === localRoomXref) {
            dbIdsPerModel.push(parseInt(dbId));
          }
        }
        else {     // array of dbIds
          if (elementRooms.includes(localRoomXref)) {
            dbIdsPerModel.push(parseInt(dbId));
          }
        }
      }
    }

      // add the dbIds we collected for this particular model
    elementsInRoom.push({model:tmpModel, dbIds:dbIdsPerModel});
  }

  return elementsInRoom;
}

/***************************************************
** FUNC: showElementsInRoom()
** DESC: find the elements that are part of a room and isolate them in the viewer
**********************/

export async function showElementsInRoom() {
  const aggrSet = vw_stubs.getSingleSelectedItem();
  if (!aggrSet) {
    return;
  }

  const roomDbId = aggrSet[0].selection[0];

    // first, lets make sure they actually selected a room object
  let flags = aggrSet[0].model.getData().dbId2flags[roomDbId];
  //if ((flags & Autodesk.Tandem.ElementFlags.Room) === 0) {
  if ((flags & 0x00000005) === 0) {
    alert("Selected object is not of type Room");
    return;
  }

  console.group("STUB: showElementsInRoom()");

  const elementsInRoom = getElementsInRoom(aggrSet[0].model, roomDbId);
  console.log("elementsInRoom", elementsInRoom);

    // now we will go through and display those in the viewer and hide everything else
    // need to get all the models in the facility so we can hide the ones that we aren't interested in
  NOP_VIEWER.clearSelection();  // start the viewer in a clean slate
  console.log("isolating elements in viewer...");

  for (let i=0; i<elementsInRoom.length; i++) {
    if (elementsInRoom[i].dbIds.length === 0)
      NOP_VIEWER.isolate([0], elementsInRoom[i].model); // ghost the entire model
    else
      NOP_VIEWER.isolate(elementsInRoom[i].dbIds, elementsInRoom[i].model); // isolate them so we can visualize them.
  }

  console.groupEnd();
}

/***************************************************
** FUNC: dbIdsToExternalIds()
** DESC: convert dbIds from the viewer session to persistent Ids from the Tandem database
**********************/

export async function dbIdsToExternalIds() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("NOTHING SELECTED");
    return;
  }

  console.group("STUB: getElementIdsFromDbIds()");

  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);

    //DtModel.prototype.getDbIdsFromElementIds = async function(elementIds) {   NOTE: reverse function is available too
    const elementIds = await model.getElementIdsFromDbIds(selSet);

    let mappingTable = [];
    selSet.forEach((item, index) => {
      let newObj = {};
      newObj.dbid = item;
      newObj.externalId = elementIds[index];
      mappingTable.push(newObj);
    });
    console.table(mappingTable);
    console.groupEnd();
  }

  console.groupEnd();
}

//DtModel.prototype.getDbIdsFromElementIds = async function (elementIds) {
