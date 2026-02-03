/**
 * Schema Cache Module (SDK Version)
 * 
 * Note: The Tandem SDK internally caches model attribute data (hash2attr) 
 * in the property database (pdb). This module provides helpers to collect
 * schema info across all models for autocomplete functionality.
 * 
 * The SDK loads property data lazily when the instance tree loads,
 * so getHash2Attr() may not be available immediately after displayFacility().
 * By the time users interact with stubs, the data is typically ready.
 */

import { getCurrentFacility } from '../viewer.js';

// Local cache for aggregated categories/properties (for autocomplete)
let cachedCategories = null;
let cachedProperties = null;  // Map: category -> Set of property names
let cachedPropertyMeta = null; // Map: "category.propName" -> { dataType, dataTypeName }
let cacheTimestamp = 0;

/**
 * Get human-readable name for data type
 * @param {number} dataType - Tandem AttributeType enum value
 * @returns {string} Human-readable data type name
 */
function getDataTypeName(dataType) {
    const AttributeType = window.Autodesk?.Tandem?.AttributeType;
    if (!AttributeType) return 'Unknown';
    
    switch (dataType) {
        case AttributeType.Unknown: return 'Unknown';
        case AttributeType.Boolean: return 'Boolean';
        case AttributeType.Integer: return 'Integer';
        case AttributeType.Double: return 'Double';
        case AttributeType.Float: return 'Float';
        case AttributeType.String: return 'String';
        case AttributeType.DateTime: return 'DateTime';
        case AttributeType.Position: return 'Position';
        default: return `Type(${dataType})`;
    }
}

/**
 * Check if dataType is numeric
 * @param {number} dataType - Tandem AttributeType enum value
 * @returns {boolean}
 */
export function isNumericType(dataType) {
    const AttributeType = window.Autodesk?.Tandem?.AttributeType;
    if (!AttributeType) return false;
    
    return (
        dataType === AttributeType.Integer ||
        dataType === AttributeType.Double ||
        dataType === AttributeType.Float
    );
}

/**
 * Check if dataType is boolean
 * @param {number} dataType - Tandem AttributeType enum value
 * @returns {boolean}
 */
export function isBooleanType(dataType) {
    const AttributeType = window.Autodesk?.Tandem?.AttributeType;
    if (!AttributeType) return false;
    
    return dataType === AttributeType.Boolean;
}

/**
 * Collect schema info from all models in the facility
 * The SDK caches internally, so this is fast after models load
 * @returns {Promise<{categories: Set, propertiesByCategory: Map, propertyMeta: Map}>}
 */
async function collectSchemaInfo() {
    const facility = getCurrentFacility();
    if (!facility) {
        return { categories: new Set(), propertiesByCategory: new Map(), propertyMeta: new Map() };
    }
    
    const models = facility.getModels();
    if (!models || models.length === 0) {
        return { categories: new Set(), propertiesByCategory: new Map(), propertyMeta: new Map() };
    }
    
    const categories = new Set();
    const propertiesByCategory = new Map();
    const propertyMeta = new Map(); // "category.propName" -> { dataType, dataTypeName }
    
    // Collect from all models
    for (const model of models) {
        try {
            // SDK caches this internally in the property database
            const hash2attr = await model.getHash2Attr();
            
            if (hash2attr) {
                for (const [id, attr] of Object.entries(hash2attr)) {
                    if (attr.category) {
                        categories.add(attr.category);
                        
                        if (!propertiesByCategory.has(attr.category)) {
                            propertiesByCategory.set(attr.category, new Set());
                        }
                        if (attr.name) {
                            propertiesByCategory.get(attr.category).add(attr.name);
                            
                            // Store property metadata (dataType)
                            const key = `${attr.category}.${attr.name}`;
                            if (!propertyMeta.has(key)) {
                                propertyMeta.set(key, {
                                    dataType: attr.dataType,
                                    dataTypeName: getDataTypeName(attr.dataType)
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            // Model properties not ready yet - skip silently
            // This is expected if called too early
            console.log(`Schema: Model ${model.label()} not ready yet`);
        }
    }
    
    return { categories, propertiesByCategory, propertyMeta };
}

/**
 * Ensure schemas are loaded and cache for autocomplete
 * @returns {Promise<boolean>} True if any schemas are available
 */
export async function ensureSchemasLoaded() {
    // Check if cache is stale (> 5 seconds old or no facility)
    const facility = getCurrentFacility();
    if (!facility) {
        return false;
    }
    
    const now = Date.now();
    if (cachedCategories && (now - cacheTimestamp) < 5000) {
        return cachedCategories.size > 0;
    }
    
    console.log('SCHEMA: Loading schema info from models...');
    const { categories, propertiesByCategory, propertyMeta } = await collectSchemaInfo();
    
    cachedCategories = categories;
    cachedProperties = propertiesByCategory;
    cachedPropertyMeta = propertyMeta;
    cacheTimestamp = now;
    
    console.log(`SCHEMA: ${categories.size} categories, ${propertyMeta.size} properties found`);
    return categories.size > 0;
}

/**
 * Get unique category names from all models
 * @returns {Array<string>} Sorted array of unique category names
 */
export function getUniqueCategoryNames() {
    if (!cachedCategories) {
        return [];
    }
    return Array.from(cachedCategories).sort((a, b) => 
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
}

/**
 * Get unique property names, optionally filtered by category
 * @param {string} [categoryFilter] - Optional category name to filter by
 * @returns {Array<string>} Sorted array of unique property names
 */
export function getUniquePropertyNames(categoryFilter = null) {
    if (!cachedProperties) {
        return [];
    }
    
    const allProperties = new Set();
    
    if (categoryFilter) {
        const props = cachedProperties.get(categoryFilter);
        if (props) {
            for (const prop of props) {
                allProperties.add(prop);
            }
        }
    } else {
        for (const props of cachedProperties.values()) {
            for (const prop of props) {
                allProperties.add(prop);
            }
        }
    }
    
    return Array.from(allProperties).sort((a, b) => 
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
}

/**
 * Get property metadata (dataType) for a specific category.property
 * @param {string} category - Category name
 * @param {string} propName - Property name
 * @returns {Object|null} { dataType, dataTypeName } or null if not found
 */
export function getPropertyMeta(category, propName) {
    if (!cachedPropertyMeta) {
        return null;
    }
    const key = `${category}.${propName}`;
    return cachedPropertyMeta.get(key) || null;
}

/**
 * Check if schemas are loaded
 * @returns {boolean}
 */
export function areSchemasLoaded() {
    return cachedCategories !== null && cachedCategories.size > 0;
}

/**
 * Clear the schema cache
 * Should be called when switching facilities
 */
export function clearSchemaCache() {
    cachedCategories = null;
    cachedProperties = null;
    cachedPropertyMeta = null;
    cacheTimestamp = 0;
    console.log('SCHEMA: Cache cleared');
}
