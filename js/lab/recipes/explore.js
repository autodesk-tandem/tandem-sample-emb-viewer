/**
 * Viewer Lab - Explore
 *
 * Let people explore a facility with a small UI of your own: a chart that filters the
 * model, and a level picker. Both combine Tandem data (queries, levels) with viewer
 * visibility control (isolate / showAll).
 *
 * Each recipe has copy-ready functions (listed in `code`) that only need the viewer
 * (and plain data), and return a handle with a dispose() function. The `run` wrapper
 * next to them is Lab plumbing: it reads the controls and reports a status line.
 *
 * API reference: https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/
 */

import { defineRecipe } from '../recipes.js';

const DOCS = 'https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/';

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 1: Chart of elements by category (click to isolate)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Open a panel that charts how many elements each Tandem category has. Click a bar
 * to isolate those elements in the viewer; click it again (or close the panel) to
 * show everything.
 *
 * The panel is an Autodesk.Viewing.UI.DockingPanel: the viewer's own movable, closable
 * panel. Out of the box it gives you a title bar, a close button and dragging, so you
 * only add your content to `panel.container`.
 *
 * Gotchas:
 *  - model.query() returns no rows unless you pass dbIds, so we pass model.getElementIds().
 *    That reads every element, which is fine for a demo; cache the result in a real app.
 *  - isolate() works per model. A model with nothing to show still has to be isolated
 *    (to the non-existent id 0) or it would stay fully visible.
 *
 * @param viewer          Viewer instance
 * @param models          Models to count, e.g. facility.getModels()
 * @param options.limit   Maximum number of bars (the biggest categories win)
 * @returns {Promise<{ categories: number, total: number, dispose: Function }>}
 */
