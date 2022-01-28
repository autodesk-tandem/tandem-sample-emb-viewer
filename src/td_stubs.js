
import * as vw_stubs from './vw_stubs.js';
import * as td_utils from './td_utils.js';


/***************************************************
** FUNC: getDtProperties()
** DESC: get all the Parameters attached to the selected entities.  If there is only one item selected,
** dump out a verbose table of info.
**********************/

export async function getDtProperties() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getDtProperties()")

    // The aggregate set comes back as array of pairs (Model, SelSet)
  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);

      // TBD: what does options do here?
    //DtModel.prototype.getPropertiesDt = async function(dbIds, options = {}).  Need a way
    // for user to input whether they want history or other options "on"
    const allProps = await model.getPropertiesDt(selSet, { history: false });
    console.log("allProps", allProps);

      // if they only selected a single item, print out some more verbose info about the properties
      // for easy reading in the debugging console.
    if (selSet.length === 1) {
      console.log("element properties...");
      console.table(allProps[0].element.properties);

      console.log("type properties...");
      console.table(allProps[0].type.properties);

      const woProp = allProps[0].element.properties.find(function(item) { return item.displayName === 'WO Id'; });
      if (woProp) {
        console.log("WO id value-->", woProp.displayValue);
      }
    }
    else {
      console.log("Multiple items in SelectionSet. Pick one item to see a table of properties.");
    }

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: getSingleAppliedParameter()
** DESC: get the specific property that we use to assign Workorder ID
**********************/

export async function getSingleAppliedParameter() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  if (aggrSet.length > 1) {
    alert("Select only one element");
    return;
  }

  if (aggrSet.length && (aggrSet[0].selection.length > 1)) {
    alert("Select only one element");
    return;
  }

  console.group("STUB: getSingleAppliedParameter()");

  //const propName = "WO Id"; // change this in the debugger if you want a different property retrieved
  //const propName = "Param A"; // change this in the debugger if you want a different property retrieved
  const propCategory = "Common"; // change this in the debugger if you want a different property retrieved
  const propName = "Name"; // change this in the debugger if you want a different property retrieved
  //debugger;

  const propValue = await td_utils.getAppliedParameterSingleElement(propCategory, propName, aggrSet[0].model, aggrSet[0].selection[0]);
  if (propValue)
    console.log(`Property \"${propName}\" = ${propValue}`);
  else
    console.log("Could not find property: ", propName);

  console.groupEnd();
}

/***************************************************
** FUNC: getMultiModelAppliedParameter()
** DESC: get a specific property across multiple items sselected
**********************/

export async function getMultiModelAppliedParameter() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getMultiModelAppliedParameter()");

  //const propName = "WO Id"; // change this in the debugger if you want a different property retrieved
  const propCategory = "Common"; // change this in the debugger if you want a different property retrieved
  const propName = "Name"; // change this in the debugger if you want a different property retrieved
  //debugger;

  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

    const propValues = await td_utils.getAppliedParameterMultipleElements(propCategory, propName, aggrSet[i].model, aggrSet[i].selection);
    if (propValues) {
      console.log("Property values -->");
      console.table(propValues);
    }
    else
      console.log("Could not find property: ", propName);

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: queryAppliedParameter()
** DESC: get a specific property across multiple items sselected
**********************/

export async function queryAppliedParameter() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: queryAppliedParameter()");

  //const propName = "WO Id"; // change this in the debugger if you want a different property retrieved
  const propCategory = "Common"; // change this in the debugger if you want a different property retrieved
  const propName = "Name"; // change this in the debugger if you want a different property retrieved
  const matchStr = "Basic Wall";  // trying to find things where NAME="Basic showAll"
  //const matchStr = "Rectangular Duct";  // trying to find things where NAME="Rectangular Duct"
  //debugger;

  NOP_VIEWER.clearSelection(); // start with nothing selected so its correct when we call isoloate()

  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

    const propValues = await td_utils.queryAppliedParameterMultipleElements(propCategory, propName, aggrSet[i].model, aggrSet[i].selection);
    if (propValues) {
      const matchingProps = propValues.filter(prop => prop.value === matchStr);   // filter out the ones that match our query

      if (matchingProps.length) {
        console.log("Matching property values-->");
        console.table(matchingProps);

          // extract all the dbids from the array of objects returned
        const dbIds = matchingProps.map(a => a.dbId);
        NOP_VIEWER.isolate(dbIds, aggrSet[i].model); // isolate them so we can visualize them.
      }
      else {
        console.log("No elements found with that value");
        NOP_VIEWER.isolate([0], aggrSet[i].model); // ghost the entire model, because we found nothing
      }
    }
    else {
      console.log("Could not find any elements with that property: ", propName);
      NOP_VIEWER.isolate([0], aggrSet[i].model); // ghost the entire model, because we found nothing
    }

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: setWoParameter()
** DESC: set the specific property we use to assign Workorder ID
**********************/

