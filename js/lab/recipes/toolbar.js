/**
 * Viewer Lab - Toolbar
 *
 * Ways to extend the viewer's own toolbar and tool system: add a button, package
 * your work as an extension, and write a custom tool that handles mouse input.
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
// Recipe 5: Add a button to the toolbar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add your own button to the viewer toolbar. This one zooms the camera to the
 * current selection (or to everything, if nothing is selected).
 *
 * A toolbar holds control groups, and a group holds buttons. We create our own group
 * so we can remove it cleanly later; you could also add to an existing one with
 * toolbar.getControl(Autodesk.Viewing.TOOLBAR.MODELTOOLSID).
 *
 * @param viewer          Viewer instance
 * @param options.label   Tooltip text
 * @returns {Promise<{ dispose: Function }>}
 */
async function addToolbarButton(viewer, { label = 'Zoom to selection' } = {}) {
    // The toolbar is created a moment after the viewer starts, so wait for it
    await viewer.waitForToolbar();
    const toolbar = viewer.getToolbar();

    const button = new Autodesk.Viewing.UI.Button('lab-zoom-to-selection');
    button.setToolTip(label);
    button.setIcon('adsk-icon-fit-to-view');      // one of the viewer's built-in icon classes

    button.onClick = () => {
        // Facilities can have several models, so selection is grouped per model
        const [first] = viewer.getAggregateSelection();
        if (first) {
            viewer.fitToView(first.selection, first.model);
        } else {
            viewer.fitToView();
        }
    };

    // Buttons can show state too, e.g. button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE)
    const group = new Autodesk.Viewing.UI.ControlGroup('lab-toolbar-group');
    group.addControl(button);
    toolbar.addControl(group);

    const dispose = () => {
        group.removeControl(button);
        toolbar.removeControl(group);
    };

    return { dispose };
}

