/**
 * Viewer Lab - Markers
 *
 * Ways to put your own visuals into the 3D scene or on top of it.
 *
 * Each recipe has a copy-ready function (listed in `code`) that only needs the
 * viewer and plain data, and return a handle with a dispose() function. The `run` wrapper
 * next to it is Lab plumbing: it reads the controls and reports a status line.
 *
 * API reference: https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/
 */

import { defineRecipe } from '../recipes.js';

const DOCS = 'https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/';

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 1: Overlay shapes at elements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Put a 3D sphere at the center of each selected element.
 *
 * Overlay scenes are extra three.js scenes the viewer renders on top of the model.
 * Because the spheres are real geometry they scale and occlude with the camera,
 * and depthTest:false makes them show through walls.
 *
 * @param viewer              Viewer instance
 * @param aggregateSelection  viewer.getAggregateSelection() -> [{ model, selection: [dbId, ...] }]
 * @param options.color       Sphere color as a hex number, e.g. 0xffd400
 * @param options.radius      Sphere radius in model units
 * @returns {{ count: number, dispose: Function }}  how many spheres were added, and a dispose() that removes them
 */
function addOverlayMarkers(viewer, aggregateSelection, { color = 0xffd400, radius = 1 } = {}) {
    const sceneName = 'lab-overlay-markers';

    if (!viewer.overlays.hasScene(sceneName)) {
        viewer.overlays.addScene(sceneName);
    }

    const material = new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false });
    const geometry = new THREE.SphereGeometry(radius, 24, 24);
    let count = 0;

    // Facilities can have several models, so selection is grouped per model.
    for (const { model, selection } of aggregateSelection) {
        const instanceTree = model.getInstanceTree();
        const fragmentList = model.getFragmentList();
        if (!instanceTree) continue;

        for (const dbId of selection) {
            // An element is made of one or more fragments. Union their world-space
            // bounding boxes to get the bounds of the whole element.
            const elementBounds = new THREE.Box3();
            const fragmentBounds = new THREE.Box3();

            instanceTree.enumNodeFragments(dbId, (fragId) => {
                fragmentList.getWorldBounds(fragId, fragmentBounds);
                elementBounds.union(fragmentBounds);
            }, true);

            if (elementBounds.isEmpty()) continue;   // logical element: nothing to draw

            const center = elementBounds.getCenter(new THREE.Vector3());
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(center.x, center.y, center.z);

            viewer.overlays.addMesh(sphere, sceneName);
            count++;
        }
    }

    viewer.impl.invalidate(true, true, true);   // ask the viewer to redraw

    const dispose = () => {
        viewer.overlays.removeScene(sceneName);
        geometry.dispose();
        material.dispose();
        viewer.impl.invalidate(true, true, true);
    };

    return { count, dispose };
}

