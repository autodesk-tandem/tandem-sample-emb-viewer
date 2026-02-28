/**
 * Stub UI Module
 * 
 * Renders stub function categories and buttons using dropdown menus.
 * Matches the styling of tandem-sample-rest-testbed-ai.
 * 
 * Stub functions are organized in the same order as the original
 * tandem-sample-emb-viewer project.
 */

import * as facilityStubs from '../stubs/facilityStubs.js';
import * as viewerStubs from '../stubs/viewerStubs.js';
import * as modelStubs from '../stubs/modelStubs.js';
import * as propertyStubs from '../stubs/propertyStubs.js';
import * as streamStubs from '../stubs/streamStubs.js';
import * as documentStubs from '../stubs/documentStubs.js';
import * as eventStubs from '../stubs/eventStubs.js';
import { areSchemasLoaded, getUniqueCategoryNames, getUniquePropertyNames, ensureSchemasLoaded, getPropertyMeta, isNumericType, isBooleanType } from '../state/schemaCache.js';

// Store last used input values for convenience
const lastInputValues = {};

function getLastInputValue(key, defaultValue) {
    return lastInputValues[key] ?? defaultValue;
}

function setLastInputValue(key, value) {
    lastInputValues[key] = value;
}

/**
 * Create a type-aware value input that adapts based on the selected property's dataType
 * Shows: text input for strings, number input for numeric, select for boolean
 * 
 * @param {HTMLElement} form - The parent form element
 * @param {string} categoryInputId - Base ID of the category input element (without index)
 * @param {string} propertyInputId - Base ID of the property input element (without index)
 * @param {number} index - Form index for unique IDs
 * @returns {Object} Object with container, getValue, validate methods
 */
function createTypeAwareValueInput(form, categoryInputId, propertyInputId, index) {
    const container = document.createElement('div');
    container.style.marginTop = '0.5rem';
    
    const label = document.createElement('label');
    label.textContent = 'Property Value';
    label.style.display = 'block';
    label.style.fontSize = '0.7rem';
    label.style.color = '#a0a0a0';
    label.style.marginBottom = '0.25rem';
    container.appendChild(label);
    
    const inputWrapper = document.createElement('div');
    inputWrapper.id = `propValWrapper-${index}`;
    container.appendChild(inputWrapper);
    
    // Type indicator
    const typeIndicator = document.createElement('div');
    typeIndicator.style.fontSize = '0.65rem';
    typeIndicator.style.color = '#6b7280';
    typeIndicator.style.marginTop = '0.25rem';
    typeIndicator.textContent = '';
    container.appendChild(typeIndicator);
    
    let currentInputType = 'text';
    
    // Build the full IDs with index suffix (matching createAutocompleteSelect)
    const fullCategoryId = `${categoryInputId}-${index}`;
    const fullPropertyId = `${propertyInputId}-${index}`;
    
    // Create initial text input
    const createTextInput = (placeholder = 'Select a property first...') => {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `propVal-${index}`;
        input.placeholder = placeholder;
        input.style.width = '100%';
        input.style.padding = '0.375rem 0.5rem';
        input.style.background = '#2a2a2a';
        input.style.border = '1px solid #404040';
        input.style.borderRadius = '0.25rem';
        input.style.color = '#e0e0e0';
        input.style.fontSize = '0.75rem';
        return input;
    };
    
    const createNumberInput = (isInteger) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `propVal-${index}`;
        input.placeholder = 'Enter a number...';
        input.step = isInteger ? '1' : 'any';
        input.style.width = '100%';
        input.style.padding = '0.375rem 0.5rem';
        input.style.background = '#2a2a2a';
        input.style.border = '1px solid #404040';
        input.style.borderRadius = '0.25rem';
        input.style.color = '#e0e0e0';
        input.style.fontSize = '0.75rem';
        return input;
    };
    
    const createBooleanSelect = () => {
        const select = document.createElement('select');
        select.id = `propVal-${index}`;
        select.style.width = '100%';
        select.style.padding = '0.375rem 0.5rem';
        select.style.background = '#2a2a2a';
        select.style.border = '1px solid #404040';
        select.style.borderRadius = '0.25rem';
        select.style.color = '#e0e0e0';
        select.style.fontSize = '0.75rem';
        
        const optTrue = document.createElement('option');
        optTrue.value = 'true';
        optTrue.textContent = 'True';
        select.appendChild(optTrue);
        
        const optFalse = document.createElement('option');
        optFalse.value = 'false';
        optFalse.textContent = 'False';
        select.appendChild(optFalse);
        
        return select;
    };
    
    // Initialize with text input
    inputWrapper.appendChild(createTextInput());
    
    // Function to update input type based on property
    const updateInputForProperty = () => {
        // Find inputs using the full ID with index suffix
        const categoryInput = form.querySelector(`#${fullCategoryId}`);
        const propertyInput = form.querySelector(`#${fullPropertyId}`);
        
        if (!categoryInput || !propertyInput) {
            console.warn('Could not find category or property inputs:', fullCategoryId, fullPropertyId);
            return;
        }
        
        const category = categoryInput.value;
        const propName = propertyInput.value;
        
        if (!category || !propName) {
            typeIndicator.textContent = '';
            return;
        }
        
        const meta = getPropertyMeta(category, propName);
        inputWrapper.innerHTML = '';
        
        if (meta && isBooleanType(meta.dataType)) {
            inputWrapper.appendChild(createBooleanSelect());
            typeIndicator.textContent = 'Boolean property - select True or False';
            typeIndicator.style.color = '#10b981';
            currentInputType = 'boolean';
        } else if (meta && isNumericType(meta.dataType)) {
            const isInteger = meta.dataType === 2; // Integer type
            inputWrapper.appendChild(createNumberInput(isInteger));
            typeIndicator.textContent = `${meta.dataTypeName} property - enter a number`;
            typeIndicator.style.color = '#3b82f6';
            currentInputType = 'number';
        } else {
            const input = createTextInput('Enter text value...');
            inputWrapper.appendChild(input);
            if (meta) {
                typeIndicator.textContent = `${meta.dataTypeName} property`;
                typeIndicator.style.color = '#8b5cf6';
            } else {
                typeIndicator.textContent = 'Property not found in schema - using text input';
                typeIndicator.style.color = '#f59e0b';
            }
            currentInputType = 'text';
        }
    };
    
    // Listen for changes on category and property inputs (using event delegation with full IDs)
    form.addEventListener('change', (e) => {
        if (e.target.id === fullCategoryId || e.target.id === fullPropertyId) {
            updateInputForProperty();
        }
    });
    
    return {
        container,
        getValue: () => {
            const input = inputWrapper.querySelector(`#propVal-${index}`);
            return input ? input.value : '';
        },
        getInputType: () => currentInputType,
        updateInputForProperty
    };
}

