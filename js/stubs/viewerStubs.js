/**
 * Viewer Stub Functions
 * 
 * Demonstrates Tandem SDK viewer-related operations.
 * Output goes to the browser console.
 */

import { getViewer, getCurrentFacility } from '../viewer.js';
import { getLoadedModels } from '../utils.js';

/**
 * Get aggregate selection from viewer
 * @returns {Array|null} Aggregate selection or null if nothing selected
 */
export function getAggregateSelection() {
    const viewer = getViewer();
    if (!viewer) return null;
    
    const aggregate = viewer.getAggregateSelection();
    if (aggregate?.length) {
        return aggregate;
    }
    return null;
}

/**
 * Get single selected item from viewer
 * @returns {Array|null} Aggregate selection with single item or null
 */
export function getSingleSelectedItem() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return null;
    }
    
    if (aggrSet.length > 1) {
        console.warn('Select only one element');
        return null;
    }
    
    if (aggrSet.length && (aggrSet[0].selection.length > 1)) {
        console.warn('Select only one element');
        return null;
    }
    
    return aggrSet;
}

/**
 * Get single selected item (optional - returns null silently if nothing selected)
 * @returns {Array|null} Aggregate selection with single item or null
 */
export function getSingleSelectedItemOptional() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        return null;
    }
    
    if (aggrSet.length > 1) {
        return null;
    }
    
    if (aggrSet.length && (aggrSet[0].selection.length > 1)) {
        return null;
    }
    
    return aggrSet;
}

/**
 * Get bounds for an element
 */
function getBounds(model, dbId) {
    const bounds = new THREE.Box3();
    const box = new THREE.Box3();
    const instanceTree = model.getData().instanceTree;
    const fragList = model.getFragmentList();
    
    if (instanceTree) {
        instanceTree.enumNodeFragments(
            dbId,
            (fragId) => {
                fragList.getWorldBounds(fragId, box);
                bounds.union(box);
            },
            true
        );
    }
    return bounds;
}

/**
 * Create sprites for objects
 */
function spheresForObjects(model, dbIds) {
    const viewer = getViewer();
    viewer.overlays.addScene('WO_sprites');
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, depthTest: false, depthWrite: false });
    const geom = new THREE.SphereBufferGeometry(1, 32, 32);
    
    for (const dbId of dbIds) {
        const box = getBounds(model, dbId);
        const cen = box.getCenter();
        const sphere = new THREE.Mesh(geom, material);
        const translate = new THREE.Matrix4().makeTranslation(cen.x, cen.y, cen.z);
        sphere.applyMatrix(translate);
        viewer.overlays.addMesh(sphere, 'WO_sprites');
    }
    viewer.refresh(false);
}

/**
 * 1. Add sprites to selected elements
 */
export function addSprites() {
    console.group('STUB: addSprites()');
    
    const aggrSet = getAggregateSelection();
    if (aggrSet) {
        for (let i = 0; i < aggrSet.length; i++) {
            spheresForObjects(aggrSet[i].model, aggrSet[i].selection);
        }
        console.log('Sprites added to selection');
    } else {
        console.warn('No objects currently selected!');
    }
    
    console.groupEnd();
}

/**
 * 2. Remove sprites from scene
 */
export function removeSprites() {
    console.group('STUB: removeSprites()');
    
    const viewer = getViewer();
    viewer.overlays.removeScene('WO_sprites');
    console.log('Sprites removed');
    
    console.groupEnd();
}

/**
 * 3. Get currently selected elements
 */
export function getCurrentSelection() {
    console.group('STUB: getCurrentSelection()');
    
    const selection = getAggregateSelection();
    
    if (!selection) {
        console.log('No objects selected');
        console.groupEnd();
        return;
    }
    
    console.log('Current Selection in viewer:', selection);
    
    selection.forEach((item, index) => {
        console.log(`Model ${index}:`, item.model);
        console.log(`  Model URN:`, item.model?.urn?.());
        console.log(`  Selected dbIds:`, item.selection);
        console.log(`  Count:`, item.selection.length);
    });
    
    console.groupEnd();
}

/**
 * 4. Isolate currently selected elements
 */
