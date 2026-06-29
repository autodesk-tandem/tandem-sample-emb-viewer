# Viewer Migration Notes

## SDK v1.0.926 — Underlying Viewer Engine Change

The Tandem JavaScript SDK is loaded as a single script that bundles all the Tandem-specific `Dt*` classes together with an underlying 3D viewer component. Prior to version 1.0.926, that underlying viewer was a customized build maintained by the Tandem team. Starting with version 1.0.926, it uses the same standard viewer engine as APS (`viewer3D.js`), keeping the Tandem-specific wrappers on top.

---

## SDK v1.0.936+

**Effective as of:** SDK version 1.0.936

A bug in the viewer's internal event handlers that caused issues when switching between facilities has been fixed in SDK v1.0.936 and above. No changes to facility load/unload logic in application code are required.

### Required Code Change

The only update needed in application code is to pass `null` instead of `false` as the `initialViewInfo` argument to `displayFacility()`:

```js
// Before
await app.displayFacility(facility, false, viewer);

// After
await app.displayFacility(facility, null, viewer);
```

The second parameter is `initialViewInfo` (`Set<string> | View | null`). Passing `null` selects the default view.
