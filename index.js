
import { checkLogin } from './login.js';
import { initLMV, startViewer } from './lmv.js';
import * as vw_stubs from './src/vw_stubs.js';
import * as fac_stubs from './src/fac_stubs.js';
import * as model_stubs from './src/model_stubs.js';
import * as prop_stubs from './src/prop_stubs.js';
import * as doc_stubs from './src/doc_stubs.js';
import * as ev_stubs from './src/ev_stubs.js';
import * as st_stubs from './src/st_stubs.js';

/***************************************************
** FUNC: getAllFacilities()
** DESC: get the list of all facilities we own directly or that are shared with us.
**********************/

async function getAllFacilities(app) {
  const currentTeamFacilities = await app.getCurrentTeamsFacilities();  // Facilities we have access to based on the current team

    // we will construct a readable table to dump out the info for the user
  let printOutFacilities = [];
  let tmp = null;
  for (let i=0; i<currentTeamFacilities.length; i++) {
    tmp = currentTeamFacilities[i];
    printOutFacilities.push({ name: tmp.settings.props["Identity Data"]["Building Name"], shared: "via current team", twinID: tmp.twinId });
  }
  console.log("getCurrentTeamsFacilities()", currentTeamFacilities);  // dump out raw return result

  const sharedWithMe = await app.getUsersFacilities();  // Facilities we have access to because they've been directly shared with us

  for (let i=0; i<sharedWithMe.length; i++) {
    tmp = sharedWithMe[i];
    printOutFacilities.push({ name: tmp.settings.props["Identity Data"]["Building Name"], shared: "directly with me", twinID: tmp.twinId });
  }
  console.log("getUsersFacilities()", sharedWithMe);  // dump out raw return result

    // now try to print out a readable table
  console.table(printOutFacilities);

  return [].concat(currentTeamFacilities, sharedWithMe);  // return the full list for the popup selector
}

/***************************************************
** FUNC: bootstrap()
** DESC: init the Tandem viewer and get the user to login via their Autodesk ID.
**********************/

async function bootstrap() {
    // login in the user and set UI elements appropriately (args are HTML elementIDs)
  const userLoggedIn = await checkLogin("btn_login", "btn_logout", "btn_userProfile", "viewer");
  if (!userLoggedIn)
    return;   // when user does login, it will go through the bootstrap process again

  await initLMV();

    // init viewer
  const container = document.getElementById('viewer');
  const viewer = startViewer(container);
  console.log('TandemViewer is up and running');

    // init app
  const app = new Autodesk.Viewing.Private.DtApp();
  //const app = new Autodesk.Viewing.Private.DtApp( {timeSeries: true} ); // TBD: remove this when FacilityMonitoring feature released
  window.DT_APP = app;

  const facilities = await getAllFacilities(app);
  if (facilities.length == 0) {
      Autodesk.Viewing.Private.AlertBox.displayError(
          viewer.container,
          'Make sure you are have access to at least one facility in Autodesk Tandem.',
          'No facilities found',
          'img-item-not-found'
      );
      return;
  }

    // load preferred or random facility
  const preferredFacilityUrn = window.localStorage.getItem('tandem-testbed-last-facility');
  const preferredFacility = facilities.find(f=>f.urn() === preferredFacilityUrn) || facilities[0];
  app.displayFacility(preferredFacility, false, viewer);

    // setup facility picker UI
  await Promise.all(facilities.map(f=>f.load()));
  const facilityPicker = document.getElementById('facilityPicker');

  for (let facility of facilities) {
      const option = document.createElement('option');
      option.text = facility.settings.props["Identity Data"]["Building Name"];
      option.selected = facility == preferredFacility;

      facilityPicker.appendChild(option);
  }

  facilityPicker.onchange = ()=>{
      const newFacility = facilities[facilityPicker.selectedIndex];
      window.localStorage.setItem('tandem-testbed-last-facility', newFacility.urn());
      app.displayFacility(newFacility, undefined, viewer);
  }
  facilityPicker.style.visibility = 'initial';
}

