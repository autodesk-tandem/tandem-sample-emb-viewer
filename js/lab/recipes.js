/**
 * Viewer Lab - recipe registry and cleanup ledger.
 *
 * A "recipe" teaches one viewer capability. Each recipe has two parts:
 *
 *   code  - one or more plain functions that are shown to the developer and meant
 *           to be copied. They take the viewer (and plain data) as arguments, use
 *           only the global Autodesk.* / THREE APIs, and return a handle with a
 *           dispose() function that undoes whatever they added.
 *
 *   run   - a thin wrapper that reads the Lab controls, calls the code above and
 *           reports a status line. This part is Lab plumbing and is NOT shown.
 *
 * The ledger below remembers each active recipe's dispose() so a recipe can be
 * reset on its own, all at once, or automatically when a different facility loads.
 */

const recipes = [];                 // registration order = display order
const active = new Map();           // recipe id -> dispose()
const listeners = new Set();        // notified whenever the active set changes

/**
 * @typedef {Object} LabControl
 * @property {string} id
 * @property {string} label
 * @property {'range'|'color'|'select'|'checkbox'|'text'} type
 * @property {*} default
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {Array<{value: string, label: string}>} [options]
 *
 * @typedef {Object} LabRecipe
 * @property {string} id            Unique id
 * @property {string} topic         Topic pill it appears under (e.g. 'Markers')
 * @property {string} title
 * @property {string} learn         One or two sentences: what this teaches
 * @property {string} lookFor       What the developer should notice in the viewer
 * @property {string} file          Source file shown under the code
 * @property {Array<{name: string, url: string}>} [apis]  Public API reference links
 * @property {LabControl[]} [controls]
 * @property {Function[]} code      Copy-ready functions shown in "Show code"
 * @property {(ctx: LabContext) => (Promise<LabResult>|LabResult)} run
 *
 * @typedef {Object} LabContext
 * @property {*} viewer             The viewer instance
 * @property {*} facility           The current facility (may be null)
 * @property {Object} values        Current control values keyed by control id
 * @property {Array|null} selection Aggregate selection: [{ model, selection: [dbId] }]
 *
 * @typedef {Object} LabResult
 * @property {string} [status]      Message shown under the buttons
 * @property {'ok'|'warn'} [level]  'warn' is shown in amber (e.g. nothing selected)
 * @property {() => void} [dispose] How to undo what was done
 */

/** Register a recipe. */
export function defineRecipe(recipe) {
    recipes.push(recipe);
}

export function getRecipes() {
    return recipes;
}

export function isActive(id) {
    return active.has(id);
}

export function onActiveChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

function notify() {
    listeners.forEach(fn => fn());
}

/**
 * Run a recipe. Any previous run of the same recipe is disposed first, so
 * pressing Run twice never stacks duplicate markers/controls.
 * @returns {Promise<{status: string, level: string}>}
 */
export async function runRecipe(recipe, ctx) {
    resetRecipe(recipe.id);

    try {
        const result = (await recipe.run(ctx)) ?? {};
        if (result.dispose) {
            active.set(recipe.id, result.dispose);
            notify();
        }
        return { status: result.status ?? 'Done.', level: result.level ?? 'ok' };
    } catch (error) {
        console.error(`Lab recipe "${recipe.id}" failed:`, error);
        return { status: `Error: ${error.message}`, level: 'error' };
    }
}

/** Undo one recipe (no-op if it is not active). */
export function resetRecipe(id) {
    const dispose = active.get(id);
    if (!dispose) return;

    active.delete(id);
    try {
        dispose();
    } catch (error) {
        console.warn(`Lab recipe "${id}" cleanup failed:`, error);
    }
    notify();
}

/** Undo everything. Called on "Reset all" and whenever a facility is (re)loaded. */
export function resetAll() {
    [...active.keys()].forEach(id => resetRecipe(id));
}
