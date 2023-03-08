
import * as vw_stubs from './vw_stubs.js';
import * as utils from './utils.js';

/***************************************************
** FUNC: getQualifiedPropName()
** DESC: from a CategoryName and PropName (human-readable), look up the internal or "qualified" name that is
** needed in calls to query() or mutate().  NOTE: the same propertyName can have different qualified names for
** each model (i.e., names are model-dependent)
**********************/

export async function getQualifiedPropName(propCategory, propName) {

  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: getQualifiedPropName()");

    // loop through each model and get the attributes (aka properties) schema
  for (let i=0; i<models.length; i++) {
    console.group(`Model[${i}]--> ${models[i].label()}`);

    const attrs = await models[i].getHash2Attr();
    if (attrs) {
      for (let key in attrs) {
        const value = attrs[key];
        if ((value.category === propCategory) && (value.name === propName)) {
          console.log(`Found property [${propCategory} | ${propName}]: `, value);
        }
      }
    }
    console.groupEnd();
  }
  console.groupEnd();
}

/***************************************************
** FUNC: getDtPropertiesImpl()
** DESC: get all the Properties attached to the selected entities.  If there is only one item selected,
** dump out a verbose table of info. The query constructed will include the elements in the selSet + any
** types they reference.  For instance, selecting a will include the Wall itself and the WallFamily (in Revit terms)
**********************/

export async function getDtPropertiesImpl(withHistory) {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group(`STUB: getDtProperties(withHistory=${withHistory})`);

    // The aggregate set comes back as array of pairs (Model, SelSet)
  for (let i=0; i<aggrSet.length; i++) {
    const model = aggrSet[i].model;
    const selSet = aggrSet[i].selection;

    console.group(`Model[${i}]--> ${model.label()}`);

      // TBD: what does options do here?
    //DtModel.prototype.getPropertiesDt = async function(dbIds, options = {}).
    const allProps = await model.getPropertiesDt(selSet, { history: withHistory });
    console.log("all props (raw obj)", allProps);

      // if they only selected a single item, print out some more verbose info about the properties
      // for easy reading in the debugging console.
    if (selSet.length === 1) {
      console.log("element properties:", allProps[0].element.properties);
      console.table(allProps[0].element.properties);

      if (allProps[0].type != null) {   // Not everything has Type properties (e.g., Rooms)
        console.log("type properties:", allProps[0].type.properties);
        console.table(allProps[0].type.properties);
      }
      else {
        console.log("type properties: NONE");
      }

        // if we want to find a specific value only with given displayName
      //const woProp = allProps[0].element.properties.find(function(item) { return item.displayName === 'WO Id'; });
      //if (woProp) {
      //  console.log("WO id value-->", woProp.displayValue);
      //}
    }
    else {
      console.log("Multiple items in SelectionSet. Pick one item to see a table of properties.");
    }

    console.groupEnd();
  }

  console.groupEnd();
}


/***************************************************
** FUNC: getDtProperties()
** DESC: call model.getDtProperties() with history flag set to false
**********************/

export async function getDtProperties() {
  getDtPropertiesImpl(false);
}

/***************************************************
** FUNC: getDtPropertiesWithHistory()
** DESC: call model.getDtProperties() with history flag set to true
**********************/

export async function getDtPropertiesWithHistory() {
  getDtPropertiesImpl(true);
}

/***************************************************
** FUNC: getCommonDtProperties()
** DESC: get all the Parameters attached to the selected entities. The query constructed will
** include the elements in the selSet + any types they reference.  For instance, selecting a wall
** will include the Wall itself and the WallFamily (in Revit terms)
**********************/

export async function getCommonDtProperties() {

  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTLY LOADED");
    return;
  }

  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  if (aggrSet.length < 2) {
    alert("This function only makes sense with 2 or more objects selected.");
    return;
  }

  console.group("STUB: getCommonDtProperties()")

    // The aggregate set comes back as array of pairs (Model, SelSet).  We need to get it into
    // an array of Models and a matching array of SelSets (e.g. [m1, m2] and [[1,2,3][4,5])
  const modelArray = [];
  const selSetArray = [];
  for (let i=0; i<aggrSet.length; i++) {
    modelArray.push(aggrSet[i].model);
    selSetArray.push(aggrSet[i].selection);
  }

  const allProps = await facility.getCommonProperties(modelArray, selSetArray);
  console.log("all common props (raw obj)", allProps);

  console.log("common element properties...");
  console.table(allProps.element.properties);

  console.log("common type properties...");
  console.table(allProps.type.properties);

  console.groupEnd();
}

