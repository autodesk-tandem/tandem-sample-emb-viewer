
import * as utils from './utils.js';


/***************************************************
** FUNC: getAggregateSelection()
** DESC: get the items selected in the viewer (aggregate means there could be multiple models in the selection!)
**********************/

export function getAggregateSelection() {
  const aggregate = window.NOP_VIEWER.getAggregateSelection();
  if (aggregate?.length) {
   return aggregate;
  }
  return null;
}

/***************************************************
** FUNC: getSingleSelectedItem()
** DESC: get only a single selection (just to show how it works if you already knew the dbId).  This is not how you would really
**    call this because you would probably know the [model, dbId] some other way, but we need a way to test dynamically.
**********************/

export function getSingleSelectedItem() {
  const aggrSet = getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return null;
  }

  if (aggrSet.length > 1) {
    alert("Select only one element");
    return null;
  }

  if (aggrSet.length && (aggrSet[0].selection.length > 1)) {
    alert("Select only one element");
    return null;
  }

  return aggrSet; // have to return the whole thing and caller will dig out the first item (because we need dbId and model)
}

/***************************************************
** FUNC: getSingleSelectedItemOptional()
** DESC: same as above, but don't return error messages because its optional
**********************/

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

  return aggrSet; // have to return the whole thing and caller will dig out the first item (because we need dbId and model)
}

/***************************************************
** FUNC: getBounds(id)
** DESC: get the bounding box of the element
**********************/

function getBounds(model, dbId) {
   const bounds = new THREE.Box3();
   const box = new THREE.Box3();
   //const instanceTree = window.NOP_VIEWER.model.getData().instanceTree;
   const instanceTree = model.getData().instanceTree;
   const fragList = window.NOP_VIEWER.model.getFragmentList();
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

 /***************************************************
 ** FUNC: spheresForObjects(dbIds)
 ** DESC: make a "sprite" to mark the element in the viewer
 **********************/

function spheresForObjects(model, dbIds) {
   window.NOP_VIEWER.overlays.addScene('WO_sprites');
   const material = new THREE.MeshBasicMaterial( { color: 0xffff00, depthTest: false, depthWrite: false } );
   const geom = new THREE.SphereBufferGeometry(1, 32, 32);
   for (const dbId of dbIds) {
     const box = getBounds(model, dbId);
     const cen = box.getCenter();
     const sphere = new THREE.Mesh(geom, material);
     const translate = new THREE.Matrix4().makeTranslation(cen.x, cen.y, cen.z);
     sphere.applyMatrix(translate);
     NOP_VIEWER.overlays.addMesh(sphere, 'WO_sprites');
   }
   NOP_VIEWER.refresh(false);
 }

 /***************************************************
 ** FUNC: addSprites()
 ** DESC: user called function to add the sprites to the currently selected elements
 **********************/

 export function addSprites() {
   const aggrSet = getAggregateSelection();
   if (aggrSet) {
    for (let i=0; i<aggrSet.length; i++) {
      spheresForObjects(aggrSet[i].model, aggrSet[i].selection);
    }
  }
  else {
    alert("No objects currently selected!");
  }
 }

 /***************************************************
 ** FUNC: removeSprites()
 ** DESC: user called function to remove sprites from the scene
 **********************/

 export function removeSprites() {
   NOP_VIEWER.overlays.removeScene('WO_sprites');
 }


 /***************************************************
 ** FUNC: getCurrentSelSet()
 ** DESC: user called function to remove sprites from the scene
 **********************/

 export function getCurrentSelSet() {
   console.log("Current Selection in viewer:", getAggregateSelection());
 }


 /***************************************************
 ** FUNC: isolateCurrentSelSet()
 ** DESC: user called function to isolate elements in the viewer
 **********************/

 export function isolateCurrentSelSet() {
    const aggrSet = getAggregateSelection();   // This would obviously be replaced with code to get the IDs of interest based on some condition
    if (aggrSet == null) {
     alert("No elements selected!");
     return;
    }

    const processedModels = []; // keep track of those we've dealt with

    console.log("Isoating current SelSet in viewer:", aggrSet);
    for (let i=0; i<aggrSet.length; i++) {
      processedModels.push(aggrSet[i].model);
      NOP_VIEWER.isolate(aggrSet[i].selection, aggrSet[i].model);
    }

      // now see if any models need to be completely hidden (because nothing was selected from them)
    const facility = utils.getCurrentFacility();
    const allModels = facility.getModels();
    for (let i=0; i<allModels.length; i++) {
      const found = processedModels.find(element => (element._modelId === allModels[i]._modelId));
      if (!found)
        NOP_VIEWER.isolate([0], allModels[i]);  // this will hide all elements from this model
    }
 }


 /***************************************************
 ** FUNC: focusCurrentSelSet()
 ** DESC: user called function to focus elements in the viewer
 **********************/

// TBD: this doesn't quite seem to work for MultiModels.  Only zooms in on one of the objects.  Option isn't available in Tandem
 export function focusCurrentSelSet() {
   const aggrSet = getAggregateSelection();   // This would obviously be replaced with code to get the IDs of interest based on some condition
   if (aggrSet == null)
    console.log("Nothing selected, calling fitToView() on entire model");
   else
    console.log("Focus current SelSet in viewer:", aggrSet);

  for (let i=0; i<aggrSet.length; i++)
    NOP_VIEWER.fitToView(aggrSet[i].selection, aggrSet[i].model);
 }


 /***************************************************
 ** FUNC: showAllObjects()
 ** DESC: user called function to unhide all elements
 **********************/

export function showAllObjects() {
   NOP_VIEWER.showAll();
 }


 /***************************************************
 ** FUNC: getAllElements()
 ** DESC: Get all physical elements in the current scene
 **********************/

export function getAllElements() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getAllElements()");

  for (let i=0; i<models.length; i++) {
    const resultObjs = models[i].getElementIds();   // NOTE: this takes an ElementType flag (null = physcial objects)(see worker/dt-schema.js line 80+)
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log("Elements", resultObjs);
    console.groupEnd();
  }

  console.groupEnd();
 }


