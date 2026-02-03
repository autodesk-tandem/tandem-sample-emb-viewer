/**
 * Property Stub Functions
 * 
 * Demonstrates Tandem SDK property-related operations.
 * Output goes to the browser console.
 */

import { getCurrentFacility, getViewer } from '../viewer.js';
import { getLoadedModels, getQualifiedProperty, queryAppliedParameterMultipleElements, convertStrToDataType, findClassificationNode } from '../utils.js';
import { getAggregateSelection } from './viewerStubs.js';

/**
 * Look up qualified property name from category and display name
 */
export async function getQualifiedPropName(propCategory, propName) {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: getQualifiedPropName()');

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        const attrs = await models[i].getHash2Attr();
        if (attrs) {
            for (let key in attrs) {
                const value = attrs[key];
                if ((value.category === propCategory) && (value.name === propName)) {
                    console.log(`Found property [${propCategory} | ${propName}]:`, value);
                }
            }
        }
        console.groupEnd();
    }
    console.groupEnd();
}

/**
 * Get properties for selected elements
 */
export async function getDtProperties() {
    await getDtPropertiesImpl(false);
}

/**
 * Get properties with history for selected elements
 */
export async function getDtPropertiesWithHistory() {
    await getDtPropertiesImpl(true);
}

/**
 * Implementation for getting DT properties
 */
