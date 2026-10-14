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
