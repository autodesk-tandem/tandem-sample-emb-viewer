/**
 * Viewer Lab - side panel UI.
 *
 * - initSidePanel(): wires the Stubs | Viewer Lab tabs and the drag-to-resize edge.
 * - renderLab():     builds the recipe cards (called every time a facility loads).
 *
 * This file is Lab plumbing. The code developers are meant to copy lives in
 * js/lab/recipes/*.js.
 */

import { getViewer, getCurrentFacility } from '../viewer.js';
import { getAggregateSelection } from '../stubs/viewerStubs.js';
import { getRecipes, runRecipe, resetRecipe, resetAll, isActive, onActiveChange } from './recipes.js';

// Recipe modules register themselves when imported
import './recipes/selection.js';
import './recipes/camera.js';
import './recipes/appearance.js';
import './recipes/explore.js';
import './recipes/markers.js';
import './recipes/toolbar.js';
import './recipes/hud.js';

const TAB_KEY   = 'tandem-emb-viewer-panel-tab';
const WIDTH_KEY = 'tandem-emb-viewer-panel-width';

// Control values and the selected topic survive re-renders (e.g. switching facility)
const savedValues = {};
let currentTopic = null;
let unsubscribe = null;

// ── Tabs + resize ─────────────────────────────────────────────────────────────

/**
 * Wire the Stubs | Viewer Lab tabs and the resizable panel edge.
 * Call once, after the page has loaded.
 */
export function initSidePanel() {
    const panel     = document.getElementById('sidePanel');
    const resizer   = document.getElementById('sidePanelResizer');
    const stubsPane = document.getElementById('stubsContainer');
    const labPane   = document.getElementById('labContainer');
    if (!panel || !stubsPane || !labPane) return;

    const showTab = (tab) => {
        stubsPane.classList.toggle('hidden', tab !== 'stubs');
        labPane.classList.toggle('hidden', tab !== 'lab');
        panel.querySelectorAll('.panel-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panelTab === tab);
        });
        localStorage.setItem(TAB_KEY, tab);
    };

    panel.querySelectorAll('.panel-tab').forEach(btn => {
        btn.addEventListener('click', () => showTab(btn.dataset.panelTab));
    });
    showTab(localStorage.getItem(TAB_KEY) === 'lab' ? 'lab' : 'stubs');

    // Restore the last width
    const savedWidth = Number(localStorage.getItem(WIDTH_KEY));
    if (savedWidth >= 280) panel.style.width = `${savedWidth}px`;

    // Drag the left edge to resize. The viewer must be told its container changed size.
    resizer?.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        resizer.setPointerCapture(event.pointerId);

        const onMove = (e) => {
            const width = window.innerWidth - e.clientX;
            panel.style.width = `${Math.max(280, Math.min(width, window.innerWidth * 0.75))}px`;
            getViewer()?.resize();
        };
        const onUp = () => {
            resizer.removeEventListener('pointermove', onMove);
            resizer.removeEventListener('pointerup', onUp);
            localStorage.setItem(WIDTH_KEY, String(parseInt(panel.style.width, 10)));
            getViewer()?.resize();
        };
        resizer.addEventListener('pointermove', onMove);
        resizer.addEventListener('pointerup', onUp);
    });
}

// ── Lab rendering ─────────────────────────────────────────────────────────────

/**
 * Render the recipe cards. Anything a previous facility left in the scene is removed.
 * @param {HTMLElement} container
 */
