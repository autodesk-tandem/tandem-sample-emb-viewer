/**
 * Viewer Lab - Appearance
 *
 * Change how elements look: paint them with a color, or color the whole model by a value.
 * (Lighting, background and render quality are already in the viewer's own Settings dialog.)
 *
 * Each recipe has copy-ready functions (listed in `code`) that only need the viewer,
 * and return a handle with a dispose() function. The `run` wrapper next to them is
 * Lab plumbing: it reads the controls and reports a status line.
 *
 * API reference: https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/
 */

import { defineRecipe } from '../recipes.js';

const DOCS = 'https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/';

// ─────────────────────────────────────────────────────────────────────────────
// Color the selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paint the selected elements with a color, without changing their data.
 *
 * setThemingColor takes a THREE.Vector4: red, green, blue (0 to 1), and an intensity
 * (0 to 1) that says how much of the color replaces the element's own. Passing
 * undefined as the color removes the theme from that element.
 *
 * Two kinds of theming coexist in Tandem. This one is per element and controlled by you.
 * Tandem's own "color by" themes (from saved views and facets) are separate, and are
 * cleared with facility.facetsManager.applyTheme(undefined, undefined).
 *
 * @param viewer              Viewer instance
 * @param aggregateSelection  viewer.getAggregateSelection() -> [{ model, selection: [dbId, ...] }]
 * @param options.color       CSS hex color, e.g. '#26bdcc'
 * @param options.intensity   0 to 1: how strongly the color replaces the original
 * @returns {{ dispose: Function }}
 */
function colorSelection(viewer, aggregateSelection, { color = '#26bdcc', intensity = 1 } = {}) {
    const threeColor = new THREE.Color(parseInt(color.slice(1), 16));
    const theme = new THREE.Vector4(threeColor.r, threeColor.g, threeColor.b, intensity);

    // Remember what we painted, so dispose() removes only our own colors
    const painted = [];

    for (const { model, selection } of aggregateSelection) {
        for (const dbId of selection) {
            viewer.setThemingColor(dbId, theme, model);
            painted.push({ model, dbId });
        }
    }

    const dispose = () => {
        for (const { model, dbId } of painted) {
            viewer.setThemingColor(dbId, undefined, model);
        }
    };

    return { count: painted.length, dispose };
}

