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
// Recipe 1: Pie chart of elements by category (click to isolate)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Open a panel with a donut (pie) chart of how many elements each Tandem category has.
 * Click a slice, or its row in the legend, to isolate those elements in the viewer;
 * click again (or close the panel) to show everything.
 *
 * The panel is an Autodesk.Viewing.UI.DockingPanel: the viewer's own movable, closable
 * panel. Out of the box it gives you a title bar, a close button and dragging, so you
 * only add your content to `panel.container`. The chart itself is plain SVG, so no
 * charting library is needed.
 *
 * The biggest categories get their own slice and the rest are merged into "Other", so the
 * slices always add up to every element.
 *
 * Gotchas:
 *  - model.query() returns no rows unless you pass dbIds, so we pass model.getElementIds().
 *    That reads every element, which is fine for a demo; cache the result in a real app.
 *  - isolate() works per model. A model with nothing to show still has to be isolated
 *    (to the non-existent id 0) or it would stay fully visible.
 *
 * @param viewer          Viewer instance
 * @param models          Models to count, e.g. facility.getModels()
 * @param options.limit   Number of categories that get their own slice
 * @returns {Promise<{ slices: number, total: number, dispose: Function }>}
 */
async function addCategoryPie(viewer, models, { limit = 8 } = {}) {
    const { QC } = Autodesk.Tandem.DtConstants;
    const categoryOf = (row) => row[QC.OTandemCategory] || row[QC.TandemCategory] || '(none)';
    const svgNS = 'http://www.w3.org/2000/svg';

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

    // 2. The biggest categories get a slice each; everything else is merged into "Other"
    const countOf = (perModel) => [...perModel.values()].reduce((sum, ids) => sum + ids.length, 0);
    const ranked = [...byCategory.entries()]
        .map(([label, perModel]) => ({ label, perModel, count: countOf(perModel) }))
        .sort((a, b) => b.count - a.count);

    const slices = ranked.slice(0, limit);
    const rest = ranked.slice(limit);

    if (rest.length) {
        const merged = new Map();
        for (const { perModel } of rest) {
            for (const [model, ids] of perModel) merged.set(model, (merged.get(model) ?? []).concat(ids));
        }
        slices.push({ label: `Other (${rest.length} categories)`, perModel: merged, count: countOf(merged), other: true });
    }

    slices.forEach((slice, i) => { slice.color = slice.other ? '#777' : `hsl(${(i * 47) % 360} 65% 55%)`; });
    const total = slices.reduce((sum, slice) => sum + slice.count, 0);

    // 3. A docking panel: title bar, dragging and close button come for free
    const width = 320;
    const panel = new Autodesk.Viewing.UI.DockingPanel(viewer.container, 'lab-category-pie', 'Elements by category',
        { addFooter: false, localizeTitle: false });

    Object.assign(panel.container.style, {
        width: `${width}px`, height: '470px', top: '60px',
        left: `${Math.max(12, viewer.container.clientWidth - width - 12)}px`,
        background: '#222', color: '#eee', font: '12px sans-serif',
    });

    const body = document.createElement('div');
    body.style.cssText = 'position:absolute; top:42px; left:0; right:0; bottom:0; overflow:auto; padding:8px 12px;';
    panel.container.appendChild(body);

    // 4. The pie: one SVG wedge per slice, with a hole in the middle that shows the count
    const radius = 90;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '-100 -100 200 200');
    svg.style.cssText = 'display:block; width:200px; height:200px; margin:0 auto 8px;';
    body.appendChild(svg);

    const point = (fraction) => {                       // 0 = 12 o'clock, going clockwise
        const angle = fraction * 2 * Math.PI - Math.PI / 2;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    };

    let selected = null;
    const wedges = new Map();
    const rows = new Map();

    const centerCount = document.createElementNS(svgNS, 'text');
    const centerLabel = document.createElementNS(svgNS, 'text');

    const refresh = () => {
        const current = slices.find(slice => slice === selected);
        centerCount.textContent = String(current ? current.count : total);
        centerLabel.textContent = current ? `${Math.round((current.count / total) * 100)}% of elements` : 'elements';

        for (const slice of slices) {
            const wedge = wedges.get(slice);
            const active = slice === selected;
            wedge.setAttribute('transform', active ? `translate(${point(slice.mid).map(v => v * 0.08).join(' ')})` : '');
            wedge.style.opacity = !selected || active ? '1' : '0.35';
            rows.get(slice).style.background = active ? 'rgba(6,150,215,.35)' : 'transparent';
        }
    };

    const select = (slice) => {
        selected = slice === selected ? null : slice;

        if (selected === null) {
            viewer.showAll();
        } else {
            for (const model of models) {
                viewer.isolate(selected.perModel.get(model) ?? [0], model);
            }
        }
        refresh();
    };

    let start = 0;
    for (const slice of slices) {
        const fraction = slice.count / total;
        slice.mid = start + fraction / 2;               // used to push the chosen slice outward

        // A slice that is the whole pie is a circle: an arc cannot start and end at the same point
        let wedge;
        if (fraction > 0.9999) {
            wedge = document.createElementNS(svgNS, 'circle');
            wedge.setAttribute('r', radius);
        } else {
            const [x1, y1] = point(start);
            const [x2, y2] = point(start + fraction);
            wedge = document.createElementNS(svgNS, 'path');
            wedge.setAttribute('d', `M0 0 L${x1} ${y1} A${radius} ${radius} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`);
        }

        wedge.setAttribute('fill', slice.color);
        wedge.setAttribute('stroke', '#222');
        wedge.setAttribute('stroke-width', '1.5');
        wedge.style.cursor = 'pointer';
        wedge.style.transition = 'opacity .15s, transform .15s';
        wedge.addEventListener('click', () => select(slice));

        const tip = document.createElementNS(svgNS, 'title');       // native hover tooltip
        tip.textContent = `${slice.label}: ${slice.count}`;
        wedge.appendChild(tip);

        svg.appendChild(wedge);
        wedges.set(slice, wedge);
        start += fraction;
    }

    const hole = document.createElementNS(svgNS, 'circle');
    hole.setAttribute('r', radius * 0.5);
    hole.setAttribute('fill', '#222');
    hole.style.pointerEvents = 'none';
    svg.appendChild(hole);

    for (const [text, y, size, opacity] of [[centerCount, 4, 20, 1], [centerLabel, 20, 9, 0.6]]) {
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('y', y);
        text.setAttribute('fill', '#eee');
        text.setAttribute('font-size', size);
        text.setAttribute('opacity', opacity);
        text.style.pointerEvents = 'none';
        svg.appendChild(text);
    }

    // 5. The legend doubles as a list of buttons. Text goes in with textContent: it comes from your data.
    for (const slice of slices) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:8px; padding:3px 4px; border-radius:4px; cursor:pointer;';

        const swatch = document.createElement('span');
        swatch.style.cssText = `flex:0 0 10px; height:10px; border-radius:2px; background:${slice.color};`;

        const label = document.createElement('span');
        label.textContent = slice.label;
        label.title = slice.label;
        label.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';

        const number = document.createElement('span');
        number.textContent = `${slice.count} (${Math.round((slice.count / total) * 100)}%)`;
        number.style.cssText = 'flex:0 0 auto; opacity:.8;';

        row.append(swatch, label, number);
        row.addEventListener('click', () => select(slice));
        body.appendChild(row);
        rows.set(slice, row);
    }

    refresh();

    // Closing the panel with its X puts the model back the way it was
    panel.addVisibilityListener((visible) => { if (!visible && selected !== null) select(selected); });
    panel.setVisible(true);

    const dispose = () => {
        if (selected !== null) viewer.showAll();
        panel.uninitialize();
    };

    return { slices: slices.length, total, dispose };
}