export function renderLab(container) {
    if (!container) return;

    resetAll();
    unsubscribe?.();
    container.innerHTML = '';

    const recipes = getRecipes();
    const topics = [...new Set(recipes.map(r => r.topic))];
    if (!topics.includes(currentTopic)) currentTopic = topics[0];

    // Header: intro + topic pills + Reset all
    const header = document.createElement('div');
    header.className = 'mb-4';
    header.innerHTML = `
        <p class="text-xs text-dark-text-secondary mb-3">
            Interactive recipes for the embedded viewer. Press <strong class="text-dark-text">Run</strong>
            to see the effect, then open <strong class="text-dark-text">Show code</strong> to copy the
            snippet into your own app.
        </p>
        <div class="flex flex-wrap items-center gap-2" data-role="topics"></div>`;
    container.appendChild(header);

    const topicsEl = header.querySelector('[data-role="topics"]');
    topics.forEach(topic => {
        const pill = document.createElement('button');
        pill.className = `lab-topic ${topic === currentTopic ? 'active' : ''}`;
        pill.textContent = topic;
        pill.addEventListener('click', () => {
            currentTopic = topic;
            renderLab(container);
        });
        topicsEl.appendChild(pill);
    });

    const resetAllBtn = document.createElement('button');
    resetAllBtn.className = 'lab-btn secondary ml-auto';
    resetAllBtn.textContent = 'Reset all';
    resetAllBtn.title = 'Remove everything the recipes added to the viewer';
    resetAllBtn.addEventListener('click', resetAll);
    topicsEl.appendChild(resetAllBtn);

    const cards = {};
    recipes.filter(r => r.topic === currentTopic).forEach(recipe => {
        const card = buildCard(recipe);
        cards[recipe.id] = card;
        container.appendChild(card);
    });

    // Highlight cards whose recipe is currently active
    const refreshActive = () => {
        Object.entries(cards).forEach(([id, card]) => {
            card.classList.toggle('is-active', isActive(id));
            card.querySelector('[data-role="reset"]').disabled = !isActive(id);
        });
    };
    unsubscribe = onActiveChange(refreshActive);
    refreshActive();
}

// ── Recipe card ───────────────────────────────────────────────────────────────

function buildCard(recipe) {
    const card = document.createElement('div');
    card.className = 'lab-card';

    card.innerHTML = `
        <h3 class="text-sm font-semibold text-dark-text mb-1">${esc(recipe.title)}</h3>
        <p class="text-xs text-dark-text-secondary mb-2">${esc(recipe.learn)}</p>
        <p class="text-xs mb-3" style="color:#8fd18f"><strong>What to look for:</strong> ${esc(recipe.lookFor)}</p>
        <div data-role="controls" class="space-y-2 mb-3"></div>
        <div class="flex items-center gap-2 mb-2">
            <button class="lab-btn" data-role="run">Run</button>
            <button class="lab-btn secondary" data-role="reset" disabled>Reset</button>
        </div>
        <p class="text-xs min-h-[1rem]" data-role="status"></p>
        <details class="mt-3">
            <summary class="text-xs text-tandem-blue cursor-pointer select-none">Show code</summary>
            <div class="mt-2">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-dark-text-secondary font-mono">${esc(recipe.file)}</span>
                    <button class="lab-btn secondary" data-role="copy">Copy code</button>
                </div>
                <pre class="lab-code" data-role="code"></pre>
                <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2" data-role="apis"></div>
            </div>
        </details>`;

    // Controls
    const controlsEl = card.querySelector('[data-role="controls"]');
    const inputs = {};
    (recipe.controls ?? []).forEach(control => {
        const { row, input } = buildControl(recipe.id, control);
        inputs[control.id] = input;
        controlsEl.appendChild(row);
    });

    const readValues = () => Object.fromEntries(
        Object.entries(inputs).map(([id, input]) => [id, input.type === 'checkbox' ? input.checked : input.value])
    );

    // Run / Reset
    const statusEl = card.querySelector('[data-role="status"]');
    const runBtn = card.querySelector('[data-role="run"]');
    const setStatus = (text, level) => {
        statusEl.textContent = text;
        statusEl.style.color = level === 'error' ? '#f87171' : level === 'warn' ? '#fbbf24' : '#a0a0a0';
    };

    runBtn.addEventListener('click', async () => {
        runBtn.disabled = true;
        const { status, level } = await runRecipe(recipe, {
            viewer: getViewer(),
            facility: getCurrentFacility(),
            values: readValues(),
            selection: getAggregateSelection(),
        });
        setStatus(status, level);
        runBtn.disabled = false;
    });

    card.querySelector('[data-role="reset"]').addEventListener('click', () => {
        resetRecipe(recipe.id);
        setStatus('Reset.', 'ok');
    });

    // Code view: show the copy-ready functions exactly as written in the source file
    // (including their explanatory comments). function.toString() is the fallback.
    const codeEl = card.querySelector('[data-role="code"]');
    codeEl.textContent = recipe.code.map(fn => dedent(fn.toString())).join('\n\n');
    loadSnippetSource(recipe).then(source => { if (source) codeEl.textContent = source; });

    const copyBtn = card.querySelector('[data-role="copy"]');
    copyBtn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(codeEl.textContent);
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy code'; }, 1500);
    });

    // API links
    const apisEl = card.querySelector('[data-role="apis"]');
    (recipe.apis ?? []).forEach(api => {
        const a = document.createElement('a');
        a.href = api.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'text-xs text-tandem-blue hover:underline';
        a.textContent = `${api.name} ↗`;
        apisEl.appendChild(a);
    });

    return card;
}