defineRecipe({
    id: 'appearance-color-selection',
    topic: 'Appearance',
    title: 'Color the selection',
    learn: 'Paint elements with a color using theming: it changes how they look without touching their data, and is easy to undo.',
    lookFor: 'Select some elements, pick a color, then Run. They are painted. Lower the intensity to blend the color with the original look. Reset removes the color.',
    file: 'js/lab/recipes/appearance.js',
    apis: [
        { name: 'Viewer3D.setThemingColor', url: DOCS + 'Viewer3D/#setthemingcolor-dbid-color-model-recursive' },
    ],
    controls: [
        { id: 'color', label: 'Color', type: 'color', default: '#26bdcc' },
        { id: 'intensity', label: 'Intensity', type: 'range', min: 0.1, max: 1, step: 0.1, default: 1 },
    ],
    code: [colorSelection],
    run({ viewer, values, selection }) {
        if (!selection) {
            return { status: 'Select one or more elements in the viewer, then press Run.', level: 'warn' };
        }

        const { count, dispose } = colorSelection(viewer, selection, {
            color: values.color,
            intensity: Number(values.intensity),
        });

        return { status: `Colored ${count} element(s). Press Reset to remove the color.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Color the whole model by a value (heatmap), with a legend
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Color elements by a number and explain the colors with a legend.
 *
 * Here the number is how high each element sits (its elevation), but the recipe has
 * three parts you can reuse with any value: (1) compute a value per element,
 * (2) map it to a color with setThemingColor, (3) draw a legend and a readout.
 *
 * Theming paints elements without changing their data, and is undone with
 * clearThemingColors. To keep the demo quick it colors at most `limit` elements per model;
 * enumerating every element of a huge model takes a while.
 *
 * @param viewer          Viewer instance
 * @param models          Models to color, e.g. facility.getModels()
 * @param options.limit   Maximum elements to color per model
 * @returns {{ count: number, min: number, max: number, dispose: Function }}
 */
function addElevationTheme(viewer, models, { limit = 2000 } = {}) {
    // 1. A value per element: the height of its center along the scene's up direction
    const values = [];                            // [{ model, dbId, value }]
    const fragmentBounds = new THREE.Box3();
    const up = viewer.navigation.getWorldUpVector();

    for (const model of models) {
        const tree = model.getInstanceTree();
        if (!tree) continue;                      // e.g. the default model has no geometry

        const leafIds = [];
        tree.enumNodeChildren(tree.getRootId(), (dbId) => {
            if (tree.getChildCount(dbId) === 0) leafIds.push(dbId);
        }, true);

        for (const dbId of leafIds.slice(0, limit)) {
            const bounds = new THREE.Box3();
            tree.enumNodeFragments(dbId, (fragId) => {
                model.getFragmentList().getWorldBounds(fragId, fragmentBounds);
                bounds.union(fragmentBounds);
            }, true);
            if (bounds.isEmpty()) continue;

            const center = bounds.getCenter(new THREE.Vector3());
            values.push({ model, dbId, value: center.dot(up) });
        }
    }

    const min = Math.min(...values.map(v => v.value));
    const max = Math.max(...values.map(v => v.value));

    // 2. Map each value to a color: blue (low) to red (high)
    const colorAt = (t) => new THREE.Color().setHSL((1 - t) * 0.66, 1, 0.5);
    const valueByElement = new Map();

    for (const { model, dbId, value } of values) {
        const color = colorAt((value - min) / ((max - min) || 1));
        viewer.setThemingColor(dbId, new THREE.Vector4(color.r, color.g, color.b, 1), model);
        valueByElement.set(`${model.id}:${dbId}`, value);
    }

    // 3. A legend: gradient bar, min and max, and a readout for the selected element
    const stops = Array.from({ length: 11 }, (_, i) => `#${colorAt(i / 10).getHexString()}`);
    const legend = document.createElement('div');
    legend.style.cssText = `
        position:absolute; left:12px; bottom:80px; width:220px; padding:10px 12px;
        border-radius:8px; background:rgba(0,0,0,.78); color:#fff; font:12px sans-serif; pointer-events:none;`;

    const title = document.createElement('div');
    title.textContent = 'Elevation';
    title.style.cssText = 'font-weight:600; margin-bottom:6px;';

    const bar = document.createElement('div');
    bar.style.cssText = `height:10px; border-radius:5px; background:linear-gradient(to right, ${stops.join(',')});`;

    const labels = document.createElement('div');
    labels.style.cssText = 'display:flex; justify-content:space-between; margin-top:4px; opacity:.8;';
    labels.innerHTML = '<span></span><span></span>';
    labels.children[0].textContent = min.toFixed(1);
    labels.children[1].textContent = max.toFixed(1);

    const readout = document.createElement('div');
    readout.style.cssText = 'margin-top:6px; min-height:16px;';

    legend.append(title, bar, labels, readout);
    viewer.container.appendChild(legend);

    const onSelection = () => {
        const selected = viewer.getAggregateSelection().find(({ selection }) => selection.length);
        const value = selected && valueByElement.get(`${selected.model.id}:${selected.selection[0]}`);
        readout.textContent = value === undefined ? 'Select an element to read its value' : `Selected: ${value.toFixed(2)}`;
    };
    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onSelection);
    onSelection();

    const dispose = () => {
        viewer.removeEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onSelection);
        models.forEach(model => viewer.clearThemingColors(model));
        legend.remove();
    };

    return { count: values.length, min, max, dispose };
}

defineRecipe({
    id: 'appearance-heatmap',
    topic: 'Appearance',
    title: 'Color the model by a value (heatmap)',
    learn: 'Turn a number into color: theme elements with setThemingColor, then add a legend and a readout so people can read what the colors mean.',
    lookFor: 'Run. Elements turn blue (low) through green to red (high) by elevation, and a legend appears at the bottom left. Click an element and the legend shows its value. Reset clears the colors.',
    file: 'js/lab/recipes/appearance.js',
    apis: [
        { name: 'Viewer3D.setThemingColor', url: DOCS + 'Viewer3D/#setthemingcolor-dbid-color-model-recursive' },
        { name: 'Viewer3D.clearThemingColors', url: DOCS + 'Viewer3D/#clearthemingcolors-model' },
        { name: 'Navigation.getWorldUpVector', url: DOCS + 'Navigation/#getworldupvector' },
    ],
    controls: [
        { id: 'limit', label: 'Max elements per model', type: 'range', min: 200, max: 5000, step: 200, default: 2000 },
    ],
    code: [addElevationTheme],
    run({ viewer, facility, values }) {
        const models = facility?.getModels() ?? [];
        const handle = addElevationTheme(viewer, models, { limit: Number(values.limit) });

        if (!handle.count) {
            handle.dispose();
            return { status: 'No elements with geometry were found to color.', level: 'warn' };
        }

        console.group('LAB: addElevationTheme()');
        console.log(`Colored ${handle.count} elements, range ${handle.min.toFixed(2)} to ${handle.max.toFixed(2)}`);
        console.groupEnd();

        return { status: `Colored ${handle.count} element(s). Click one to read its value.`, dispose: handle.dispose };
    },
});
