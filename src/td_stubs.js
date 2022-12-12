
import * as vw_stubs from './vw_stubs.js';
import * as td_utils from './td_utils.js';

/***************************************************
** FUNC: getQualifiedPropName()
** DESC: from a CategoryName and PropName (human-readable), look up the internal or "qualified" name that is
** needed in calls to query() or mutate().  NOTE: the same propertyName can have different qualified names for
** each model (i.e., names are model-dependent)
**********************/

export async function getQualifiedPropName(propCategory, propName) {

  const models = td_utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getQualifiedPropName()");

    // loop through each model and get the attributes (aka properties) schema
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);

    const attrs = await models[i].getHash2Attr();
    if (attrs) {
      for (let key in attrs) {
        const value = attrs[key];
        if ((value.category === propCategory) && (value.name === propName)) {
          console.log(`Found property [${propCategory} | ${propName}]: `, value);
        }
      }
        // NOTE: getHash2Attr() returns a map-like structure, but not one with iterators
        // so not all Javascript functions will work with it.
      //console.log("entries", Object.values(attrs));   // works
      //console.log("entries", attrs.values());       // does NOT work
        // iterate over map until we find our Property Name
      //for (let [key, value] of attrs) {
      //  if ((value.category === "propCategory") && (value.name === "propName")) {
      //    console.log(`Found property [${propCategory} | ${propName}]: `, value);
      //  }
      //}
    }

    console.groupEnd();
  }
}

/***************************************************
** FUNC: getDtPropertiesImpl()
** DESC: get all the Properties attached to the selected entities.  If there is only one item selected,
** dump out a verbose table of info. The query constructed will include the elements in the selSet + any
** types they reference.  For instance, selecting a will include the Wall itself and the WallFamily (in Revit terms)
**********************/

export async function getDtPropertiesImpl(withHistory) {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group(`STUB: getDtProperties(withHistory=${withHistory})`);

    // The aggregate set comes back as array of pairs (Model, SelSet)
  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);

      // TBD: what does options do here?
    //DtModel.prototype.getPropertiesDt = async function(dbIds, options = {}).
    const allProps = await model.getPropertiesDt(selSet, { history: withHistory });
    console.log("all props (raw obj)", allProps);

      // if they only selected a single item, print out some more verbose info about the properties
      // for easy reading in the debugging console.
    if (selSet.length === 1) {
      console.log("element properties:", allProps[0].element.properties);
      console.table(allProps[0].element.properties);

      if (allProps[0].type != null) {   // Not everything has Type properties (e.g., Rooms)
        console.log("type properties:", allProps[0].type.properties);
        console.table(allProps[0].type.properties);
      }
      else {
        console.log("type properties: NONE");
      }

        // if we want to find a specific value only with given displayName
      //const woProp = allProps[0].element.properties.find(function(item) { return item.displayName === 'WO Id'; });
      //if (woProp) {
      //  console.log("WO id value-->", woProp.displayValue);
      //}
    }
    else {
      console.log("Multiple items in SelectionSet. Pick one item to see a table of properties.");
    }

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: getDtProperties()
** DESC: call model.getDtProperties() with history flag set to false
**********************/

export async function getDtProperties() {
  getDtPropertiesImpl(false);
}

/***************************************************
** FUNC: getDtPropertiesWithHistory()
** DESC: call model.getDtProperties() with history flag set to true
**********************/

export async function getDtPropertiesWithHistory() {
  getDtPropertiesImpl(true);
}

/***************************************************
** FUNC: getCommonDtProperties()
** DESC: get all the Parameters attached to the selected entities. The query constructed will
** include the elements in the selSet + any types they reference.  For instance, selecting a wall
** will include the Wall itself and the WallFamily (in Revit terms)
**********************/

