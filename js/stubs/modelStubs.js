/**
 * Model Stub Functions
 * 
 * Demonstrates Tandem SDK model-related operations.
 * Output goes to the browser console.
 */

import { getCurrentFacility, getViewer } from '../viewer.js';
import { getLoadedModels } from '../utils.js';
import { getAggregateSelection, getSingleSelectedItem } from './viewerStubs.js';

/**
 * Helper function to dump info for a single model
 */
async function dumpSingleModel(model) {
    console.log('getBoundingBox()', model.getBoundingBox());
    console.log('getInstanceTree()', model.getInstanceTree());
    console.log('is2d()', model.is2d());
    console.log('is3d()', model.is3d());
    console.log('isOTG()', model.isOTG());
    console.log('isPdf()', model.isPdf());

    console.log('getQueryParams()', model.getQueryParams());
    console.log('urn()', model.urn());
    console.log('isDefault()', model.isDefault());
    console.log('getParentFacility()', model.getParentFacility());
    console.log('isPrimaryModel()', model.isPrimaryModel());
    console.log('isVisibleByDefault()', model.isVisibleByDefault());
    console.log('label()', model.label());
    console.log('accessLevel()', model.accessLevel());
    console.log('getData()', model.getData());
    console.log('getRootId()', model.getRootId());
    console.log('getRoot()', model.getRoot());
    console.log('getUnitScale()', model.getUnitScale());
    console.log('getUnitString()', model.getUnitString());
    console.log('getDisplayUnit()', model.getDisplayUnit());
    console.log('getDefaultCamera()', model.getDefaultCamera());
    console.log('getUpVector()', model.getUpVector());
    console.log('isLoadDone()', model.isLoadDone());

    const hasTopology = model.hasTopology();
    console.log('hasTopology()', hasTopology);
    if (hasTopology) {
        console.log('fetchTopology()', await model.fetchTopology());
    }

    console.log('getBasePath()', model.getBasePath());
    console.log('getAlignment()', await model.getAlignment());
    
    console.log('getLevels()');
    console.table(await model.getLevels());

    console.log('hasRooms()', model.hasRooms());
    console.log('getRooms()');
    console.table(await model.getRooms());

    console.log('getHash2Attr()', await model.getHash2Attr());
    console.log('getModelProperties()', await model.getModelProperties());
    console.log('fileName()', model.fileName());
    console.log('displayName()', model.displayName());
    console.log('isLoaded()', model.isLoaded());
    console.log('getAttributes()', await model.getAttributes());
    console.log('canEdit()', model.canEdit());
    console.log('getTaggedAssets()', await model.getTaggedAssets());
    console.log('getClassifiedAssets()', await model.getClassifiedAssets());
    console.log('getElementCount()', model.getElementCount());
    console.log('getAllSystemClasses()', model.getAllSystemClasses());
}

/**
 * 1. Dump detailed model information
 */
export async function dumpDtModelInfo() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: dumpDtModelInfo()');

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);
        await dumpSingleModel(models[i]);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 2. Get model history (last 30 days)
 */
export async function getDtModelHistory() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: getDtModelHistory()');

    const dateNow = new Date();
    const timestampEnd = dateNow.getTime();
    console.log('Time Now:', dateNow, timestampEnd);

    const dateMinus30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const timestampStart = dateMinus30.getTime();
    console.log('30 Days Ago:', dateMinus30, timestampStart);

    console.log('NOTE: API allows any time range, but using last 30 days.');

    for (let i = 0; i < models.length; i++) {
        const hist = await models[i].getHistory([], timestampStart, timestampEnd, true);

        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);
        console.table(hist);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 3. Get model usage metrics
 */
export async function getDtModelUsageMetrics() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    const from = new Date().toISOString().split('T')[0].replace(/-/g, '');

    console.group('STUB: getDtModelUsageMetrics()');

    for (let i = 0; i < models.length; i++) {
        const usage = await models[i].getUsageMetrics(from);
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);
        console.log('Received metrics', JSON.stringify(usage));
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 4. Get levels for each model in the facility
 */
