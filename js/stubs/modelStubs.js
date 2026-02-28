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

    const facility = getCurrentFacility();
    const from = new Date().toISOString().split('T')[0].replace(/-/g, '');

    console.group('STUB: getDtModelUsageMetrics()');

    // getUsageMetrics() requires ALOwner access level on the server side -
    // calling it with lower access returns 403 Forbidden.
    if (!facility?.isOwner()) {
        console.log('(skipped - requires Owner access level)');
        console.groupEnd();
        return;
    }

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
 *
 * Given a selected element, returns all rooms that contain it. The SDK checks
 * both same-model rooms and cross-model (xref) rooms. Results are synchronous
 * local lookups — no API call is made.
 *
 * NOTE: This only works if room data is present in the model AND the element
 * has been spatially assigned to a room (i.e., room assignment has been run
 * in Tandem). Elements outside any room, or in facilities with no rooms, will
 * return an empty result.
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

    const model = aggrSet[0].model;
    const dbId = aggrSet[0].selection[0];

    console.group('STUB: getRoomsOfElement()');
    console.log(`Selected element  -- dbId: ${dbId} | model: ${model.label()}`);

    // Check if the model has any rooms at all
    const allRooms = model.getRooms();
    const roomCount = allRooms ? Object.keys(allRooms).length / 2 : 0; // roomMap is keyed by both dbId AND externalId
    console.log(`Rooms in model: ${roomCount}`);

    const roomsOfElement = facility.getRoomsOfElement(model, dbId);

    if (!roomsOfElement.length) {
        console.warn('No rooms found for this element.');
        console.warn('Possible reasons: element is outside all room boundaries, room assignment has not been run, or this model has no rooms.');
        console.groupEnd();
        return;
    }

    console.log(`Found ${roomsOfElement.length} room(s):`);
    const rows = roomsOfElement.map(r => ({
        dbId:       r.dbId,
        externalId: r.externalId,
        name:       r.name ?? '(no name)',
        model:      r.model?.label() ?? '(unknown model)'
    }));
    console.table(rows);

    // Select and show the containing rooms in the viewer
    const viewer = getViewer();
    viewer.clearSelection();

    const newAggrSet = [];
    for (const room of roomsOfElement) {
        viewer.show(room.dbId, room.model);

        let entry = newAggrSet.find(e => e.model === room.model);
        if (entry) {
            entry.selection.push(room.dbId);
        } else {
            newAggrSet.push({ model: room.model, selection: [room.dbId] });
        }
    }
    viewer.setAggregateSelection(newAggrSet);

    console.groupEnd();
}

/**
 * 9. Get element classification for selected elements
 * 
 * Three classification systems can be assigned to any element in Tandem:
 * 
 *   ufClass        — Uniformat assembly code (e.g. "B2010") assigned from the
 *                    Revit source or set manually in Tandem. Industry-standard
 *                    hierarchical classification for building elements.
 * 
 *   customClass    — Custom classification from whatever classification template
 *                    is applied to this facility (e.g. OmniClass, MasterFormat,
 *                    or a user-defined scheme).
 * 
 *   tandemCategory — Tandem's own internal category code (TC.*). A coarser
 *                    grouping used for filtering, facets, and stream assignment.
 * 
 * All three are synchronous local lookups — no API call is made.
 */
export async function getElementClasses() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: getElementClasses()');

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const selSet = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log(`Model URN: ${model.urn()}`);

        const rows = selSet.map(dbId => ({
            dbId,
            ufClass:        model.getElementUfClass(dbId),
            customClass:    model.getElementCustomClass(dbId),
            tandemCategory: model.getElementTandemCategory(dbId)
        }));

        console.table(rows);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 10. Get element bounds for selected elements
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
 * 11. Isolate tagged assets in the viewer
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
 * 12. Isolate un-tagged assets in the viewer
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
 * 13. Isolate classified assets in the viewer
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
 * 14. Isolate un-classified assets in the viewer
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
 * 15. Query elements using model.query()
 * 
 * model.query() is a flexible, low-level API that lets you filter elements and
 * fetch specific attribute families in a single call. It's the foundation that
 * higher-level helpers like getTaggedAssets() and getClassifiedAssets() are built on.
 * 
 * The query object supports:
 *   dbIds       - limit to specific viewer IDs (omit to query all elements)
 *   includes    - which attribute families to fetch:
 *                   standard  = built-in Tandem attributes (Name, CategoryId, ElementFlags, etc.)
 *                   applied   = user-defined custom parameters (the "z" column family)
 *                   element   = original source attributes from the Revit/IFC file
 *                   type      = family/type-level attributes
 *                   status    = lifecycle status flags
 *   filter      - MongoDB-style conditions on column values (e.g. existsInRaw, $gt, $eq)
 *   strict      - if true, only return elements that have ALL included families populated
 * 
 * Results shape:  { rows: [...], cols: [...] }
 *   rows  - one entry per element; keys are "family:column" strings (e.g. "n:n" = Standard:Name)
 *           "l:d" is always the viewer dbId for that row
 *   cols  - attribute definitions for every key present in rows
 */
