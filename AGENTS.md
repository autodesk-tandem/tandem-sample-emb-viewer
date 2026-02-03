# AI Development Guide for Tandem JavaScript SDK Applications

**Target Audience:** Large Language Models assisting developers in building Tandem applications using the JavaScript SDK with embedded viewer.

This guide provides essential context about the Autodesk Tandem JavaScript SDK, common patterns, and pitfalls specific to this codebase.

---

## Table of Contents

1. [SDK vs REST API](#sdk-vs-rest-api)
2. [Core SDK Objects](#core-sdk-objects)
3. [Common Patterns](#common-patterns)
4. [Working with Selections](#working-with-selections)
5. [Property Operations](#property-operations)
6. [Common Pitfalls](#common-pitfalls)
7. [File Organization](#file-organization)
8. [Adding New Stubs](#adding-new-stubs)

---

## SDK vs REST API

This project uses the **Tandem JavaScript SDK** rather than direct REST API calls. Key differences:

| Aspect | REST API | JavaScript SDK |
|--------|----------|----------------|
| Access | HTTP fetch calls | SDK method calls |
| Viewer | None | Integrated 3D viewer |
| Element Selection | Manual key input | Click in viewer |
| Data Format | JSON responses | JavaScript objects |
| Authentication | Manual token handling | SDK manages tokens |

The SDK wraps the REST API and provides higher-level abstractions. Many concepts (keys, xrefs, column families) still apply but are accessed differently.

---

## Core SDK Objects

### DtApp

The main application object. Handles authentication, facility loading, and viewer initialization.

```javascript
// Access via window.DT_APP after initialization
const app = window.DT_APP;

// Load a facility
const facility = await app.displayFacility(facilityURN, null, false, false);
```

### Facility

Represents a loaded digital twin. Provides access to models, elements, and data.

```javascript
const facility = getCurrentFacility();

// Basic info
facility.urn();           // URN string
facility.label();         // Display name
facility.settings;        // Facility settings object

// Models
const models = facility.getModels();  // Array of DtModel objects

// Default model (where streams/logical elements live)
const defaultModel = facility.getDefaultModel();
```

### DtModel

Represents a 3D model within a facility.

```javascript
const model = models[0];

model.urn();              // Model URN
model.label();            // Display name
model.getData();          // Get element data

// Get properties for an element
const props = await model.getPropertiesDt(dbId);

// Get schema (attribute definitions)
const attrs = model.getHash2Attr();
```

### Viewer

The Autodesk Viewer instance. Use the helper functions in `viewer.js`:

```javascript
import { getViewer, getCurrentFacility } from '../viewer.js';

const viewer = getViewer();
const facility = getCurrentFacility();
```

---

## Common Patterns

### Pattern 1: Getting Current Facility

Always check if a facility is loaded before operating:

```javascript
import { getCurrentFacility } from '../viewer.js';

export async function myStub() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }
    
    // Proceed with facility operations
}
```

### Pattern 2: Iterating Over Models

```javascript
const facility = getCurrentFacility();
const models = facility.getModels();

for (const model of models) {
    console.log(`Model: ${model.label()} (${model.urn()})`);
    // Process each model
}
```

### Pattern 3: Getting Element Properties

```javascript
// For a single element by dbId
const props = await model.getPropertiesDt(dbId);

// props contains property values keyed by qualified column names
// e.g., props['n:n'] is the name, props['z:ABC'] is a custom property
```

### Pattern 4: Finding Properties in Schema

```javascript
// Get attribute map (cached by SDK)
const hash2Attr = model.getHash2Attr();

// Find attribute by category and name
for (const [key, attr] of Object.entries(hash2Attr)) {
    if (attr.category === 'Identity Data' && attr.name === 'Mark') {
        console.log('Found property:', attr);
        // attr.id is the qualified column ID (e.g., 'z:XYz')
        // attr.dataType is the type (1=Boolean, 2=Integer, 3=Double, etc.)
    }
}
```

### Pattern 5: Setting Property Values

```javascript
import { DtConstants } from 'tandem-viewer-sdk';  // Access via window.Autodesk.Tandem

// Build the fully qualified property name
const qualifiedProp = DtConstants.ColumnFamilies.DtProperties + ':' + attr.id;

// Set on elements
await model.mutate([elementKey], qualifiedProp, typedValue);
```

---

## Working with Selections

### Getting Aggregate Selection

Returns selections grouped by model (handles multi-model facilities):

```javascript
import { getAggregateSelection } from '../viewer.js';

const aggrSet = getAggregateSelection();
// Returns: [{ model: DtModel, selection: [dbId1, dbId2, ...] }, ...]

if (!aggrSet || aggrSet.length === 0) {
    console.warn('No objects selected');
    return;
}

for (const { model, selection } of aggrSet) {
    console.log(`Model: ${model.label()}, Selected: ${selection.length} elements`);
    for (const dbId of selection) {
        // Process each selected element
    }
}
```

### Getting Single Selection

For operations requiring exactly one element:

```javascript
import { getSingleSelectedItem, getSingleSelectedItemOptional } from '../viewer.js';

// Throws if not exactly one selected
const { model, dbId } = getSingleSelectedItem();

// Returns null if none selected
const item = getSingleSelectedItemOptional();
if (!item) {
    console.warn('Please select one element');
    return;
}
```

### Converting dbId to Element Key

```javascript
// Get element key from dbId
const elemData = model.getData().getElement(dbId);
const elementKey = elemData?.key;  // Short key (20 bytes)
```

---

## Property Operations

### Data Types

The SDK uses `Autodesk.Tandem.AttributeType` for property types:

```javascript
const AttributeType = Autodesk.Tandem.AttributeType;

// Common types:
AttributeType.Boolean   // 1
AttributeType.Integer   // 2
AttributeType.Double    // 3
AttributeType.Float     // 4
AttributeType.String    // 20
```

### Type Conversion

Use the utility function for converting string input to typed values:

```javascript
import { convertStrToDataType } from '../utils.js';

const typedValue = convertStrToDataType(attr.dataType, stringValue);
// Returns correctly typed value (number, boolean, or string)
```

### Finding a Qualified Property

```javascript
async function getQualifiedProperty(model, categoryName, propertyName) {
    const hash2Attr = model.getHash2Attr();
    
    for (const [key, attr] of Object.entries(hash2Attr)) {
        if (attr.category === categoryName && attr.name === propertyName) {
            return attr;
        }
    }
    return null;
}
```

### Setting Properties on Elements

```javascript
const DtConstants = Autodesk.Tandem.DtConstants;

// Get the qualified property
const attr = await getQualifiedProperty(model, 'My Category', 'My Property');

// Build fully qualified name
let fullyQualifiedProp;
if (attr.isNative()) {
    fullyQualifiedProp = DtConstants.ColumnFamilies.DtProperties + ':' + attr.id;
} else {
    fullyQualifiedProp = attr.id;
}

// Convert value to correct type
const typedValue = convertStrToDataType(attr.dataType, userInputString);

// Set on elements (elementKeys is array of short keys)
await model.mutate(elementKeys, fullyQualifiedProp, typedValue);
```

---

## Common Pitfalls

### Pitfall 1: Not Checking for Facility

**Problem:** Calling facility methods before one is loaded.

**Solution:**
```javascript
const facility = getCurrentFacility();
if (!facility) {
    console.warn('No facility loaded');
    return;
}
```

### Pitfall 2: Not Checking for Selection

**Problem:** Assuming elements are selected.

**Solution:**
```javascript
const aggrSet = getAggregateSelection();
if (!aggrSet || aggrSet.length === 0) {
    console.warn('No objects selected');
    return;
}
```

### Pitfall 3: Wrong Property Type

**Problem:** Setting a numeric property with a string value.

**Solution:** Always use `convertStrToDataType()`:
```javascript
const typedValue = convertStrToDataType(attr.dataType, stringInput);
if (typedValue === null) {
    console.error('Could not convert value to expected type');
    return;
}
```

### Pitfall 4: Using Wrong Property ID Format

**Problem:** Mixing up `attr.id` with fully qualified names.

**Solution:** Check if property is native:
```javascript
let qualifiedProp;
if (attr.isNative()) {
    // Native properties need prefix
    qualifiedProp = DtConstants.ColumnFamilies.DtProperties + ':' + attr.id;
} else {
    // Non-native already have family prefix
    qualifiedProp = attr.id;
}
```

### Pitfall 5: Expecting Schema Before Load

**Problem:** Accessing `model.getHash2Attr()` before model data is loaded.

**Solution:** The SDK loads data lazily. Schema access works after facility loads, but may return empty if queried too early. Use the schema cache pattern:
```javascript
import { ensureSchemasLoaded } from '../state/schemaCache.js';

await ensureSchemasLoaded();
// Now safe to query schema info
```

### Pitfall 6: Hardcoding Column Names

**Problem:** Using magic strings like `'n:n'` instead of constants.

**Solution:** Use constants from `tandem/constants.js`:
```javascript
import { QC } from '../tandem/constants.js';

const name = element[QC.OName] ?? element[QC.Name];  // Check override first
```

---

## File Organization

```
tandem-sample-emb-viewer/
├── index.html              # UI with Tailwind CSS + Tandem Viewer
├── js/
│   ├── app.js              # Login, facility selection, initialization
│   ├── auth.js             # OAuth PKCE authentication
│   ├── config.js           # Environment configuration (APS keys)
│   ├── viewer.js           # Viewer init + helper exports
│   ├── utils.js            # Shared utilities (type conversion, etc.)
│   ├── stubs/              # STUB functions organized by domain
│   │   ├── facilityStubs.js    # Facility info operations
│   │   ├── viewerStubs.js      # Camera, selection, visibility
│   │   ├── modelStubs.js       # Model enumeration, element queries
│   │   ├── propertyStubs.js    # Property read/write operations
│   │   ├── streamStubs.js      # IoT stream data
│   │   ├── documentStubs.js    # Facility documents
│   │   └── eventStubs.js       # Event subscriptions
│   ├── ui/
│   │   └── stubUI.js           # UI rendering, form handling
│   └── state/
│       └── schemaCache.js      # Schema caching and property lookup
└── tandem/
    ├── constants.js            # Column families, names, flags, QC
    └── keys.js                 # Key conversion utilities
```

### What Each File Does

| File | Purpose |
|------|---------|
| `app.js` | Orchestrates login flow, account/facility dropdowns, calls viewer init |
| `auth.js` | PKCE OAuth flow, token storage/refresh |
| `config.js` | APS client IDs, environment URLs |
| `viewer.js` | Initializes DtApp, loads facilities, exports helper functions |
| `utils.js` | Type conversion, formatting utilities |
| `stubUI.js` | Creates dropdown menus, handles input forms, executes stubs |
| `schemaCache.js` | Collects property metadata from all models, provides lookups |

---

## Adding New Stubs

### Step 1: Choose the Right Stub File

- Facility operations → `facilityStubs.js`
- Viewer/camera operations → `viewerStubs.js`
- Model/element queries → `modelStubs.js`
- Property read/write → `propertyStubs.js`
- Stream data → `streamStubs.js`
- Documents → `documentStubs.js`
- Events → `eventStubs.js`

### Step 2: Write the Stub Function

```javascript
// In js/stubs/modelStubs.js

import { getCurrentFacility } from '../viewer.js';

/**
 * Example stub that lists all elements in the default model
 */
export async function listDefaultModelElements() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: listDefaultModelElements()');
    
    const defaultModel = facility.getDefaultModel();
    if (!defaultModel) {
        console.log('No default model found');
        console.groupEnd();
        return;
    }
    
    const data = defaultModel.getData();
    const elements = data.getElements();
    
    console.log(`Found ${elements.length} elements in default model`);
    console.log('Elements:', elements);
    
    console.groupEnd();
}
```

### Step 3: Add to UI

Edit `js/ui/stubUI.js` in the `renderStubs()` function:

```javascript
// Find the appropriate dropdown (e.g., modelDropdown)
const modelDropdown = createDropdownMenu('Model Stubs', [
    // ... existing stubs
    { 
        label: 'List Default Model Elements', 
        description: 'List all elements in default model',
        action: modelStubs.listDefaultModelElements 
    }
]);
```

### Step 4: For Stubs with Input

```javascript
{
    label: 'Get Element by Key',
    description: 'Get element details by key',
    hasInput: true,
    inputConfig: {
        fields: [
            { 
                id: 'elementKey', 
                label: 'Element Key', 
                placeholder: 'e.g., ABC123...' 
            }
        ],
        onExecute: (values) => modelStubs.getElementByKey(values.elementKey)
    }
}
```

---

## Quick Reference

### Getting Things

| What | How |
|------|-----|
| Current facility | `getCurrentFacility()` from `viewer.js` |
| Viewer instance | `getViewer()` from `viewer.js` |
| All models | `facility.getModels()` |
| Default model | `facility.getDefaultModel()` |
| Selected elements | `getAggregateSelection()` from `viewer.js` |
| Single selection | `getSingleSelectedItem()` from `viewer.js` |
| Property schema | `model.getHash2Attr()` |
| Element properties | `await model.getPropertiesDt(dbId)` |

### Constants

| Import | Contains |
|--------|----------|
| `QC` from `tandem/constants.js` | Qualified column names (`QC.Name`, `QC.OName`, etc.) |
| `ColumnFamilies` from `tandem/constants.js` | Column family prefixes |
| `ElementFlags` from `tandem/constants.js` | Element type flags |
| `Autodesk.Tandem.AttributeType` | Property data types |
| `Autodesk.Tandem.DtConstants` | SDK constants |

### Key SDK Classes

| Class | Access |
|-------|--------|
| DtApp | `window.DT_APP` |
| Facility | `getCurrentFacility()` |
| DtModel | `facility.getModels()[i]` |
| Viewer | `getViewer()` |

---

## Additional Resources

- [Tandem API Documentation](https://aps.autodesk.com/en/docs/tandem/v1/developers_guide/overview/)
- [REST Testbed Project](../tandem-sample-rest-testbed-ai/) - For direct REST API patterns
- [tandem-sample-stats](../tandem-sample-stats/) - For more REST API patterns and AGENTS.md

---

This guide covers SDK-specific patterns. For REST API concepts (short/long keys, xrefs, column families), see the AGENTS.md in the tandem-sample-stats project.