export async function getLevels() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: getLevels()');

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const levelObjs = await models[i].getLevels();
        if (levelObjs) {
            console.table(levelObjs);
        } else {
            console.log('No levels found in this model.');
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 5. Isolate a specific level in the viewer
 */
export async function isolateLevel(levelName) {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: isolateLevel()');
    console.log(`Isolating level "${levelName}"...`);

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const levelObjs = await models[i].getLevels();

        // Find the named levels for this model
        const levelIds = [];
        for (let key in levelObjs) {
            if (levelObjs[key].name === levelName) {
                levelIds.push(levelObjs[key].dbId);
            }
        }

        if (levelIds.length > 0) {
            const levelElementIds = [];
            for (let id of levelIds) {
                levelElementIds.push(...models[i].getElementsForLevel(id));
            }

            console.log(`Isolating ${levelElementIds.length} elements on this level in viewer...`);
            viewer.isolate(levelElementIds, models[i]);
        } else {
            console.log('That level not found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 6. Isolate rooms in the viewer
 */
export async function isolateRooms() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: isolateRooms()');

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const roomObjs = await models[i].getRooms();
        const roomIds = [];
        for (let key in roomObjs) {
            roomIds.push(roomObjs[key].dbId);
        }

        if (roomIds.length) {
            console.table(roomObjs);
            console.log('Isolating rooms in viewer...');
            viewer.isolate(roomIds, models[i]);
        } else {
            console.log('No rooms found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 7. Show elements in a selected room
 */
export async function showElementsInRoom() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    const aggrSet = getSingleSelectedItem();
    if (!aggrSet) {
        return;
    }

    const roomDbId = aggrSet[0].selection[0];

    // Check if room is selected
    const flags = aggrSet[0].model.getData().dbId2flags[roomDbId];
    if ((flags & 0x00000005) === 0) {
        console.warn('Selected object is not of type Room');
        return;
    }

    console.group('STUB: showElementsInRoom()');

    const elementsInRoom = await facility.getElementsInRoom(aggrSet[0].model.urn(), roomDbId);
    console.log('elementsInRoom', elementsInRoom);

    const viewer = getViewer();
    viewer.clearSelection();
    console.log('Isolating elements in viewer...');

    for (let i = 0; i < elementsInRoom.length; i++) {
        if (elementsInRoom[i].dbIds.length === 0) {
            viewer.isolate([0], elementsInRoom[i].model);
        } else {
            viewer.isolate(elementsInRoom[i].dbIds, elementsInRoom[i].model);
        }
    }

    console.groupEnd();
}

/**
 * 8. Get rooms of a selected element
 */
export async function getRoomsOfElement() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    const aggrSet = getSingleSelectedItem();
    if (!aggrSet) {
        return;
    }

    console.group('STUB: getRoomsOfElement()');

    const roomsOfElement = await facility.getRoomsOfElement(aggrSet[0].model, aggrSet[0].selection[0]);
    console.table(roomsOfElement);

    const viewer = getViewer();
    viewer.clearSelection();

    if (roomsOfElement.length) {
        const newAggrSet = [];
        for (let i = 0; i < roomsOfElement.length; i++) {
            viewer.show(roomsOfElement[i].dbId, roomsOfElement[i].model);

            let found = false;
            for (let j = 0; j < newAggrSet.length; j++) {
                if (newAggrSet[j].model === roomsOfElement[i].model) {
                    newAggrSet[j].selection.push(roomsOfElement[i].dbId);
                    found = true;
                    break;
                }
            }
            if (!found) {
                newAggrSet.push({ model: roomsOfElement[i].model, selection: [roomsOfElement[i].dbId] });
            }
        }
        viewer.setAggregateSelection(newAggrSet);
    }

    console.groupEnd();
}

/**
 * 9. Get element UfClass for selected elements
 */
export async function getElementUfClass() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: getElementUfClass()');

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const selSet = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log(`Model URN: ${model.urn()}`);

        const prettyPrintArray = selSet.map(dbId => ({
            dbId,
            ufClass: model.getElementUfClass(dbId)
        }));

        console.table(prettyPrintArray);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 10. Get element custom class for selected elements
 */
export async function getElementCustomClass() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: getElementCustomClass()');

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const selSet = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log(`Model URN: ${model.urn()}`);

        const prettyPrintArray = selSet.map(dbId => ({
            dbId,
            customClass: model.getElementCustomClass(dbId)
        }));

        console.table(prettyPrintArray);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 11. Get element bounds for selected elements
 */
export async function getElementBounds() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: getElementBounds()');

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const selSet = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log(`Model URN: ${model.urn()}`);

        for (let j = 0; j < selSet.length; j++) {
            console.log(`dbId: ${selSet[j]}, bounds:`, model.getElementBounds(selSet[j]));
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * Helper function to subtract elements from all IDs
 */
function utilSubtractElementsFromAllIds(model, subtractElems) {
    const allIds = model.getElementIds();

    const subtractIds = [];
    for (let j = 0; j < subtractElems.rows.length; j++) {
        subtractIds.push(subtractElems.rows[j]['l:d']);
    }

    const keepIds = allIds.filter(id => !subtractIds.includes(id));
    return keepIds;
}

/**
 * 12. Isolate tagged assets in the viewer
 */
export async function isolateTaggedAssets() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: isolateTaggedAssets()');

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const taggedObjs = await models[i].getTaggedAssets();
        console.log('Tagged Assets-->', taggedObjs);

        const isoIds = [];
        for (let j = 0; j < taggedObjs.rows.length; j++) {
            isoIds.push(taggedObjs.rows[j]['l:d']);
        }

        if (isoIds.length) {
            console.log('Isolating tagged assets in viewer...');
            viewer.isolate(isoIds, models[i]);
        } else {
            console.log('No tagged assets found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 13. Isolate un-tagged assets in the viewer
 */
export async function isolateUnTaggedAssets() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: isolateUnTaggedAssets()');

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const taggedObjs = await models[i].getTaggedAssets();
        const isoIds = utilSubtractElementsFromAllIds(models[i], taggedObjs);

        if (isoIds.length) {
            console.log('Isolating un-tagged assets in viewer...');
            viewer.isolate(isoIds, models[i]);
        } else {
            console.log('No un-tagged assets found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 14. Isolate classified assets in the viewer
 */
export async function isolateClassifiedAssets() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: isolateClassifiedAssets()');

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const classifiedObjs = await models[i].getClassifiedAssets();
        console.log('Classified Assets-->', classifiedObjs);

        const isoIds = [];
        for (let j = 0; j < classifiedObjs.rows.length; j++) {
            isoIds.push(classifiedObjs.rows[j]['l:d']);
        }

        if (isoIds.length) {
            console.log('Isolating classified assets in viewer...');
            viewer.isolate(isoIds, models[i]);
        } else {
            console.log('No classified assets found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 15. Isolate un-classified assets in the viewer
 */
export async function isolateUnClassifiedAssets() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: isolateUnClassifiedAssets()');

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const classifiedObjs = await models[i].getClassifiedAssets();
        const isoIds = utilSubtractElementsFromAllIds(models[i], classifiedObjs);

        if (isoIds.length) {
            console.log('Isolating un-classified assets in viewer...');
            viewer.isolate(isoIds, models[i]);
        } else {
            console.log('No un-classified assets found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 16. Convert dbIds to external element IDs
 */
export async function dbIdsToExternalIds() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('Nothing selected');
        return;
    }

    console.group('STUB: dbIdsToExternalIds()');

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const selSet = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log(`Model URN: ${model.urn()}`);

        const elementIds = await model.getElementIdsFromDbIds(selSet);

        const mappingTable = selSet.map((dbid, index) => ({
            dbid,
            externalId: elementIds[index]
        }));
        
        console.table(mappingTable);
        console.groupEnd();
    }

    console.groupEnd();
}