defineRecipe({
    id: 'explore-category-pie',
    topic: 'Explore',
    title: 'Pie chart by category (click to isolate)',
    learn: 'Count elements by a Tandem property and turn the chart into a filter. Uses model.query() for the data, plain SVG for the pie, and the viewer\'s own DockingPanel for the window.',
    lookFor: 'Run. A movable panel opens on the right with a donut chart and a legend. Click a slice or a legend row and everything else disappears while the slice pulls out; click it again to bring the model back. Drag the panel by its title and close it with the X.',
    file: 'js/lab/recipes/explore.js',
    apis: [
        { name: 'UI.DockingPanel', url: 'https://aps.autodesk.com/en/docs/viewer/v7/reference/UI/DockingPanel/' },
        { name: 'Viewer3D.isolate', url: DOCS + 'Viewer3D/#isolate-node-model' },
        { name: 'Viewer3D.showAll', url: DOCS + 'Viewer3D/#showall' },
    ],
    controls: [
        { id: 'limit', label: 'Categories with their own slice', type: 'range', min: 3, max: 12, step: 1, default: 8 },
    ],
    code: [addCategoryPie],
    async run({ viewer, facility, values }) {
        const models = facility?.getModels() ?? [];
        const { slices, total, dispose } = await addCategoryPie(viewer, models, { limit: Number(values.limit) });

        if (!total) {
            dispose();
            return { status: 'No elements with a category were found.', level: 'warn' };
        }

        return { status: `Charted ${total} element(s) in ${slices} slices. Click one.`, dispose };
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