export function isolateSelection() {
    console.group('STUB: isolateSelection()');
    
    const viewer = getViewer();
    const aggrSet = getAggregateSelection();
    
    if (!aggrSet) {
        console.warn('No elements selected!');
        console.groupEnd();
        return;
    }
    
    const processedModels = [];
    
    console.log('Isolating current SelSet in viewer:', aggrSet);
    for (let i = 0; i < aggrSet.length; i++) {
        processedModels.push(aggrSet[i].model);
        viewer.isolate(aggrSet[i].selection, aggrSet[i].model);
    }
    
    // Hide models that have nothing selected
    const facility = getCurrentFacility();
    const allModels = facility.getModels();
    for (let i = 0; i < allModels.length; i++) {
        const found = processedModels.find(element => (element._modelId === allModels[i]._modelId));
        if (!found) {
            viewer.isolate([0], allModels[i]);
        }
    }
    
    console.groupEnd();
}

/**
 * 5. Focus/zoom to current selection
 */
export function focusSelection() {
    console.group('STUB: focusSelection()');
    
    const viewer = getViewer();
    const aggrSet = getAggregateSelection();
    
    if (!aggrSet) {
        console.log('Nothing selected, calling fitToView() on entire model');
        viewer.fitToView();
        console.groupEnd();
        return;
    }
    
    console.log('Focus current SelSet in viewer:', aggrSet);
    
    for (let i = 0; i < aggrSet.length; i++) {
        viewer.fitToView(aggrSet[i].selection, aggrSet[i].model);
    }
    
    console.groupEnd();
}

/**
 * 6. Show all objects (un-isolate)
 */
export function showAllObjects() {
    console.group('STUB: showAllObjects()');
    
    const viewer = getViewer();
    if (!viewer) {
        console.warn('Viewer not available');
        console.groupEnd();
        return;
    }
    
    viewer.showAll();
    console.log('All objects are now visible');
    
    console.groupEnd();
}

/**
 * 7. Get all elements in the facility
 */
export function getAllElements() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: getAllElements()');

    for (let i = 0; i < models.length; i++) {
        const resultObjs = models[i].getElementIds();
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log('Elements', resultObjs);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 8. Get visible element IDs
 */
export function getVisibleDbIds() {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: getVisibleDbIds()');

    for (let i = 0; i < models.length; i++) {
        const resultObjs = models[i].getVisibleDbIds();
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log('Visible Elements', resultObjs);
        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * 9. Select all visible elements
 */
export async function selectAllVisibleElements() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: selectAllVisibleElements()');
    
    facility.selectAllVisibleElements();
    console.log('Selected all visible elements');
    
    console.groupEnd();
}

/**
 * 10. Hide model
 */
export async function hideModel() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    const model = facility.getPrimaryModel();
    if (!model) {
        console.warn('No primary model');
        return;
    }

    console.group('STUB: hideModel()');

    if (!facility.isModelVisible(model)) {
        console.log(`Model [${model.label()}] is already hidden`);
    } else {
        facility.hideModel(model);
        console.log(`Hiding primary model [${model.label()}]`);
    }

    console.groupEnd();
}

/**
 * 11. Show model
 */
export async function showModel() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    const model = facility.getPrimaryModel();
    if (!model) {
        console.warn('No primary model');
        return;
    }

    console.group('STUB: showModel()');

    if (facility.isModelVisible(model)) {
        console.log(`Model [${model.label()}] is already visible`);
    } else {
        facility.showModel(model);
        console.log(`Showing primary model [${model.label()}]`);
    }

    console.groupEnd();
}

/**
 * Export mesh to OBJ format
 */