function buildControl(recipeId, control) {
    const key = `${recipeId}:${control.id}`;
    const row = document.createElement('label');
    row.className = 'flex items-center justify-between gap-3 text-xs text-dark-text-secondary';

    const label = document.createElement('span');
    label.textContent = control.label;
    row.appendChild(label);

    let input;
    const value = savedValues[key] ?? control.default;

    if (control.type === 'select') {
        input = document.createElement('select');
        control.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            input.appendChild(o);
        });
        input.value = value;
        input.className = 'bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-dark-text';
    } else if (control.type === 'checkbox') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!value;
    } else {
        input = document.createElement('input');
        input.type = control.type;   // 'range' | 'color' | 'text'
        if (control.type === 'range') {
            input.min = control.min;
            input.max = control.max;
            input.step = control.step;
        }
        if (control.type === 'text') {
            input.className = 'bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-dark-text w-40';
        }
        input.value = value;
    }

    // Show the live value next to a slider
    const right = document.createElement('span');
    right.className = 'flex items-center gap-2';
    right.appendChild(input);
    if (control.type === 'range') {
        const readout = document.createElement('span');
        readout.className = 'w-8 text-right text-dark-text';
        readout.textContent = input.value;
        input.addEventListener('input', () => { readout.textContent = input.value; });
        right.appendChild(readout);
    }
    row.appendChild(right);

    input.addEventListener('input', () => {
        savedValues[key] = input.type === 'checkbox' ? input.checked : input.value;
    });

    return { row, input };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sourceCache = new Map();   // file path -> Promise<string>

/**
 * Read the recipe's source file and cut out each copy-ready function together with
 * the comment block directly above it. By convention (see markers.js) a snippet is a
 * top-level function that ends with a "}" in column 0.
 * @returns {Promise<string|null>} null if anything looks unexpected
 */
async function loadSnippetSource(recipe) {
    try {
        if (!sourceCache.has(recipe.file)) {
            sourceCache.set(recipe.file, fetch(recipe.file).then(r => (r.ok ? r.text() : '')));
        }
        const file = await sourceCache.get(recipe.file);

        const parts = recipe.code.map(fn => {
            const start = file.search(new RegExp(`^(async )?function ${fn.name}\\(`, 'm'));
            if (start < 0) throw new Error(`function ${fn.name} not found`);

            const end = file.indexOf('\n}\n', start) + 2;
            let from = start;

            // Include a doc comment that sits directly above the function
            const before = file.slice(0, start);
            const docEnd = before.lastIndexOf('*/');
            if (docEnd >= 0 && before.slice(docEnd + 2).trim() === '') {
                from = before.lastIndexOf('/**', docEnd);
            }
            return file.slice(from, end);
        });
        return parts.join('\n\n');
    } catch (error) {
        console.warn('Lab: could not read snippet source, showing function.toString()', error);
        return null;
    }
}

/** Remove the common leading indentation so snippets display flush-left. */
function dedent(source) {
    const lines = source.split('\n');
    const indents = lines.slice(1)
        .filter(line => line.trim())
        .map(line => line.match(/^\s*/)[0].length);
    const strip = indents.length ? Math.min(...indents) : 0;

    return [lines[0], ...lines.slice(1).map(line => line.slice(strip))].join('\n');
}

function esc(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
