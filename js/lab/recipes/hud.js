/**
 * Viewer Lab - HUD
 *
 * Your own controls and readouts on top of the 3D view. A HUD is just HTML placed
 * inside `viewer.container`, kept in sync with viewer events.
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
// Recipe 8: Selection info card
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show a small card over the viewer that describes whatever is selected, and
 * updates itself every time the selection changes.
 *
 * The pattern: listen to a viewer event, read the current state, redraw your HTML.
 *
 * Which properties to show is up to you. Each property is identified by a qualified
 * column name (QC.Name is 'n:n'). Many have a user-override twin (QC.OName), which holds
 * the value when someone edited it in Tandem, so check the override first.
 *
 * Property values come from your data, so they are written with textContent (never
 * innerHTML) to keep markup in them from being interpreted.
 *
 * @param viewer  Viewer instance
 * @returns {{ dispose: Function }}
 */
function addSelectionCard(viewer) {
    const { QC } = Autodesk.Tandem.DtConstants;

    // What to show: a label, and the columns to read (override first, then the original)
    const fields = [
        { label: 'Category',       columns: [QC.OTandemCategory, QC.TandemCategory] },
        { label: 'Classification', columns: [QC.OClassification, QC.Classification] },
        { label: 'Level',          columns: [QC.OLevel, QC.Level] },
    ];

    const card = document.createElement('div');
    card.style.cssText = `
        position:absolute; top:12px; left:12px; width:260px; padding:10px 12px;
        border-radius:8px; background:rgba(0,0,0,.78); color:#fff; font:12px sans-serif;
        pointer-events:none; display:none;`;
    viewer.container.appendChild(card);

    const addLine = (text, style) => {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.cssText = style;
        card.appendChild(line);
    };

    const addRow = (label, value) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; gap:8px; margin-top:3px;';

        const name = document.createElement('span');
        name.textContent = label;
        name.style.cssText = 'flex:0 0 90px; opacity:.6;';

        const text = document.createElement('span');
        text.textContent = value;
        text.style.cssText = 'overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';

        row.append(name, text);
        card.appendChild(row);
    };

    // The value of the first of these columns that has one
    const readFirst = (byColumn, columns) => {
        for (const column of columns) {
            const value = byColumn.get(column)?.displayValue;
            if (value !== undefined && value !== null && value !== '') return String(value);
        }
        return '-';
    };

    let latest = 0;

    const update = async () => {
        const ticket = ++latest;                  // property reads are async: ignore stale answers
        const groups = viewer.getAggregateSelection().filter(({ selection }) => selection.length);
        const total = groups.reduce((sum, { selection }) => sum + selection.length, 0);

        card.replaceChildren();
        card.style.display = total ? 'block' : 'none';
        if (!total) return;

        if (total > 1) {
            addLine(`${total} elements selected`, 'font-weight:600; font-size:13px;');
            return;
        }

        const { model, selection: [dbId] } = groups[0];
        addLine(model.getInstanceTree()?.getNodeName(dbId) ?? `Element ${dbId}`, 'font-weight:600; font-size:13px;');

        // One call returns everything about the element: index it by column name
        const [props] = await model.getPropertiesDt([dbId]);
        if (ticket !== latest) return;            // selection changed while we were waiting

        const byColumn = new Map(Object.values(props.element.properties).map(prop => [prop.internalName, prop]));

        // Replace the placeholder title with the real (possibly overridden) name
        card.replaceChildren();
        addLine(readFirst(byColumn, [QC.OName, QC.Name]), 'font-weight:600; font-size:13px;');
        addLine(model.label(), 'opacity:.6; margin-bottom:6px;');

        for (const { label, columns } of fields) {
            addRow(label, readFirst(byColumn, columns));
        }

        // "Tagged as asset" is a yes/no column, and it is missing entirely on untagged elements
        const tagged = ['1', 'true', 'yes'].includes(String(byColumn.get(QC.IsAsset)?.displayValue).toLowerCase());
        addRow('Tagged asset', tagged ? 'Yes' : 'No');
    };

    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, update);
    update();                                     // show something right away if a selection already exists

    const dispose = () => {
        viewer.removeEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, update);
        card.remove();
    };

    return { dispose };
}