export async function queryElements() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    const facility = getCurrentFacility();
    const model = facility.getPrimaryModel();
    if (!model) {
        console.warn('No primary model');
        return;
    }

    console.group('STUB: queryElements() -- model.query()');

    // -------------------------------------------------------------------------
    // Example 1: Query ALL elements — fetch standard built-in attributes only.
    // This is the simplest form. "standard" covers Name, CategoryId, ElementFlags,
    // Assembly Code, Classification, etc.
    // -------------------------------------------------------------------------
    console.group('Example 1: All elements, standard attributes');
    const allStandard = await model.query({
        includes: { standard: true }
    });
    console.log('Result shape:', allStandard);
    console.log(`  rows (elements found): ${allStandard.rows.length}`);
    console.log(`  cols (attributes returned): ${allStandard.cols.length}`);
    console.log('  Sample row[0]:', allStandard.rows[0]);
    console.log('  Attribute definitions (cols):', allStandard.cols);
    console.groupEnd();

    // -------------------------------------------------------------------------
    // Example 2: Query elements that have user-defined custom parameters set.
    // "applied" = the "z" column family — these are parameters added in Tandem's
    // Parameters panel. The filter { existsInRaw: true } means "only include
    // elements where at least one applied parameter has a value stored".
    // This is exactly what getTaggedAssets() does internally.
    // -------------------------------------------------------------------------
    console.group('Example 2: Elements with custom parameters set (applied family)');
    const allIds = model.getElementIds();
    const withCustomParams = await model.query({
        dbIds: allIds,
        includes: { standard: true, applied: true },
        filter: {
            [Autodesk.Tandem.DtConstants.ColumnFamilies.DtProperties]: { existsInRaw: true }
        }
    });
    console.log('Elements with custom parameters:', withCustomParams.rows.length);
    // Extract dbIds from results — "l:d" is the Refs:LmvDbId column
    const dbIds = withCustomParams.rows.map(row => row['l:d']);
    console.log('  dbIds:', dbIds);
    console.log('  Full results:', withCustomParams);
    console.groupEnd();

    // -------------------------------------------------------------------------
    // Example 3: Query the current viewer selection — fetch standard AND source
    // (element) attributes. Source attributes are the original values from the
    // Revit/IFC file before any Tandem overrides are applied.
    // If nothing is selected, this falls back to all elements.
    // -------------------------------------------------------------------------
    console.group('Example 3: Selected elements (or all), standard + source attributes');
    const aggrSet = getAggregateSelection();
    const selectedDbIds = aggrSet?.flatMap(s => s.selection) ?? model.getElementIds();
    console.log(`Querying ${selectedDbIds.length} element(s) — select some in the viewer to narrow this down`);

    const selectedProps = await model.query({
        dbIds: selectedDbIds,
        includes: { standard: true, element: true, applied: true }
    });
    console.log(`Result: ${selectedProps.rows.length} element(s) found`);
    console.table(selectedProps.rows.slice(0, 20)); // cap at 20 rows for readability
    console.groupEnd();

    console.groupEnd();
}

/**
 * 16. Search elements by property value using model.search()
 * 
 * model.search() is a free-text search across property VALUES in the model.
 * It scans the Source (original Revit/IFC) and DtProperties (user-defined) families.
 * 
 * Key differences from model.query():
 *   - Input:  { text: string }   — a plain search string, not a structured filter
 *   - Output: dbId[]             — just viewer IDs, not the {rows, cols} object
 *   - Scope:  searches VALUES (e.g. "Concrete", "AHU-01") not property names
 *   - Use it when you know what VALUE you're looking for but not which attribute
 *     contains it. Use query() when you know the exact attribute to filter on.
 * 
 * Matching is case-insensitive and substring-based.
 */
