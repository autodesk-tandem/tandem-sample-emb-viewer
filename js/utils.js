/**
 * Utility Functions
 * 
 * Helper functions used across multiple stub modules.
 */

import { getCurrentFacility } from './viewer.js';

/**
 * Format date as YYYYMMDD string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateYYYYMMDD = (date) => 
    (date ? date.toISOString().substr(0, 10).replace(/-/g, '') : '');

/**
 * Generate a random integer between 0 and max
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Convert string value to appropriate data type based on attribute type
 * @param {number} dataType - Tandem AttributeType enum value
 * @param {string} strValue - String value to convert
 * @returns {*} Converted value or null if conversion failed
 */
export function convertStrToDataType(dataType, strValue) {
    const AttributeType = window.Autodesk.Tandem.AttributeType;
    
    if (dataType === AttributeType.String) {
        return strValue;
    } else if (dataType === AttributeType.Boolean) {
        // Handle various truthy/falsy string representations
        const lower = strValue.toLowerCase().trim();
        return lower === 'true' || lower === '1' || lower === 'yes';
    } else if (dataType === AttributeType.Integer) {
        return parseInt(strValue, 10);
    } else if (dataType === AttributeType.Double || dataType === AttributeType.Float) {
        return parseFloat(strValue);
    } else {
        console.log('ERROR: this func only supports data types STRING, BOOLEAN, INT, FLOAT, or DOUBLE');
        return null;
    }
}

/**
 * Find a classification node in the facility template
 * @param {object} facility - Facility object
 * @param {string} classificationStr - Classification string to find
 * @returns {object|null} Classification node or null if not found
 */
export async function findClassificationNode(facility, classificationStr) {
    const templ = await facility.getClassificationTemplate();
    if (templ === null) {
        console.log('ERROR: expected this facility to have a template!');
        return null;
    }

    for (let i = 0; i < templ.rows.length; i++) {
        const rowObj = templ.rows[i];
        if (rowObj[0] === classificationStr) {
            return rowObj;
        }
    }
    return null;
}

/**
 * Get the primary model of the currently loaded facility
 * @returns {object|null} Primary model or null
 */
export function getCurrentPrimaryModel() {
    const facility = getCurrentFacility();
    if (facility) {
        return facility.getPrimaryModel();
    }
    return null;
}

/**
 * Get array of models currently loaded
 * @returns {Array|null} Array of models or null if none loaded
 */
export function getLoadedModels() {
    const facility = getCurrentFacility();
    if (facility) {
        const modelArray = facility.getModels();
        if (modelArray.length) {
            return modelArray;
        }
    }
    return null;
}

/**
 * Look up qualified property from category and property name
 * @param {object} model - Model object
 * @param {string} categoryName - Category name
 * @param {string} propName - Property name
 * @returns {object|null} Property object or null if not found
 */
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

/**
 * Query properties for multiple elements and return matching values
 * @param {string} propCategory - Property category
 * @param {string} propName - Property name
 * @param {object} model - Model object
 * @param {object} queryInfo - Query configuration
 * @returns {Array|null} Array of property values or null
 */
export async function queryAppliedParameterMultipleElements(propCategory, propName, model, queryInfo) {
    const props = await model.query(queryInfo);
    console.log('Raw properties returned-->', props);

    const propValues = [];

    if (props) {
        const prop = props.cols.find(item => 
            (item.category === propCategory) && (item.name === propName)
        );
        
        if (prop) {
            console.log('Raw property requested-->', prop);
            for (let i = 0; i < props.rows.length; i++) {
                const rowObj = props.rows[i];
                if (rowObj && (rowObj[prop.id] !== null && rowObj[prop.id] !== undefined)) {
                    propValues.push({ 
                        modelName: model.label(), 
                        dbId: queryInfo.dbIds[i], 
                        value: rowObj[prop.id] 
                    });
                }
            }
            return propValues;
        }
    }

    return null;
}

