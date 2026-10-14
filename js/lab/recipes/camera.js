/**
 * Viewer Lab - Camera
 *
 * Move and reshape the camera from code.
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
// Turntable
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the center of the selected elements, or of the whole model if nothing is selected.
 *
 * @param viewer              Viewer instance
 * @param aggregateSelection  viewer.getAggregateSelection() -> [{ model, selection: [dbId, ...] }], or null
 * @returns {THREE.Vector3}
 */
function getFocusPoint(viewer, aggregateSelection) {
    const bounds = new THREE.Box3();
    const fragmentBounds = new THREE.Box3();

    for (const { model, selection } of aggregateSelection ?? []) {
        for (const dbId of selection) {
            model.getInstanceTree()?.enumNodeFragments(dbId, (fragId) => {
                model.getFragmentList().getWorldBounds(fragId, fragmentBounds);
                bounds.union(fragmentBounds);
            }, true);
        }
    }

    if (bounds.isEmpty()) {
        bounds.copy(viewer.model.getBoundingBox());
    }

    return bounds.getCenter(new THREE.Vector3());
}

/**
 * Slowly spin the camera around a point, like a showroom turntable.
 *
 * A camera is a position plus a target (the point it looks at). To orbit, keep the
 * target fixed and rotate the position around the world's up axis, a little each frame.
 * Scaling by elapsed time keeps the speed the same on fast and slow screens.
 *
 * Grabbing the model with the mouse stops the spin, so the user is never fighting it.
 *
 * @param viewer                    Viewer instance
 * @param center                    THREE.Vector3 to circle around
 * @param options.degreesPerSecond  Spin speed (negative spins the other way)
 * @returns {{ dispose: Function }}
 */