export async function searchElements(searchText) {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    const text = searchText?.trim();
    if (!text) {
        console.warn('No search text provided');
        return;
    }

    console.group('STUB: searchElements() -- model.search()');
    console.log(`Searching for: "${text}"`);
    console.log('Searches across: Source attributes (original Revit/IFC) + user-defined DtProperties');
    console.log('NOTE: result is a plain dbId[] — use these directly with viewer.isolate()');

    const viewer = getViewer();
    viewer.clearSelection();

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        // model.search() returns a plain array of viewer dbIds (numbers), not {rows, cols}
        const matchingDbIds = await models[i].search({ text });

        console.log(`Found ${matchingDbIds.length} matching element(s):`, matchingDbIds);

        if (matchingDbIds.length > 0) {
            console.log('Isolating matches in viewer...');
            viewer.isolate(matchingDbIds, models[i]);
        } else {
            console.log('No matches found in this model.');
            viewer.isolate([0], models[i]);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 17. Convert external element IDs back to viewer dbIds
 * 
 * The typical use case: you have element keys from an external source
 * (a REST API response, a database, a QR code scan, another tool) and you
 * want to locate and highlight those specific elements in the 3D viewer.
 * 
 *   elementId — a stable, persistent base64-encoded string (Tandem's permanent key).
 *               Consistent across all sessions and API calls.
 * 
 *   dbId      — a session-local integer required for ALL viewer operations:
 *               isolate(), select(), setThemingColor(), etc.
 * 
 * This stub accepts a comma-separated list of elementIds, searches every loaded
 * model for matches, and isolates the found elements in the viewer.
 * Tip: run 'Viewer Ids --> Element Ids' first to get some keys to paste in here.
 */
export async function externalIdsToDbIds(elementKeys) {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    const elementIds = elementKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (elementIds.length === 0) {
        console.warn('No element IDs provided');
        return;
    }

    console.group('STUB: externalIdsToDbIds() -- model.getDbIdsFromElementIds()');
    console.log('Terminology: dbId = ViewerID (session-local integer)  |  elementId = elementKey (stable base64 string)');
    console.log('Input elementIds (elementKeys):', elementIds);
    console.log('NOTE: call is per-model — the SDK has no cross-model awareness, so we try each model and collect hits.');

    // getDbIdsFromElementIds() is per-model: it looks up each ID in that model's
    // local property database and returns null for IDs that don't belong to it.
    // Since each elementId is globally unique, it will only be found in one model.
    const viewer = getViewer();
    viewer.clearSelection();

    const found = [];       // { elementId, dbId, model, modelLabel }
    const notFound = [];    // elementIds that weren't in any model

    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const dbIds = await model.getDbIdsFromElementIds(elementIds);
        const hitDbIds = [];

        elementIds.forEach((elementId, index) => {
            const dbId = dbIds[index];
            if (dbId !== null && dbId !== undefined) {
                found.push({ elementId, dbId, model: model.label(), modelUrn: model.urn() });
                hitDbIds.push(dbId);
            }
        });

        if (hitDbIds.length > 0) {
            viewer.isolate(hitDbIds, model);
        } else {
            viewer.isolate([0], model);
        }
    }

    // Anything not found in any model
    const foundIds = new Set(found.map(r => r.elementId));
    elementIds.forEach(id => { if (!foundIds.has(id)) notFound.push(id); });

    // Single clean summary — only show where elements were actually found
    if (found.length > 0) {
        console.log(`Found ${found.length} of ${elementIds.length} element(s):`);
        console.table(found);
    }
    if (notFound.length > 0) {
        console.warn(`${notFound.length} element ID(s) not found in any loaded model:`, notFound);
    }

    console.groupEnd();
}

/**
 * 18. Convert dbIds to external element IDs
 */
export async function dbIdsToExternalIds() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('Nothing selected');
        return;
    }

    console.group('STUB: dbIdsToExternalIds()');
    console.log('Terminology: dbid = ViewerID (session-local integer)  |  externalId = elementKey (stable base64 string)');

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
