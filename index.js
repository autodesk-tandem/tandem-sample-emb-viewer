
import { checkLogin } from './login.js';
import { initLMV, startViewer } from './lmv.js';
import * as vw_stubs from './src/vw_stubs.js';
import * as td_stubs from './src/td_stubs.js';
import * as tdApp_stubs from './src/tdApp_stubs.js';
import * as ev_stubs from './src/ev_stubs.js';


/***************************************************
** FUNC: getAllFacilities()
** DESC: get the list of all facilities we own directly or that are shared with us.
**********************/

async function getAllFacilities(app) {
  const ownedByMe = await app.getCurrentTeamsFacilities();
  const sharedWithMe = await app.getUsersFacilities();
  return [].concat(ownedByMe, sharedWithMe);
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
  const app = new Autodesk.Viewing.Private.DtApp({});
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
  var modalFuncCallbackNum = 0;

  $("#btn_getQualifiedPropName").click(function() {
      $('#stubInput_getPropertyName').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_getProperties").click(td_stubs.getDtProperties);
  $("#btn_getPropertiesWithHistory").click(td_stubs.getDtPropertiesWithHistory);
  $("#btn_getCommonProperties").click(td_stubs.getCommonDtProperties);

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

  $("#btn_dumpFacilityInfo").click(td_stubs.dumpDtFacilityInfo);
  $("#btn_dumpModelInfo").click(td_stubs.dumpDtModelInfo);
  $("#btn_dumpAppInfo").click(td_stubs.dumpDtAppInfo);
  $("#btn_dumpDtConstants").click(td_stubs.dumpDtConstants);
  $("#btn_getParameterSets").click(td_stubs.getParameterSets);
  $("#btn_getLevels").click(td_stubs.getLevels);
  $("#btn_getRooms").click(td_stubs.getRooms);
  $("#btn_showElementsInRoom").click(td_stubs.showElementsInRoom);
  $("#btn_getModelHistory").click(td_stubs.getDtModelHistory);
  $("#btn_getModelUsageMetrics").click(td_stubs.getDtModelUsageMetrics);
  $("#btn_loadFacilityUsageMetrics").click(td_stubs.loadFacilityUsageMetrics);
  $("#btn_dbIdsToPersistentIds").click(td_stubs.dbIdsToExternalIds);

  $("#btn_getFacilityDocuments").click(td_stubs.getFacilityDocuments);

  $("#btn_getDocument").click(function() {
      $('#stubInput_getURN').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_deleteDocument").click(function() {
      $('#stubInput_getURN').modal('show');
      modalFuncCallbackNum = 1;
    });

  $("#btn_getSavedViews").click(tdApp_stubs.getSavedViews);
  $("#btn_getSavedViewByUUID").click(function() {
      $('#stubInput_getUUID').modal('show');
      modalFuncCallbackNum = 0;
    });

  $("#btn_getClassifications").click(tdApp_stubs.getClassifications);
  $("#btn_getClassificationByUUID").click(function() {
      $('#stubInput_getUUID').modal('show');
      modalFuncCallbackNum = 1;
    });

  $("#btn_getFacilityTemplates").click(tdApp_stubs.getFacilityTemplates);
  $("#btn_getFacilityTemplateByUUID").click(function() {
      $('#stubInput_getUUID').modal('show');
      modalFuncCallbackNum = 2;
    });

  $("#btn_getParameters").click(tdApp_stubs.getParameters);
  $("#btn_getParameterByUUID").click(function() {
      $('#stubInput_getUUID').modal('show');
      modalFuncCallbackNum = 3;
    });

  $("#btn_getPreferences").click(tdApp_stubs.getPreferences);

  $("#btn_addEventListeners").click(ev_stubs.addEventListeners);
  $("#btn_removeEventListeners").click(ev_stubs.removeEventListeners);

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
      td_stubs.getQualifiedPropName(propCategory, propName);
    else if (modalFuncCallbackNum == 1)
      td_stubs.getPropertySelSet(propCategory, propName);
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
      td_stubs.setPropertySelSet(propCategory, propName, propVal);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

    // this gets called from above via modal dialog (#btn_findElementsWherePropValueEqualsX)
  $('#stubInput_getPropertyFilter_OK').click(function() {
    const propCategory = $("#stubInput_propCategoryFilter").val();
    const propName = $("#stubInput_propNameFilter").val();
    const matchStr = $("#stubInput_propValFilter").val();

    td_stubs.findElementsWherePropValueEqualsX(propCategory, propName, matchStr);
  });

    // this gets called from above via modal dialog (#btn_findElementsWherePropValueEqualsX)
  $('#stubInput_setClassification_OK').click(function() {
    const classificationStr = $("#stubInput_classificationStr").val();

    td_stubs.assignClassification(classificationStr);
  });

  $('#stubInput_getURN_OK').click(function() {
    const urn = $("#stubInput_urn").val();

    if (modalFuncCallbackNum == 0)
      td_stubs.getDocument(urn);
    else if (modalFuncCallbackNum == 1)
        td_stubs.deleteDocument(urn);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

  $('#stubInput_getUUID_OK').click(function() {
    const uuid = $("#stubInput_uuid").val();

    if (modalFuncCallbackNum == 0)
      tdApp_stubs.getSavedViewByUUID(uuid);
    else if (modalFuncCallbackNum == 1)
        tdApp_stubs.getClassificationByUUID(uuid);
    else if (modalFuncCallbackNum == 2)
      tdApp_stubs.getFacilityTemplateByUUID(uuid);
    else if (modalFuncCallbackNum == 3)
      tdApp_stubs.getParameterByUUID(uuid);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });
};

main();
