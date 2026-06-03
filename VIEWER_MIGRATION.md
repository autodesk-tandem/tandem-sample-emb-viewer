# Viewer Migration Guide — SDK v1.0.926

## What Changed

The Tandem JavaScript SDK is loaded as a single script that bundles all the Tandem-specific `Dt*` classes together with an underlying 3D viewer component. Prior to version 1.0.926, that underlying viewer was a **customized build** maintained by the Tandem team. Starting with **version 1.0.926**, it uses the **same standard viewer engine as APS** (`viewer3D.js`), keeping the Tandem-specific wrappers on top.

From a day-to-day SDK usage perspective, the public API is unchanged. However, the internal lifecycle of facility loading and unloading changed in subtle but important ways that will break existing apps if not updated.

---

## Updating Facility Load / Switch Logic

The most impactful change is how you must handle **switching between facilities**. The old SDK managed teardown internally without requiring explicit cleanup. The new standard viewer exposes lower-level hooks that must be called in the correct order.

### The Problem with Naive Re-Loading

If you simply call `displayFacility()` a second time (to switch to a different facility, or reload the same one), you will see errors like:

```
TypeError: Cannot read properties of null (reading 'clientWidth')
TypeError: Cannot read properties of null (reading 'forEach')
TypeError: Cannot read properties of null (reading 'getLinkForModel')
```

These occur because:

- `displayFacility()` tries to unload the current facility through the old viewer instance **after** it has been torn down, nulling its internal arrays.
- Model objects from a previously loaded facility retain stale LMV viewer references. When re-loaded into a fresh viewer instance, those stale references cause null-dereference errors.

### The Correct Sequence

The fix requires three steps **before** calling `displayFacility()` for a new facility:

1. **`facility.unloadModels()`** — call this while the old viewer is still alive. This invokes `model.reset()` on every model, clearing stale LMV references so the models can be cleanly reloaded later.
2. **`currentApp.currentFacility = null`** — clearing this before calling `displayFacility()` tells the SDK to skip its internal `#unloadFacility()` path, which would otherwise attempt to call `unloadModels()` a second time through the already-torn-down viewer.
3. **`viewer.tearDown()`** — only safe to call *after* `unloadModels()` has run.

```javascript
async function switchFacility(newFacility) {
    // Only needed when switching away from a loaded facility.
    // On first load currentApp.currentFacility is null, so skip this block.
    if (currentApp.currentFacility) {

        // Step 1: reset model state through the LIVE viewer (must come first)
        try { currentApp.currentFacility.unloadModels(); } catch(e) {}

        // Step 2: clear the SDK's facility reference so displayFacility()
        //         skips its internal unload (which would re-run through the
        //         torn-down viewer and throw)
        currentApp.currentFacility = null;

        // Step 3: tear down and replace the viewer
        try { currentViewer.tearDown(); } catch(e) {}
        viewerContainer.innerHTML = '';
        currentViewer = startViewer(viewerContainer);
    }

    // Load the new facility into the fresh viewer.
    // Pass null for initialViewInfo (not false) — false is not a valid value.
    await currentApp.displayFacility(newFacility, null, currentViewer);
}
```

### Why the Order Matters

| Step | Why it must come first |
|------|------------------------|
| `unloadModels()` | Must run while `viewer.impl` is still valid. Calls `model.reset()` which clears per-model LMV references. Without this, revisiting a facility throws `getLinkForModel` of null. |
| `currentFacility = null` | Must come before `tearDown()` so the SDK doesn't try to use the nulled viewer state. Must also come before `displayFacility()` to skip the redundant internal unload. |
| `tearDown()` | Must come after `unloadModels()`. Nulls internal viewer arrays; calling it first causes the `forEach/clientWidth of null` errors. |

---

## Summary of Breaking Changes

| Area | Old behavior | New behavior (v1.0.926+) |
|------|-------------|--------------------------|
| Underlying viewer engine | Tandem-maintained custom build | Standard APS viewer engine |
| Facility switching | SDK managed teardown internally | App must call `unloadModels()` before `tearDown()` |
| `displayFacility` 2nd arg | `false` was treated as "no saved view" | Must pass `null`; `false` causes incorrect behavior |
| Model state on re-load | SDK reset models automatically | App must ensure `unloadModels()` was called first |

---

## Reference Implementation

See [`js/app.js`](js/app.js) in this project for a working implementation of the above pattern. Search for the comment block beginning with `// Facility switching strategy:` for the annotated code.
