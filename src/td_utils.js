
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
** FUNC: getQualifiedProperty(model, categoryName, propName)
** DESC: look up the internal, qualified name from a Display Name.  Return the full property object
** if found, or else return null
**********************/

export async function getQualifiedProperty(model, categoryName, propName) {
  const attrs = await model.getHash2Attr();
  if (attrs) {
    for (let key in attrs) {
      const value = attrs[key];
      if ((value.category === categoryName) && (value.name === propName)) {
        return value;
      }
    }
  }
  return null;
}

/***************************************************
** FUNC: getQualifiedPropertyName(model, categoryName, propName)
** DESC: look up the internal, qualified name from a Display Name.  Return just the
** qualified name.  Will add a "z:" prefix if necessary and will check to see if the
** expectec type is correct.
**********************/

export async function getQualifiedPropertyName(model, categoryName, propName, expectedType) {

  const attr = await getQualifiedProperty(model, categoryName, propName); // get the raw property
  console.log("raw attr", attr);

  if (attr) {
    if (attr.dataType == expectedType) {    // check data type is the same as expectedType
      let fullyQualifiedPropName = "";
      if ((attr.flags & Autodesk.Tandem.AttributeFlags.afDtParam) !== 0)  // should be a attr.isNative() function!
        fullyQualifiedPropName = Autodesk.Tandem.DtConstants.ColumnFamilies.DtProperties + ":" + attr.id; // prepend with "z:" to get fully qualified
      else
        fullyQualifiedPropName = attr.id;

      return fullyQualifiedPropName;
    }
    else {
      console.log(`Property "${categoryName} | ${propertyName}" was found, but was not the expected dataType!`);
    }
  }

  return null;
}

/***************************************************
** FUNC: getAppliedParameterSingleElement()
** DESC: utility function to dig out a specific property from an object.  Requires there to be only one item to get from
**********************/

export async function getAppliedParameterSingleElement(propCategory, propName, model, queryInfo) {
    // find all the objects in the selection set and get the properties that have been applied as custom parameters
  //const queryInfo = { dbIds: [dbId], includes: { standard: true, applied: true, element: true } };
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log(`Raw property -->`, prop);
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

export async function getAppliedParameterMultipleElements(propCategory, propName, model, queryInfo) {
    // find all the objects in the selection set and get the properties that have been applied as custom parameters
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  const propValues = [];  // we will return an array of property values (which will then match the dbId array)

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log("Raw property requested-->", prop);
        // now dig the value out of the property row
      for (let i=0; i<props.rows.length; i++) {
        const rowObj = props.rows[i];
        if (rowObj)
          propValues.push({ modelName: model.label(), dbId: queryInfo.dbIds[i], value: rowObj[prop.id] });  // push a new object that keeps track of the triple
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

export async function queryAppliedParameterMultipleElements(propCategory, propName, model, queryInfo) {
    // find all the objects in the selection set and get the properties that have been applied as custom parameters
  //const queryInfo = { dbIds: dbIds, includes: { standard: false, applied: true, element: false } };
  const props = await model.query(queryInfo);
  console.log("Raw properties returned-->", props);

  const propValues = [];  // return ONLY the elements that matched the query

  if (props) {
    const prop = props.cols.find(function(item) { return ((item.category === propCategory) && (item.name === propName)); });
    if (prop) {
      console.log("Raw property requested-->", prop);
        // now dig the value out of the property row
      for (let i=0; i<props.rows.length; i++) {
        const rowObj = props.rows[i];
        if (rowObj)
          propValues.push({ modelName: model.label(), dbId: queryInfo.dbIds[i], value: rowObj[prop.id] });  // push a new object that keeps track of the triple
      }

      return propValues;
    }
  }

  return null;
}