export async function setWoParameter() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: setWoParameter()")

  const randomNum = td_utils.getRandomInt(1000); // generate some random number to update the WO ID (obviously we would need to set a valid value)
  const randomStr = "RandomName_" + randomNum.toString();
  console.log("Setting Random number for Workorder ID = ", randomStr);

    // loop through each model and do the mutation for each one with proper hash
  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

      // NOTE: number of mutations has to match number of dbIds in selSet, so create an array of muts the same
      // size to match each dbId.  This current code is not good enough for multi-model situations where a hash is needed
      // as the 3rd argument in the mutation.  TODO: figure out how to find the hash.
      // Also: the value "z:3Ao" needs to be looked up dynamically from the column name.
    const muts = [];
    aggrSet[i].selection.forEach((dbId) => {
          // look up attribute name, and use hash as 3rd argument
      muts.push(["n:n", randomStr]);    // TBD: probably can't rely on the value "z:3Ao".  Might need to look that up like in function above
    });

    await aggrSet[i].model.mutate(aggrSet[i].selection, muts, "WO_Tandem App Update")
        .then(() => {
          console.info('Update succeeded');
        })
        .catch((err) => {
          console.error('Update failed', err);
        });

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: setSingleSelectionParameter()
** DESC: set the specific property we are interested in
**********************/

