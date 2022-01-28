
export const formatDateYYYYMMDD = (date) => (date ? date.toISOString().substr(0, 10).replace(/-/g, '') : '');

/***************************************************
** FUNC: getRandomInt()
** DESC: generate a random Integer between 0 and max
**********************/

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/***************************************************
** FUNC: getCurrentFacility()
** DESC: get the currently loaded facility
**********************/

export function getCurrentFacility() {
  return DT_APP.currentFacility;
}

/***************************************************
** FUNC: getCurrentPrimaryModel()
** DESC: get the primary model fo the currently loaded facility
**********************/

export function getCurrentPrimaryModel() {
  const facility = getCurrentFacility();
  if (facility) {
      return facility.getPrimaryModel();
  }
  return null;
}

/***************************************************
** FUNC: getLoadedModels()
** DESC: get the array of models currently loaded.  If there aren't any, return null
**********************/

export function getLoadedModels() {
  const facility = getCurrentFacility();
  if (facility) {
      const modelArray = facility.getModels();
      if (modelArray.length) {
        return modelArray;
      }
      else {
        return null;
      }
  }
  return null;
}

/***************************************************
** FUNC: getAppliedParameterSingleElement()
** DESC: utility function to dig out a specific property from an object.  Requires there to be only one item to get from
**********************/

export async function getAppliedParameterSingleElement(propCategory, propName, model, dbId) {
    // find all the objects in the selection set and get the properties that have been applied as custom parameters
  const queryInfo = { dbIds: [dbId], includes: { standard: false, applied: true, element: false } };
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log(`Raw property (dbId=${dbId})-->`, prop);
        // now dig the value out of the property row
      if (props.rows.length === 1) {
        const rowObj = props.rows[0];
        const propValue = rowObj[prop.id];
        return propValue;
      }
      else {
        console.warning("expected props.rows.length === 1");
      }
    }
  }

  return null;
}

/***************************************************
** FUNC: getAppliedParameterMultipleElements()
** DESC: utility function to dig out a specific property from an object.  Requires there to be only one item to get from
** RETURN: array of objects { modelName, dbId, propValue }
**********************/

export async function getAppliedParameterMultipleElements(propCategory, propName, model, dbIds) {
    // find all the objects in the selection set and get the properties that have been applied as custom parameters
  const queryInfo = { dbIds: dbIds, includes: { standard: false, applied: true, element: false } };
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  const propValues = [];  // we will return an array of property values (which will then match the dbId array)

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log("Raw property-->", prop);
        // now dig the value out of the property row
      for (let i=0; i<props.rows.length; i++) {
        const rowObj = props.rows[i];
        if (rowObj)
          propValues.push({ modelName: model.label(), dbId: dbIds[i], value: rowObj[prop.id] });  // push a new object that keeps track of the triple
        else
          propValues.push(null);
      }

      return propValues;
    }
  }

  return null;
}

/***************************************************
** FUNC: queryAppliedParameterMultipleElements()
** DESC: same as above, but only return elements that actually have that value, don't push NULL into the return values.
**    this version tries to be a little more efficient because its expecting to iterate over the entire database. (still playing with best way to do this)
** RETURN: array of objects { dbId, propValue }
**********************/

export async function queryAppliedParameterMultipleElements(propCategory, propName, model, dbIds) {
    // find all the objects in the selection set and get the properties that have been applied as custom parameters
  const queryInfo = { dbIds: dbIds, includes: { standard: false, applied: true, element: false } };
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  const propValues = [];  // return ONLY the elements that matched the query

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log("Raw property-->", prop);
        // now dig the value out of the property row
      for (let i=0; i<props.rows.length; i++) {
        const rowObj = props.rows[i];
        if (rowObj)
          propValues.push({ dbId: dbIds[i], value: rowObj[prop.id] });  // push a new object that keeps track of the triple
      }

      return propValues;
    }
  }

  return null;
}

/***************************************************
** FUNC: lookupPropertyInternalName()
** DESC: utility function to retrieve the internal name for a given Property
** RETURN: the internalName (like: "z:q32", or return null if not found)
**********************/

export async function lookupPropertyInternalName(propCategory, propName, model, dbId) {
    // for the given entity, return the Parameters applied to this
  const queryInfo = { dbIds: [dbId], includes: { standard: false, applied: true, element: false } };
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log(`Found internalName for [${propCategory} | ${propName}]-->`, prop.id);
      return prop.id;
    }
  }

  console.log(`Property named [${propCategory} | ${propName}] not found`);
  return null;
}