function exportMesh(aggrSet, useWorldSpace) {
    const VE = Autodesk.Viewing.Private.VertexEnumerator;
    const mtx = new Autodesk.Viewing.Private.LmvMatrix4(true);

    const obj = ['# Produced by LMV OBJ export', '\n\n\n'];

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const fl = model.getFragmentList();
        const it = model.getInstanceTree();
        const selection = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log('Scraping geometry for dbIds', selection);

        let baseVertexIndex = 1;

        selection.forEach(dbId => {
            obj.push(`o ${dbId}`);

            it.enumNodeFragments(dbId, fragId => {
                obj.push(`g ${fragId}`);

                const geom = fl.getGeometry(fragId);
                fl.getOriginalWorldMatrix(fragId, mtx);

                let vcount = 0;
                let hasN = false;
                let hasUV = false;

                VE.enumMeshVertices(geom, (p, n, uv, idx) => {
                    vcount++;

                    if (p) {
                        obj.push(`v ${p.x} ${p.y} ${p.z}`);
                    }

                    if (n) {
                        obj.push(`vn ${n.x} ${n.y} ${n.z}`);
                        hasN = true;
                    }

                    if (uv) {
                        obj.push(`vt ${uv.x} ${uv.y}`);
                        hasUV = true;
                    }
                }, useWorldSpace ? mtx : undefined);

                obj.push('\n');

                VE.enumMeshIndices(geom, (a, b, c) => {
                    a += baseVertexIndex;
                    b += baseVertexIndex;
                    c += baseVertexIndex;

                    if (hasN && hasUV) {
                        obj.push(`f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}`);
                    } else if (hasN) {
                        obj.push(`f ${a}//${a} ${b}//${b} ${c}//${c}`);
                    } else if (hasUV) {
                        obj.push(`f ${a}/${a} ${b}/${b} ${c}/${c}`);
                    } else {
                        obj.push(`f ${a} ${b} ${c}`);
                    }
                });

                baseVertexIndex += vcount;
            }, true);
        });

        console.groupEnd();
    }

    return obj;
}

/**
 * 12. Scrape geometry from selected elements
 */
export function scrapeGeometry() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: scrapeGeometry()');

    const geomExportObj = exportMesh(aggrSet, true);
    if (geomExportObj) {
        console.log('OBJ format opening in new browser tab.');
        const blob = URL.createObjectURL(new Blob([geomExportObj.join('\n')], { type: 'text/plain' }));
        window.open(blob);
    }

    console.groupEnd();
}

/**
 * 13. Set theme color for selection
 */
export async function setThemeColor() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: setThemeColor()');

    const viewer = getViewer();
    const color = new THREE.Vector4(0.15, 0.74, 0.80, 1.0);

    for (let i = 0; i < aggrSet.length; i++) {
        const dbIds = aggrSet[i].selection;
        for (let j = 0; j < dbIds.length; j++) {
            viewer.setThemingColor(dbIds[j], color, aggrSet[i].model);
        }
    }
    
    console.log('Theme color applied');

    console.groupEnd();
}

/**
 * 14. Unset theme color for selection
 */
export async function unsetThemeColor() {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: unsetThemeColor()');

    const viewer = getViewer();

    for (let i = 0; i < aggrSet.length; i++) {
        const dbIds = aggrSet[i].selection;
        for (let j = 0; j < dbIds.length; j++) {
            viewer.setThemingColor(dbIds[j], undefined, aggrSet[i].model);
        }
    }
    
    console.log('Theme color removed');

    console.groupEnd();
}

/**
 * Helper to restore color theme for view
 */
function restoreColorThemeForView(facility, view) {
    const colorMap = facility.facetsManager.generateColorMap(view.facets.colorMaps);
    const facetId = view.facets.coloredFacetId;
    facility.facetsManager.applyTheme(facetId, colorMap[facetId]);
}

/**
 * 15. Clear all theming from facility
 */
export function clearAllTheming() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: clearAllTheming()');

    facility.facetsManager.applyTheme(undefined, undefined);
    console.log('All theming cleared');

    console.groupEnd();
}

/**
 * 16. Get saved views
 */
export async function getSavedViews() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: getSavedViews()');

    const views = await facility.getSavedViewsList();
    if (views && views.length) {
        console.log(views);

        const viewTable = views.map(view => ({
            viewName: view.viewName,
            id: view.id
        }));
        console.table(viewTable);
    } else {
        console.log('No saved views found.');
    }

    console.groupEnd();
}

/**
 * 17. Go to a saved view
 */
export async function gotoSavedView(viewName) {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: gotoSavedView()');

    const views = await facility.getSavedViewsList();
    const newView = views.find(v => v.viewName === viewName);
    
    if (newView) {
        await facility.goToView(newView);
        restoreColorThemeForView(facility, newView);
        console.log(`Restored view: ${viewName}`);
    } else {
        console.log(`ERROR: Couldn't find saved view: ${viewName}`);
    }

    console.groupEnd();
}
