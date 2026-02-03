/**
 * Facility Stub Functions
 * 
 * Demonstrates Tandem SDK facility-related operations.
 * Output goes to the browser console.
 */

import { getCurrentFacility, getDtApp } from '../viewer.js';

/**
 * Dump detailed facility information
 */
export async function dumpFacilityInfo() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility currently loaded');
        return;
    }
    
    console.group('STUB: dumpFacilityInfo()');
    
    console.log('getCurrentFacility()', facility);
    console.log('facility.urn()', facility.urn());
    console.log('facility.settings', facility.settings);
    console.log('facility.thumbnailUrl', facility.thumbnailUrl);
    
    console.log('facility.getClassificationTemplate()');
    console.log(await facility.getClassificationTemplate());
    
    console.log('facility.getUsers()');
    console.table(await facility.getUsers());
    
    console.log('facility.getSubjects()');
    console.table(await facility.getSubjects());
    
    console.log('facility.getModels(skipDefault=false)', facility.getModels());
    console.log('facility.getModels(skipDefault=true)', facility.getModels(true));
    console.log('facility.getPrimaryModel()', facility.getPrimaryModel());
    
    console.log('facility.canManage()', facility.canManage());
    console.log('facility.isOwner()', facility.isOwner());
    console.log('facility._getAccessLevel()', facility._getAccessLevel());
    
    console.log('facility.getSharedToLocalSpaceTransform()', facility.getSharedToLocalSpaceTransform());
    console.log('facility.getLocalToSharedSpaceTransform()', facility.getLocalToSharedSpaceTransform());
    console.log('facility.getDefaultModelId()', facility.getDefaultModelId());
    console.log('facility.getDefaultModel()', facility.getDefaultModel());
    console.log('facility.isSampleFacility()', facility.isSampleFacility());
    console.log('facility.getStreamManager()', facility.getStreamManager());
    console.log('facility.getAllImportedSystemClasses()', facility.getAllImportedSystemClasses());
    
    console.log('facility.getSavedViewsList()');
    console.log(await facility.getSavedViewsList());
    
    console.log('facility.getSchemaVersion()', await facility.getSchemaVersion());
    console.log('facility.getBuiltInClassificationSystem()', await facility.getBuiltInClassificationSystem());
    
    console.groupEnd();
}

/**
 * Dump DtApp object information
 */
export async function dumpAppInfo() {
    const app = getDtApp();
    if (!app) {
        console.warn('DtApp not initialized');
        return;
    }
    
    console.group('STUB: dumpAppInfo()');
    
    console.log('getCurrentTeamsFacilities()');
    console.log(await app.getCurrentTeamsFacilities());
    
    console.log('getSharedFacilities()');
    console.log(await app.getSharedFacilities());
    
    console.log('getTeams()');
    console.log(await app.getTeams());
    
    console.log('getActiveTeam()');
    console.log(await app.getActiveTeam());
    
    console.groupEnd();
}

/**
 * Dump Tandem SDK constants
 */