defineRecipe({
    id: 'hud-selection-card',
    topic: 'HUD',
    title: 'Selection info card',
    learn: 'Build a live readout: listen for the selection-changed event and redraw a small HTML card from chosen properties of the selected element. Shows how to pick properties by qualified column name and honor user overrides.',
    lookFor: 'Run, then click different elements. A card at the top left shows the name, model, category, classification, level and whether the element is tagged as an asset. Select several at once to see the count. Edit an element\'s name in Tandem and reselect it to see the override win.',
    file: 'js/lab/recipes/hud.js',
    apis: [
        { name: 'AGGREGATE_SELECTION_CHANGED_EVENT', url: DOCS + 'Viewer3D/#event-aggregate-selection-changed' },
        { name: 'Viewer3D.getAggregateSelection', url: DOCS + 'Viewer3D/#getaggregateselection' },
    ],
    code: [addSelectionCard],
    run({ viewer }) {
        const { dispose } = addSelectionCard(viewer);
        return { status: 'Card added. Click elements in the viewer.', dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 9: Camera bookmark bar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a bar of camera bookmarks across the top of the viewer: save the current
 * view, click a bookmark to fly back to it, remove it with the x.
 *
 * viewer.getState() returns a plain JSON object, so bookmarks can also be saved to
 * localStorage or sent to a server and restored in a later session. Here they just live in memory.
 *
 * @param viewer  Viewer instance
 * @returns {{ dispose: Function }}
 */
function addCameraBookmarks(viewer) {
    const bookmarks = [];
    let counter = 0;

    const bar = document.createElement('div');
    bar.style.cssText = `
        position:absolute; top:12px; left:50%; transform:translateX(-50%);
        display:flex; flex-wrap:wrap; gap:6px; max-width:80%; padding:6px;
        border-radius:8px; background:rgba(0,0,0,.78); font:12px sans-serif; color:#fff;`;
    viewer.container.appendChild(bar);

    const makeButton = (text, onClick, background = '#0696d7') => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `padding:4px 10px; border:0; border-radius:4px; background:${background}; color:#fff; cursor:pointer; font:inherit;`;
        button.addEventListener('click', onClick);
        return button;
    };

    const render = () => {
        bar.replaceChildren();

        bar.appendChild(makeButton('+ Save view', () => {
            // Only the camera: skip selection, isolation, etc.
            bookmarks.push({ name: `View ${++counter}`, state: viewer.getState({ viewport: true }) });
            render();
        }, '#2e9d57'));

        for (const bookmark of bookmarks) {
            const chip = document.createElement('span');
            chip.style.cssText = 'display:inline-flex; gap:2px;';

            // restoreState(state, filter, immediate): immediate = false animates the camera
            chip.appendChild(makeButton(bookmark.name, () => viewer.restoreState(bookmark.state, { viewport: true }, false)));
            chip.appendChild(makeButton('x', () => {
                bookmarks.splice(bookmarks.indexOf(bookmark), 1);
                render();
            }, '#555'));
            bar.appendChild(chip);
        }
    };

    render();

    const dispose = () => bar.remove();

    return { dispose };
}

defineRecipe({
    id: 'hud-bookmarks',
    topic: 'HUD',
    title: 'Camera bookmark bar',
    learn: 'Add interactive controls over the viewer. Save the camera with getState(), and fly back to it later with restoreState().',
    lookFor: 'Run. A bar appears at the top of the viewer. Orbit somewhere, click "+ Save view", move away, then click the bookmark and watch the camera fly back. Save a few and jump between them.',
    file: 'js/lab/recipes/hud.js',
    apis: [
        { name: 'Viewer3D.getState', url: DOCS + 'Viewer3D/#getstate-filter' },
        { name: 'Viewer3D.restoreState', url: DOCS + 'Viewer3D/#restorestate-viewerstate-filter-immediate' },
    ],
    code: [addCameraBookmarks],
    run({ viewer }) {
        const { dispose } = addCameraBookmarks(viewer);
        return { status: 'Bar added. Save a view, move the camera, then click the bookmark.', dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 10: Hover tooltip
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show a tooltip with the name and category of whatever is under the mouse.
 *
 * The viewer has no hover event, so we listen to mousemove ourselves and ask the viewer
 * what is under the cursor with clientToWorld(), which returns the hit element's `dbId`
 * and `model`. Because property reads are async and the mouse keeps moving, each answer
 * is checked against the latest request, and results are cached per element.
 *
 * Skipped while a button is held (orbiting or panning), so the tooltip never fights navigation.
 * Values go in with textContent, never innerHTML.
 *
 * @param viewer  Viewer instance
 * @returns {{ dispose: Function }}
 */
function addHoverTooltip(viewer) {
    const { QC } = Autodesk.Tandem.DtConstants;

    const tip = document.createElement('div');
    tip.style.cssText = `
        position:absolute; padding:6px 10px; border-radius:6px; background:rgba(0,0,0,.85);
        color:#fff; font:12px sans-serif; pointer-events:none; display:none; white-space:nowrap; z-index:5;`;
    viewer.container.appendChild(tip);

    const cache = new Map();                        // "modelId:dbId" -> { name, category }
    let latest = 0;
    let frame = 0;

    const describe = async (model, dbId) => {
        const key = `${model.id}:${dbId}`;
        if (!cache.has(key)) {
            const { rows } = await model.query({ dbIds: [dbId], includes: { standard: true } });
            const row = rows[0] ?? {};
            cache.set(key, {
                name: row[QC.OName] || row[QC.Name] || `Element ${dbId}`,
                category: row[QC.OTandemCategory] || row[QC.TandemCategory] || '',
            });
        }
        return cache.get(key);
    };

    const onMove = (event) => {
        if (event.buttons) { tip.style.display = 'none'; return; }

        cancelAnimationFrame(frame);                // at most one hit test per frame
        frame = requestAnimationFrame(async () => {
            const ticket = ++latest;
            const canvas = viewer.impl.getCanvasBoundingClientRect();
            const hit = viewer.clientToWorld(event.clientX - canvas.left, event.clientY - canvas.top, true);

            if (!hit?.dbId || !hit.model) { tip.style.display = 'none'; return; }

            const { name, category } = await describe(hit.model, hit.dbId);
            if (ticket !== latest) return;          // the mouse moved on while we were reading properties

            tip.replaceChildren();
            const title = document.createElement('div');
            title.textContent = name;
            title.style.fontWeight = '600';
            tip.appendChild(title);

            if (category) {
                const sub = document.createElement('div');
                sub.textContent = category;
                sub.style.opacity = '.7';
                tip.appendChild(sub);
            }

            const box = viewer.container.getBoundingClientRect();
            tip.style.left = `${event.clientX - box.left + 14}px`;
            tip.style.top = `${event.clientY - box.top + 14}px`;
            tip.style.display = 'block';
        });
    };

    const onLeave = () => { latest++; tip.style.display = 'none'; };

    viewer.container.addEventListener('mousemove', onMove);
    viewer.container.addEventListener('mouseleave', onLeave);

    const dispose = () => {
        cancelAnimationFrame(frame);
        viewer.container.removeEventListener('mousemove', onMove);
        viewer.container.removeEventListener('mouseleave', onLeave);
        tip.remove();
    };

    return { dispose };
}

defineRecipe({
    id: 'hud-hover-tooltip',
    topic: 'HUD',
    title: 'Hover tooltip',
    learn: 'React to the mouse without clicking: hit-test under the cursor with clientToWorld(), read the element\'s Tandem data, and float a tooltip next to the pointer.',
    lookFor: 'Run, then move the mouse over the model without clicking. A tooltip follows the pointer with the element\'s name and category. It disappears over empty space and while you orbit.',
    file: 'js/lab/recipes/hud.js',
    apis: [
        { name: 'Viewer3D.clientToWorld', url: DOCS + 'Viewer3D/#clienttoworld-clientx-clienty-ignoretransparent' },
    ],
    code: [addHoverTooltip],
    run({ viewer }) {
        const { dispose } = addHoverTooltip(viewer);
        return { status: 'Tooltip active. Hover over elements.', dispose };
    },
});