/***************************************************
** FUNC: getPropertySelSet()
** DESC: get a specific property across multiple items sselected
**********************/

export async function getPropertySelSet(propCategory, propName) {
  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: getPropertySelSet()");

  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

      // TBD: not sure yet exactly how all the options work or why to use model.query() over model.getDtProperties()
      // You can experiment by changing flags
    const queryInfo = {
      dbIds: aggrSet[i].selection,
      //classificationId: facility.settings?.template?.classificationId,
      includes: { standard: false, applied: true, element: true, type: false, compositeChildren: false }
    };

    const propValues = await utils.queryAppliedParameterMultipleElements(propCategory, propName, aggrSet[i].model, queryInfo);
    if (propValues) {
      console.log("Property values -->");
      console.table(propValues);
    }
    else
      console.log("Could not find property: ", propName);

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: findElementsWherePropValueEqualsX()
** DESC: get a specific property across multiple items selected where the property value is what
** we are looking for.   EXAMPLE: find all elements where "Common | Name" = "Basic Wall".  You can
** also specify whether to treat the matchStr as a Javascript regular expression, and you can specify
** whether to only search the elements that are visible in the viewer, or search all elements in the db
**********************/

export async function findElementsWherePropValueEqualsX(propCategory, propName, matchStr, isRegEx, searchVisibleOnly, isCaseInsensitive) {
    // we are going to try to search all elements in the database (that are loaded/visible in the viewer)
  const models = utils.getLoadedModels();
  if (!models) {
    alert("NO MODEL LOADED");
    return;
  }

  console.group("STUB: findElementsWherePropValueEqualsX()");

  NOP_VIEWER.clearSelection(); // start with nothing selected so its correct when we call isoloate()

  //for (let i=0; i<models.length; i++) {
  for (let i=0; i<models.length; i++) { // TBD: switch back when bugs fixed
    console.group(`Model[${i}]--> ${models[i].label()}`);

    if (models[i].label() === "") {
      console.log("skipping null model...");  // TBD: bug in the system where we have a model with no geometry
    }
    else {
      let objsToSearch = null;
      if (searchVisibleOnly) {
          // get all the elements that are currently visible in the viewer
        console.log("searching only elments visible in the viewer...");
        objsToSearch = models[i].getVisibleDbIds();   // NOTE: this takes an ElementType flag (null = physcial objects)(see worker/dt-schema.js line 80+)
      }
      else {
          // dearch everything in the database regardless of whether its on screen in the viewer
        console.log("searching all elments in the database...");
        objsToSearch = models[i].getElementIds();
      }
        // TBD: not sure yet exactly how all the options work or why to use model.query() over model.getDtProperties()
        // You can experiment by changing flags
      const queryInfo = {
        dbIds: objsToSearch,
        //classificationId: facility.settings?.template?.classificationId,
        includes: { standard: true, applied: true, element: true, type: false, compositeChildren: true }
      };

      const propValues = await utils.queryAppliedParameterMultipleElements(propCategory, propName, models[i], queryInfo);
      if (propValues) {
        let matchingProps = null;
        if (isRegEx) {
          let regEx = null;
          if (isCaseInsensitive)
            regEx = new RegExp(matchStr, "i");
          else
            regEx = new RegExp(matchStr);

          console.log("Doing RegularExpression match for:", regEx);
          matchingProps = propValues.filter(prop => regEx.test(prop.value)); // filter out the ones that match our query using a RegEx
        }
        else {
          if (isCaseInsensitive) {
            console.log(`Doing case insensitive match for: "${matchStr}..."`);
            matchingProps = propValues.filter(prop => prop.value.toLowerCase() === matchStr.toLowerCase());   // filter out the ones that match our query exactly
          }
          else {
            console.log(`Doing literal match for: "${matchStr}..."`);
            matchingProps = propValues.filter(prop => prop.value === matchStr);   // filter out the ones that match our query exactly
          }
        }

        if (matchingProps.length) {
          console.log("Matching property values-->");
          console.table(matchingProps);

            // extract all the dbids from the array of objects returned
          const dbIds = matchingProps.map(a => a.dbId);
          NOP_VIEWER.isolate(dbIds, models[i]); // isolate them so we can visualize them.
        }
        else {
          console.log("No elements found with that value");
          NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
        }
      }
      else {
        console.log("Could not find any elements with that property: ", propName);
        NOP_VIEWER.isolate([0], models[i]); // ghost the entire model, because we found nothing
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: setPropertyOnElements()
** DESC: common bit of code to wrap the call to mutate() once you isolate the model and qualified property
**********************/

export async function setPropertyOnElements(model, dbIds, qualifiedPropName, newValue) {
  const muts = [];

    // NOTE: number of mutations and elements must match (even if mutation is the same each time)
  for (let i=0; i<dbIds.length; i++)
    muts.push([qualifiedPropName, newValue]);       // do we need 3rd arg for hash?

  await model.mutate(dbIds, muts, "EmbeddedViewerSampleApp Update")
      .then(() => {
        console.info('Update succeeded');
      })
      .catch((err) => {
        console.error('Update failed', err);
      });
}

/***************************************************
** FUNC: setPropertySelSet()
** DESC: set the specific property we are interested in.  If the property is already applied to the
** given element, it will update it.  If the property does not exist yet, it will add it.  NOTE: This
** does not take into account "Classification" logic.  It applies the property regardless of whether
** it is mapped to a classification in the Facility Template.
**********************/

export async function setPropertySelSet(propCategory, propName, propValue) {

  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: setPropertySelSet()");

    // loop through the models individually and set the property to something new
  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

    const attr = await utils.getQualifiedProperty(aggrSet[i].model, propCategory, propName);
    console.log("attr", attr);

    if (attr) {
      const typedValue = utils.convertStrToDataType(attr.dataType, propValue)
      if (typedValue != null) {    // check data type was expected and we could convert to it
        let fullyQualifiedPropName = "";
        if (attr.isNative())  // is this user-defined in Tandem?
          fullyQualifiedPropName = Autodesk.Tandem.DtConstants.ColumnFamilies.DtProperties + ":" + attr.id; // prepend with "z:" to get fully qualified
        else
          fullyQualifiedPropName = attr.id;

        console.log(`Setting value for "${propCategory} | ${propName}" = `, typedValue);
        setPropertyOnElements(aggrSet[i].model, aggrSet[i].selection, fullyQualifiedPropName, typedValue);
      }
      else {
        console.log("Property value could not be converted to expected type.");
      }
    }
    else {
      console.log(`Property named "${propCategory} | ${propName}" not found.`);
    }

    console.groupEnd();
  }

  console.groupEnd();
}

/***************************************************
** FUNC: assignClassification()
** DESC: apply a Classification to the selected elements, which will determine which Properties
** are associated with the element. NOTE: the act of applying the classification will cause the
** associated properties to show up in subsequent calls to get the property, but as of now, the value
** is "undefined".  To give the value a default or initial value, you have to make a subsequent call
** via some code like setPropertySingleElement() in the above example.
**********************/

export async function assignClassification(classificationStr) {

  const facility = utils.getCurrentFacility();
  if (!facility) {
    alert("NO FACILITY CURRENTL LOADED");
    return;
  }
  const classificationNode = await utils.findClassificationNode(facility, classificationStr);
  if (classificationNode == null) {
    alert("Could not find that classification in the current Facility Template.");
    return;
  }

  const aggrSet = vw_stubs.getAggregateSelection();
  if (!aggrSet) {
    alert("No objects selected");
    return;
  }

  console.group("STUB: assignClassification()");

  const fullyQualifiedPropName = "n:!v";  // classification attribute (hardwired in system)

  console.log("classificationNode-->", classificationNode);
  console.log(`Setting classifiction to "${classificationStr}"`);

    // loop through the models individually and set the "Classification" property to a new value
  for (let i=0; i<aggrSet.length; i++) {
    console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);

    setPropertyOnElements(aggrSet[i].model, aggrSet[i].selection, fullyQualifiedPropName, classificationStr);

    console.groupEnd();
  }

  console.groupEnd();
}
