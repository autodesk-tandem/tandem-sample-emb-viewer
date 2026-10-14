/**
 * Viewer Lab - Selection
 *
 * Select, find and isolate elements from code instead of by clicking.
 *
 * Each recipe has copy-ready functions (listed in `code`) that only need the viewer
 * and models, and return a handle with a dispose() function. The `run` wrapper next
 * to them is Lab plumbing: it reads the controls and reports a status line.
 *
 * API reference: https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/
 */

import { defineRecipe } from '../recipes.js';

const DOCS = 'https://aps.autodesk.com/en/docs/viewer/v7/reference/Viewing/';

// ─────────────────────────────────────────────────────────────────────────────
// Select by searching property values
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Select every element whose property values contain `text`, and zoom to them.
 *
 * model.search() is a Tandem call that searches property VALUES (for example
 * "Concrete" or "AHU-01") and returns plain dbIds, ready for viewer.select().
 *
 * Gotchas: matching is fuzzy, so near-misses and typos count, and it looks at every
 * source and custom property of the element, including ones the Properties panel
 * hides. So an element can match a word you can't see anywhere in its visible properties.
 *
 * Selection is grouped per model, so we collect one group per model and set them all at once.
 *
 * @param viewer  Viewer instance
 * @param models  Models to search, e.g. facility.getModels()
 * @param text    Text to look for
 * @returns {Promise<{ count: number, groups: Array, dispose: Function }>}
 */
async function selectBySearch(viewer, models, text) {
    const groups = [];

    for (const model of models) {
        const dbIds = await model.search({ text });
        if (dbIds.length) groups.push({ model, selection: dbIds });
    }

    // Replaces the current selection (an empty list clears it)
    viewer.setAggregateSelection(groups);

    if (groups.length) {
        viewer.fitToView(groups[0].selection, groups[0].model);
    }

    const count = groups.reduce((sum, group) => sum + group.selection.length, 0);
    return { count, groups, dispose: () => viewer.clearSelection() };
}

/**
 * Lab plumbing (not shown in Show code): explain the first few matches in the console
 * by listing the properties that literally contain the text, hidden ones included.
 */
async function logWhyMatched(groups, text) {
    const needle = text.toLowerCase();
    const rows = [];

    for (const { model, selection } of groups) {
        for (const dbId of selection.slice(0, 5)) {
            const [props] = await model.getPropertiesDt([dbId]);
            const hits = Object.values(props.element.properties)
                .filter(({ displayValue }) => String(displayValue ?? '').toLowerCase().includes(needle));

            rows.push({
                model: model.label(),
                dbId,
                name: model.getInstanceTree()?.getNodeName(dbId),
                literalMatches: hits.length
                    ? hits.map(({ displayName, displayValue, hidden }) => `${displayName}${hidden ? ' (hidden)' : ''} = ${displayValue}`).join('; ')
                    : '(none: fuzzy match only)',
            });
        }
    }

    console.group(`LAB: why did these match "${text}"? (first few per model)`);
    console.table(rows);
    console.groupEnd();
}

