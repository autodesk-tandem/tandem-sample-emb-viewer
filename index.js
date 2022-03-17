
import { logMeIn } from './login.js';
import { initLMV, startViewer } from './lmv.js';
import * as vw_stubs from './src/vw_stubs.js';
import * as td_stubs from './src/td_stubs.js';
import * as tdApp_stubs from './src/tdApp_stubs.js';
import * as ev_stubs from './src/ev_stubs.js';

function onDtAppInit() {
  debugger;
  console.log("onDtAppInit() got called");
}

async function main() {
    await initLMV();
    console.log('LMV is up and running');

    await logMeIn();
    console.log('Successfully logged in');

    // init viewer
    const container = document.getElementById('viewer');
    const viewer = startViewer(container);
    console.log('Viewer started');

    // init app
    const app = new Autodesk.Viewing.Private.DtApp({});
    window.DT_APP = app;
    // fetch facilities (and sort by urn)
    const facilities = await app.getCurrentTeamsFacilities();
    //const facilities = await app.getUsersFacilities();
    facilities.sort((a,b)=>a.urn().localeCompare(b.urn()));

    if(facilities.length == 0) {
        Autodesk.Viewing.Private.AlertBox.displayError(
            viewer.container,
            'Make sure you are have access to at least one facility in Autodesk Tandem.',
            'No facilities found',
            'img-item-not-found'
        );
        return;
    }

    // load preferred or random facility
    const preferredFacilityUrn = window.localStorage.getItem('dt-demo-app-preferred');
    const preferredFacility = facilities.find(f=>f.urn() === preferredFacilityUrn) || facilities[0];
    app.displayFacility(preferredFacility, false, viewer);

    // setup facility picker UI
    await Promise.all(facilities.map(f=>f.load()));
    const facilityPicker = document.getElementById('facilityPicker');
    for(let facility of facilities) {
        const option = document.createElement('option');
        option.text = facility.settings.props["Identity Data"]["Building Name"];
        option.selected = facility == preferredFacility;

        facilityPicker.appendChild(option);
    }
    facilityPicker.onchange = ()=>{
        const newFacility = facilities[facilityPicker.selectedIndex];
        window.localStorage.setItem('dt-demo-app-preferred', newFacility.urn());
        app.displayFacility(newFacility, undefined, viewer);
    }
    facilityPicker.style.visibility = 'initial';



      // bind all the callbacks from the UI to the stub functions
    $("#btn_getQualifiedPropName").click(td_stubs.getQualifiedPropName);
    $("#btn_getProperties").click(td_stubs.getDtProperties);
    $("#btn_getPropertiesWithHistory").click(td_stubs.getDtPropertiesWithHistory);
    $("#btn_getCommonProperties").click(td_stubs.getCommonDtProperties);
    $("#btn_getPropertySingleElement").click(td_stubs.getPropertySingleElement);
    $("#btn_getPropertySelSet").click(td_stubs.getPropertySelSet);
    $("#btn_findElementsWherePropValueEqualsX").click(td_stubs.findElementsWherePropValueEqualsX);
    $("#btn_setPropertySingleElement").click(td_stubs.setPropertySingleElement);
    $("#btn_setPropertySelSet").click(td_stubs.setPropertySelSet);
    $("#btn_dumpFacilityInfo").click(td_stubs.dumpDtFacilityInfo);
    $("#btn_dumpModelInfo").click(td_stubs.dumpDtModelInfo);
    $("#btn_dumpAppInfo").click(td_stubs.dumpDtAppInfo);
    $("#btn_dumpDtConstants").click(td_stubs.dumpDtConstants);
    $("#btn_getParameterSets").click(td_stubs.getParameterSets);
    $("#btn_getLevels").click(td_stubs.getLevels);
    $("#btn_getRooms").click(td_stubs.getRooms);
    $("#btn_getModelHistory").click(td_stubs.getDtModelHistory);
    $("#btn_getModelUsageMetrics").click(td_stubs.getDtModelUsageMetrics);
    $("#btn_loadFacilityUsageMetrics").click(td_stubs.loadFacilityUsageMetrics);
    $("#btn_dbIdsToPersistentIds").click(td_stubs.dbIdsToExternalIds);
    $("#btn_search").click(td_stubs.search);

    $("#btn_getFacilityDocuments").click(td_stubs.getFacilityDocuments);
    $("#btn_getDocument").click(td_stubs.getDocument);
    $("#btn_deleteDocument").click(td_stubs.deleteDocument);

    $("#btn_getSavedViews").click(tdApp_stubs.getSavedViews);
    $("#btn_getClassifications").click(tdApp_stubs.getClassifications);
    $("#btn_getFacilityTemplates").click(tdApp_stubs.getFacilityTemplates);
    $("#btn_getFacilityTemplateByUUID").click(tdApp_stubs.getFacilityTemplateByUUID);
    $("#btn_getParameterSetsApp").click(tdApp_stubs.getParameterSets);
    $("#btn_getParameterSetByUUID").click(tdApp_stubs.getParameterSetByUUID);

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

};

main();