export async function dumpDtConstants() {
    const dtConst = Autodesk.Tandem.DtConstants;
    
    console.group('STUB: dumpDtConstants()');
    
    // Async library functions
    console.log('getForgeUnits()', await dtConst.getForgeUnits());
    console.log('getForgeUnitSpecs()', await dtConst.getForgeUnitSpecs());
    console.log('getRevitCategories()', await dtConst.getRevitCategories());
    console.log('getParameterLibrary()', await dtConst.getParameterLibrary());
    console.log('getFacilityTemplatesLibrary()', await dtConst.getFacilityTemplatesLibrary());
    console.log('getClassificationsLibrary()', await dtConst.getClassificationsLibrary());
    console.log('getSystemClassNames()', await dtConst.getSystemClassNames());
    console.log('getInterestingTracingCats()', await dtConst.getInterestingTracingCats());
    console.log('getTandemCategories({workOrders:false, calculatedStreams:false})', await dtConst.getTandemCategories({workOrders: false, calculatedStreams: false}));
    console.log('getTandemCategories({workOrders:true, calculatedStreams:true})', await dtConst.getTandemCategories({workOrders: true, calculatedStreams: true}));
    console.log('getUniformatClassificationSystem()', await dtConst.getUniformatClassificationSystem());
    console.log('getMasterFormatClassificationSystem()', await dtConst.getMasterFormatClassificationSystem());
    // NOTE: getRevitCategoryToDisciplineMapping() has a bug - CAT_TO_DISC is not defined in SDK
    // console.log('getRevitCategoryToDisciplineMapping()', await dtConst.getRevitCategoryToDisciplineMapping());
    
    // Schema and element constants
    console.log('QC', dtConst.QC);
    console.log('QCOverrides', dtConst.QCOverrides);
    console.log('ColumnFamilies', dtConst.ColumnFamilies);
    console.log('ColumnNames', dtConst.ColumnNames);
    console.log('ElementFlags', dtConst.ElementFlags);
    console.log('StandardAttributes', dtConst.StandardAttributes);
    console.log('FamilyAttributes', dtConst.FamilyAttributes);
    console.log('AttributeFlags', dtConst.AttributeFlags);
    console.log('AttributeType', dtConst.AttributeType);
    console.log('AttributeContext', dtConst.AttributeContext);
    
    // State and action constants
    console.log('ModelImportState', dtConst.ModelImportState);
    console.log('MutationActions', dtConst.MutationActions);
    console.log('SystemState', dtConst.SystemState);
    console.log('DtAccessLevel', dtConst.DtAccessLevel);
    console.log('ChangeTypes', dtConst.ChangeTypes);
    console.log('ChangeDesc', dtConst.ChangeDesc);
    console.log('StreamState', dtConst.StreamState);
    console.log('StreamStates', dtConst.StreamStates);
    console.log('StreamAlertState2State', dtConst.StreamAlertState2State);
    
    // Classification and category constants
    console.log('UNIFORMAT_UUID', dtConst.UNIFORMAT_UUID);
    console.log('MASTERFORMAT_UUID', dtConst.MASTERFORMAT_UUID);
    console.log('TANDEMCATEGORIES_UUID', dtConst.TANDEMCATEGORIES_UUID);
    console.log('RC', dtConst.RC);
    console.log('TC', dtConst.TC);
    console.log('HiddenRevitCategories', dtConst.HiddenRevitCategories);
    console.log('CenterlineCatIDs', dtConst.CenterlineCatIDs);
    
    // System and stream constants
    console.log('SystemFilterNames', dtConst.SystemFilterNames);
    console.log('SystemElementFirstKey', dtConst.SystemElementFirstKey);
    console.log('StreamsImportExportTableHeader', dtConst.StreamsImportExportTableHeader);
    
    // URN prefix constants
    console.log('DT_URN_PREFIX', dtConst.DT_URN_PREFIX);
    console.log('DT_MODEL_URN_PREFIX', dtConst.DT_MODEL_URN_PREFIX);
    console.log('DT_TWIN_URN_PREFIX', dtConst.DT_TWIN_URN_PREFIX);
    console.log('DT_USER_URN_PREFIX', dtConst.DT_USER_URN_PREFIX);
    console.log('DT_GROUP_URN_PREFIX', dtConst.DT_GROUP_URN_PREFIX);
    console.log('DT_DOCUMENT_URN_PREFIX', dtConst.DT_DOCUMENT_URN_PREFIX);
    
    console.groupEnd();
}

/**
 * Get facility usage metrics
 */
export async function getFacilityUsageMetrics() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility currently loaded');
        return;
    }
    
    console.group('STUB: getFacilityUsageMetrics()');
    
    const metrics = await facility.loadUsageMetrics();
    console.log('Usage Metrics:', metrics);
    
    console.groupEnd();
}

/**
 * Get facility history (last 30 days)
 */
export async function getFacilityHistory() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility currently loaded');
        return;
    }
    
    console.group('STUB: getFacilityHistory()');
    
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    console.log('Time range: Last 30 days');
    console.log('Start:', new Date(thirtyDaysAgo).toISOString());
    console.log('End:', new Date(now).toISOString());
    
    const history = await facility.getHistory([], thirtyDaysAgo, now, true);
    console.log('History entries:', history?.length || 0);
    console.log('History:', history);
    
    console.groupEnd();
}