defineRecipe({
    id: 'markers-overlay',
    topic: 'Markers',
    title: 'Overlay shapes at elements',
    learn: 'Draw your own 3D geometry in the scene using an overlay scene. This is the simplest way to mark a location.',
    lookFor: 'Select one or more elements first. A sphere appears at the center of each one and stays attached as you orbit.',
    file: 'js/lab/recipes/markers.js',
    apis: [
        { name: 'OverlayManager', url: DOCS + 'OverlayManager/' },
        { name: 'Viewer3D', url: DOCS + 'Viewer3D/' },
    ],
    controls: [
        { id: 'color', label: 'Color', type: 'color', default: '#ffd400' },
        { id: 'radius', label: 'Radius (model units)', type: 'range', min: 0.25, max: 5, step: 0.25, default: 1 },
    ],
    code: [addOverlayMarkers],
    run({ viewer, values, selection }) {
        if (!selection) {
            return { status: 'Select one or more elements in the viewer, then press Run.', level: 'warn' };
        }

        const { count, dispose } = addOverlayMarkers(viewer, selection, {
            color: parseInt(values.color.slice(1), 16),
            radius: Number(values.radius),
        });

        console.group('LAB: addOverlayMarkers()');
        console.log('Selection:', selection);
        console.log(`Markers added: ${count}`);
        console.groupEnd();

        return { status: `${count} marker(s) added.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared by the next recipes: where is an element in 3D space?
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the center of an element in scene (world) coordinates.
 *
 * Most elements are made of fragments (pieces of geometry), so we union their
 * bounding boxes. Elements without fragments (for example rooms) fall back to
 * model.getElementBounds(), a Tandem API that knows their extents.
 *
 * @param model  A model from viewer.getAggregateSelection() or facility.getModels()
 * @param dbId   Element id inside that model (dbIds are only unique per model!)
 * @returns {THREE.Vector3|null}  null for elements with no geometry at all
 */
function getElementCenter(model, dbId) {
    const bounds = new THREE.Box3();
    const fragmentBounds = new THREE.Box3();

    model.getInstanceTree()?.enumNodeFragments(dbId, (fragId) => {
        model.getFragmentList().getWorldBounds(fragId, fragmentBounds);
        bounds.union(fragmentBounds);
    }, true);

    if (bounds.isEmpty()) {
        model.getElementBounds(dbId, bounds);
    }

    return bounds.isEmpty() ? null : bounds.getCenter(new THREE.Vector3());
}

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 2: Many markers, hidden by walls (sprites)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pick `count` random points inside a model's bounding box.
 * Stand-in for "the places where my sensors are": swap in your own list of positions.
 *
 * @returns {THREE.Vector3[]}  Points in scene (world) coordinates
 */
function randomPointsInModel(model, count) {
    const box = model.getBoundingBox();
    const size = box.max.clone().sub(box.min);

    return Array.from({ length: count }, () => new THREE.Vector3(
        box.min.x + Math.random() * size.x,
        box.min.y + Math.random() * size.y,
        box.min.z + Math.random() * size.z,
    ));
}

/**
 * Add a camera-facing sprite at each point, kept at a constant size on screen.
 *
 * Sprites live inside the 3D scene, which gives them two strengths over HTML pins:
 *  - Walls and other geometry hide them, so a marker behind a wall is not shown.
 *  - They are drawn by the GPU, so thousands stay smooth. Hundreds of HTML pins
 *    are repositioned in JavaScript on every camera move and get sluggish.
 * The trade-off: they are not clickable, and can't hold text or HTML.
 *
 * All sprites share one material and texture, which is what keeps them cheap.
 *
 * @param viewer          Viewer instance
 * @param points          THREE.Vector3[] in scene coordinates
 * @param options.color   Sprite color, as a CSS color string
 * @param options.size    Sprite diameter in pixels
 * @returns {{ count: number, dispose: Function }}
 */
function addCameraFacingSprites(viewer, points, { color = '#ff6a00', size = 24 } = {}) {
    const sceneName = 'lab-sprites';

    // A sprite's picture is a texture. Draw a dot on a canvas to use as one.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

    viewer.overlays.addScene(sceneName);

    const sprites = points.map((point) => {
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(point);
        viewer.overlays.addMesh(sprite, sceneName);
        return sprite;
    });

    // A sprite is sized in world units, so it would shrink as you move away.
    // To keep it a constant number of pixels, rescale it whenever the camera moves.
    const updateScale = () => {
        const camera = viewer.getCamera();
        const height = viewer.canvas.clientHeight;

        for (const sprite of sprites) {
            const worldUnitsPerPixel = camera.isPerspective
                ? (2 * Math.tan(THREE.Math.degToRad(camera.fov) / 2) * camera.position.distanceTo(sprite.position)) / height
                : (camera.top - camera.bottom) / height;
            sprite.scale.set(size * worldUnitsPerPixel, size * worldUnitsPerPixel, 1);
        }
        viewer.impl.invalidate(true, true, true);
    };

    viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, updateScale);
    updateScale();

    const dispose = () => {
        viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, updateScale);
        viewer.overlays.removeScene(sceneName);
        texture.dispose();
        material.dispose();
        viewer.impl.invalidate(true, true, true);
    };

    return { count: sprites.length, dispose };
}

defineRecipe({
    id: 'markers-sprites',
    topic: 'Markers',
    title: 'Many markers hidden by walls (sprites)',
    learn: 'When you have hundreds of markers (think sensors) and they should be hidden when something is in front of them, use sprites in the 3D scene instead of HTML pins.',
    lookFor: 'Run (no selection needed): dots are scattered through the model. Walk or orbit so a wall is between you and some dots, and they disappear. Raise the count to 1000 and notice the camera stays smooth. The HTML pins recipe could do neither.',
    file: 'js/lab/recipes/markers.js',
    apis: [
        { name: 'Viewer3D.overlays', url: DOCS + 'OverlayManager/' },
        { name: 'THREE.Sprite', url: 'https://threejs.org/docs/#api/en/objects/Sprite' },
    ],
    controls: [
        { id: 'count', label: 'Number of sprites', type: 'range', min: 10, max: 2000, step: 10, default: 300 },
        { id: 'color', label: 'Color', type: 'color', default: '#ff6a00' },
        { id: 'size', label: 'Size (pixels)', type: 'range', min: 8, max: 48, step: 2, default: 20 },
    ],
    code: [randomPointsInModel, addCameraFacingSprites],
    run({ viewer, values }) {
        const model = viewer.model;
        if (!model) {
            return { status: 'No model is loaded yet.', level: 'warn' };
        }

        const points = randomPointsInModel(model, Number(values.count));
        const { count, dispose } = addCameraFacingSprites(viewer, points, {
            color: values.color,
            size: Number(values.size),
        });

        console.group('LAB: addCameraFacingSprites()');
        console.log(`Sprites added: ${count}`);
        console.groupEnd();

        return { status: `${count} sprite(s) scattered in the model. Orbit around and look for ones that vanish behind walls.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 3: HTML pins that follow elements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Put an HTML pin on top of the viewer for each point in `pins`, and keep the pins
 * glued to their 3D positions while the camera moves.
 *
 * This is the most flexible kind of marker: a pin is just a <div>, so it can hold
 * text, images, buttons or anything else you can build with HTML and CSS.
 *
 * Gotcha: pins are drawn above the 3D canvas, so they are NOT hidden by walls
 * in front of them. We only hide pins that are behind the camera.
 *
 * @param viewer  Viewer instance
 * @param pins    [{ position: THREE.Vector3, label, color, title, onClick }]
 * @param options.size  Pin diameter in pixels
 * @returns {{ count: number, dispose: Function }}
 */
function addHtmlPins(viewer, pins, { size = 24 } = {}) {
    // One layer that covers the viewer; it ignores the mouse so orbiting still works
    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute; inset:0; overflow:hidden; pointer-events:none;';
    viewer.container.appendChild(layer);

    const items = pins.map((pin) => {
        const element = document.createElement('div');
        element.textContent = pin.label ?? '';
        element.title = pin.title ?? '';
        element.style.cssText = `
            position:absolute; left:0; top:0; width:${size}px; height:${size}px;
            border-radius:50%; background:${pin.color}; border:2px solid #fff;
            color:#fff; font:600 ${Math.round(size * 0.45)}px sans-serif;
            display:flex; align-items:center; justify-content:center;
            cursor:pointer; pointer-events:auto; box-shadow:0 1px 4px rgba(0,0,0,.6);`;
        element.addEventListener('click', () => pin.onClick?.());
        layer.appendChild(element);
        return { pin, element };
    });

    // Convert each 3D position to a screen position (this is what viewer.worldToClient() does)
    const updatePositions = () => {
        const camera = viewer.getCamera();
        const width = viewer.canvas.clientWidth;
        const height = viewer.canvas.clientHeight;

        for (const { pin, element } of items) {
            const ndc = pin.position.clone().project(camera);   // -1..1 on each axis
            const behindCamera = ndc.z > 1 || ndc.z < -1;

            if (behindCamera) {
                element.style.display = 'none';
                continue;
            }

            const x = (ndc.x * 0.5 + 0.5) * width;
            const y = (-ndc.y * 0.5 + 0.5) * height;
            element.style.display = 'flex';
            element.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
        }
    };

    // Re-position whenever the camera moves or the viewer is resized
    viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, updatePositions);
    viewer.addEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, updatePositions);
    updatePositions();

    const dispose = () => {
        viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, updatePositions);
        viewer.removeEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, updatePositions);
        layer.remove();
    };

    return { count: items.length, dispose };
}

