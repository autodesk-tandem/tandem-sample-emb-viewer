
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
  //console.log("getSeedUrn()", model.getSeedUrn());
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
    console.log(`Model URN: ${models[i].urn()}`);

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
    console.log(`Model URN: ${models[i].urn()}`);

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
    console.log(`Model URN: ${models[i].urn()}`);
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

    // loop through each model and get the data for levels
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

    const levelObjs = await models[i].getLevels();
    if (levelObjs)
      console.table(levelObjs);
    else
      console.log("No levels found in this model.");

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: isolateLevel()
** DESC: Take one Level and isolate it in the viewer
**********************/

export async function isolateLevel(levelName) {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: isolateLevel()");

  console.log(`Isolating level "${levelName}"...`);

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for levels
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

    const levelObjs = await models[i].getLevels();

    // find the named levels for this models
    let levelIds = [];
    for (let key in levelObjs) {
      if (levelObjs[key].name === levelName)
        levelIds.push(levelObjs[key].dbId);
    }

      // if we found levels in this model, turn those objects on
    if (levelIds.length > 0) {
      let levelElementIds = [];
      for (let id in levelIds) {
         levelElementIds.push(...models[i].getElementsForLevel(levelIds[id]));
      }

      console.log(`isolating ${levelElementIds.length} elements on this level in viewer...`);

      NOP_VIEWER.isolate(levelElementIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("That level not found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: isolateRooms()
** DESC: dump out the rooms for each model in the facility
**********************/

export async function isolateRooms() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: isolateRooms()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for rooms
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

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
** FUNC: showElementsInRoom()
** DESC: find the elements that are part of a room and isolate them in the viewer
**********************/

export async function showElementsInRoom() {

  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

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

  const elementsInRoom = await facility.getElementsInRoom(aggrSet[0].model.urn(), roomDbId);
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
** FUNC: getRoomsOfElement()
** DESC: find the rooms this element is associated with
**********************/

export async function getRoomsOfElement() {

  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

  const aggrSet = vw_stubs.getSingleSelectedItem();
  if (!aggrSet) {
    return;
  }

  console.group("STUB: getRoomsOfElement()");

  const roomsOfElement = await facility.getRoomsOfElement(aggrSet[0].model, aggrSet[0].selection[0])

  console.table(roomsOfElement);

    // now we will go through and display those in the viewer and hide everything else
    // need to get all the models in the facility so we can hide the ones that we aren't interested in
  NOP_VIEWER.clearSelection();  // start the viewer in a clean slate

  if (roomsOfElement.length) {
    const aggrSet = [];
    for (let i=0; i<roomsOfElement.length; i++) {
      NOP_VIEWER.show(roomsOfElement[i].dbId, roomsOfElement[i].model);

        // now put this into our aggrSet object
      let found = false;
      for (let j=0; j<aggrSet.length; j++) {
        if (aggrSet[j].model === roomsOfElement[i].model) {
          aggrSet[j].selection.push(roomsOfElement[i].dbId);
          found = true;
          break;
        }
      }
      if (!found) {
        aggrSet.push( { model: roomsOfElement[i].model, selection: [roomsOfElement[i].dbId] });
      }
    }
      // now select these rooms so they are clearly visible
    NOP_VIEWER.setAggregateSelection(aggrSet);
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

    //console.group(`Model[${i}]--> []${model.label()}, ${model.urn()}]`);
    console.group(`Model[${i}]--> ${model.label()}`);
    console.log(`Model URN: ${model.urn()}`);

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

/***************************************************
** FUNC: getElementUfClass()
** DESC:
**********************/

export async function getElementUfClass() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getElementUfClass()");

    // The aggregate set comes back as array of pairs (Model, SelSet)
  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);
    console.log(`Model URN: ${model.urn()}`);

    const prettyPrintArray = [];
    for (let j=0; j<selSet.length; j++) {
      const newObj = { dbId: selSet[j], ufClass: model.getElementUfClass(selSet[j]) };
      prettyPrintArray.push(newObj);
    }

    console.table(prettyPrintArray);

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getElementCustomClass()
** DESC:
**********************/

export async function getElementCustomClass() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getElementCustomClass()");

    // The aggregate set comes back as array of pairs (Model, SelSet)
  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);
    console.log(`Model URN: ${model.urn()}`);

    const prettyPrintArray = [];
    for (let j=0; j<selSet.length; j++) {
      const newObj = { dbId: selSet[j], customClass: model.getElementCustomClass(selSet[j]) };
      prettyPrintArray.push(newObj);
    }

    console.table(prettyPrintArray);

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getElementBounds()
** DESC:
**********************/

export async function getElementBounds() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getElementBounds()");

    // The aggregate set comes back as array of pairs (Model, SelSet)
  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);
    console.log(`Model URN: ${model.urn()}`);

    for (let j=0; j<selSet.length; j++) {
      console.log(`dbId: ${selSet[j]}, bounds:`, model.getElementBounds(selSet[j]));
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: isolateTaggedAssets()
** DESC: isolate tagged assets in the viewer
**********************/

export async function isolateTaggedAssets() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: isolateTaggedAssets()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for rooms
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

    const taggedObjs = await models[i].getTaggedAssets();
    console.log("Tagged Assets-->", taggedObjs);

      // extract the dbIds out of this object so we can highlight in the viewer
    const isoIds = [];
    for (let j=0; j<taggedObjs.rows.length; j++)
      isoIds.push(taggedObjs.rows[j]["l:d"]);

    if (isoIds.length) {
      console.log("isolating tagged assets in viewer...");
      NOP_VIEWER.isolate(isoIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("No tagged assets found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: utilSubractIdsFromAllIds()
** DESC:
**********************/

function utilSubractElementsFromAllIds(model, subtractElems) {

  const allIds = model.getElementIds();   // all elements in the model

    // pull the Ids out of the rows for each element
  const subtractIds = [];
  for (let j=0; j<subtractElems.rows.length; j++)
    subtractIds.push(subtractElems.rows[j]["l:d"]);

  console.log("subtractIds", subtractIds);

    // now filter those out of all the Ids
  const keepIds = [];
  for (let i=0; i<allIds.length; i++) {
    if (subtractIds.includes(allIds[i]) == false)
      keepIds.push(allIds[i]);
  }

  console.log("keepIds", keepIds);

  return keepIds;
}

/***************************************************
** FUNC: isolateUnTaggedAssets()
** DESC: isolate un-tagged assets in the viewer
**********************/

export async function isolateUnTaggedAssets() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: isolateUnTaggedAssets()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for rooms
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

    const taggedObjs = await models[i].getTaggedAssets();
    const isoIds = utilSubractElementsFromAllIds(models[i], taggedObjs);

    if (isoIds.length) {
      console.log("isolating un-tagged assets in viewer...");
      NOP_VIEWER.isolate(isoIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("No un-tagged assets found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: isolateClassifiedAssets()
** DESC: isolate classified assets in the viewer
**********************/

export async function isolateClassifiedAssets() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: isolateClassifiedAssets()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for rooms
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

    const taggedObjs = await models[i].getClassifiedAssets();
    console.log("Classified Assets-->", taggedObjs);

      // extract the dbIds out of this object so we can highlight in the viewer
    const isoIds = [];
    for (let j=0; j<taggedObjs.rows.length; j++)
      isoIds.push(taggedObjs.rows[j]["l:d"]);

    if (isoIds.length) {
      console.log("isolating classified assets in viewer...");
      NOP_VIEWER.isolate(isoIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("No classified assets found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: isolateUnClassifiedAssets()
** DESC: isolate un-tagged assets in the viewer
**********************/

export async function isolateUnClassifiedAssets() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: isolateUnClassifiedAssets()");

  NOP_VIEWER.clearSelection();

    // loop through each model and get the data for rooms
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log(`Model URN: ${models[i].urn()}`);

    const taggedObjs = await models[i].getClassifiedAssets();
    const isoIds = utilSubractElementsFromAllIds(models[i], taggedObjs);

    if (isoIds.length) {
      console.log("isolating un-classifiee assets in viewer...");
      NOP_VIEWER.isolate(isoIds, models[i]); // isolate them so we can visualize them.
    }
    else {
      console.log("No un-classified assets found in this model.");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}
