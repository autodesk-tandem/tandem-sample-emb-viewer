# Tandem JavaScript SDK Testbed

A developer-focused web application for learning and exploring the Autodesk Tandem JavaScript SDK with an embedded 3D viewer. This project provides **STUB functions** that demonstrate SDK usage, with detailed console logging to help you understand data structures and API patterns.

## Purpose

This testbed is designed for **developer education**. Unlike typical end-user applications that hide complexity, this project intentionally exposes it:

- Learn how to use the Tandem JavaScript SDK
- Interact with a live 3D viewer and selected elements
- Understand Tandem data structures (facilities, models, elements, streams)
- See actual SDK method calls and responses
- Copy patterns into your own embedded viewer applications

## Comparison with REST Testbed

| Feature | REST Testbed | SDK Testbed (this project) |
|---------|--------------|----------------------------|
| API Access | Direct REST calls | JavaScript SDK wrapper |
| 3D Viewer | None | Embedded Autodesk Viewer |
| Element Selection | Manual key input | Click elements in viewer |
| Use Case | Backend integration, scripts | Frontend apps with viewer |

## Quick Start

### Prerequisites

- A modern web browser (Chrome recommended for DevTools)
- An Autodesk account with access to at least one Tandem facility
- A local web server (Python, Node.js http-server, etc.)

### Running Locally

1. **Clone or download this repository**

2. **Configure your APS Client ID** in `js/config.js`:

   ```javascript
   const prodEnvironment = {
       apsKey: 'YOUR_APS_CLIENT_ID',
       // ...
   };
   ```

3. **Start a local web server** in the project root:

   ```bash
   # Python 3
   python -m http.server 8000
   
   # OR Node.js
   npx http-server -p 8000
   ```

4. **Open your browser** to `http://localhost:8000`

5. **Sign in** with your Autodesk account

6. **Open Chrome DevTools** (F12 or Cmd+Option+I)

7. **Select a facility** from the dropdowns - the 3D model will load

8. **Click any STUB button** and watch the console

## How to Use

### 1. Open the Console

The most important step. All STUB functions output to the browser console:

- **Chrome/Edge**: Press F12 or Cmd+Option+I (Mac)
- **Firefox**: Press F12 or Cmd+Option+K (Mac)

### 2. Load a Facility

Select an account and facility from the dropdowns. The 3D viewer will load the model.

### 3. Select Elements (for some stubs)

Many STUB functions operate on selected elements. Click on objects in the 3D viewer to select them. Multi-select with Ctrl+Click.

### 4. Click a STUB Button

Each button executes SDK calls. For example, "Dump Facility Info" outputs:

```javascript
STUB: dumpFacilityInfo()
Facility URN: urn:adsk.dtt:...
Facility Label: My Building
Models: [...]
Settings: {...}
```

### 5. Inspect the Console Output

Expand objects in the console (click the triangles) to explore data structures.

## Architecture

```
tandem-sample-emb-viewer/
├── index.html              # UI with Tailwind CSS + Tandem Viewer
├── js/
│   ├── app.js              # Orchestrates login & facility selection
│   ├── auth.js             # OAuth authentication flow (PKCE)
│   ├── config.js           # Environment configuration
│   ├── viewer.js           # Viewer initialization and helpers
│   ├── utils.js            # Utility functions
│   ├── stubs/              # STUB functions (SDK calls)
│   │   ├── facilityStubs.js
│   │   ├── viewerStubs.js
│   │   ├── modelStubs.js
│   │   ├── propertyStubs.js
│   │   ├── streamStubs.js
│   │   ├── documentStubs.js
│   │   └── eventStubs.js
│   ├── ui/
│   │   └── stubUI.js       # UI rendering (separate from logic)
│   └── state/
│       └── schemaCache.js  # Schema caching for property lookups
└── tandem/
    ├── constants.js        # Tandem constants (QC, ColumnFamilies, etc.)
    └── keys.js             # Key utilities (short/long keys, xrefs)
```

### Key Design Principles

1. **STUB files are pure SDK logic** - No UI concerns, just SDK calls and console logging
2. **UI files handle rendering** - Buttons, forms, event handlers
3. **Viewer helpers** - Common patterns for getting selections, current facility
4. **Clean separation** - Easy to copy STUB functions into your own projects