/**
 * Turn the current selection into pins: one numbered pin per element.
 * Clicking a pin selects its element and zooms to it.
 */
function pinsForSelection(viewer, aggregateSelection, color) {
    const pins = [];

    for (const { model, selection } of aggregateSelection) {
        for (const dbId of selection) {
            const position = getElementCenter(model, dbId);
            if (!position) continue;

            pins.push({
                position,
                label: String(pins.length + 1),
                color,
                title: `dbId ${dbId}`,
                onClick: () => {
                    viewer.select([dbId], model);
                    viewer.fitToView([dbId], model);
                },
            });
        }
    }

    return pins;
}

defineRecipe({
    id: 'markers-html-pins',
    topic: 'Markers',
    title: 'HTML pins that follow elements',
    learn: 'Position ordinary HTML elements over the 3D view by projecting a 3D point to screen coordinates every time the camera changes.',
    lookFor: 'Select elements, then Run. Numbered pins appear and stay attached while you orbit, pan and zoom. Click a pin to select and zoom to its element.',
    file: 'js/lab/recipes/markers.js',
    apis: [
        { name: 'Viewer3D.getCamera', url: DOCS + 'Viewer3D/#getcamera' },
        { name: 'Viewer3D.worldToClient', url: DOCS + 'Viewer3D/#worldtoclient-point' },
        { name: 'CAMERA_CHANGE_EVENT', url: DOCS + 'Viewer3D/#event-camera-change' },
    ],
    controls: [
        { id: 'color', label: 'Color', type: 'color', default: '#0696d7' },
        { id: 'size', label: 'Pin size (pixels)', type: 'range', min: 14, max: 48, step: 2, default: 26 },
    ],
    code: [getElementCenter, pinsForSelection, addHtmlPins],
    run({ viewer, values, selection }) {
        if (!selection) {
            return { status: 'Select one or more elements in the viewer, then press Run.', level: 'warn' };
        }

        const pins = pinsForSelection(viewer, selection, values.color);
        const { count, dispose } = addHtmlPins(viewer, pins, { size: Number(values.size) });

        console.group('LAB: addHtmlPins()');
        console.log('Pins:', pins);
        console.groupEnd();

        return { status: `${count} pin(s) added. Orbit the model, then click a pin.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 4: markers driven by Tandem data (streams)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build one pin per stream, placed on the element that hosts the stream and colored
 * by the stream's current alert state (green = normal, amber = warning, red = alert).
 *
 * This is where the viewer meets Tandem data: stream info gives the host element,
 * and the stream manager gives live alert states.
 *
 * @param viewer    Viewer instance
 * @param facility  The loaded Tandem facility
 * @returns {Promise<Array>}  Pins for addHtmlPins()
 */
async function pinsForStreams(viewer, facility) {
    const colors = { Normal: '#2e9d57', Warning: '#e0a100', Alert: '#d64545' };
    const { StreamStateBitmask } = Autodesk.Tandem.DtConstants;
    const streamManager = facility.getStreamManager();

    // Each stream info has { dbId, name, hostElement: { model, hostId } }
    const streams = await streamManager.getAllStreamInfos();

    // alerts is a Map: stream dbId -> { [channelId]: { currentState } }
    const [, alerts] = await streamManager.getLastReadingsWithAlerts({ dbIds: streams.map(s => s.dbId) });

    const pins = [];
    for (const stream of streams) {
        if (!stream.hostElement) continue;               // stream is not attached to an element

        const { model, hostId } = stream.hostElement;
        const position = getElementCenter(model, hostId);
        if (!position) continue;

        // currentState is a bitmask. A stream can have several channels: use the worst one.
        const states = Object.values(alerts?.get(stream.dbId) ?? {}).map(channel => channel.currentState);
        const state = states.some(s => s & StreamStateBitmask.ALERT) ? 'Alert'
                    : states.some(s => s & StreamStateBitmask.WARN) ? 'Warning'
                    : 'Normal';

        pins.push({
            position,
            label: '',
            color: colors[state],
            title: `${stream.name} - ${state}`,
            state,
            onClick: () => viewer.fitToView([hostId], model),
        });
    }

    return pins;
}

defineRecipe({
    id: 'markers-streams',
    topic: 'Markers',
    title: 'Markers from stream data',
    learn: 'Drive markers from Tandem data: place a pin on the host element of every stream and color it by the stream\'s current alert state.',
    lookFor: 'Run (no selection needed). Each stream host gets a pin: green = normal, amber = warning, red = alert. Hover for the stream name; click to zoom to its host.',
    file: 'js/lab/recipes/markers.js',
    apis: [
        { name: 'Viewer3D.fitToView', url: DOCS + 'Viewer3D/#fittoview-objectids-model-immediate' },
    ],
    controls: [
        { id: 'size', label: 'Pin size (pixels)', type: 'range', min: 14, max: 48, step: 2, default: 22 },
    ],
    code: [getElementCenter, pinsForStreams, addHtmlPins],
    async run({ viewer, facility, values }) {
        if (!facility?.getStreamManager()) {
            return { status: 'No stream manager available for this facility.', level: 'warn' };
        }

        const pins = await pinsForStreams(viewer, facility);
        if (!pins.length) {
            return { status: 'No streams with a host element were found in this facility.', level: 'warn' };
        }

        const { count, dispose } = addHtmlPins(viewer, pins, { size: Number(values.size) });

        const tally = pins.reduce((t, p) => ({ ...t, [p.state]: (t[p.state] ?? 0) + 1 }), {});
        console.group('LAB: pinsForStreams()');
        console.log('Pins:', pins);
        console.log('By state:', tally);
        console.groupEnd();

        const summary = Object.entries(tally).map(([state, n]) => `${n} ${state.toLowerCase()}`).join(', ');
        return { status: `${count} pin(s): ${summary}.`, dispose };
    },
});