/***************************************************
** FUNC: getVisibleDbIds()
** DESC: get all currently visible elements (per model)
**********************/

export function getVisibleDbIds() {
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getVisibleDbIds()");

  for (let i=0; i<models.length; i++) {
    const resultObjs = models[i].getVisibleDbIds();
    console.group(`Model[${i}]--> ${models[i].label()}`);
    console.log("Visible Elements", resultObjs);
    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: selectAllVisibleElemnents()
** DESC: selects all currently visible elements
**********************/

export async function selectAllVisibleElemnents() {
  const facility = utils.getCurrentFacility();
  if (facility == null) {
    alert("No facility loaded");
    return;
  }

  facility.selectAllVisibleElements();
}

/***************************************************
** FUNC: getHiddenElementsByModel()
** DESC: self-explanatory
**********************/

export async function getHiddenElementsByModel() {
  const facility = utils.getCurrentFacility();
  if (facility == null) {
    alert("No facility loaded");
    return;
  }

  const resultObjs = facility.getHiddenElementsByModel();
  console.group("STUB: getHiddenElementsByModel()");
  console.log("Hidden Elements", resultObjs);
  console.groupEnd();
}

/***************************************************
** FUNC: hideModel()
** DESC: hide a give model in the facility
**********************/

export async function hideModel() {
  const facility = utils.getCurrentFacility();
  if (facility == null) {
    alert("No facility loaded");
    return;
  }

    // arbitrarily choose the primary model, but it could be any of the aggregated models in the facility
  const model = facility.getPrimaryModel();
  if (model == null) {
    alert("No primary model");
    return;
  }

  console.group("STUB: hideModel()");

  if (!facility.isModelVisible(model)) {
    console.log(`Model [${model.label()}] is already hidden`);
  }
  else {
    facility.hideModel(model);
    console.log(`Hiding primary model [${model.label()}]`);
  }

  console.groupEnd();
}

/***************************************************
** FUNC: showModel()
** DESC: show a give model in the facility
**********************/

export async function showModel() {
  const facility = utils.getCurrentFacility();
  if (facility == null) {
    alert("No facility loaded");
    return;
  }

    // arbitrarily choose the primary model, but it could be any of the aggregated models in the facility
  const model = facility.getPrimaryModel();
  if (model == null) {
    alert("No primary model");
    return;
  }

  console.group("STUB: showModel()");

  if (facility.isModelVisible(model)) {
    console.log(`Model [${model.label()}] is already visible`);
  }
  else {
    facility.showModel(model);
    console.log(`Showing primary model [${model.label()}]`);
  }

  console.groupEnd();
}


/***************************************************
** FUNC: exportMesh()
** DESC: iterate over the LMV geometry of selected elements and output
** the collected geometry to OBJ format and display in a n
**********************/

export function exportMesh(aggrSet, useWorldSpace) {

    let VE = Autodesk.Viewing.Private.VertexEnumerator;

    let mtx = new Autodesk.Viewing.Private.LmvMatrix4(true);

    let obj = ["# Produced by LMV OBJ export", "\n\n\n"];

      // iterate over all the selected objects, one model at a time
    for (var i=0; i<aggrSet.length; i++) {

        let model = aggrSet[i].model;
        let fl = model.getFragmentList();
        let it = model.getInstanceTree();

        let selection = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log("scraping geometry for dbIds", selection);

        let baseVertexIndex = 1; //OBJ indices are 1-based

        selection.forEach(dbId => {

            obj.push(`o ${dbId}`);

            it.enumNodeFragments(dbId, fragId => {

                obj.push(`g ${fragId}`);

                let geom = fl.getGeometry(fragId);

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
                }
                , useWorldSpace ? mtx : undefined);

                obj.push("\n");

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

/***************************************************
** FUNC: scrapeGeometry()
** DESC: iterate over the LMV geometry of a selected element
**********************/

export function scrapeGeometry() {
  const aggrSet = getAggregateSelection();
  if (aggrSet == null) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: scrapeGeometry()");

  let geomExportObj = exportMesh(aggrSet, true);
  if (geomExportObj) {
    console.log("OBJ format opening in new browser tab.");
    let blob = URL.createObjectURL(new Blob([geomExportObj.join("\n")], {type: "text/plain"}));
    window.open(blob);
  }

  console.groupEnd();
}

/***************************************************
** FUNC: getSavedViews()
** DESC: get the list of saved views
**********************/

export async function getSavedViews() {

  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

  console.group("STUB: getSavedViews()");

  let views = await facility.getSavedViewsList();
  if (views && views.length) {
    console.log(views);

      // make a nice table so they can easily see the viewnames in order to restore a view by name
    const viewTable = [];
    for (let i=0; i<views.length; i++) {
      viewTable.push({ viewName: views[i].viewName, id: views[i].id });
    }
    console.table(viewTable);
  }
  else {
    console.log("No saved views found.");
  }

  console.groupEnd();
}

/***************************************************
** FUNC: gotoSavedView()
** DESC: restore a saved view
**********************/

export async function gotoSavedView(viewName) {

  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }

  console.group("STUB: gotoSavedView()");

  let views = await facility.getSavedViewsList();
  let newView = views.find(v => v.viewName === viewName);
  if (newView) {
    await facility.goToView(newView);
  }
  else {
    console.log(`ERROR: Couldn't find saved view: ${viewName}`);
  }

  console.groupEnd();
}