## STUB Categories

### Facility Stubs
- Dump facility info, settings, and metadata

### Viewer Stubs
- Camera controls, selection management, visibility

### Model Stubs
- Enumerate models, get element properties by key

### Property Stubs
- Find elements by property value (with type-aware matching)
- Set property values on selected elements
- Read all properties from selection

### Stream Stubs
- List streams, get historical values

### Document Stubs
- Get facility documents

### Event Stubs
- Subscribe to facility events

## Adding New STUB Functions

### Step 1: Add STUB Function

Edit the appropriate stub file (e.g., `js/stubs/modelStubs.js`):

```javascript
import { getCurrentFacility, getViewer } from '../viewer.js';

export async function myNewStub() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: myNewStub()');
    
    // Your SDK logic here
    const models = facility.getModels();
    console.log('Models:', models);
    
    console.groupEnd();
}
```

### Step 2: Add UI Button

Edit `js/ui/stubUI.js` in the appropriate dropdown:

```javascript
const modelDropdown = createDropdownMenu('Model Stubs', [
    // ... existing stubs
    { 
        label: 'My New Stub', 
        description: 'Description here',
        action: modelStubs.myNewStub 
    }
]);
```

### Adding Stubs with Input Parameters

For stubs that need user input:

```javascript
{
    label: 'Find Elements',
    description: 'Find elements by property',
    hasInput: true,
    inputConfig: {
        fields: [
            { id: 'propName', label: 'Property Name', placeholder: 'e.g., Mark' }
        ],
        onExecute: (values) => propertyStubs.findElements(values.propName)
    }
}
```

## Understanding the SDK

### DtApp vs Facility

- **DtApp**: The main application object, handles authentication and facility loading
- **Facility**: A loaded digital twin with models, elements, and data

```javascript
// Get current facility
const facility = getCurrentFacility();

// Get all models in facility
const models = facility.getModels();

// Get a specific model
const model = models[0];
const elements = await model.getElements();
```

### Working with Selections

```javascript
import { getAggregateSelection, getSingleSelectedItem } from '../viewer.js';

// Get all selected items across models
const aggrSet = getAggregateSelection();
// Returns: [{ model, selection: [dbIds...] }, ...]

// Get single selection (for stubs requiring one element)
const item = getSingleSelectedItem();
// Returns: { model, dbId } or null
```

### Property Access

```javascript
// Get properties for selected elements
for (const { model, selection } of aggrSet) {
    for (const dbId of selection) {
        const props = await model.getPropertiesDt(dbId);
        console.log('Properties:', props);
    }
}
```

## Type-Aware Property Inputs

When setting or searching properties, the UI automatically adapts based on property type:

- **String**: Text input with partial/exact/regex matching options
- **Numeric** (Integer, Double, Float): Number input with comparison operators
- **Boolean**: True/False dropdown

This ensures correct data types are sent to the SDK.

## Troubleshooting

### Viewer doesn't load

1. Check the console for errors
2. Verify your APS Client ID is configured in `js/config.js`
3. Make sure you're accessing via `localhost` (not `127.0.0.1`)

### "No facility loaded"

1. Select a facility from the dropdown first
2. Wait for the viewer to finish loading

### "No objects selected"

Click on elements in the 3D viewer before running selection-based stubs.

### Console shows errors

1. Check the Network tab in DevTools
2. Look for 401 errors (token expired - sign out and back in)
3. Some stubs require specific facility setup (templates, classifications)

### Nothing happens when clicking buttons

Make sure Chrome DevTools console is open - that's where all output goes.

## Additional Resources

- [Tandem API Documentation](https://aps.autodesk.com/en/docs/tandem/v1/developers_guide/overview/)
- [Tandem Developer Forum](https://aps.autodesk.com/apis-and-services/tandem-data-api)
- [APS Developer Portal](https://aps.autodesk.com/)

## Authentication Note

This app uses **PKCE** (Proof Key for Code Exchange) for OAuth authentication, which is safe for public clients. The client ID is intentionally included in the source code - this is the recommended approach for browser-based apps.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

