import * as utils from './utils.js';

/***************************************************
** FUNC: dumpDtFacilityInfo()
** DESC: dump out as much info as we can about the Facility (just to show what is available)
**********************/

export async function dumpDtFacilityInfo() {
  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

  console.group("STUB: dumpDtFacilityInfo()")

  console.log("getCurrentFacility()", facility);
  console.log("facility.urn()", facility.urn());
  console.log("facility.settings", facility.settings);
  console.log("facility.thumbnailUrl", facility.thumbnailUrl);
  //console.log("facility.getThumbnail()", await facility.getThumbnail());    // you can get this, but its just bytes
  console.log("facility.getClassificationTemplate()", await facility.getClassificationTemplate());

  console.log("facility.getUsers()");
  console.table(await facility.getUsers());

  console.log("facility.getSubjects()");
  console.table(await facility.getSubjects());

  console.log("facility.getModels(skipDefault=false)", facility.getModels());
  console.log("facility.getModels(skipDefault=true)", facility.getModels(true));
  console.log("facility.getPrimaryModel()", facility.getPrimaryModel());

  console.log("facility.canManage()", facility.canManage());
  console.log("facility.isOwner()", facility.isOwner());
  console.log("facility._getAccessLevel()", facility._getAccessLevel());

  console.log("facility.getSharedToLocalSpaceTransform()", facility.getSharedToLocalSpaceTransform());
  console.log("facility.getLocalToSharedSpaceTransform()", facility.getLocalToSharedSpaceTransform());
  console.log("facility.getDefaultModelId()", facility.getDefaultModelId());
  console.log("facility.getDefaultModel()", facility.getDefaultModel());
  console.log("facility.isSampleFacility()", facility.isSampleFacility());
  console.log("facility.getStreamManager()", facility.getStreamManager());
  //console.log("facility.getAllRoomsInfo()", facility.getAllRoomsInfo());  (TBD: dissappeared??)
  console.log("facility.getAllImportedSystemClasses()", facility.getAllImportedSystemClasses());
  console.log("facility.getSavedViewsList()", await facility.getSavedViewsList());
  console.log("facility.getSchemaVersion()", await facility.getSchemaVersion());
  console.log("facility.getBuiltInClassificationSystem()", await facility.getBuiltInClassificationSystem());

  console.groupEnd();

  /* other functions...
  load(needResetFacetsManager = false)
  reloadSettings()
  getModelByUrn(urn)
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
  getModelLoadOptions(model, visibleModelsForView);
  unloadModels();
  unloadModel(model, skipFacetUpdate);
  isModelVisible(model);
  showModel(model);
  hideModel(model);
  excelImport(importData);
  loadUsageMetrics(fromCache = false)
  triggerAssetCleanup()
  setHiddenElementsForView(hiddenElements);
  getHiddenElementsByModel();
  getVisibleElementsByURN(skipDefault = false)
  selectAllVisibleElements();
  getHistory(timestamps, min, max, includeChanges)
  deactivateExtensions()
  getDocumentContentUrl(doc)
  setupTransforms(mainModel)
  createDefaultModel()
  hide3D();
  show3D();
  setTwinClassificationSource(classificationSourceAttr, skipMapAttrTask = false)
  getElementsInRoom(modelId, roomDbId)
  getRoomsOfElement(model, elementId)
  assignRooms(boundByUpperFloor, skipRoomBounders)
  encodeIds(modelToDbIds, useFullIds)
  resolveXrefs(xrefs)
  loadMetaData()
  updateRoomsLink(rooms
  updateSystemClass(selections, systemsToAdd, systemsToDelete)
  goToView(view);
  */
}

/***************************************************
** FUNC: dumpDtAppInfo()
** DESC: dump out all the info attached to the App object
**********************/

export async function dumpDtAppInfo() {
  const dtApp = window.DT_APP;  // this was stashed away for us by index.js when the viewer was initiated

  console.group("STUB: dumpDtAppInfo()")

  console.log("getCurrentTeamsFacilities()", await dtApp.getCurrentTeamsFacilities());
  console.log("getSharedFacilities()", await dtApp.getSharedFacilities());
  console.log("getTeams()", await dtApp.getTeams());
  console.log("getActiveTeam()", await dtApp.getActiveTeam());
  //console.log("getSampleFacility()", await dtApp.getSampleFacility());


  console.groupEnd();

  /* wrappers for the following too..
  getOrCreateFacility(twinId, initialSettings);
  getFacility(urn);
  createFacility(settings);
  findFacility(urn);
  removeCachedFacility(urn);
  createSampleFacility();
  deleteFacility(urn);
  displayFacility(facility, visibleModelsForView, viewer, forceReload = false);
  setAsActiveTeam(dtTeam);
  setActiveTeamUrn(urn);
  */
}