async function addCategoryChart(viewer, models, { limit = 12 } = {}) {
    const { QC } = Autodesk.Tandem.DtConstants;
    const categoryOf = (row) => row[QC.OTandemCategory] || row[QC.TandemCategory] || '(none)';

    // 1. Group element ids by category and model: category -> Map(model -> [dbId])
    const byCategory = new Map();

    for (const model of models) {
        const { rows } = await model.query({ dbIds: model.getElementIds(), includes: { standard: true } });

        for (const row of rows) {
            const category = categoryOf(row);
            if (!byCategory.has(category)) byCategory.set(category, new Map());

            const perModel = byCategory.get(category);
            if (!perModel.has(model)) perModel.set(model, []);
            perModel.get(model).push(row[QC.LmvDbId]);     // the viewer's id for the element
        }
    }

    const countOf = (category) => [...byCategory.get(category).values()].reduce((sum, ids) => sum + ids.length, 0);
    const bars = [...byCategory.keys()]
        .map(category => ({ category, count: countOf(category) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    const total = bars.reduce((sum, bar) => sum + bar.count, 0);

    // 2. A docking panel: title bar, dragging and close button come for free
    const width = 320;
    const panel = new Autodesk.Viewing.UI.DockingPanel(viewer.container, 'lab-category-chart', 'Elements by category',
        { addFooter: false, localizeTitle: false });

    Object.assign(panel.container.style, {
        width: `${width}px`, height: '360px', top: '60px',
        left: `${Math.max(12, viewer.container.clientWidth - width - 12)}px`,
        background: '#222', color: '#eee', font: '12px sans-serif',
    });

    const body = document.createElement('div');
    body.style.cssText = 'position:absolute; top:42px; left:0; right:0; bottom:0; overflow:auto; padding:8px 12px;';
    panel.container.appendChild(body);

    const hint = document.createElement('div');
    hint.textContent = 'Click a bar to isolate it. Click again to show all.';
    hint.style.cssText = 'opacity:.6; margin-bottom:8px;';
    body.appendChild(hint);

    // 3. One row per category. Text goes in with textContent: it comes from your data.
    let selected = null;
    const rowsByCategory = new Map();

    const select = (category) => {
        selected = category === selected ? null : category;

        if (selected === null) {
            viewer.showAll();
        } else {
            const perModel = byCategory.get(selected);
            for (const model of models) {
                viewer.isolate(perModel.get(model) ?? [0], model);
            }
        }

        for (const [name, row] of rowsByCategory) {
            row.style.background = name === selected ? 'rgba(6,150,215,.35)' : 'transparent';
        }
    };

    const maxCount = bars[0]?.count || 1;

    for (const { category, count } of bars) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:8px; padding:3px 4px; border-radius:4px; cursor:pointer;';

        const label = document.createElement('span');
        label.textContent = category;
        label.title = category;
        label.style.cssText = 'flex:0 0 110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';

        const track = document.createElement('span');
        track.style.cssText = 'flex:1; height:10px; border-radius:5px; background:rgba(255,255,255,.12);';

        const fill = document.createElement('span');
        fill.style.cssText = `display:block; height:100%; border-radius:5px; background:#0696d7; width:${(count / maxCount) * 100}%;`;
        track.appendChild(fill);

        const number = document.createElement('span');
        number.textContent = String(count);
        number.style.cssText = 'flex:0 0 44px; text-align:right; opacity:.8;';

        row.append(label, track, number);
        row.addEventListener('click', () => select(category));
        body.appendChild(row);
        rowsByCategory.set(category, row);
    }

    // Closing the panel with its X puts the model back the way it was
    panel.addVisibilityListener((visible) => { if (!visible && selected !== null) select(selected); });
    panel.setVisible(true);

    const dispose = () => {
        if (selected !== null) viewer.showAll();
        panel.uninitialize();
    };

    return { categories: bars.length, total, dispose };
}

defineRecipe({
    id: 'explore-category-chart',
    topic: 'Explore',
    title: 'Chart by category (click to isolate)',
    learn: 'Count elements by a Tandem property and turn the chart into a filter. Uses model.query() for the data and the viewer\'s own DockingPanel for the UI.',
    lookFor: 'Run. A movable panel opens on the right with a bar per Tandem category. Click a bar and everything else disappears; click it again to bring the model back. Drag the panel by its title and close it with the X.',
    file: 'js/lab/recipes/explore.js',
    apis: [
        { name: 'UI.DockingPanel', url: 'https://aps.autodesk.com/en/docs/viewer/v7/reference/UI/DockingPanel/' },
        { name: 'Viewer3D.isolate', url: DOCS + 'Viewer3D/#isolate-node-model' },
        { name: 'Viewer3D.showAll', url: DOCS + 'Viewer3D/#showall' },
    ],
    controls: [
        { id: 'limit', label: 'Number of bars', type: 'range', min: 4, max: 30, step: 1, default: 12 },
    ],
    code: [addCategoryChart],
    async run({ viewer, facility, values }) {
        const models = facility?.getModels() ?? [];
        const { categories, total, dispose } = await addCategoryChart(viewer, models, { limit: Number(values.limit) });

        if (!categories) {
            dispose();
            return { status: 'No elements with a category were found.', level: 'warn' };
        }

        return { status: `Charted ${total} element(s) in ${categories} categories. Click a bar.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Recipe 2: Level picker
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a column of buttons, one per building level, that shows only the chosen level
 * (or the chosen level and everything below it, to cut the building away from the top).
 *
 * model.getLevels() returns the levels of a model by dbId, with their name and
 * elevation, and model.getElementsForLevel(dbId) returns the elements on one. Reference
 * models each carry their own levels, so levels with the same name are merged into one button.
 *
 * Gotchas:
 *  - Elements that belong to no level (a site, for example) are hidden while a level is chosen.
 *  - Level elevations are in each model's own unit, so they are only used here to order the buttons.
 *
 * @param viewer                 Viewer instance
 * @param models                 Models to read levels from, e.g. facility.getModels()
 * @param options.cumulative     true: show the chosen level and every level below it
 * @returns {{ levels: number, dispose: Function }}
 */
function addLevelPicker(viewer, models, { cumulative = false } = {}) {
    // 1. Merge levels with the same name across models, highest first
    const byName = new Map();

    for (const model of models) {
        for (const level of Object.values(model.getLevels() ?? {})) {
            if (!byName.has(level.name)) byName.set(level.name, { name: level.name, elevation: level.elev, entries: [] });
            byName.get(level.name).entries.push({ model, dbId: level.dbId });
        }
    }

    const levels = [...byName.values()].sort((a, b) => b.elevation - a.elevation);

    // 2. Isolate the elements of the chosen level(s), model by model
    const showLevels = (chosen) => {
        const idsByModel = new Map(models.map(model => [model, []]));

        for (const level of chosen) {
            for (const { model, dbId } of level.entries) {
                const ids = idsByModel.get(model);
                for (const id of model.getElementsForLevel(dbId)) ids.push(id);
            }
        }

        // A model with nothing on these levels is isolated to a non-existent id to hide it
        for (const [model, ids] of idsByModel) {
            viewer.isolate(ids.length ? ids : [0], model);
        }
    };

    // 3. The buttons
    const panel = document.createElement('div');
    panel.style.cssText = `
        position:absolute; left:12px; top:50%; transform:translateY(-50%); max-height:60%; overflow:auto;
        display:flex; flex-direction:column; gap:4px; padding:6px; border-radius:8px;
        background:rgba(0,0,0,.78); font:12px sans-serif; color:#fff;`;
    viewer.container.appendChild(panel);

    let current = null;
    const buttons = new Map();

    const choose = (index) => {
        current = index === current ? null : index;       // clicking the active level again shows everything

        if (current === null) {
            viewer.showAll();
        } else {
            showLevels(cumulative ? levels.slice(current) : [levels[current]]);   // levels are ordered top to bottom
        }

        for (const [i, button] of buttons) {
            button.style.background = i === current ? '#0696d7' : '#444';
        }
    };

    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.textContent = level.name;
        button.style.cssText = 'padding:4px 12px; border:0; border-radius:4px; background:#444; color:#fff; cursor:pointer; font:inherit; text-align:left;';
        button.addEventListener('click', () => choose(index));
        panel.appendChild(button);
        buttons.set(index, button);
    });

    const dispose = () => {
        if (current !== null) viewer.showAll();
        panel.remove();
    };

    return { levels: levels.length, dispose };
}

defineRecipe({
    id: 'explore-level-picker',
    topic: 'Explore',
    title: 'Level picker (one floor at a time)',
    learn: 'Use the levels Tandem already knows about to filter the 3D view: read them with model.getLevels(), then isolate the elements on the chosen one.',
    lookFor: 'Run. A column of level buttons appears at the left, top floor first. Click one to see only that floor, click it again to show everything. Tick the box to keep everything below the chosen level and cut the building away from the top.',
    file: 'js/lab/recipes/explore.js',
    apis: [
        { name: 'Viewer3D.isolate', url: DOCS + 'Viewer3D/#isolate-node-model' },
        { name: 'Viewer3D.showAll', url: DOCS + 'Viewer3D/#showall' },
    ],
    controls: [
        { id: 'cumulative', label: 'Chosen level and everything below', type: 'checkbox', default: false },
    ],
    code: [addLevelPicker],
    run({ viewer, facility, values }) {
        const models = facility?.getModels() ?? [];
        const { levels, dispose } = addLevelPicker(viewer, models, { cumulative: Boolean(values.cumulative) });

        if (!levels) {
            dispose();
            return { status: 'No levels were found in this facility.', level: 'warn' };
        }

        return { status: `${levels} level(s) found. Click a button at the left of the viewer.`, dispose };
    },
});