export async function getCommonDtProperties() {

  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTLY LOADED");
    return;
  }

  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getCommonDtProperties()")

    // The aggregate set comes back as array of pairs (Model, SelSet).  We need to get it into
    // an array of Models and a matching array of SelSets (e.g. [m1, m2] and [[1,2,3][4,5])
  const modelArray = [];
  const selSetArray = [];
  for (let i=0; i<aggrSet.length; i++) {
    modelArray.push(aggrSet[i].model);
    selSetArray.push(aggrSet[i].selection);
  }

  const allProps = await facility.getCommonProperties(modelArray, selSetArray);
  console.log("all common props (raw obj)", allProps);

  console.log("common element properties...");
  console.table(allProps.element.properties);

  console.log("common type properties...");
  console.table(allProps.type.properties);

  console.groupEnd();
}

/***************************************************
** FUNC: getPropertySelSet()
** DESC: get a specific property across multiple items sselected
**********************/

export async function getPropertySelSet(propCategory, propName) {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getPropertySelSet()");

  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

      // TBD: not sure yet exactly how all the options work or why to use model.query() over model.getDtProperties()
      // You can experiment by changing flags
    const queryInfo = {
      dbIds: aggrSet[i].selection,
      //classificationId: facility.settings?.template?.classificationId,
      includes: { standard: false, applied: true, element: true, type: false, compositeChildren: false }
    };

    const propValues = await td_utils.queryAppliedParameterMultipleElements(propCategory, propName, aggrSet[i].model, queryInfo);
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
** FUNC: findElementsWherePropValueEqualsX()
** DESC: get a specific property across multiple items selected where the property value is what
** we are looking for.   EXAMPLE: find all elements where "Common | Name" = "Basic Wall".  You can
** also specify whether to treat the matchStr as a Javascript regular expression, and you can specify
** whether to only search the elements that are visible in the viewer, or search all elements in the db
**********************/

export async function findElementsWherePropValueEqualsX(propCategory, propName, matchStr, isRegEx, searchVisibleOnly, isCaseInsensitive) {
    // we are going to try to search all elements in the database (that are loaded/visible in the viewer)
  const models = td_utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: findElementsWherePropValueEqualsX()");

  NOP_VIEWER.clearSelection(); // start with nothing selected so its correct when we call isoloate()

  //for (let i=0; i<models.length; i++) {
  for (let i=0; i<models.length; i++) { // TBD: switch back when bugs fixed
    console.group(`Model[${i}]--> ${models[i].label()}`);

    if (models[i].label() === "") {
      console.log("skipping null model...");  // TBD: bug in the system where we have a model with no geometry
    }
    else {
      let objsToSearch = null;
      if (searchVisibleOnly) {
          // get all the elements that are currently visible in the viewer
        console.log("searching only elments visible in the viewer...");
        objsToSearch = models[i].getVisibleDbIds();   // NOTE: this takes an ElementType flag (null = physcial objects)(see worker/dt-schema.js line 80+)
      }
      else {
          // dearch everything in the database regardless of whether its on screen in the viewer
        console.log("searching all elments in the database...");
        objsToSearch = models[i].getElementIds();
      }
        // TBD: not sure yet exactly how all the options work or why to use model.query() over model.getDtProperties()
        // You can experiment by changing flags
      const queryInfo = {
        dbIds: objsToSearch,
        //classificationId: facility.settings?.template?.classificationId,
        includes: { standard: true, applied: true, element: true, type: false, compositeChildren: true }
      };

      const propValues = await td_utils.queryAppliedParameterMultipleElements(propCategory, propName, models[i], queryInfo);
      if (propValues) {
        let matchingProps = null;
        if (isRegEx) {
          let regEx = null;
          if (isCaseInsensitive)
            regEx = new RegExp(matchStr, "i");
          else
            regEx = new RegExp(matchStr);

          console.log("Doing RegularExpression match for:", regEx);
          matchingProps = propValues.filter(prop => regEx.test(prop.value)); // filter out the ones that match our query using a RegEx
        }
        else {
          if (isCaseInsensitive) {
            console.log(`Doing case insensitive match for: "${matchStr}..."`);
            matchingProps = propValues.filter(prop => prop.value.toLowerCase() === matchStr.toLowerCase());   // filter out the ones that match our query exactly
          }
          else {
            console.log(`Doing literal match for: "${matchStr}..."`);
            matchingProps = propValues.filter(prop => prop.value === matchStr);   // filter out the ones that match our query exactly
          }
        }

        if (matchingProps.length) {
          console.log("Matching property values-->");
          console.table(matchingProps);

            // extract all the dbids from the array of objects returned
          const dbIds = matchingProps.map(a => a.dbId);
          NOP_VIEWER.isolate(dbIds, models[i]); // isolate them so we can visualize them.
        }
        else {
          console.log("No elements found with that value");
          NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
        }
      }
      else {
        console.log("Could not find any elements with that property: ", propName);
        NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: setPropertyOnElements()
** DESC: common bit of code to wrap the call to mutate() once you isolate the model and qualified property
**********************/

export async function setPropertyOnElements(model, dbIds, qualifiedPropName, newValue) {
  const muts = [];

    // NOTE: number of mutations and elements must match (even if mutation is the same each time)
  for (let i=0; i<dbIds.length; i++)
    muts.push([qualifiedPropName, newValue]);       // do we need 3rd arg for hash?

  await model.mutate(dbIds, muts, "EmbeddedViewerSampleApp Update")
      .then(() => {
        console.info('Update succeeded');
      })
      .catch((err) => {
        console.error('Update failed', err);
      });
}

/***************************************************
** FUNC: setPropertySelSet()
** DESC: set the specific property we are interested in.  If the property is already applied to the
** given element, it will update it.  If the property does not exist yet, it will add it.  NOTE: This
** does not take into account "Classification" logic.  It applies the property regardless of whether
** it is mapped to a classification in the Facility Template.
**********************/

export async function setPropertySelSet(propCategory, propName, propValue) {

  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: setPropertySelSet()");

    // loop through the models individually and set the property to something new
  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

    const attr = await td_utils.getQualifiedProperty(aggrSet[i].model, propCategory, propName);
    console.log("attr", attr);

    if (attr) {
      const typedValue = td_utils.convertStrToDataType(attr.dataType, propValue)
      if (typedValue != null) {    // check data type was expected and we could convert to it
        let fullyQualifiedPropName = "";
        if (attr.isNative())  // is this user-defined in Tandem?
          fullyQualifiedPropName = Autodesk.Tandem.DtConstants.ColumnFamilies.DtProperties + ":" + attr.id; // prepend with "z:" to get fully qualified
        else
          fullyQualifiedPropName = attr.id;

        console.log(`Setting value for "${propCategory} | ${propName}" = `, typedValue);
        setPropertyOnElements(aggrSet[i].model, aggrSet[i].selection, fullyQualifiedPropName, typedValue);
      }
      else {
        console.log("Property value could not be converted to expected type.");
      }
    }
    else {
      console.log(`Property named "${propCategory} | ${propName}" not found.`);
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: assignClassification()
** DESC: apply a Classification to the selected elements, which will determine which Properties
** are associated with the element. NOTE: the act of applying the classification will cause the
** associated properties to show up in subsequent calls to get the property, but as of now, the value
** is "undefined".  To give the value a default or initial value, you have to make a subsequent call
** via some code like setPropertySingleElement() in the above example.
**********************/

export async function assignClassification(classificationStr) {

  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }
  const classificationNode = await td_utils.findClassificationNode(facility, classificationStr);
  if (classificationNode == null) {
    alert("Could not find that classification in the current Facility Template.");
    return;
  }

  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: assignClassification()");

  const fullyQualifiedPropName = "n:!v";  // classification attribute (hardwired in system)

  console.log("classificationNode-->", classificationNode);
  console.log(`Setting classifiction to "${classificationStr}"`);

    // loop through the models individually and set the "Classification" property to a new value
  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

    setPropertyOnElements(aggrSet[i].model, aggrSet[i].selection, fullyQualifiedPropName, classificationStr);

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
  console.log("facility.urn()", facility.urn());
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

  console.log("facility.canManage()", facility.canManage());
  console.log("facility.isOwner()", facility.isOwner());
  console.log("facility._getAccessLevel()", facility._getAccessLevel());

  console.log("facility.getSharedToLocalSpaceTransform()", facility.getSharedToLocalSpaceTransform());
  console.log("facility.getLocalToSharedSpaceTransform()", facility.getLocalToSharedSpaceTransform());
  console.log("facility.getDefaultModelId()", facility.getDefaultModelId());
  //console.log("facility.getDefaultModel()", facility.getDefaultModel());      // TBD: currently crashes
  console.log("facility.getStreamManager()", facility.getStreamManager());    // TBD: currently returns "undefined"
  console.log("facility.getAllRoomsInfo()", facility.getAllRoomsInfo());

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
  console.log("getParameterLibrary()", await dtConst.getParameterLibrary());
  console.log("getFacilityTemplatesLibrary()", await dtConst.getFacilityTemplatesLibrary());
  console.log("getClassificationsLibrary()", await dtConst.getClassificationsLibrary());

  //async function getClassification(uuid) {

    // TBD: following call fails "ReferenceError: CAT_TO_DISC is not defined"
  //console.log("getRevitCategoryToDisciplineMapping()", await dtConst.getRevitCategoryToDisciplineMapping());

  //console.log("matchClassification()", await dtConst.matchClassification(a, b));
  //mapUniformatToClass(uf);

    // TBD: these dissappeared.  Where did they go?
  //console.log("DtClass", dtConst.DtClass);
  //console.log("DtClassNames", dtConst.DtClassNames);
  //console.log("DtClassNamesToUniformat", dtConst.DtClassNamesToUniformat);
  //console.log("UniformatToDtClass", dtConst.UniformatToDtClass);


  console.log("QC", dtConst.QC);
  console.log("QCOverrides", dtConst.QCOverrides);
  console.log("ColumnFamilies", dtConst.ColumnFamilies);
  console.log("ColumnNames", dtConst.ColumnNames);
  console.log("ElementFlags", dtConst.ElementFlags);
  console.log("StandardAttributes", dtConst.StandardAttributes);
  console.log("StreamBaseParameterSet", dtConst.StreamBaseParameterSet);
  console.log("HiddenRevitCategories", dtConst.HiddenRevitCategories);
  console.log("ModelImportState", dtConst.ModelImportState);
  console.log("ImportStateLabels", dtConst.ImportStateLabels);
  console.log("DtAccessLevel", dtConst.DtAccessLevel);
  console.log("ChangeTypes", dtConst.ChangeTypes);
  console.log("SystemColumns", dtConst.SystemColumns);
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
** FUNC: dumpDtAppInfo()
** DESC: dump out all the info attached to the App object
**********************/

export async function dumpDtAppInfo() {
  const dtApp = window.DT_APP;  // this was stashed away for us by index.js when the viewer was initiated

  console.group("STUB: dumpDtAppInfo()")

  console.log("getCurrentTeamsFacilities()", await dtApp.getCurrentTeamsFacilities());
  console.log("getUsersFacilities()", await dtApp.getUsersFacilities());
  console.log("getTeams()", await dtApp.getTeams());
  console.log("getActiveTeam()", await dtApp.getActiveTeam());

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
  let models = td_utils.getLoadedModels();
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
  console.log("canEdit()", model.canEdit());
  //console.log("hasPhysicalElements()", model.hasPhysicalElements());
  console.log("getTaggedAssets()", await model.getTaggedAssets());
  console.log("getClassifiedAssets()", await model.getClassifiedAssets());
  console.log("isGeoReferenceSet()", model.isGeoReferenceSet());
  console.log("getElementCount()", model.getElementCount());

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

  //const start = td_utils.formatDateYYYYMMDD(startDate);
  //const end = td_utils.formatDateYYYYMMDD(endDate);
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

export async function getDocument(docURN) {
  const facility = td_utils.getCurrentFacility();
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
  const facility = td_utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY LOADED");
    return;
  }

  console.group("STUB: deleteDocument()");

  const doc = await facility.deleteDocument(docURN);

  console.groupEnd();
}