defineRecipe({
    id: 'selection-search',
    topic: 'Selection',
    title: 'Select by searching values',
    learn: 'Find elements with a text search over their property values, then select them and zoom to them from code. The search is fuzzy and also covers hidden properties, so results can surprise you: the console shows what matched.',
    lookFor: 'Type a word that appears in your model (a category, a material, a name), then Run. Every matching element becomes selected and the camera zooms to them. Reset clears the selection.',
    file: 'js/lab/recipes/selection.js',
    apis: [
        { name: 'Viewer3D.setAggregateSelection', url: DOCS + 'Viewer3D/#setaggregateselection-selections' },
        { name: 'Viewer3D.fitToView', url: DOCS + 'Viewer3D/#fittoview-objectids-model-immediate' },
    ],
    controls: [
        { id: 'text', label: 'Search for', type: 'text', default: 'Mech' },
    ],
    code: [selectBySearch],
    async run({ viewer, facility, values }) {
        const text = values.text?.trim();
        if (!text) {
            return { status: 'Type some text to search for.', level: 'warn' };
        }

        const { count, groups, dispose } = await selectBySearch(viewer, facility.getModels(), text);
        if (!count) {
            return { status: `Nothing matched "${text}". Try a different word.`, level: 'warn' };
        }

        await logWhyMatched(groups, text);

        return { status: `Selected ${count} element(s) matching "${text}". Open the console to see why they matched.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Select similar elements (query Tandem data)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Select every element that has the same Tandem category as the current selection.
 *
 * model.query() reads Tandem data for many elements in one call. We ask for the
 * category of the selected elements, then for the category of all elements in the
 * model, and keep the matches. Rows come back keyed by qualified column name, and
 * the user-override column (QC.OTandemCategory) wins over the original one.
 *
 * Gotchas:
 *  - query() only returns rows for the dbIds you pass. Leave `dbIds` out and you get
 *    zero rows, not "all elements", so pass model.getElementIds() to mean "everything".
 *  - This reads a row for every element. Fine for a demo; for very large models
 *    cache the result instead of querying on every click.
 *
 * @param viewer              Viewer instance
 * @param aggregateSelection  viewer.getAggregateSelection() -> [{ model, selection: [dbId, ...] }]
 * @returns {Promise<{ count: number, categories: string[], dispose: Function }>}
 */
async function selectSimilar(viewer, aggregateSelection) {
    const { QC } = Autodesk.Tandem.DtConstants;
    const categoryOf = (row) => row[QC.OTandemCategory] || row[QC.TandemCategory];

    const groups = [];
    const categories = new Set();

    for (const { model, selection } of aggregateSelection) {
        const selected = await model.query({ dbIds: selection, includes: { standard: true } });
        const wanted = new Set(selected.rows.map(categoryOf).filter(Boolean));
        if (!wanted.size) continue;

        wanted.forEach(category => categories.add(category));

        const all = await model.query({ dbIds: model.getElementIds(), includes: { standard: true } });
        const dbIds = all.rows
            .filter(row => wanted.has(categoryOf(row)))
            .map(row => row[QC.LmvDbId]);          // the viewer's id for the element

        groups.push({ model, selection: dbIds });
    }

    viewer.setAggregateSelection(groups);

    const count = groups.reduce((sum, group) => sum + group.selection.length, 0);
    return { count, categories: [...categories], dispose: () => viewer.clearSelection() };
}

defineRecipe({
    id: 'selection-similar',
    topic: 'Selection',
    title: 'Select similar elements',
    learn: 'Use Tandem data to grow a selection: find the category of what is selected and select everything else with that category.',
    lookFor: 'Click one element (a piece of equipment works well), then Run. All elements with the same Tandem category become selected. Reset clears the selection.',
    file: 'js/lab/recipes/selection.js',
    apis: [
        { name: 'Viewer3D.setAggregateSelection', url: DOCS + 'Viewer3D/#setaggregateselection-selections' },
    ],
    code: [selectSimilar],
    async run({ viewer, selection }) {
        if (!selection) {
            return { status: 'Select an element in the viewer first, then press Run.', level: 'warn' };
        }

        const { count, categories, dispose } = await selectSimilar(viewer, selection);
        if (!count) {
            return {
                status: categories.length
                    ? `No elements found for: ${categories.join(', ')}.`
                    : 'The selected element has no Tandem category to match on.',
                level: 'warn',
            };
        }

        console.group('LAB: selectSimilar()');
        console.log('Categories:', categories);
        console.groupEnd();

        return { status: `Selected ${count} element(s) in: ${categories.join(', ')}.`, dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Isolate the selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show only the selected elements. Everything else, in every model, is either hidden
 * or, with `ghost`, drawn faint and transparent so you keep the context.
 *
 * isolate() works per model, and a model with nothing selected is not touched by it.
 * To fade or hide those models too, isolate them with the dbId 0, which matches no
 * element, so everything in that model counts as "not isolated".
 *
 * @param viewer              Viewer instance
 * @param models              All models, e.g. facility.getModels()
 * @param aggregateSelection  viewer.getAggregateSelection() -> [{ model, selection: [dbId, ...] }]
 * @param options.ghost       true = show the rest faintly, false = hide it completely
 * @returns {{ dispose: Function }}
 */
function isolateSelection(viewer, models, aggregateSelection, { ghost = true } = {}) {
    viewer.setGhosting(ghost);

    for (const model of models) {
        const group = aggregateSelection.find(({ model: selectedModel }) => selectedModel.id === model.id);
        viewer.isolate(group ? group.selection : [0], model);
    }

    const dispose = () => {
        viewer.showAll();
        viewer.setGhosting(true);                 // the viewer's default
    };

    return { dispose };
}

defineRecipe({
    id: 'selection-isolate',
    topic: 'Selection',
    title: 'Isolate the selection',
    learn: 'Focus on part of the model: isolate the selected elements and either ghost or hide everything else.',
    lookFor: 'Select a few elements, then Run. Everything else, in every model, fades out (or disappears if you untick Ghost the rest). Reset shows everything again.',
    file: 'js/lab/recipes/selection.js',
    apis: [
        { name: 'Viewer3D.isolate', url: DOCS + 'Viewer3D/#isolate-node-model' },
        { name: 'Viewer3D.setGhosting', url: DOCS + 'Viewer3D/#setghosting-value' },
        { name: 'Viewer3D.showAll', url: DOCS + 'Viewer3D/#showall' },
    ],
    controls: [
        { id: 'ghost', label: 'Ghost the rest', type: 'checkbox', default: true },
    ],
    code: [isolateSelection],
    run({ viewer, facility, values, selection }) {
        if (!selection) {
            return { status: 'Select one or more elements in the viewer, then press Run.', level: 'warn' };
        }

        const { dispose } = isolateSelection(viewer, facility.getModels(), selection, { ghost: !!values.ghost });
        return { status: 'Selection isolated. Press Reset to show everything.', dispose };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Hide a model
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hide the whole model that the selected elements belong to.
 *
 * A facility is made of several models (architecture, mechanical, and so on). Use the
 * facility's own hideModel() and showModel() rather than hiding every element yourself:
 * they are fast, and they keep Tandem's list of visible models in sync.
 *
 * @param facility            The loaded Tandem facility
 * @param aggregateSelection  viewer.getAggregateSelection() -> [{ model, selection: [dbId, ...] }]
 * @returns {{ models: object[], dispose: Function }}  The models that were hidden
 */
function hideModelOfSelection(facility, aggregateSelection) {
    const models = aggregateSelection
        .map(({ model }) => model)
        .filter(model => facility.isModelVisible(model));

    models.forEach(model => facility.hideModel(model));

    const dispose = () => models.forEach(model => facility.showModel(model));

    return { models, dispose };
}

defineRecipe({
    id: 'selection-hide-model',
    topic: 'Selection',
    title: 'Hide a model',
    learn: 'Show and hide whole models in a multi-model facility, using the facility\'s own methods.',
    lookFor: 'Select an element, then Run. Its entire model disappears and the others remain. Reset shows it again.',
    file: 'js/lab/recipes/selection.js',
    apis: [],
    code: [hideModelOfSelection],
    run({ facility, selection }) {
        if (!selection) {
            return { status: 'Select an element in the model you want to hide, then press Run.', level: 'warn' };
        }

        const { models, dispose } = hideModelOfSelection(facility, selection);
        if (!models.length) {
            return { status: 'That model is already hidden.', level: 'warn' };
        }

        return { status: `Hid: ${models.map(model => model.label()).join(', ')}. Press Reset to show it.`, dispose };
    },
});