/***************************************************
** FUNC: dumpDtConstants()
** DESC: dump out all the Constants that are part of the DT data model
**********************/

export async function dumpDtConstants() {
  const dtConst = Autodesk.Tandem.DtConstants;

  console.group("STUB: dumpDtConstants()")

  console.log("getForgeUnits()", await dtConst.getForgeUnits());
  console.log("getForgeUnitSpecs()", await dtConst.getForgeUnitSpecs());
  console.log("getRevitCategories()", await dtConst.getRevitCategories());
  console.log("getParameterSetsLibrary()", await dtConst.getParameterSetsLibrary());
  console.log("getParameterLibrary()", await dtConst.getParameterLibrary());
  console.log("getFacilityTemplatesLibrary()", await dtConst.getFacilityTemplatesLibrary());
  console.log("getClassificationsLibrary()", await dtConst.getClassificationsLibrary());
  //console.log("getTandemCategories()", await dtConst.getTandemCategories());
  console.log("getSystemClassNames()", await dtConst.getSystemClassNames());
  //console.log("matchClassification()", await dtConst.matchClassification());
  //console.log("checkClassificationSystem()", await dtConst.checkClassificationSystem());
  //console.log("isBuiltInClassificationSystem()", await dtConst.isBuiltInClassificationSystem());
  //console.log("matchAttributeContext()", await dtConst.matchAttributeContext());

  //async function getClassification(uuid) {
  //function isBuiltInClassificationSystem(uuid) {

    // TBD: following call fails "ReferenceError: CAT_TO_DISC is not defined"
  //console.log("getRevitCategoryToDisciplineMapping()", await dtConst.getRevitCategoryToDisciplineMapping());


  console.log("QC", dtConst.QC);
  console.log("QCOverrides", dtConst.QCOverrides);
  console.log("ColumnFamilies", dtConst.ColumnFamilies);
  console.log("ColumnNames", dtConst.ColumnNames);
  console.log("ElementFlags", dtConst.ElementFlags);
  console.log("StandardAttributes", dtConst.StandardAttributes);
  console.log("FamilyAttributes", dtConst.FamilyAttributes);
  console.log("StreamsImportExportTableHeader", dtConst.StreamsImportExportTableHeader);
  console.log("HiddenRevitCategories", dtConst.HiddenRevitCategories);
  console.log("ModelImportState", dtConst.ModelImportState);
  console.log("MutationActions", dtConst.MutationActions);
  console.log("SystemState", dtConst.SystemState);
  console.log("ImportStateLabels", dtConst.ImportStateLabels);
  console.log("DtAccessLevel", dtConst.DtAccessLevel);
  console.log("ChangeTypes", dtConst.ChangeTypes);
  console.log("SystemFilterNames", dtConst.SystemFilterNames);
  console.log("SystemElementFirstKey", dtConst.SystemElementFirstKey);
  console.log("StreamState", dtConst.StreamState);
  console.log("CenterlineCatIDs", dtConst.CenterlineCatIDs);
  console.log("StreamStates", dtConst.StreamStates);
  console.log("StreamOfflineTimeouts", dtConst.StreamOfflineTimeouts);
  console.log("StreamStatePriority", dtConst.StreamStatePriority);
  console.log("Timeline", dtConst.Timeline);
  console.log("ClassificationAttribute2FilterKey", dtConst.ClassificationAttribute2FilterKey);
  console.log("HUD_LAYER", dtConst.HUD_LAYER);
  console.log("RC", dtConst.RC);
  console.log("TC", dtConst.TC);
  console.log("AttributeFlags", dtConst.AttributeFlags);
  console.log("AttributeType", dtConst.AttributeType);
  console.log("AttributeContext", dtConst.AttributeContext);

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
** FUNC: loadFacilityUsageMetrics()
** DESC: dump out the usage metrics for this facility
**********************/

export async function loadFacilityUsageMetrics() {
  const facility = utils.getCurrentFacility();
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
** FUNC: getFacilityHistory()
** DESC: get history of changes on this facility
**********************/

export async function getFacilityHistory() {
  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  console.group("STUB: getFacilityHistory()");

  const dateNow = new Date();
  const timestampEnd = dateNow.getTime();
  console.log("Time Now:", dateNow, timestampEnd);

  const dateMinus30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const timestampStart = dateMinus30.getTime();
  console.log("30 Days Ago:", dateMinus30, timestampStart);

  console.log("NOTE: API allows any time range, but using last 30 days.")

  const history = await facility.getHistory([], timestampStart, timestampEnd, true);
  console.log("History", history);

  console.groupEnd();
}

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
