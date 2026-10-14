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
 * 1. Get currently selected elements
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
 * 2. Get all elements in the facility
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
 * 3. Get visible element IDs
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
 * 4. Select all visible elements
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
 * 5. Scrape geometry from selected elements
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

