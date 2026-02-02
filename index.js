
import { checkLogin } from './login.js';
import { initLMV, startViewer } from './lmv.js';
import * as vw_stubs from './src/vw_stubs.js';
import * as fac_stubs from './src/fac_stubs.js';
import * as model_stubs from './src/model_stubs.js';
import * as prop_stubs from './src/prop_stubs.js';
import * as doc_stubs from './src/doc_stubs.js';
import * as ev_stubs from './src/ev_stubs.js';
import * as st_stubs from './src/st_stubs.js';

// Schema version constant - API only supports version 2
const SchemaVersion = 2;

/***************************************************
** FUNC: noFacilitiesAvailable()
** DESC: could be the case that this user doesn't even have a Tandem account, is not
**  part of any teams and/or doesn't have access to any facilities.
**********************/

function noFacilitiesAvailable(teams, sharedWithMe) {

    // check if we are part of any accounts
  if (teams == null) {
    Autodesk.Viewing.Private.AlertBox.displayError(
      viewer.container,
      'Make sure you have an account setup in Autodesk Tandem.',
      'No account found',
      'img-item-not-found'
    );
    return true;
  }

    // first check if any facilities have been shared directly with this user
  if (sharedWithMe != null)
    return false; // this means we are ok

  let foundOne = false;
  for (let i=0; i<teams.length; i++) {
    if (teams[i].facilities.length) {
      foundOne = true;
      break;
    }
  }
  if (!foundOne) {
      Autodesk.Viewing.Private.AlertBox.displayError(
          viewer.container,
          'Make sure you are have access to at least one facility in Autodesk Tandem.',
          'No facilities found',
          'img-item-not-found'
      );
      return true;
  }

  return false; // this means we are OK
}

/***************************************************
** FUNC: populateTeamsDropdown()
** DESC: get the list of all teams that we are a part of
**********************/

async function populateTeamsDropdown(app, viewer) {
  
  const acctPicker = document.getElementById('acctPicker');
  const preferredTeam = window.localStorage.getItem('tandem-testbed-last-team');  // the last one that was used

    // get the list of all teams and then sort them alphabetically
  const teams = await app.getTeams();
  console.log("Teams:", teams);

  const teamNames = [];
  for (let i=0; i<teams.length; i++) {
    await teams[i].getFacilities(); // need to load the facilties we will be referencing later (will populate DtTeam.facilities property)
    teamNames.push(teams[i].name);
  }

  teamNames.sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    // there are also Facilities that are just shared directly with a given user.
    // make a "fake" team to be represented in the drop down if we have some of these
  const sharedWithMe = await app.getSharedFacilities();  // Facilities we have access to because they've been directly shared with us
  if (sharedWithMe != null) {
    const fakeTeam = { app: app, name: "** SHARED DIRECTLY **", facilities: sharedWithMe };
    teams.push(fakeTeam);   // always push to end, regardless of alphabetical place
    teamNames.push(fakeTeam.name);
  }

      // bail out if they don't have access to anything
  if (noFacilitiesAvailable(teams, sharedWithMe)) {
    return;
  }

  const safePreferredTeam = teamNames.find(t=>t === preferredTeam) || teamNames[0];   // make sure we can find last used, or else use first

    // add all the account names to the acct dropdown picker
  for (let i=0; i<teamNames.length; i++) {
      const option = document.createElement('option');
      option.text = teamNames[i];
      option.selected = teamNames[i] == safePreferredTeam;  // set initial selection in dropdown

      acctPicker.appendChild(option);
  }

  populateFacilitiesDropdown(app, safePreferredTeam, viewer); // this will load the Facilities on first pass initialization

    // this callback will load the Facilities when the dropdown list gets a different selection
  acctPicker.onchange = ()=>{
      const newTeam = acctPicker.value;
      window.localStorage.setItem('tandem-testbed-last-team', newTeam);
      populateFacilitiesDropdown(app, newTeam, viewer);
  }
  acctPicker.style.visibility = 'initial';
}

/***************************************************
** FUNC: checkSchemaVersion()
** DESC: Check if facility has compatible schema version before loading
**********************/