async function getDtPropertiesImpl(withHistory) {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group(`STUB: getDtProperties(withHistory=${withHistory})`);

    for (let i = 0; i < aggrSet.length; i++) {
        const model = aggrSet[i].model;
        const selSet = aggrSet[i].selection;

        console.group(`Model[${i}]--> ${model.label()}`);
        console.log(`Model URN: ${model.urn()}`);

        const allProps = await model.getPropertiesDt(selSet, { history: withHistory });
        console.log('All props (raw obj)', allProps);

        if (selSet.length === 1) {
            console.log('Element properties:', allProps[0].element.properties);
            console.table(allProps[0].element.properties);

            if (allProps[0].type !== null) {
                console.log('Type properties:', allProps[0].type.properties);
                console.table(allProps[0].type.properties);
            } else {
                console.log('Type properties: NONE');
            }
        } else {
            console.log('Multiple items in SelectionSet. Pick one item to see a table of properties.');
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * Get common properties across multiple selected elements
 */
export async function getCommonDtProperties() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    if (aggrSet.length < 2) {
        console.warn('This function only makes sense with 2 or more objects selected.');
        return;
    }

    console.group('STUB: getCommonDtProperties()');

    const modelArray = [];
    const selSetArray = [];
    for (let i = 0; i < aggrSet.length; i++) {
        modelArray.push(aggrSet[i].model);
        selSetArray.push(aggrSet[i].selection);
    }

    const allProps = await facility.getCommonProperties(modelArray, selSetArray);
    console.log('All common props (raw obj)', allProps);

    console.log('Common element properties...');
    console.table(allProps.element.properties);

    console.log('Common type properties...');
    console.table(allProps.type.properties);

    console.groupEnd();
}

/**
 * Get a specific property across selected elements
 */
export async function getPropertySelSet(propCategory, propName) {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: getPropertySelSet()');

    for (let i = 0; i < aggrSet.length; i++) {
        console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);
        console.log(`Model URN: ${aggrSet[i].model.urn()}`);

        const queryInfo = {
            dbIds: aggrSet[i].selection,
            includes: { standard: false, applied: true, element: true, type: false, compositeChildren: false }
        };

        const propValues = await queryAppliedParameterMultipleElements(propCategory, propName, aggrSet[i].model, queryInfo);
        if (propValues) {
            console.log('Property values -->');
            console.table(propValues);
        } else {
            console.log('Could not find property:', propName);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * Find elements where property equals a specific value
 * Supports type-aware matching: string (partial/exact/regex), numeric (=,!=,>,>=,<,<=), boolean
 * 
 * @param {string} propCategory - Property category name
 * @param {string} propName - Property name
 * @param {string} matchValue - Value to match (ignored for boolean)
 * @param {Object} searchOptions - Search options object
 * @param {string} searchOptions.dataType - 'string', 'numeric', or 'boolean'
 * @param {boolean} searchOptions.visibleOnly - Search only visible elements
 * For string: { matchType: 'partial'|'exact'|'regex', caseInsensitive: boolean, value: string }
 * For numeric: { operator: '='|'!='|'>'|'>='|'<'|'<=', value: number }
 * For boolean: { value: boolean }
 */
export async function findElementsWherePropValueEqualsX(propCategory, propName, matchValue, searchOptions) {
    const models = getLoadedModels();
    if (!models) {
        console.warn('No models loaded');
        return;
    }

    console.group('STUB: findElementsWherePropValueEqualsX()');
    console.log('Search options:', searchOptions);

    const viewer = getViewer();
    viewer.clearSelection();

    // Build the matcher function based on data type
    let matcher;
    const dataType = searchOptions?.dataType || 'string';
    
    if (dataType === 'boolean') {
        const targetValue = searchOptions.value;
        console.log(`Matching boolean value: ${targetValue}`);
        matcher = (val) => {
            if (typeof val === 'boolean') return val === targetValue;
            // Handle string representations
            const valStr = String(val).toLowerCase();
            return valStr === (targetValue ? 'true' : 'false') || 
                   valStr === (targetValue ? '1' : '0');
        };
    } else if (dataType === 'numeric') {
        const targetValue = searchOptions.value;
        const operator = searchOptions.operator || '=';
        console.log(`Matching numeric value: ${operator} ${targetValue}`);
        matcher = (val) => {
            const numVal = typeof val === 'number' ? val : parseFloat(val);
            if (isNaN(numVal)) return false;
            switch (operator) {
                case '=': return numVal === targetValue;
                case '!=': return numVal !== targetValue;
                case '>': return numVal > targetValue;
                case '>=': return numVal >= targetValue;
                case '<': return numVal < targetValue;
                case '<=': return numVal <= targetValue;
                default: return numVal === targetValue;
            }
        };
    } else {
        // String matching
        const value = searchOptions?.value || matchValue || '';
        const matchType = searchOptions?.matchType || 'partial';
        const caseInsensitive = searchOptions?.caseInsensitive || false;
        
        if (matchType === 'regex') {
            try {
                const regex = new RegExp(value, caseInsensitive ? 'i' : '');
                console.log(`Matching regex: ${regex}`);
                matcher = (val) => regex.test(String(val));
            } catch (e) {
                console.error('Invalid regex:', e.message);
                // Fallback to partial match
                matcher = (val) => {
                    const valStr = String(val);
                    return caseInsensitive 
                        ? valStr.toLowerCase().includes(value.toLowerCase())
                        : valStr.includes(value);
                };
            }
        } else if (matchType === 'exact') {
            console.log(`Matching exact: "${value}" (case insensitive: ${caseInsensitive})`);
            matcher = (val) => {
                const valStr = String(val);
                return caseInsensitive 
                    ? valStr.toLowerCase() === value.toLowerCase()
                    : valStr === value;
            };
        } else {
            // Partial match (default)
            console.log(`Matching partial: "${value}" (case insensitive: ${caseInsensitive})`);
            matcher = (val) => {
                const valStr = String(val);
                return caseInsensitive 
                    ? valStr.toLowerCase().includes(value.toLowerCase())
                    : valStr.includes(value);
            };
        }
    }

    const visibleOnly = searchOptions?.visibleOnly || false;

    for (let i = 0; i < models.length; i++) {
        console.group(`Model[${i}]--> ${models[i].label()}`);
        console.log(`Model URN: ${models[i].urn()}`);

        if (models[i].label() === '') {
            console.log('Skipping null model...');
        } else {
            let objsToSearch = null;
            if (visibleOnly) {
                console.log('Searching only elements visible in the viewer...');
                objsToSearch = models[i].getVisibleDbIds();
            } else {
                console.log('Searching all elements in the database...');
                objsToSearch = models[i].getElementIds();
            }

            const queryInfo = {
                dbIds: objsToSearch,
                includes: { standard: true, applied: true, element: true, type: false, compositeChildren: true }
            };

            const propValues = await queryAppliedParameterMultipleElements(propCategory, propName, models[i], queryInfo);
            if (propValues) {
                const matchingProps = propValues.filter(prop => matcher(prop.value));

                if (matchingProps.length) {
                    console.log('Matching property values-->');
                    console.table(matchingProps);

                    const dbIds = matchingProps.map(a => a.dbId);
                    viewer.isolate(dbIds, models[i]);
                } else {
                    console.log('No elements found matching criteria');
                    viewer.isolate([0], models[i]);
                }
            } else {
                console.log('Could not find any elements with that property:', propName);
                viewer.isolate([0], models[i]);
            }
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * Set property on selected elements
 */
export async function setPropertySelSet(propCategory, propName, propValue) {
    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: setPropertySelSet()');

    for (let i = 0; i < aggrSet.length; i++) {
        console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);
        console.log(`Model URN: ${aggrSet[i].model.urn()}`);

        const attr = await getQualifiedProperty(aggrSet[i].model, propCategory, propName);
        console.log('attr', attr);

        if (attr) {
            const typedValue = convertStrToDataType(attr.dataType, propValue);
            if (typedValue !== null) {
                let fullyQualifiedPropName = '';
                if (attr.isNative()) {
                    fullyQualifiedPropName = Autodesk.Tandem.DtConstants.ColumnFamilies.DtProperties + ':' + attr.id;
                } else {
                    fullyQualifiedPropName = attr.id;
                }

                console.log(`Setting value for "${propCategory} | ${propName}" =`, typedValue);
                await setPropertyOnElements(aggrSet[i].model, aggrSet[i].selection, fullyQualifiedPropName, typedValue);
            } else {
                console.log('Property value could not be converted to expected type.');
            }
        } else {
            console.log(`Property named "${propCategory} | ${propName}" not found.`);
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * Helper function to set property on elements via mutate
 */
async function setPropertyOnElements(model, dbIds, qualifiedPropName, newValue) {
    const muts = [];

    for (let i = 0; i < dbIds.length; i++) {
        muts.push([qualifiedPropName, newValue]);
    }

    await model.mutate(dbIds, muts, 'EmbeddedViewerSampleApp Update')
        .then(() => {
            console.info('Update succeeded');
        })
        .catch((err) => {
            console.error('Update failed', err);
        });
}

/**
 * Assign classification to selected elements
 */
export async function assignClassification(classificationStr) {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    const classificationNode = await findClassificationNode(facility, classificationStr);
    if (classificationNode === null) {
        console.warn('Could not find that classification in the current Facility Template.');
        return;
    }

    const aggrSet = getAggregateSelection();
    if (!aggrSet) {
        console.warn('No objects selected');
        return;
    }

    console.group('STUB: assignClassification()');

    const fullyQualifiedPropName = 'n:!v'; // classification attribute

    console.log('classificationNode-->', classificationNode);
    console.log(`Setting classification to "${classificationStr}"`);

    for (let i = 0; i < aggrSet.length; i++) {
        console.group(`Model[${i}]--> ${aggrSet[i].model.label()}`);
        console.log(`Model URN: ${aggrSet[i].model.urn()}`);

        await setPropertyOnElements(aggrSet[i].model, aggrSet[i].selection, fullyQualifiedPropName, classificationStr);

        console.groupEnd();
    }

    console.groupEnd();
}