function startTurntable(viewer, center, { degreesPerSecond = 20 } = {}) {
    const navigation = viewer.navigation;
    const up = navigation.getWorldUpVector();

    navigation.setTarget(center);
    navigation.setPivotPoint(center);

    let frame = null;
    let last = performance.now();

    const tick = (now) => {
        const angle = THREE.Math.degToRad(degreesPerSecond) * ((now - last) / 1000);
        last = now;

        const offset = navigation.getPosition().clone().sub(center);
        offset.applyAxisAngle(up, angle);
        navigation.setPosition(center.clone().add(offset));

        frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const dispose = () => {
        cancelAnimationFrame(frame);
        viewer.canvas.removeEventListener('pointerdown', dispose);
    };
    viewer.canvas.addEventListener('pointerdown', dispose);

    return { dispose };
}

defineRecipe({
    id: 'camera-turntable',
    topic: 'Camera',
    title: 'Turntable',
    learn: 'Move the camera from code: a camera is a position and a target, so orbiting means rotating the position around the target every frame.',
    lookFor: 'Run (optionally select something first). The camera circles the selection, or the whole model if nothing is selected. Grab the model with the mouse, or press Reset, to stop.',
    file: 'js/lab/recipes/camera.js',
    apis: [
        { name: 'Navigation', url: DOCS + 'Navigation/' },
        { name: 'Navigation.getWorldUpVector', url: DOCS + 'Navigation/#getworldupvector' },
    ],
    controls: [
        { id: 'speed', label: 'Speed (degrees/second, negative reverses)', type: 'range', min: -90, max: 90, step: 5, default: 20 },
    ],
    code: [getFocusPoint, startTurntable],
    run({ viewer, values, selection }) {
        const center = getFocusPoint(viewer, selection);
        const { dispose } = startTurntable(viewer, center, { degreesPerSecond: Number(values.speed) });

        return {
            status: selection ? 'Spinning around the selection. Grab the model to stop.' : 'Spinning around the model. Grab it to stop.',
            dispose,
        };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Projection and field of view
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Switch between a perspective camera (things shrink with distance, like your eyes)
 * and an orthographic one (parallel projection, as in drawings), and change the
 * field of view of the perspective camera.
 *
 * A wide field of view exaggerates depth, a narrow one flattens it.
 * Returns a dispose() that puts back what was there before.
 *
 * @param viewer               Viewer instance
 * @param options.perspective  true = perspective, false = orthographic
 * @param options.fov          Vertical field of view in degrees (perspective only)
 * @returns {{ dispose: Function }}
 */
function setProjection(viewer, { perspective = true, fov = 45 } = {}) {
    const navigation = viewer.navigation;
    const before = { perspective: navigation.getCamera().isPerspective, fov: viewer.getFOV() };

    if (perspective) {
        navigation.toPerspective();
        viewer.setFOV(fov);
    } else {
        navigation.toOrthographic();
    }

    const dispose = () => {
        if (before.perspective) {
            navigation.toPerspective();
            viewer.setFOV(before.fov);
        } else {
            navigation.toOrthographic();
        }
    };

    return { dispose };
}

defineRecipe({
    id: 'camera-projection',
    topic: 'Camera',
    title: 'Projection and field of view',
    learn: 'Perspective makes distant things smaller, orthographic keeps parallel lines parallel. The field of view controls how strong the perspective effect is.',
    lookFor: 'Run with Perspective and try a very wide field of view (100): the view looks distorted, like a fisheye. Then try a narrow one (15): it flattens. Switch to Orthographic and notice that nothing gets smaller with distance.',
    file: 'js/lab/recipes/camera.js',
    apis: [
        { name: 'Viewer3D.setFOV', url: DOCS + 'Viewer3D/#setfov-degrees' },
        { name: 'Navigation.toOrthographic', url: DOCS + 'Navigation/#toorthographic' },
    ],
    controls: [
        { id: 'projection', label: 'Projection', type: 'select', default: 'perspective', options: [
            { value: 'perspective', label: 'Perspective' },
            { value: 'orthographic', label: 'Orthographic' },
        ] },
        { id: 'fov', label: 'Field of view (degrees)', type: 'range', min: 10, max: 120, step: 5, default: 100 },
    ],
    code: [setProjection],
    run({ viewer, values }) {
        const perspective = values.projection === 'perspective';
        const { dispose } = setProjection(viewer, { perspective, fov: Number(values.fov) });

        return {
            status: perspective ? `Perspective, ${values.fov} degree field of view.` : 'Orthographic. (Field of view does not apply.)',
            dispose,
        };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Saved views
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a bar over the viewer with one button per saved view of the facility.
 *
 * A Tandem saved view remembers more than the camera: it also stores which
 * elements were visible and a "color by" theme. facility.goToView() restores the
 * camera and visibility, but the color theme has to be applied separately.
 *
 * @param viewer    Viewer instance
 * @param facility  The loaded Tandem facility
 * @returns {Promise<{ count: number, dispose: Function }>}
 */
async function addSavedViewsBar(viewer, facility) {
    const views = await facility.getSavedViewsList();
    let themed = false;

    const bar = document.createElement('div');
    bar.style.cssText = `
        position:absolute; top:12px; left:12px; max-height:60%; overflow:auto;
        display:flex; flex-direction:column; gap:4px; padding:8px; min-width:140px;
        border-radius:8px; background:rgba(0,0,0,.78); font:12px sans-serif; color:#fff;`;

    const title = document.createElement('div');
    title.textContent = 'Saved views';
    title.style.cssText = 'font-weight:600; margin-bottom:2px;';
    bar.appendChild(title);

    for (const view of views) {
        const button = document.createElement('button');
        button.textContent = view.viewName;
        button.style.cssText = 'padding:4px 10px; border:0; border-radius:4px; background:#0696d7; color:#fff; cursor:pointer; text-align:left; font:inherit;';

        button.addEventListener('click', async () => {
            await facility.goToView(view);

            // goToView does not restore the view's "color by" theme, so apply it here
            if (view.facets?.coloredFacetId) {
                const colorMap = facility.facetsManager.generateColorMap(view.facets.colorMaps);
                facility.facetsManager.applyTheme(view.facets.coloredFacetId, colorMap[view.facets.coloredFacetId]);
                themed = true;
            }
        });
        bar.appendChild(button);
    }

    viewer.container.appendChild(bar);

    const dispose = () => {
        bar.remove();
        if (themed) facility.facetsManager.applyTheme(undefined, undefined);
    };

    return { count: views.length, dispose };
}

defineRecipe({
    id: 'camera-saved-views',
    topic: 'Camera',
    title: 'Saved views',
    learn: 'Tandem saved views remember the camera, what was visible, and a color theme. Build your own picker over the viewer and restore them from code.',
    lookFor: 'Run. A list of this facility\'s saved views appears at the top left. Click one and the camera flies there, with the same visibility (and color theme, if the view had one). Reset removes the list.',
    file: 'js/lab/recipes/camera.js',
    apis: [],
    code: [addSavedViewsBar],
    async run({ viewer, facility }) {
        const { count, dispose } = await addSavedViewsBar(viewer, facility);
        if (!count) {
            dispose();
            return { status: 'This facility has no saved views. Create one in Tandem, then try again.', level: 'warn' };
        }

        return { status: `${count} saved view(s) listed at the top left of the viewer.`, dispose };
    },
});