/**
 * Create an autocomplete select dropdown for category or property names
 */
function createAutocompleteSelect(field, inputForm, index) {
    const select = document.createElement('select');
    select.id = `${field.id}-${index}`;
    select.style.width = '100%';
    select.style.padding = '0.375rem 0.5rem';
    select.style.background = '#2a2a2a';
    select.style.border = '1px solid #404040';
    select.style.borderRadius = '0.25rem';
    select.style.color = '#e0e0e0';
    select.style.fontSize = '0.75rem';
    select.style.fontFamily = "'Courier New', monospace";
    
    let options = [];
    if (field.autocomplete === 'category') {
        options = getUniqueCategoryNames();
    } else if (field.autocomplete === 'property') {
        // Get properties filtered by current category selection
        const categoryInput = inputForm.querySelector(`[id^="category-"]`);
        const categoryFilter = categoryInput ? categoryInput.value : null;
        options = getUniquePropertyNames(categoryFilter);
    }
    
    // Add options
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
    
    // Set default value from last used or first option
    const lastUsed = getLastInputValue(field.id, '');
    if (lastUsed && options.includes(lastUsed)) {
        select.value = lastUsed;
    } else if (options.length > 0) {
        select.value = options[0];
    }
    
    // For property dropdown, update when category changes
    if (field.autocomplete === 'property') {
        const categoryInput = inputForm.querySelector(`[id^="category-"]`);
        if (categoryInput) {
            categoryInput.addEventListener('change', () => {
                const newOptions = getUniquePropertyNames(categoryInput.value || null);
                select.innerHTML = '';
                
                newOptions.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    select.appendChild(option);
                });
                
                // Try to keep previous selection or select first
                const lastUsedProp = getLastInputValue(field.id, '');
                if (lastUsedProp && newOptions.includes(lastUsedProp)) {
                    select.value = lastUsedProp;
                } else if (newOptions.length > 0) {
                    select.value = newOptions[0];
                }
            });
        }
    }
    
    // Save value on change
    select.addEventListener('change', () => {
        setLastInputValue(field.id, select.value);
    });
    
    return select;
}

/**
 * Create a dropdown menu with STUB functions
 */
function createDropdownMenu(title, items) {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    
    const toggle = document.createElement('button');
    toggle.className = 'dropdown-toggle';
    toggle.innerHTML = `
        <span>${title}</span>
        <svg class="dropdown-toggle-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
    `;
    
    const content = document.createElement('div');
    content.className = 'dropdown-content';
    
    items.forEach((item, index) => {
        if (item.hasInput && item.inputConfig) {
            const itemContainer = document.createElement('div');
            
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.textContent = item.label;
            button.title = item.description || item.label;
            
            // Create form lazily on first click
            let inputForm = null;
            let formCreated = false;
            
            button.addEventListener('click', async () => {
                // Load schemas lazily if any field needs autocomplete
                const needsAutocomplete = item.inputConfig.fields.some(f => f.autocomplete);
                if (needsAutocomplete && !areSchemasLoaded()) {
                    button.textContent = `${item.label} (loading...)`;
                    await ensureSchemasLoaded();
                    button.textContent = item.label;
                }
                
                // Create form on first click (so schemas are loaded)
                if (!formCreated) {
                    inputForm = createInputForm(item.inputConfig, index);
                    itemContainer.appendChild(inputForm);
                    formCreated = true;
                }
                
                inputForm.classList.toggle('hidden');
            });
            
            itemContainer.appendChild(button);
            content.appendChild(itemContainer);
        } else {
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.textContent = item.label;
            button.title = item.description || item.label;
            
            button.addEventListener('click', async () => {
                button.disabled = true;
                const originalText = button.textContent;
                button.textContent = `${originalText} (running...)`;
                
                try {
                    await item.action();
                } catch (error) {
                    console.error(`Error in ${item.label}:`, error);
                }
                
                button.disabled = false;
                button.textContent = originalText;
            });
            
            content.appendChild(button);
        }
    });
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        content.classList.toggle('show');
    });
    
    dropdown.appendChild(toggle);
    dropdown.appendChild(content);
    
    return dropdown;
}

/**
 * Create an input form for stub functions that need parameters
 */