async function checkSchemaVersion(facility, viewer) {
  // Load facility to get schema version
  if (!facility.settings || facility.settings.schemaVersion === undefined) {
    await facility.load();
  }
  
  const schemaVersion = facility.settings?.schemaVersion;
  
  if (schemaVersion === undefined) {
    console.warn('Unable to determine facility schema version');
    return true; // Allow to proceed if we can't determine version
  }
  
  if (schemaVersion < SchemaVersion) {
    const errorMessage = `This facility is using schema version ${schemaVersion}. 
The API currently only supports schema version ${SchemaVersion}. 
Please open this facility in Autodesk Tandem first to upgrade the schema.`;
    
    Autodesk.Viewing.Private.AlertBox.displayError(
      viewer.container,
      errorMessage,
      '⚠️ Incompatible Schema Version',
      'img-item-not-found'
    );
    
    console.warn(`⚠️ Facility schema version (${schemaVersion}) is incompatible. Required: ${SchemaVersion}`);
    return false;
  }
  
  return true;
}

/***************************************************
** FUNC: populateFacilitiesDropdown()
** DESC: get the list of Facilities for a given team
**********************/

async function populateFacilitiesDropdown(app, teamName, viewer) {

    // get the list of all teams
  const teams = await app.getTeams(); 
  const curTeam = teams.find(obj => obj.name === teamName);

  const facilityPicker = document.getElementById('facilityPicker');

  // Guard: team not found or no facilities
  if (!curTeam || !curTeam.facilities || curTeam.facilities.length === 0) {
    facilityPicker.innerHTML = '<option value="">No facilities available</option>';
    facilityPicker.style.visibility = 'initial';
    return;
  }

    // load preferred or random facility
  const preferredFacilityUrn = window.localStorage.getItem('tandem-testbed-last-facility');
  const preferredFacility = curTeam.facilities.find(f=>f.twinId === preferredFacilityUrn) || curTeam.facilities[0];
  
  // Guard: preferredFacility could still be undefined (defensive)
  if (!preferredFacility) {
    facilityPicker.innerHTML = '<option value="">No facilities available</option>';
    facilityPicker.style.visibility = 'initial';
    return;
  }

  // Check schema version before loading
  const isCompatible = await checkSchemaVersion(preferredFacility, viewer);
  if (isCompatible) {
    app.displayFacility(preferredFacility, false, viewer);    // initially loaded facility
  }

    // setup facility picker UI
  await Promise.all(curTeam.facilities.map(f => f.load()));

  console.log("Facilities for current team:", curTeam.facilities);
  curTeam.facilities.sort((a, b) => a.settings.props["Identity Data"]["Building Name"].localeCompare(b.settings.props["Identity Data"]["Building Name"])); // Sort alphabetically

  facilityPicker.innerHTML = '';  // clear out any previous options

  for (let facility of curTeam.facilities) {
      const option = document.createElement('option');
      option.text = facility.settings.props["Identity Data"]["Building Name"];
      option.selected = facility.twinId === preferredFacility?.twinId;

      facilityPicker.appendChild(option);
  }

    // this callback will load the facility that the user picked in the Facility dropdown
  facilityPicker.onchange = async ()=>{
      const newFacility = curTeam.facilities[facilityPicker.selectedIndex];
      window.localStorage.setItem('tandem-testbed-last-facility', newFacility.twinId);
      
      // Check schema version before loading
      const isCompatible = await checkSchemaVersion(newFacility, viewer);
      if (isCompatible) {
        app.displayFacility(newFacility, undefined, viewer);
      }
  }
  facilityPicker.style.visibility = 'initial';
}

/***************************************************
** FUNC: bootstrap()
** DESC: init the Tandem viewer and get the user to login via their Autodesk ID.
**********************/

async function bootstrap() {
    // login in the user and set UI elements appropriately (args are HTML elementIDs)
  const userLoggedIn = await checkLogin("btn_login", "btn_logout", "btn_userProfile");
  if (!userLoggedIn)
    return;   // when user does login, it will go through the bootstrap process again

  await initLMV();

    // init viewer
  const container = document.getElementById('viewer');
  const viewer = startViewer(container);
  console.log('TandemViewer is up and running');

    // init app
  const app = new Autodesk.Tandem.DtApp();
  window.DT_APP = app;

    // setup the account picker dropdown
  await populateTeamsDropdown(app, viewer); // this will trigger loading of a current facility
}