export async function setSingleSelectionParameter() {
    // NOTE: this is just to demonstrate for a test.  Normally you would already know the [model, dbId] and not have to
    // retrieve it from the user.  Example; you had a list of objects that were identified by some other logic that needed
    // this property set.  See contrast with the way setMultipleSelectionParameter() works.
  const aggrSet = vw_stubs.getSingleSelectedItem();
  if (!aggrSet) {
    // alert("No objects selected");  // alert message already displayed by utility funciton
    return;
  }

  console.group("STUB: setSingleSelectionParameter()")

  const internalName = await td_utils.lookupPropertyInternalName("Common", "Name", aggrSet[0].model, aggrSet[0].selection[0]);
  if (internalName) {
    const randomNum = getRandomInt(1000); // generate some random number to update the WO ID (obviously we would need to set a valid value)
    const randomStr = "RandomName_" + randomNum.toString();
    console.log("Setting Random number for Name property = ", randomStr);

    const muts = [];
    muts.push([internalName, randomStr]);       // do we need 3rd arg for hash?

    await aggrSet[0].model.mutate(aggrSet[0].selection, muts, "WO_Tandem App Update")
        .then(() => {
          console.info('Update succeeded');
        })
        .catch((err) => {
          console.error('Update failed', err);
        });

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: dumpDtFacilityInfo()
** DESC: dump out as much info as we can about the Facility (just to show what is available)
**********************/

export async function dumpDtFacilityInfo() {
  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

  console.group("STUB: dumpDtFacilityInfo()")

  console.log("getCurrentFacility()", facility);
  console.log("facility.urn", facility.urn());
  console.log("facility.settings", facility.settings);
  console.log("facility.thumbnailUrl", facility.thumbnailUrl);
  //console.log("facility.getThumbnail()", await facility.getThumbnail());    TBD: this fails if there is no thumbnail (even if thumnailURL returns something)
  console.log("facility.getClassificationTemplate()", await facility.getClassificationTemplate());

  console.log("facility.getUsers()");
  console.table(await facility.getUsers());

  console.log("facility.getSubjects()");
  console.table(await facility.getSubjects());

  console.log("facility.getModels()", facility.getModels());
  console.log("facility.getPrimaryModel()", facility.getPrimaryModel());
  console.log("facility.getParameterSets()", await facility.getParameterSets());

  console.log("facility.canManage()", facility.canManage());
  console.log("facility.isOwner()", facility.isOwner());
  console.log("facility._getAccessLevel()", facility._getAccessLevel());

  console.log("facility.getAttributeDefinitions()");
  console.table(await facility.getAttributeDefinitions());

  console.log("facility.getSharedToLocalSpaceTransform()", facility.getSharedToLocalSpaceTransform());
  console.log("facility.getLocalToSharedSpaceTransform()", facility.getLocalToSharedSpaceTransform());
  console.log("facility.getDefaultModelId()", facility.getDefaultModelId());


  console.groupEnd();

  /* other functions...
  addParameterSet(pset);
  deleteParameterSet(pset);
  getUploadModelLink(realFileName);
  confirmUploadModel(linkDetails);
  createModels(modelsParams);
  updateModel(model, filename, urn, phaseNames);
  deleteModel(model);
  updateSettings(data);
  makePrimary(model);
  getLinkForModel(model);
  updateLinkForModel(model, link);
  updateThumbnail(file);
  updateClassificationTemplate(classification);
  setUserAccess(userID, accessLevel, name);
  setGroupAccess(groupId, accessLevel, name);
  getCommonProperties(models, dbIds);
  loadModels(visibleModelsForView = undefined);
  loadModel(model, priority = LoadPriority.Visible, skipQueue = false);
  async processLoadQueue();
  async waitForAllModels();
  getModelLoadOptions(model, visibleModelsForView);
  unloadModels();
  unloadModel(model, skipFacetUpdate);
  isModelVisible(model);
  showModel(model);
  hideModel(model);
  excelImport(importData);
  triggerAssetCleanup();
  setHiddenElementsForView(hiddenElements);
  getHiddenElementsByModel();
  selectAllVisibleElements();
  getHistory(timestamps, min, max, includeChanges);
  getDocumentContentUrl(doc);
  createDefaultModel();
  createStream(name, modelToLinkTo, dbIdToLinkTo);
  hide3D();
  show3D();
  */
}

/***************************************************
** FUNC: getParameterSets()
** DESC: pretty print out the ParameterSets for this facility
**********************/

export async function getParameterSets() {
  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

  console.group("STUB: getParameterSets()")

  const paramSets = await facility.getParameterSets();
  console.log("facility.getParameterSets()");
  console.table(paramSets);

  for (let i=0; i<paramSets.length; i++) {
    console.log(`Parameters for: "${paramSets[i].name}" -->`);
    console.table(paramSets[i].parameters);
  }

  console.groupEnd();
}


/***************************************************
** FUNC: dumpDtConstants()
** DESC: dump out all the Constants that are part of the DT data model
**********************/

export async function dumpDtConstants() {
  const dtConst = Autodesk.Viewing.Private.DtConstants;

  console.group("STUB: dumpDtConstants()")

  console.log("getForgeUnits()", await dtConst.getForgeUnits());
  console.log("getForgeUnitSpecs()", await dtConst.getForgeUnitSpecs());
  console.log("getRevitCategories()", await dtConst.getRevitCategories());
  console.log("getParameterSetsLibrary()", await dtConst.getParameterSetsLibrary());
  console.log("getFacilityTemplatesLibrary()", await dtConst.getFacilityTemplatesLibrary());
  console.log("getClassificationsLibrary()", await dtConst.getClassificationsLibrary());

    // TBD: following call fails "ReferenceError: CAT_TO_DISC is not defined"
  //console.log("getRevitCategoryToDisciplineMapping()", await dtConst.getRevitCategoryToDisciplineMapping());

  //console.log("matchClassification()", await dtConst.matchClassification(a, b));
  //mapUniformatToClass(uf);

  console.log("DtClass", dtConst.DtClass);
  console.log("DtClassNames", dtConst.DtClassNames);
  console.log("DtClassNamesToUniformat", dtConst.DtClassNamesToUniformat);
  console.log("UniformatToDtClass", dtConst.UniformatToDtClass);
  console.log("StreamBaseParameterSet", dtConst.StreamBaseParameterSet);
  console.log("StandardAttributes", dtConst.StandardAttributes);
  console.log("HiddenRevitCategories", dtConst.HiddenRevitCategories);
  console.log("ModelImportState", dtConst.ModelImportState);
  console.log("ImportStateLabels", dtConst.ImportStateLabels);
  console.log("DtAccessLevel", dtConst.DtAccessLevel);
  console.log("ChangeTypes", dtConst.ChangeTypes);
  console.log("SystemColumns", dtConst.SystemColumns);
  console.log("QC", dtConst.QC);
  console.log("QCOverrides", dtConst.QCOverrides);

  console.log("UNIFORMAT_UUID", dtConst.UNIFORMAT_UUID);
  console.log("MASTERFORMAT_UUID", dtConst.MASTERFORMAT_UUID);

  console.log("DT_URN_PREFIX", dtConst.DT_URN_PREFIX);
  console.log("DT_MODEL_URN_PREFIX", dtConst.DT_MODEL_URN_PREFIX);
  console.log("DT_TWIN_URN_PREFIX", dtConst.DT_TWIN_URN_PREFIX);
  console.log("DT_USER_URN_PREFIX", dtConst.DT_USER_URN_PREFIX);
  console.log("DT_GROUP_URN_PREFIX", dtConst.DT_GROUP_URN_PREFIX);
  console.log("DT_DOCUMENT_URN_PREFIX", dtConst.DT_DOCUMENT_URN_PREFIX);

  console.groupEnd();
}

/***************************************************
** FUNC: dumpDtAppInfo()
** DESC: dump out all the info attached to the App object
**********************/

export async function dumpDtAppInfo() {
  const dtApp = window.DT_APP;  // this was stashed away for us by index.js when the viewer was initiated

  console.group("STUB: dumpDtAppInfo()")

  console.log("getCurrentTeamsFacilities()", await dtApp.getCurrentTeamsFacilities());
  console.log("getUsersFacilities()", await dtApp.getUsersFacilities());
  console.log("getTeams()", dtApp.getTeams());
  console.log("getActiveTeam()", dtApp.getActiveTeam());
  console.log("canManage()", dtApp.canManage());

  console.groupEnd();

  /* wrappers for the following too..
  findFacility(urn);
  createSampleFacility();
  createFacility(settings);
  deleteFacility(urn);
  getFacility(urn);
  displayFacility(facility, visibleModelsForView, viewer);
  loadTeams()
  setAsActiveTeam(urn);
  */
}


/***************************************************
** FUNC: getLevels()
** DESC: dump out the levels for each model in the facility
**********************/

export async function getLevels() {
  const models = td_utils.getLoadedModels();
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
    console.table(levelObjs);

      // extract the levelIds out of this object
    const levelIds = [];
    for (let key in levelObjs)
      levelIds.push(levelObjs[key].dbid);

      // arbitrarily get the elements on the first level in the array and then isolate them
    if (levelIds?.length) {
      console.log("isolating levels[0] in viewer...");
      const levelElementIds = models[i].getElementsForLevel(levelIds[0]);

      //console.log("levelIds", levelIds);
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
  const models = td_utils.getLoadedModels();
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
    if (roomObjs.length === 0) {
      console.log("There are no rooms in this model");
      NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
    }
    else {
      console.table(roomObjs);

        // extract all the dbids from the array of objects returned
        // TBD: note that getRooms() returns an array, but getLevels() returns something array-like
        // also, the property names are inconsistent (dbid and dbId)
      let roomIds = roomObjs.map(a => a.dbId);

      console.log("roomIds", roomIds);
      NOP_VIEWER.isolate(roomIds, models[i]); // isolate them so we can visualize them.
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: dumpSingleModel()
** DESC: helper function to dump out the info for a single model
**********************/

async function dumpSingleModel(model) {
  console.log("getQueryParams()", model.getQueryParams());
  console.log("urn()", model.urn());
  console.log("isDefault()", model.isDefault());
  console.log("getParentFacility()", model.getParentFacility());
  console.log("isPrimaryModel()", model.isPrimaryModel());
  console.log("isVisibleByDefault()", model.isVisibleByDefault());
  console.log("label()", model.label());
  console.log("accessLevel()", model.accessLevel());
  console.log("getData()", model.getData());
  console.log("getDocumentNode()", model.getDocumentNode());
  console.log("getRoot()", model.getRoot());
  console.log("getRootId()", model.getRootId());
  //console.log("getUnitData()", model.getUnitData());  //deprecated!
  console.log("getUnitScale()", model.getUnitScale());
  console.log("getUnitString()", model.getUnitString());
  console.log("getDisplayUnit()", model.getDisplayUnit());
  console.log("getDefaultCamera()", model.getDefaultCamera());
  console.log("isAEC()", model.isAEC());
  console.log("getUpVector()", model.getUpVector());
  console.log("geomPolyCount()", model.geomPolyCount());
  console.log("instancePolyCount()", model.instancePolyCount());
  console.log("isLoadDone()", model.isLoadDone());
  console.log("isObjectTreeCreated()", model.isObjectTreeCreated());
  console.log("getPropertyDb()", model.getPropertyDb());
  //console.log("getObjectTree()", model.getObjectTree(onsuccesscb, onerrorCb));

    // TBD: should fetchTopolgy() fail badly if hasTopology() is false.  Currently it does,
    // seems like it should just return null or something.
  const hasIt = model.hasTopology();
  console.log("hasTopology()", hasIt);
  if (hasIt)
    console.log("fetchTopology()", await model.fetchTopology());

  console.log("hasGeometry()", model.hasGeometry());
  console.log("getBasePath()", model.getBasePath());

  console.log("getLevels()");
  console.table(await model.getLevels());

  console.log("getRooms()");
  console.table(await model.getRooms());

  console.log("getHash2Attr()", await model.getHash2Attr());

  console.log("getModelProperties()", await model.getModelProperties());
  console.log("fileName()", model.fileName());
  console.log("displayName()", model.displayName());
  console.log("isLoaded()", model.isLoaded());
  console.log("getSeedUrn()", model.getSeedUrn());
  console.log("canEdit()", model.canEdit());
  console.log("getFullXConns()", model.getFullXConns());

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
  const models = td_utils.getLoadedModels();
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
  const models = td_utils.getLoadedModels();
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
  const models = td_utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

    // TBD: doesn't work.  And isn't consistent with getHistory() in usage of the dates.
    // this one requires you to know to get the date into a specific format.  Probably should take
    // Date objects and then do that formatting inside the getUsageMetrics() function.
  const startDate = new Date(2020, 0, 1);  // arbitrarily the beginning of 2020
  const endDate = new Date();  // today

  const start = td_utils.formatDateYYYYMMDD(startDate);
  const end = td_utils.formatDateYYYYMMDD(endDate);


  console.group("STUB: getUsageMetrics()");

  for (let i=0; i<models.length; i++) {
    const usage = await models[i].getUsageMetrics(start, end);
    console.group(`Model[${i}]--> ${models[i].label()}`);

    console.table(usage);
    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: loadFacilityUsageMetrics()
** DESC: dump out the usage metrics for this facility
**********************/

export async function loadFacilityUsageMetrics() {
  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  console.group("STUB: loadFacilityUsageMetrics()");

  const metrics = await facility.loadUsageMetrics();
  console.log("Metrics", metrics);

  console.groupEnd();
}



/***************************************************
** FUNC: getElementClass()
** DESC: dump out the history for this model
**********************/

export async function getElementClass() {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("NOTHING SELECTED");
    return;
  }

  console.group("STUB: getElementClass()");

  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);

      // NOTE: these return a DtConstants::class() and DtConstants::className()
      // iterate through the selection set and make a new array that has the {dbid, class, className}
      // so we can dump a table to the console window.
    let selSetInfo = [];
    selSet.forEach((item, index) => {
      let newObj = {};
      newObj.dbid = item;
      newObj.dtClass = model.getElementClass(item);
      newObj.dtClassName = model.getElementClassName(item);
      selSetInfo.push(newObj);
    });
    console.table(selSetInfo);
    console.groupEnd();
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

/***************************************************
** FUNC: getFacilityDocuments()
** DESC: dump out the documents assigned to this facility
**********************/

export async function getFacilityDocuments() {
  const facility = td_utils.getCurrentFacility();
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

export async function getDocument() {
  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  // TBD: this function is a little whack.  If you pass in a bad docId, it will just crap out in the REST call,
  // when it should probably return NULL to javascript or something.
  console.group("STUB: getDocument()");
  const docId = "urn:adsk.dtd:SqzGFsAfS3CcknEqlON_gA"; // change this to something valid (you can get by calling getFacilityDocuments() first and console window)

  const doc = await facility.getDocument(docId);
  console.log("Document", doc);

  console.groupEnd();
}

/***************************************************
** FUNC: deleteDocument()
** DESC: get a specific document by ID
**********************/

export async function deleteDocument() {
  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  console.group("STUB: deleteDocument()");
  const docId = "urn:adsk.dtd:SqzGFsAfS3CcknEqlON_gA"; // change this to something valid (you can get by calling getFacilityDocuments() first and console window)

  const doc = await facility.deleteDocument(docId);

  console.groupEnd();
}


function onSearchSuccessCB(results) {
  console.log("Results", results);
}

function onSearchErrorCB(e) {
  console.log("ERROR", e);
}

/***************************************************
** FUNC: search()
** DESC: search the object property database
**********************/

export async function search() {
  const models = td_utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: search()");

  const searchStr = "New Construction";  // arbitrarily string; change here or put debugger breakpoint to change in console.

  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);

    await models[i].search(searchStr, onSearchSuccessCB, onSearchErrorCB, ["r:8gI"]);

    console.groupEnd();
  }

  console.groupEnd();
}