function createInputForm(config, index) {
    const form = document.createElement('div');
    form.className = 'stub-input-form hidden';
    form.style.margin = '0.375rem';
    form.style.marginTop = '0';
    form.style.padding = '0.5rem';
    form.style.background = '#1a1a1a';
    form.style.border = '1px solid #404040';
    form.style.borderRadius = '0.25rem';
    
    const inputs = {};
    const typeAwareValueInputs = []; // Track type-aware value inputs for post-processing
    
    config.fields.forEach(field => {
        // Handle type-aware value input (adapts based on property dataType)
        if (field.type === 'typeAwareValue') {
            const typeAwareInput = createTypeAwareValueInput(form, field.categoryInputId, field.propertyInputId, index);
            form.appendChild(typeAwareInput.container);
            inputs[field.id] = { 
                getValue: typeAwareInput.getValue,
                getInputType: typeAwareInput.getInputType
            };
            typeAwareValueInputs.push(typeAwareInput);
            return; // Skip to next field
        }
        
        // Handle checkbox fields differently
        if (field.type === 'checkbox') {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.style.display = 'flex';
            checkboxWrapper.style.alignItems = 'center';
            checkboxWrapper.style.gap = '0.5rem';
            checkboxWrapper.style.marginTop = '0.5rem';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${field.id}-${index}`;
            checkbox.checked = field.defaultValue === true;
            checkbox.style.accentColor = '#0696D7';
            
            const label = document.createElement('label');
            label.textContent = field.label;
            label.htmlFor = checkbox.id;
            label.style.fontSize = '0.75rem';
            label.style.color = '#e0e0e0';
            label.style.cursor = 'pointer';
            
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            form.appendChild(checkboxWrapper);
            inputs[field.id] = checkbox;
        } else {
            // Standard label for non-checkbox fields
            const label = document.createElement('label');
            label.textContent = field.label;
            label.style.display = 'block';
            label.style.fontSize = '0.7rem';
            label.style.color = '#a0a0a0';
            label.style.marginBottom = '0.25rem';
            label.style.marginTop = '0.5rem';
            
            form.appendChild(label);
            
            // Use autocomplete select if schemas are loaded and field supports it
            if (field.autocomplete && areSchemasLoaded()) {
                const select = createAutocompleteSelect(field, form, index);
                form.appendChild(select);
                inputs[field.id] = select;
            } else {
                // Regular text input
                const input = document.createElement('input');
                input.type = field.type || 'text';
                input.id = `${field.id}-${index}`;
                input.placeholder = field.placeholder || '';
                input.value = getLastInputValue(field.id, field.defaultValue || '');
                input.style.width = '100%';
                input.style.padding = '0.375rem 0.5rem';
                input.style.background = '#2a2a2a';
                input.style.border = '1px solid #404040';
                input.style.borderRadius = '0.25rem';
                input.style.color = '#e0e0e0';
                input.style.fontSize = '0.75rem';
                input.style.fontFamily = "'Courier New', monospace";
                
                // Save value on change
                input.addEventListener('change', () => {
                    setLastInputValue(field.id, input.value);
                });
                
                form.appendChild(input);
                inputs[field.id] = input;
            }
        }
    });
    
    // Add type-aware search options if configured
    let typeAwareState = null;
    if (config.typeAwareOptions) {
        typeAwareState = { currentType: 'string' }; // Track current detected type
        
        // Container for type-aware options
        const optionsContainer = document.createElement('div');
        optionsContainer.id = `type-aware-options-${index}`;
        optionsContainer.style.marginTop = '0.75rem';
        optionsContainer.style.padding = '0.5rem';
        optionsContainer.style.background = '#1f1f1f';
        optionsContainer.style.border = '1px solid #404040';
        optionsContainer.style.borderRadius = '0.25rem';
        
        // Type indicator
        const typeIndicator = document.createElement('div');
        typeIndicator.id = `type-indicator-${index}`;
        typeIndicator.style.fontSize = '0.65rem';
        typeIndicator.style.color = '#6b7280';
        typeIndicator.style.marginBottom = '0.5rem';
        typeIndicator.textContent = 'Property type: String (default)';
        optionsContainer.appendChild(typeIndicator);
        
        // Value input (hidden for boolean)
        const valueLabel = document.createElement('label');
        valueLabel.textContent = 'Match Value';
        valueLabel.style.display = 'block';
        valueLabel.style.fontSize = '0.7rem';
        valueLabel.style.color = '#a0a0a0';
        valueLabel.style.marginBottom = '0.25rem';
        optionsContainer.appendChild(valueLabel);
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.id = `match-value-${index}`;
        valueInput.placeholder = 'e.g., Basic Wall or ^Concrete';
        valueInput.style.width = '100%';
        valueInput.style.padding = '0.375rem 0.5rem';
        valueInput.style.background = '#2a2a2a';
        valueInput.style.border = '1px solid #404040';
        valueInput.style.borderRadius = '0.25rem';
        valueInput.style.color = '#e0e0e0';
        valueInput.style.fontSize = '0.75rem';
        valueInput.style.fontFamily = "'Courier New', monospace";
        valueInput.style.marginBottom = '0.5rem';
        optionsContainer.appendChild(valueInput);
        inputs['matchValue'] = valueInput;
        
        // --- String Options Section ---
        const stringOptions = document.createElement('div');
        stringOptions.id = `string-options-${index}`;
        stringOptions.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <label style="font-size: 0.7rem; color: #a0a0a0; display: block; margin-bottom: 0.25rem;">Match Type</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="match-type-${index}" value="partial" checked style="accent-color: #0696D7; margin-right: 0.25rem;"> Partial
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="match-type-${index}" value="exact" style="accent-color: #0696D7; margin-right: 0.25rem;"> Exact
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="match-type-${index}" value="regex" style="accent-color: #0696D7; margin-right: 0.25rem;"> Regex
                    </label>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                    <input type="checkbox" id="case-insensitive-${index}" style="accent-color: #0696D7; margin-right: 0.25rem;"> Case Insensitive
                </label>
                <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                    <input type="checkbox" id="visible-only-${index}" style="accent-color: #0696D7; margin-right: 0.25rem;"> Visible Only
                </label>
            </div>
        `;
        optionsContainer.appendChild(stringOptions);
        
        // --- Numeric Options Section (hidden by default) ---
        const numericOptions = document.createElement('div');
        numericOptions.id = `numeric-options-${index}`;
        numericOptions.style.display = 'none';
        numericOptions.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <label style="font-size: 0.7rem; color: #a0a0a0; display: block; margin-bottom: 0.25rem;">Comparison Operator</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="numeric-op-${index}" value="=" checked style="accent-color: #0696D7; margin-right: 0.25rem;"> =
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="numeric-op-${index}" value="!=" style="accent-color: #0696D7; margin-right: 0.25rem;"> ≠
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="numeric-op-${index}" value=">" style="accent-color: #0696D7; margin-right: 0.25rem;"> >
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="numeric-op-${index}" value=">=" style="accent-color: #0696D7; margin-right: 0.25rem;"> ≥
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="numeric-op-${index}" value="<" style="accent-color: #0696D7; margin-right: 0.25rem;"> <
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="numeric-op-${index}" value="<=" style="accent-color: #0696D7; margin-right: 0.25rem;"> ≤
                    </label>
                </div>
            </div>
            <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                <input type="checkbox" id="numeric-visible-only-${index}" style="accent-color: #0696D7; margin-right: 0.25rem;"> Visible Only
            </label>
        `;
        optionsContainer.appendChild(numericOptions);
        
        // --- Boolean Options Section (hidden by default) ---
        const booleanOptions = document.createElement('div');
        booleanOptions.id = `boolean-options-${index}`;
        booleanOptions.style.display = 'none';
        booleanOptions.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <label style="font-size: 0.7rem; color: #a0a0a0; display: block; margin-bottom: 0.25rem;">Boolean Value</label>
                <div style="display: flex; gap: 1rem;">
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="boolean-val-${index}" value="true" checked style="accent-color: #0696D7; margin-right: 0.25rem;"> True
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                        <input type="radio" name="boolean-val-${index}" value="false" style="accent-color: #0696D7; margin-right: 0.25rem;"> False
                    </label>
                </div>
            </div>
            <label style="display: flex; align-items: center; cursor: pointer; font-size: 0.7rem; color: #e0e0e0;">
                <input type="checkbox" id="boolean-visible-only-${index}" style="accent-color: #0696D7; margin-right: 0.25rem;"> Visible Only
            </label>
        `;
        optionsContainer.appendChild(booleanOptions);
        
        // --- Regex Help Section (for strings) ---
        const regexHelp = document.createElement('div');
        regexHelp.id = `regex-help-${index}`;
        regexHelp.style.marginTop = '0.5rem';
        regexHelp.style.padding = '0.5rem';
        regexHelp.style.background = '#252525';
        regexHelp.style.border = '1px solid #404040';
        regexHelp.style.borderRadius = '0.25rem';
        regexHelp.style.fontSize = '0.65rem';
        regexHelp.innerHTML = `
            <div style="font-weight: bold; color: #9ca3af; margin-bottom: 0.25rem;">RegEx Pattern Examples:</div>
            <div style="font-family: monospace; color: #d1d5db; display: grid; grid-template-columns: auto 1fr; gap: 0.15rem 0.5rem;">
                <span style="color: #10b981;">Concrete</span><span>Contains "Concrete"</span>
                <span style="color: #10b981;">^Concrete</span><span>Starts with "Concrete"</span>
                <span style="color: #10b981;">Steel$</span><span>Ends with "Steel"</span>
                <span style="color: #10b981;">Concrete|Steel</span><span>"Concrete" OR "Steel"</span>
            </div>
        `;
        optionsContainer.appendChild(regexHelp);
        
        form.appendChild(optionsContainer);
        
        // Function to update UI based on detected property type
        const updateTypeAwareUI = () => {
            const category = inputs['category']?.value || '';
            const propName = inputs['propName']?.value || '';
            
            if (category && propName) {
                const meta = getPropertyMeta(category, propName);
                if (meta) {
                    const isNumeric = isNumericType(meta.dataType);
                    const isBoolean = isBooleanType(meta.dataType);
                    
                    typeIndicator.textContent = `Property type: ${meta.dataTypeName}`;
                    typeIndicator.style.color = '#10b981'; // Green for detected
                    
                    if (isBoolean) {
                        typeAwareState.currentType = 'boolean';
                        stringOptions.style.display = 'none';
                        numericOptions.style.display = 'none';
                        booleanOptions.style.display = 'block';
                        valueInput.style.display = 'none';
                        valueLabel.style.display = 'none';
                        regexHelp.style.display = 'none';
                    } else if (isNumeric) {
                        typeAwareState.currentType = 'numeric';
                        stringOptions.style.display = 'none';
                        numericOptions.style.display = 'block';
                        booleanOptions.style.display = 'none';
                        valueInput.style.display = 'block';
                        valueLabel.style.display = 'block';
                        valueInput.placeholder = 'e.g., 100 or 3.14';
                        regexHelp.style.display = 'none';
                    } else {
                        typeAwareState.currentType = 'string';
                        stringOptions.style.display = 'block';
                        numericOptions.style.display = 'none';
                        booleanOptions.style.display = 'none';
                        valueInput.style.display = 'block';
                        valueLabel.style.display = 'block';
                        valueInput.placeholder = 'e.g., Basic Wall or ^Concrete';
                        regexHelp.style.display = 'block';
                    }
                    return;
                }
            }
            
            // Default to string if property not found in schema
            typeIndicator.textContent = 'Property type: String (default)';
            typeIndicator.style.color = '#6b7280';
            typeAwareState.currentType = 'string';
            stringOptions.style.display = 'block';
            numericOptions.style.display = 'none';
            booleanOptions.style.display = 'none';
            valueInput.style.display = 'block';
            valueLabel.style.display = 'block';
            valueInput.placeholder = 'e.g., Basic Wall or ^Concrete';
            regexHelp.style.display = 'block';
        };
        
        // Listen for changes on category and property fields
        if (inputs['category']) {
            inputs['category'].addEventListener('change', updateTypeAwareUI);
            inputs['category'].addEventListener('input', updateTypeAwareUI);
        }
        if (inputs['propName']) {
            inputs['propName'].addEventListener('change', updateTypeAwareUI);
            inputs['propName'].addEventListener('input', updateTypeAwareUI);
        }
        
        // Store reference for value extraction
        typeAwareState.index = index;
    }
    
    // Add RegEx help panel if configured (for non-type-aware forms)
    if (config.showRegexHelp && !config.typeAwareOptions) {
        const helpSection = document.createElement('div');
        helpSection.style.marginTop = '0.75rem';
        helpSection.style.padding = '0.5rem';
        helpSection.style.background = '#252525';
        helpSection.style.border = '1px solid #404040';
        helpSection.style.borderRadius = '0.25rem';
        helpSection.style.fontSize = '0.7rem';
        
        const helpTitle = document.createElement('div');
        helpTitle.style.fontWeight = 'bold';
        helpTitle.style.marginBottom = '0.25rem';
        helpTitle.style.color = '#9ca3af';
        helpTitle.textContent = 'RegEx Pattern Examples:';
        
        const helpTable = document.createElement('div');
        helpTable.style.fontFamily = 'monospace';
        helpTable.style.color = '#d1d5db';
        helpTable.innerHTML = `
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 0.5rem; margin-top: 0.25rem;">
                <span style="color: #10b981;">Concrete</span>
                <span>Contains "Concrete" anywhere</span>
                <span style="color: #10b981;">^Concrete</span>
                <span>Starts with "Concrete"</span>
                <span style="color: #10b981;">Steel$</span>
                <span>Ends with "Steel"</span>
                <span style="color: #10b981;">Concrete.*Wall</span>
                <span>"Concrete" then "Wall"</span>
                <span style="color: #10b981;">Concrete|Steel</span>
                <span>"Concrete" OR "Steel"</span>
            </div>
            <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #404040; color: #9ca3af;">
                <strong>Tip:</strong> For exact match, uncheck "Is Javascript RegEx?"
            </div>
        `;
        
        helpSection.appendChild(helpTitle);
        helpSection.appendChild(helpTable);
        form.appendChild(helpSection);
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '0.375rem';
    buttonContainer.style.marginTop = '0.5rem';
    
    const executeBtn = document.createElement('button');
    executeBtn.textContent = 'Execute';
    executeBtn.style.flex = '1';
    executeBtn.style.padding = '0.375rem 0.75rem';
    executeBtn.style.background = '#0696D7';
    executeBtn.style.color = 'white';
    executeBtn.style.border = 'none';
    executeBtn.style.borderRadius = '0.25rem';
    executeBtn.style.fontSize = '0.75rem';
    executeBtn.style.cursor = 'pointer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.flex = '1';
    cancelBtn.style.padding = '0.375rem 0.75rem';
    cancelBtn.style.background = '#404040';
    cancelBtn.style.color = '#e0e0e0';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '0.25rem';
    cancelBtn.style.fontSize = '0.75rem';
    cancelBtn.style.cursor = 'pointer';
    
    executeBtn.addEventListener('click', async () => {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Running...';
        
        try {
            const values = {};
            Object.entries(inputs).forEach(([id, input]) => {
                // Handle type-aware value inputs (have getValue method)
                if (input && typeof input.getValue === 'function') {
                    values[id] = input.getValue();
                // Handle checkboxes differently
                } else if (input.type === 'checkbox') {
                    values[id] = input.checked;
                } else {
                    values[id] = input.value;
                }
            });

            
            // Build searchOptions for type-aware forms
            if (config.typeAwareOptions && typeAwareState) {
                const idx = typeAwareState.index;
                const currentType = typeAwareState.currentType;
                
                if (currentType === 'boolean') {
                    const boolVal = form.querySelector(`input[name="boolean-val-${idx}"]:checked`)?.value;
                    const visibleOnly = form.querySelector(`#boolean-visible-only-${idx}`)?.checked || false;
                    values.searchOptions = {
                        dataType: 'boolean',
                        value: boolVal === 'true',
                        visibleOnly: visibleOnly
                    };
                } else if (currentType === 'numeric') {
                    const operator = form.querySelector(`input[name="numeric-op-${idx}"]:checked`)?.value || '=';
                    const visibleOnly = form.querySelector(`#numeric-visible-only-${idx}`)?.checked || false;
                    values.searchOptions = {
                        dataType: 'numeric',
                        operator: operator,
                        value: parseFloat(values.matchValue),
                        visibleOnly: visibleOnly
                    };
                } else {
                    // String type
                    const matchType = form.querySelector(`input[name="match-type-${idx}"]:checked`)?.value || 'partial';
                    const caseInsensitive = form.querySelector(`#case-insensitive-${idx}`)?.checked || false;
                    const visibleOnly = form.querySelector(`#visible-only-${idx}`)?.checked || false;
                    values.searchOptions = {
                        dataType: 'string',
                        matchType: matchType,
                        caseInsensitive: caseInsensitive,
                        value: values.matchValue,
                        visibleOnly: visibleOnly
                    };
                }
            }
            
            await config.onExecute(values);
            form.classList.add('hidden');
        } catch (error) {
            console.error('Error executing stub:', error);
        } finally {
            executeBtn.disabled = false;
            executeBtn.textContent = 'Execute';
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        form.classList.add('hidden');
    });
    
    buttonContainer.appendChild(executeBtn);
    buttonContainer.appendChild(cancelBtn);
    form.appendChild(buttonContainer);
    
    // Initialize type-aware value inputs after form is fully built
    // Use setTimeout to ensure DOM is ready and selects have their initial values
    if (typeAwareValueInputs.length > 0) {
        setTimeout(() => {
            typeAwareValueInputs.forEach(input => {
                input.updateInputForProperty();
            });
        }, 0);
    }
    
    return form;
}

/**
 * Render all stub categories as dropdown menus
 * Order matches the original tandem-sample-emb-viewer project
 */
export async function renderStubs(container, facility) {
    if (!container) return;
    
    container.innerHTML = '';
    
    // 1. Facility Stubs (same order as original)
    const facilityDropdown = createDropdownMenu('Facility Stubs', [
        { label: 'Dump Facility Info', description: 'Display detailed facility information', action: facilityStubs.dumpFacilityInfo },
        { label: 'Dump App Info', description: 'Display DtApp object information', action: facilityStubs.dumpAppInfo },
        { label: 'Dump DT Constants', description: 'Display Tandem SDK constants', action: facilityStubs.dumpDtConstants },
        { label: 'Get Facility Usage Metrics', description: 'Get facility usage metrics', action: facilityStubs.getFacilityUsageMetrics },
        { label: 'Facility History', description: 'Get recent facility history (30 days)', action: facilityStubs.getFacilityHistory },
        { label: 'Trigger Asset Cleanup', description: 'Remove orphaned/ghost assets after model re-upload (irreversible)', action: facilityStubs.triggerAssetCleanup }
    ]);
    container.appendChild(facilityDropdown);
    
    // 2. Model Stubs (same order as original)
    const modelDropdown = createDropdownMenu('Model Stubs', [
        { label: 'Dump Model Info', description: 'Display detailed model information', action: modelStubs.dumpDtModelInfo },
        { label: 'Get Model History', description: 'Get model history (30 days)', action: modelStubs.getDtModelHistory },
        { label: 'Get Model Usage Metrics', description: 'Get model usage metrics', action: modelStubs.getDtModelUsageMetrics },
        { label: 'Get Levels', description: 'Get levels for all models', action: modelStubs.getLevels },
        {
            label: 'Isolate Level',
            description: 'Isolate a specific level',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'levelName', label: 'Level Name', placeholder: 'e.g., Level 1' }
                ],
                onExecute: (values) => modelStubs.isolateLevel(values.levelName)
            }
        },
        { label: 'Isolate Rooms', description: 'Isolate rooms in viewer', action: modelStubs.isolateRooms },
        { label: 'Show Elements In Room', description: 'Show elements in selected room', action: modelStubs.showElementsInRoom },
        { label: 'Get Rooms of Element', description: 'Get rooms for selected element', action: modelStubs.getRoomsOfElement },
        { label: 'Get Element Classes', description: 'Get ufClass, customClass, tandemCategory for selection', action: modelStubs.getElementClasses },
        { label: 'Get Element Bounds', description: 'Get bounding boxes for selection', action: modelStubs.getElementBounds },
        { label: 'Isolate Tagged Assets', description: 'Isolate tagged assets', action: modelStubs.isolateTaggedAssets },
        { label: 'Isolate Un-Tagged Assets', description: 'Isolate un-tagged assets', action: modelStubs.isolateUnTaggedAssets },
        { label: 'Isolate Classified Assets', description: 'Isolate classified assets', action: modelStubs.isolateClassifiedAssets },
        { label: 'Isolate Un-Classified Assets', description: 'Isolate un-classified assets', action: modelStubs.isolateUnClassifiedAssets },
        {
            label: 'Element Ids --> Viewer Ids',
            description: 'Locate elements by external ID and isolate them in the viewer',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'elementKeys', label: 'Element IDs (comma-separated)', placeholder: 'e.g., QUFBQUE...,QUFBQUI...' }
                ],
                onExecute: (values) => modelStubs.externalIdsToDbIds(values.elementKeys)
            }
        },
        { label: 'Viewer Ids --> Element Ids', description: 'Convert selection to external IDs', action: modelStubs.dbIdsToExternalIds },
        { label: 'Query Elements', description: 'Query elements using model.query() with 3 progressive examples', action: modelStubs.queryElements },
        {
            label: 'Search Elements',
            description: 'Free-text search across property values using model.search()',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'searchText', label: 'Search Text', placeholder: 'e.g., Concrete, AHU-01, Level 2' }
                ],
                onExecute: (values) => modelStubs.searchElements(values.searchText)
            }
        }
    ]);
    container.appendChild(modelDropdown);
    
    // 3. Property Stubs (same order as original)
    const propertyDropdown = createDropdownMenu('Property Stubs', [
        {
            label: 'Get Qualified Prop Name',
            description: 'Look up qualified property name',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'category', label: 'Category Name', placeholder: 'e.g., Identity Data', autocomplete: 'category' },
                    { id: 'propName', label: 'Property Name', placeholder: 'e.g., Mark', autocomplete: 'property' }
                ],
                onExecute: (values) => propertyStubs.getQualifiedPropName(values.category, values.propName)
            }
        },
        { label: 'Get Properties', description: 'Get properties for selection', action: propertyStubs.getDtProperties },
        { label: 'Get Properties (with history)', description: 'Get properties with change history', action: propertyStubs.getDtPropertiesWithHistory },
        { label: 'Get Common Properties', description: 'Get common properties across selection', action: propertyStubs.getCommonDtProperties },
        {
            label: 'Get Property (selSet)',
            description: 'Get specific property for selection',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'category', label: 'Category Name', placeholder: 'e.g., Identity Data', autocomplete: 'category' },
                    { id: 'propName', label: 'Property Name', placeholder: 'e.g., Mark', autocomplete: 'property' }
                ],
                onExecute: (values) => propertyStubs.getPropertySelSet(values.category, values.propName)
            }
        },
        {
            label: 'Find Elements Where PropValue = X',
            description: 'Search for elements with property value (type-aware)',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'category', label: 'Category Name', placeholder: 'e.g., Identity Data', autocomplete: 'category' },
                    { id: 'propName', label: 'Property Name', placeholder: 'e.g., Mark', autocomplete: 'property' }
                ],
                // Type-aware options - form builder will show/hide based on property type
                typeAwareOptions: true,
                onExecute: (values) => propertyStubs.findElementsWherePropValueEqualsX(
                    values.category, 
                    values.propName, 
                    values.matchValue,
                    values.searchOptions
                )
            }
        },
        {
            label: 'Set Property (selSet)',
            description: 'Set property value for selection',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'category', label: 'Category Name', placeholder: 'e.g., Identity Data', autocomplete: 'category' },
                    { id: 'propName', label: 'Property Name', placeholder: 'e.g., Mark', autocomplete: 'property' },
                    { id: 'propValue', type: 'typeAwareValue', categoryInputId: 'category', propertyInputId: 'propName' }
                ],
                onExecute: (values) => propertyStubs.setPropertySelSet(values.category, values.propName, values.propValue)
            }
        },
        {
            label: 'Assign Classification',
            description: 'Assign classification to selection',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'classification', label: 'Classification String', placeholder: 'e.g., 01 30 00' }
                ],
                onExecute: (values) => propertyStubs.assignClassification(values.classification)
            }
        }
    ]);
    container.appendChild(propertyDropdown);
    
    // 4. Document Stubs (same order as original)
    const documentDropdown = createDropdownMenu('Document Stubs', [
        { label: 'Get Facility Documents', description: 'Get all documents', action: documentStubs.getFacilityDocuments },
        {
            label: 'Get Document',
            description: 'Get document by URN',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'docURN', label: 'Document URN', placeholder: 'Enter document URN' }
                ],
                onExecute: (values) => documentStubs.getDocument(values.docURN)
            }
        },
        {
            label: 'Delete Document',
            description: 'Delete document by URN',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'docURN', label: 'Document URN', placeholder: 'Enter document URN' }
                ],
                onExecute: (values) => documentStubs.deleteDocument(values.docURN)
            }
        }
    ]);
    container.appendChild(documentDropdown);
    
    // 5. Event Stubs (same order as original)
    const eventDropdown = createDropdownMenu('Event Stubs', [
        { label: 'Add Event Listeners', description: 'Start trapping DtApp events', action: eventStubs.addEventListeners },
        { label: 'Remove Event Listeners', description: 'Stop trapping events', action: eventStubs.removeEventListeners }
    ]);
    container.appendChild(eventDropdown);
    
    // 6. Stream Stubs (same order as original)
    const streamDropdown = createDropdownMenu('Stream Stubs', [
        { label: 'Dump Stream Manager', description: 'Display stream manager info', action: streamStubs.dumpStreamManager },
        { label: 'Get Stream IDs', description: 'Get all stream IDs and keys', action: streamStubs.getStreamIds },
        { label: 'Get Last Readings', description: 'Get last readings for all streams', action: streamStubs.getLastReadings },
        { label: 'Refresh Last Readings', description: 'Refresh stream cache', action: streamStubs.refreshStreamsLastReadings },
        { label: 'Export Streams to JSON', description: 'Export stream data', action: streamStubs.exportStreamsToJson },
        { label: 'Get All Stream Infos', description: 'Get detailed stream info', action: streamStubs.getAllStreamInfos },
        { label: 'Get All Stream Infos from Cache', description: 'Get cached stream info', action: streamStubs.getAllStreamInfosFromCache },
        { label: 'Get All Connected Attributes', description: 'Get all connected attributes', action: streamStubs.getAllConnectedAttributes },
        { label: 'Get Attribute Candidates', description: 'Get attribute candidates for streams', action: streamStubs.getAttributeCandidates },
        {
            label: 'Get Stream Secrets',
            description: 'Get secrets for streams',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'streamKeys', label: 'Stream Keys (comma-separated)', placeholder: 'e.g., key1,key2' }
                ],
                onExecute: (values) => streamStubs.getStreamSecrets(values.streamKeys)
            }
        },
        {
            label: 'Reset Stream Secrets',
            description: 'Reset secrets for streams',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'streamKeys', label: 'Stream Keys (comma-separated)', placeholder: 'e.g., key1,key2' }
                ],
                onExecute: (values) => streamStubs.resetStreamSecrets(values.streamKeys)
            }
        },
        { label: 'Get Stream Bulk Import Template', description: 'Get stream import schema', action: streamStubs.getStreamsBulkImportTemplate },
        {
            label: 'Create Stream',
            description: 'Create a new stream',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'streamName', label: 'Stream Name', placeholder: 'e.g., Temperature Sensor 1' }
                ],
                onExecute: (values) => streamStubs.createStream(values.streamName)
            }
        },
        // NOTE: createCalculatedStream is behind a feature flag — uncomment when available.
        // {
        //     label: 'Create Calculated Stream',
        //     description: 'Create a virtual stream fed by computation, not IoT hardware (select element to attach)',
        //     hasInput: true,
        //     inputConfig: {
        //         fields: [
        //             { id: 'streamName', label: 'Stream Name', placeholder: 'e.g., Computed Avg Temperature' }
        //         ],
        //         onExecute: (values) => streamStubs.createCalculatedStream(values.streamName)
        //     }
        // },
        {
            label: 'Delete Stream',
            description: 'Delete a stream by ID',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'streamId', label: 'Stream ID', placeholder: 'Enter stream ID' }
                ],
                onExecute: (values) => streamStubs.deleteStream(values.streamId)
            }
        },
        { label: 'Get Stream Ingestion URLs', description: 'Get stream ingestion URLs', action: streamStubs.getStreamIngestionUrls },
        { label: 'Get Thresholds', description: 'Get threshold settings', action: streamStubs.getThresholds },
        { label: 'Get Latest Reading', description: 'Get most recent value for every stream (no parameters needed)', action: streamStubs.getLatestReading },
        { label: 'Get Last Readings With Alerts', description: 'Get latest values + alert states (Normal/Warning/Alert/Offline) for all streams', action: streamStubs.getLastReadingsWithAlerts }
    ]);
    container.appendChild(streamDropdown);
    
    // 7. Viewer Stubs (same order as original)
    const viewerDropdown = createDropdownMenu('Viewer Stubs', [
        { label: 'Add Sprites (to SelSet)', description: 'Add sprites to selection', action: viewerStubs.addSprites },
        { label: 'Remove Sprites', description: 'Remove all sprites', action: viewerStubs.removeSprites },
        { label: 'Get Current Selection', description: 'Get currently selected elements', action: viewerStubs.getCurrentSelection },
        { label: 'Isolate Current Selection', description: 'Isolate currently selected elements', action: viewerStubs.isolateSelection },
        { label: 'Focus / FitToView', description: 'Zoom to fit current selection', action: viewerStubs.focusSelection },
        { label: 'Show all objects', description: 'Show all objects in the model', action: viewerStubs.showAllObjects },
        { label: 'Get All Elements', description: 'Get all elements in facility', action: viewerStubs.getAllElements },
        { label: 'Get All Visible Elements', description: 'Get currently visible element IDs', action: viewerStubs.getVisibleDbIds },
        { label: 'Select All Visible Elements', description: 'Select all visible elements', action: viewerStubs.selectAllVisibleElements },
        { label: 'Hide Model', description: 'Hide the primary model', action: viewerStubs.hideModel },
        { label: 'Show Model', description: 'Show the primary model', action: viewerStubs.showModel },
        { label: 'Scrape Geometry', description: 'Export geometry as OBJ', action: viewerStubs.scrapeGeometry },
        { label: 'Set Theme Color (SelSet)', description: 'Apply color to selection', action: viewerStubs.setThemeColor },
        { label: 'Unset Theme Color (SelSet)', description: 'Remove color from selection', action: viewerStubs.unsetThemeColor },
        { label: 'Clear All Theming', description: 'Clear all color theming', action: viewerStubs.clearAllTheming },
        { label: 'Get Saved Views', description: 'List all saved views', action: viewerStubs.getSavedViews },
        {
            label: 'Go To Saved View',
            description: 'Restore a saved view',
            hasInput: true,
            inputConfig: {
                fields: [
                    { id: 'viewName', label: 'View Name', placeholder: 'Enter view name' }
                ],
                onExecute: (values) => viewerStubs.gotoSavedView(values.viewName)
            }
        }
    ]);
    container.appendChild(viewerDropdown);
    
    // Help message
    const helpDiv = document.createElement('div');
    helpDiv.className = 'mt-4 p-3 bg-dark-bg border border-dark-border rounded text-xs text-dark-text-secondary';
    helpDiv.innerHTML = `
        <strong class="text-dark-text">Developer Tips:</strong><br>
        - Open Chrome DevTools (F12) to see output<br>
        - Click dropdown menus to see available functions<br>
        - Select elements in viewer, then use Property/Model stubs<br>
        - All responses logged to console with details
    `;
    container.appendChild(helpDiv);
}

// Make renderStubs available globally for app.js
window.renderStubs = renderStubs;