/***************************************************
** FUNC: main()
** DESC: load the viewer and final UI elements, then bind all the events to menu items.
**********************/

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
  $("#btn_facilityHistory").click(fac_stubs.getFacilityHistory);

    // Model stubs
  $("#btn_dumpModelInfo").click(model_stubs.dumpDtModelInfo);
  $("#btn_getLevels").click(model_stubs.getLevels);
  $("#btn_isolateLevel").click(function() {
      $('#stubInput_getName').modal('show');
      modalFuncCallbackNum = 2;
    });
  $("#btn_isolateRooms").click(model_stubs.isolateRooms);
  $("#btn_showElementsInRoom").click(model_stubs.showElementsInRoom);
  $("#btn_getRoomsOfElement").click(model_stubs.getRoomsOfElement);
  $("#btn_getModelHistory").click(model_stubs.getDtModelHistory);
  $("#btn_getModelUsageMetrics").click(model_stubs.getDtModelUsageMetrics);
  $("#btn_dbIdsToPersistentIds").click(model_stubs.dbIdsToExternalIds);
  $("#btn_getElementUfClass").click(model_stubs.getElementUfClass);
  $("#btn_getElementCustomClass").click(model_stubs.getElementCustomClass);
  $("#btn_getElementBounds").click(model_stubs.getElementBounds);
  $("#btn_isolateTaggedAssets").click(model_stubs.isolateTaggedAssets);
  $("#btn_isolateUnTaggedAssets").click(model_stubs.isolateUnTaggedAssets);
  $("#btn_isolateClassifiedAssets").click(model_stubs.isolateClassifiedAssets);
  $("#btn_isolateUnClassifiedAssets").click(model_stubs.isolateUnClassifiedAssets);

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
  $("#btn_getStreamsBulkImportTemplate").click(st_stubs.getStreamsBulkImportTemplate);

  $("#btn_createStream").click(function() {
      $('#stubInput_getName').modal('show');
      modalFuncCallbackNum = 0;
    });
  $("#btn_deleteStream").click(function() {
      $('#stubInput_getInt').modal('show');
      modalFuncCallbackNum = 0;
    });
  $("#btn_getStreamSecrets").click(function() {
      $('#stubInput_getKey').modal('show');
      modalFuncCallbackNum = 0;
    });
  $("#btn_resetStreamSecrets").click(function() {
      $('#stubInput_getKey').modal('show');
      modalFuncCallbackNum = 1;
    });

  $("#btn_getStreamIngestionUrls").click(st_stubs.getStreamIngestionUrls);
  $("#btn_getStreamThresholds").click(st_stubs.getThresholds);

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
  $("#btn_setThemeColor").click(vw_stubs.setThemeColor);
  $("#btn_unsetThemeColor").click(vw_stubs.unsetThemeColor);
  $("#btn_clearAllTheming").click(vw_stubs.clearAllTheming);
  $("#btn_getSavedViews").click(vw_stubs.getSavedViews);
  $("#btn_gotoSavedView").click(function() {
      $('#stubInput_getName').modal('show');
      modalFuncCallbackNum = 1;
    });

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

    prop_stubs.assignClassification(classificationStr);
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
      st_stubs.getStreamSecrets(key);
    else if (modalFuncCallbackNum == 1)
        st_stubs.resetStreamSecrets(key);
    else {
      alert("ASSERT: modalFuncCallbackNum not expected.");
    }
  });

  $('#stubInput_getName_OK').click(function() {
    const nameStr = $("#stubInput_name").val();

    if (modalFuncCallbackNum == 0)
      st_stubs.createStream(nameStr);
    else if (modalFuncCallbackNum == 1)
      vw_stubs.gotoSavedView(nameStr);
    else if (modalFuncCallbackNum == 2)
      model_stubs.isolateLevel(nameStr);
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



// trigger things when the HTML is loaded
document.addEventListener('DOMContentLoaded', function() {
  //console.log("DOMContentLoaded");
  main();
});