async function main() {
    // init the Viewer and login
  await bootstrap();

    // bind all the callbacks from the UI to the stub functions
    // TBD: not super happy about how this callback mechanism works... I did trial and error
    // forever to get these partial HTML snippets to work for the modal input.  Will try later
    // to make a more elegant mechanism.  (JMA - 03/28/22)
  let modalFuncCallbackNum = 0;

    // Facility Stubs
  $("#btn_dumpFacilityInfo").click(fac_stubs.dumpDtFacilityInfo);
  $("#btn_dumpAppInfo").click(fac_stubs.dumpDtAppInfo);
  $("#btn_dumpDtConstants").click(fac_stubs.dumpDtConstants);
  $("#btn_loadFacilityUsageMetrics").click(fac_stubs.loadFacilityUsageMetrics);

    // Model stubs
  $("#btn_dumpModelInfo").click(model_stubs.dumpDtModelInfo);
  $("#btn_getLevels").click(model_stubs.getLevels);
  $("#btn_getRooms").click(model_stubs.getRooms);
  $("#btn_showElementsInRoom").click(model_stubs.showElementsInRoom);
  $("#btn_getModelHistory").click(model_stubs.getDtModelHistory);
  $("#btn_getModelUsageMetrics").click(model_stubs.getDtModelUsageMetrics);
  $("#btn_dbIdsToPersistentIds").click(model_stubs.dbIdsToExternalIds);

    // Prop Stubs
  $("#btn_getQualifiedPropName").click(function() {
      $('#stubInput_getPropertyName').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_getProperties").click(prop_stubs.getDtProperties);
  $("#btn_getPropertiesWithHistory").click(prop_stubs.getDtPropertiesWithHistory);
  $("#btn_getCommonProperties").click(prop_stubs.getCommonDtProperties);

  $("#btn_getPropertySelSet").click(function() {
      $('#stubInput_getPropertyName').modal('show');
      modalFuncCallbackNum = 1;
    });

  $("#btn_findElementsWherePropValueEqualsX").click(function() {
      $('#stubInput_getPropertyFilter').modal('show');
    });

  $("#btn_setPropertySelSet").click(function() {
      $('#stubInput_setPropertyValue').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_assignClassification").click(function() {
      $('#stubInput_setClassification').modal('show');
    });

    // Document Stubs
  $("#btn_getFacilityDocuments").click(doc_stubs.getFacilityDocuments);

  $("#btn_getDocument").click(function() {
    $('#stubInput_getURN').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_deleteDocument").click(function() {
    $('#stubInput_getURN').modal('show');
      modalFuncCallbackNum = 1;
    });

    // event stubs
  $("#btn_addEventListeners").click(ev_stubs.addEventListeners);
  $("#btn_removeEventListeners").click(ev_stubs.removeEventListeners);

    // stream stubs
  $("#btn_dumpStreamManager").click(st_stubs.dumpStreamManager);
  $("#btn_getStreamIds").click(st_stubs.getStreamIds);
  $("#btn_getLastReadings").click(st_stubs.getLastReadings);
  $("#btn_refreshStreamsLastReadings").click(st_stubs.refreshStreamsLastReadings);
  $("#btn_exportStreamsToJson").click(st_stubs.exportStreamsToJson);
  $("#btn_getAllStreamInfos").click(st_stubs.getAllStreamInfos);
  $("#btn_getAllStreamInfosFromCache").click(st_stubs.getAllStreamInfosFromCache);
  $("#btn_getAllConnectedAttributes").click(st_stubs.getAllConnectedAttributes);
  $("#btn_getAttributeCandidates").click(st_stubs.getAttributeCandidates);
  $("#btn_getStreamSecrets").click(st_stubs.getStreamSecrets);
  $("#btn_getStreamsBulkImportTemplate").click(st_stubs.getStreamsBulkImportTemplate);

  $("#btn_createStream").click(function() {
      $('#stubInput_getName').modal('show');
      modalFuncCallbackNum = 0;
    });
  $("#btn_deleteStream").click(function() {
      $('#stubInput_getInt').modal('show');
      modalFuncCallbackNum = 0;
    });
  $("#btn_resetStreamSecrets").click(function() {
      $('#stubInput_getKey').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_getStreamIngestionUrls").click(st_stubs.getStreamIngestionUrls);


    // viewer stubs
  $("#btn_addSprites").click(vw_stubs.addSprites);
  $("#btn_removeSprites").click(vw_stubs.removeSprites);
  $("#btn_getCurrentSelSet").click(vw_stubs.getCurrentSelSet);
  $("#btn_isolateCurrentSelSet").click(vw_stubs.isolateCurrentSelSet);
  $("#btn_focusCurrentSelSet").click(vw_stubs.focusCurrentSelSet);
  $("#btn_showAllObjects").click(vw_stubs.showAllObjects);
  $("#btn_getAllElements").click(vw_stubs.getAllElements);
  $("#btn_getAllVisibleDbIds").click(vw_stubs.getVisibleDbIds);
  $("#btn_selectAllVisibleElements").click(vw_stubs.selectAllVisibleElemnents);
  $("#btn_getHiddenElementsByModel").click(vw_stubs.getHiddenElementsByModel);
  $("#btn_hideModel").click(vw_stubs.hideModel);
  $("#btn_showModel").click(vw_stubs.showModel);
  $("#btn_scrapeGeometry").click(vw_stubs.scrapeGeometry);


    // this gets called from above via modal dialog (#btn_getQualifiedPropName, and others)
  $('#stubInput_getPropertyName_OK').click(function() {
    const propCategory = $("#stubInput_propCategory").val();
    const propName = $("#stubInput_propName").val();

    if (modalFuncCallbackNum == 0)
      prop_stubs.getQualifiedPropName(propCategory, propName);
    else if (modalFuncCallbackNum == 1)
      prop_stubs.getPropertySelSet(propCategory, propName);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

    // this gets called from above via modal dialog (#btn_setPropertySelSet, and others)
  $('#stubInput_setPropertyValue_OK').click(function() {
    const propCategory = $("#stubInput_propCategorySet").val();
    const propName = $("#stubInput_propNameSet").val();
    const propVal = $("#stubInput_propValSet").val();

    if (modalFuncCallbackNum == 0)
      prop_stubs.setPropertySelSet(propCategory, propName, propVal);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

    // this gets called from above via modal dialog (#btn_findElementsWherePropValueEqualsX)
  $('#stubInput_getPropertyFilter_OK').click(function() {
    const propCategory = $("#stubInput_propCategoryFilter").val();
    const propName = $("#stubInput_propNameFilter").val();
    const matchStr = $("#stubInput_propValFilter").val();
    const isCaseInsensitive = $("#stubInput_propValIsCaseInsensitive").is(":checked");
    const isRegEx = $("#stubInput_propValIsRegEx").is(":checked");
    const searchVisibleOnly = $("#stubInput_searchVisibleOnly").is(":checked");

    prop_stubs.findElementsWherePropValueEqualsX(propCategory, propName, matchStr, isRegEx, searchVisibleOnly, isCaseInsensitive);
  });

    // this gets called from above via modal dialog (#btn_findElementsWherePropValueEqualsX)
  $('#stubInput_setClassification_OK').click(function() {
    const classificationStr = $("#stubInput_classificationStr").val();

    porp_stubs.assignClassification(classificationStr);
  });

  $('#stubInput_getURN_OK').click(function() {
    const urn = $("#stubInput_urn").val();

    if (modalFuncCallbackNum == 0)
      doc_stubs.getDocument(urn);
    else if (modalFuncCallbackNum == 1)
      doc_stubs.deleteDocument(urn);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

  $('#stubInput_getKey_OK').click(function() {
    const key = $("#stubInput_key").val();

    if (modalFuncCallbackNum == 0)
      st_stubs.resetStreamSecrets(key);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

  $('#stubInput_getName_OK').click(function() {
    const nameStr = $("#stubInput_name").val();

    if (modalFuncCallbackNum == 0)
      st_stubs.createStream(nameStr);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

  $('#stubInput_getInt_OK').click(function() {
    const rawStr = $("#stubInput_int").val();

    if (modalFuncCallbackNum == 0)
      st_stubs.deleteStream(parseInt(rawStr));
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });
};

main();