defineRecipe({
    id: 'toolbar-button',
    topic: 'Toolbar & Tools',
    title: 'Add a toolbar button',
    learn: 'Add your own button to the viewer toolbar. A toolbar holds control groups, and a control group holds buttons.',
    lookFor: 'Run. A new group with one button appears in the viewer toolbar (hover for the tooltip). Select an element, orbit away, then click the button to zoom back to it.',
    file: 'js/lab/recipes/toolbar.js',
    apis: [
        { name: 'UI.Button', url: DOCS + 'Button/' },
        { name: 'UI.ControlGroup', url: DOCS + 'ControlGroup/' },
        { name: 'Viewer3D.fitToView', url: DOCS + 'Viewer3D/#fittoview-objectids-model-immediate' },
    ],
    controls: [
        { id: 'label', label: 'Tooltip', type: 'text', default: 'Zoom to selection' },
    ],
    code: [addToolbarButton],
    async run({ viewer, values }) {
        const { dispose } = await addToolbarButton(viewer, { label: values.label || 'Zoom to selection' });
        return { status: 'Button added to the toolbar. Hover it, select something, and click it.', dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 6: Package your tools as an extension
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register an extension: the viewer's standard way to package a feature.
 *
 * The viewer calls load() when you load it, unload() when you unload it, and
 * onToolbarCreated() when the toolbar is ready. Everything an extension adds
 * should be removed again in unload().
 *
 * Gotcha: if the extension is loaded after the toolbar already exists,
 * onToolbarCreated() may not fire, so load() calls it itself (guarded against running twice).
 *
 * @param extensionId  Unique name, e.g. 'MyCompany.SampleTools'
 */
function registerSampleToolsExtension(extensionId = 'Sample.Tools') {
    class SampleToolsExtension extends Autodesk.Viewing.Extension {
        constructor(viewer, options) {
            super(viewer, options);              // options come from viewer.loadExtension(id, options)
            this.group = null;
        }

        load() {
            const toolbar = this.viewer.getToolbar();
            if (toolbar) this.onToolbarCreated(toolbar);
            return true;                          // returning true tells the viewer the load succeeded
        }

        unload() {
            if (this.group) {
                this.viewer.getToolbar()?.removeControl(this.group);
                this.group = null;
            }
            return true;
        }

        onToolbarCreated(toolbar) {
            if (this.group) return;

            const button = new Autodesk.Viewing.UI.Button('sample-tools-count');
            button.setToolTip('How many elements are selected?');
            button.setIcon('adsk-icon-properties');
            button.onClick = () => this.showToast(this.countSelected());

            this.group = new Autodesk.Viewing.UI.ControlGroup('sample-tools-group');
            this.group.addControl(button);
            toolbar.addControl(this.group);
        }

        countSelected() {
            const total = this.viewer.getAggregateSelection()
                .reduce((sum, { selection }) => sum + selection.length, 0);
            return `${this.options.greeting ?? 'Selected'}: ${total} element(s)`;
        }

        // A tiny message over the viewer that fades out on its own
        showToast(text) {
            const toast = document.createElement('div');
            toast.textContent = text;
            toast.style.cssText = `
                position:absolute; left:50%; bottom:80px; transform:translateX(-50%);
                padding:8px 14px; border-radius:6px; background:rgba(0,0,0,.8);
                color:#fff; font:14px sans-serif; pointer-events:none;`;
            this.viewer.container.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }
    }

    Autodesk.Viewing.theExtensionManager.registerExtension(extensionId, SampleToolsExtension);
}

/**
 * Register the extension (once) and load it into the viewer.
 * Unloading the extension is how you remove everything it added.
 */
async function loadSampleToolsExtension(viewer, { extensionId = 'Sample.Tools', greeting = 'Selected' } = {}) {
    registerSampleToolsExtension(extensionId);
    await viewer.loadExtension(extensionId, { greeting });

    const dispose = () => viewer.unloadExtension(extensionId);
    return { dispose };
}

defineRecipe({
    id: 'toolbar-extension',
    topic: 'Toolbar & Tools',
    title: 'Package it as an extension',
    learn: 'Extensions are the viewer\'s standard unit of reuse. Learn the lifecycle (load, onToolbarCreated, unload) and how options are passed in.',
    lookFor: 'Run. An info button appears in the toolbar. Select a few elements and click it: a message with the count shows over the viewer. Press Reset and the button disappears, because unload() removed it.',
    file: 'js/lab/recipes/toolbar.js',
    apis: [
        { name: 'Extension', url: DOCS + 'Extension/' },
        { name: 'Viewer3D.loadExtension', url: DOCS + 'Viewer3D/#loadextension-extensionid-options' },
        { name: 'ExtensionManager', url: DOCS + 'ExtensionManager/' },
    ],
    controls: [
        { id: 'greeting', label: 'Message prefix (an extension option)', type: 'text', default: 'Selected' },
    ],
    code: [registerSampleToolsExtension, loadSampleToolsExtension],
    async run({ viewer, values }) {
        const { dispose } = await loadSampleToolsExtension(viewer, { greeting: values.greeting || 'Selected' });
        return { status: 'Extension loaded. Select elements and click the new info button.', dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 7: A custom tool (click to drop a pin)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a custom tool: while it is active, every click on the model drops a sphere on
 * the exact 3D point you clicked.
 *
 * Tools receive the viewer's mouse and keyboard input. They are tried in priority
 * order, and a handler that returns true "consumes" the event so lower-priority tools
 * (such as the one that selects elements) never see it. Orbit, pan and zoom keep working,
 * because this tool only handles single clicks.
 *
 * @param viewer          Viewer instance
 * @param options.color   Sphere color as a hex number
 * @param options.radius  Sphere radius in model units
 * @returns {{ dispose: Function }}
 */
function addClickToPinTool(viewer, { color = 0xe53935, radius = 0.3 } = {}) {
    const toolName = 'lab-click-to-pin';
    const sceneName = 'lab-click-to-pin';

    viewer.overlays.addScene(sceneName);
    const material = new THREE.MeshBasicMaterial({ color });
    const geometry = new THREE.SphereGeometry(radius, 16, 16);

    const tool = {
        getNames: () => [toolName],
        getName: () => toolName,
        getPriority: () => 100,                   // higher numbers get the event first
        register() {},
        deregister() {},
        activate() { viewer.canvas.style.cursor = 'crosshair'; },
        deactivate() { viewer.canvas.style.cursor = ''; },
        update() { return false; },

        handleSingleClick(event, button) {
            if (button !== 0) return false;       // left button only

            // Which point of the model is under the mouse? null if the click hit nothing
            const hit = viewer.clientToWorld(event.canvasX, event.canvasY);
            if (!hit) return false;

            // The hit point is ON the surface, so a sphere centered there would be half buried
            // in the model and look cut in half from the side. Lift it by its radius along the
            // surface normal so it rests on the surface instead.
            const normal = hit.normal?.clone() ?? new THREE.Vector3();
            const towardCamera = viewer.getCamera().position.clone().sub(hit.point);
            if (normal.dot(towardCamera) < 0) normal.negate();      // some faces point inward

            const pin = new THREE.Mesh(geometry, material);
            pin.position.copy(hit.point).add(normal.multiplyScalar(radius));
            viewer.overlays.addMesh(pin, sceneName);
            viewer.impl.invalidate(true, true, true);

            console.log('LAB: pin dropped at', hit.point, 'on dbId', hit.dbId);
            return true;                          // consumed: don't also select the element
        },
    };

    viewer.toolController.registerTool(tool);
    viewer.toolController.activateTool(toolName);

    const dispose = () => {
        viewer.toolController.deactivateTool(toolName);
        viewer.toolController.deregisterTool(tool);
        viewer.overlays.removeScene(sceneName);
        viewer.impl.invalidate(true, true, true);
    };

    return { dispose };
}

defineRecipe({
    id: 'toolbar-click-tool',
    topic: 'Toolbar & Tools',
    title: 'Custom click-to-pin tool',
    learn: 'Write a tool: an object that receives the viewer\'s mouse input. This one drops a sphere at the exact 3D point you click, instead of selecting the element.',
    lookFor: 'Run, then click on the model: red spheres appear at the clicked points and nothing gets selected. Orbit and zoom still work. Press Reset to remove the pins and give clicking back to selection.',
    file: 'js/lab/recipes/toolbar.js',
    apis: [
        { name: 'ToolInterface', url: DOCS + 'ToolInterface/' },
        { name: 'ToolController', url: DOCS + 'ToolController/' },
        { name: 'Viewer3D.clientToWorld', url: DOCS + 'Viewer3D/#clienttoworld-clientx-clienty-ignoretransparent' },
    ],
    controls: [
        { id: 'color', label: 'Color', type: 'color', default: '#e53935' },
        { id: 'radius', label: 'Pin radius (model units)', type: 'range', min: 0.1, max: 3, step: 0.1, default: 0.3 },
    ],
    code: [addClickToPinTool],
    run({ viewer, values }) {
        const { dispose } = addClickToPinTool(viewer, {
            color: parseInt(values.color.slice(1), 16),
            radius: Number(values.radius),
        });
        return { status: 'Tool active. Click on the model to drop pins. Press Reset to stop.', dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 4: Right-click menu items
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add your own items, including a submenu, to the viewer's right-click menu.
 *
 * You do not replace the menu. You register a callback that runs every time the menu
 * is about to open, and push items onto the array it receives. `status` describes the
 * click: hasSelected / numSelected / hasVisible / hasHidden, and canvasX / canvasY (where
 * the mouse was, which you can pass to clientToWorld() to find the element under it).
 *
 * A menu item is `{ title, target }`. `target` is a function to run, or an array of
 * items to make a submenu.
 *
 * Right-clicking does not change the selection. This example acts on the selection when
 * there is one, and otherwise on the element under the mouse.
 *
 * @param viewer  Viewer instance
 * @returns {{ dispose: Function }}
 */
function addContextMenuItems(viewer) {
    const callbackId = 'lab-context-menu';
    const painted = new Map();                      // model -> Set of dbIds we colored

    // What the menu acts on: [{ model, selection: [dbId] }], like viewer.getAggregateSelection()
    const paint = (targets, hex) => {
        const color = new THREE.Color(hex);
        const vector = new THREE.Vector4(color.r, color.g, color.b, 1);

        for (const { model, selection } of targets) {
            if (!painted.has(model)) painted.set(model, new Set());

            for (const dbId of selection) {
                viewer.setThemingColor(dbId, vector, model);
                painted.get(model).add(dbId);
            }
        }
    };

    const clearPaint = () => {
        for (const [model, dbIds] of painted) {
            for (const dbId of dbIds) viewer.setThemingColor(dbId, undefined, model);   // undefined clears one element
        }
        painted.clear();
    };

    viewer.registerContextMenuCallback(callbackId, (menu, status) => {
        let targets = [];
        let label = 'selection';

        if (status.hasSelected) {
            targets = viewer.getAggregateSelection();
        } else {
            const hit = viewer.clientToWorld(status.canvasX, status.canvasY, true);   // the element under the mouse
            if (hit?.dbId && hit.model) targets = [{ model: hit.model, selection: [hit.dbId] }];
            label = 'element under mouse';
        }

        menu.push({
            title: targets.length ? `Lab: Paint ${label}` : 'Lab: Paint (nothing here)',
            target: [                              // an array makes a submenu
                { title: 'Orange', target: () => paint(targets, 0xff8800) },
                { title: 'Green',  target: () => paint(targets, 0x2e9d57) },
                { title: 'Clear all paint', target: clearPaint },
            ],
        });
    });

    const dispose = () => {
        viewer.unregisterContextMenuCallback(callbackId);
        clearPaint();
    };

    return { dispose };
}

defineRecipe({
    id: 'toolbar-context-menu',
    topic: 'Toolbar & Tools',
    title: 'Right-click menu items',
    learn: 'Extend the right-click menu with your own commands, including a submenu, without replacing the viewer\'s menu.',
    lookFor: 'Run, then right-click in the viewer. A "Lab: Paint ..." item appears at the bottom of the menu. With elements selected it paints the selection; with nothing selected it paints the element under the mouse. Its submenu paints orange or green, or clears. Reset removes the item and the colors.',
    file: 'js/lab/recipes/toolbar.js',
    apis: [
        { name: 'Viewer3D.registerContextMenuCallback', url: DOCS + 'Viewer3D/#registercontextmenucallback-id-callback' },
        { name: 'Viewer3D.unregisterContextMenuCallback', url: DOCS + 'Viewer3D/#unregistercontextmenucallback-id' },
    ],
    code: [addContextMenuItems],
    run({ viewer }) {
        const { dispose } = addContextMenuItems(viewer);
        return { status: 'Menu item added. Right-click in the viewer.', dispose };
    },
});
