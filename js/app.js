/**
 * Main Application Entry Point
 * 
 * Orchestrates authentication, viewer initialization, account/facility selection,
 * and STUB function UI rendering.
 */

import { login, logout, checkLogin, isLoggedIn } from './auth.js';
import { initLMV, startViewer, getDtApp, setCurrentFacility } from './viewer.js';
import { SchemaVersion } from '../tandem/constants.js';
import { renderStubs } from './ui/stubUI.js';
import { clearSchemaCache } from './state/schemaCache.js';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userProfileImg = document.getElementById('userProfileImg');
const userProfileLink = document.getElementById('userProfileLink');
const accountSelect = document.getElementById('accountSelect');
const facilitySelect = document.getElementById('facilitySelect');
const accountSelectWrapper = document.getElementById('accountSelectWrapper');
const facilitySelectWrapper = document.getElementById('facilitySelectWrapper');
const viewerContainer = document.getElementById('viewerContainer');
const stubsContainer = document.getElementById('stubsContainer');
const dashboardContent = document.getElementById('dashboardContent');
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingOverlay = document.getElementById('loadingOverlay');

// State
let teams = [];
let currentViewer = null;
let currentApp = null;
let lastLoadedFacility = null;
let lastLoadedFacilityId = null;

/**
 * Toggle loading overlay visibility
 */
function toggleLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.classList.toggle('hidden', !show);
    }
}

/**
 * Update UI based on login state
 */
function updateUIForLoginState(loggedIn, userInfo) {
    if (loggedIn) {
        loginBtn?.classList.add('hidden');
        logoutBtn?.classList.remove('hidden');
        welcomeMessage?.classList.add('hidden');
        dashboardContent?.classList.remove('hidden');
        
        if (userInfo?.picture && userProfileImg) {
            userProfileImg.src = userInfo.picture;
            userProfileLink?.classList.remove('hidden');
        }
        
        accountSelectWrapper?.classList.remove('hidden');
        facilitySelectWrapper?.classList.remove('hidden');
        accountSelect?.classList.remove('hidden');
        facilitySelect?.classList.remove('hidden');
    } else {
        loginBtn?.classList.remove('hidden');
        logoutBtn?.classList.add('hidden');
        userProfileLink?.classList.add('hidden');
        welcomeMessage?.classList.remove('hidden');
        dashboardContent?.classList.add('hidden');
        accountSelectWrapper?.classList.add('hidden');
        facilitySelectWrapper?.classList.add('hidden');
    }
}

/**
 * Show a modal dialog for schema version incompatibility
 */
function showSchemaWarningModal(facilityName, schemaVersion) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    backdrop.id = 'schema-warning-modal';
    
    const modal = document.createElement('div');
    modal.className = 'bg-dark-card border border-dark-border rounded-lg p-6 max-w-md mx-4 shadow-xl';
    modal.innerHTML = `
        <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-dark-text mb-2">Incompatible Schema Version</h3>
                <p class="text-dark-text-secondary text-sm mb-4">
                    The facility "<span class="text-dark-text font-medium">${facilityName}</span>" uses schema version ${schemaVersion}, 
                    but this application requires version ${SchemaVersion} or higher.
                </p>
                <p class="text-dark-text-secondary text-sm mb-4">
                    Please open this facility in <a href="https://tandem.autodesk.com" target="_blank" class="text-tandem-blue hover:underline">Autodesk Tandem</a> to upgrade it.
                </p>
                <button id="schema-warning-ok-btn" class="w-full bg-tandem-blue hover:bg-tandem-blue-dark text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                    OK
                </button>
            </div>
        </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    // Close on button click
    document.getElementById('schema-warning-ok-btn').addEventListener('click', () => {
        backdrop.remove();
    });
    
    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            backdrop.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/**
 * Try to load the next compatible facility in the list
 */
function tryNextCompatibleFacility(skipFacilityId) {
    if (!facilitySelect) return;
    
    const options = Array.from(facilitySelect.options);
    for (const option of options) {
        if (option.value && option.value !== skipFacilityId) {
            facilitySelect.value = option.value;
            facilitySelect.dispatchEvent(new Event('change'));
            return;
        }
    }
    
    // No other facilities available
    console.warn('No compatible facilities available');
}


/**
 * Populate the accounts dropdown
 */
async function populateAccountsDropdown() {
    if (!accountSelect) return;
    
    accountSelect.innerHTML = '<option value="">Loading accounts...</option>';
    
    try {
        teams = await currentApp.getTeams();
        console.log('Teams loaded:', teams);
        
        // Load facilities for each team
        for (const team of teams) {
            await team.getFacilities();
        }
        
        // Get facilities shared directly with user
        const sharedFacilities = await currentApp.getSharedFacilities();
        if (sharedFacilities && sharedFacilities.length > 0) {
            const sharedTeam = {
                app: currentApp,
                name: '** SHARED DIRECTLY **',
                facilities: sharedFacilities
            };
            teams.push(sharedTeam);
        }
        
        // Sort teams alphabetically (except SHARED DIRECTLY)
        const sortedTeams = [...teams].sort((a, b) => {
            if (a.name === '** SHARED DIRECTLY **') return 1;
            if (b.name === '** SHARED DIRECTLY **') return -1;
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
        
        // Check if user has any access
        const hasAccess = sortedTeams.some(t => t.facilities && t.facilities.length > 0);
        if (!hasAccess) {
            accountSelect.innerHTML = '<option value="">No facilities available</option>';
            Autodesk.Viewing.Private.AlertBox.displayError(
                currentViewer.container,
                'Make sure you have access to at least one facility in Autodesk Tandem.',
                'No Facilities Found',
                'img-item-not-found'
            );
            return;
        }
        
        // Build dropdown
        accountSelect.innerHTML = '<option value="">Select Account...</option>';
        
        const preferredTeam = window.localStorage.getItem('tandem-emb-viewer-ai-last-team');
        
        sortedTeams.forEach(team => {
            if (team.facilities && team.facilities.length > 0) {
                const option = document.createElement('option');
                option.value = team.name;
                option.textContent = team.name;
                option.selected = team.name === preferredTeam;
                accountSelect.appendChild(option);
            }
        });
        
        // Set initial selection
        const selectedTeamName = preferredTeam && sortedTeams.find(t => t.name === preferredTeam)
            ? preferredTeam
            : sortedTeams.find(t => t.facilities?.length > 0)?.name;
        
        if (selectedTeamName) {
            accountSelect.value = selectedTeamName;
            await populateFacilitiesDropdown(selectedTeamName);
        }
        
    } catch (error) {
        console.error('Error loading accounts:', error);
        accountSelect.innerHTML = '<option value="">Error loading accounts</option>';
    }
}

/**
 * Populate the facilities dropdown for a given team
 */
async function populateFacilitiesDropdown(teamName) {
    if (!facilitySelect) return;
    
    const team = teams.find(t => t.name === teamName);
    if (!team || !team.facilities || team.facilities.length === 0) {
        facilitySelect.innerHTML = '<option value="">No facilities</option>';
        return;
    }
    
    // Load facility settings if needed
    await Promise.all(team.facilities.map(f => f.load?.() || Promise.resolve()));
    
    // Sort facilities alphabetically
    const sortedFacilities = [...team.facilities].sort((a, b) => {
        const nameA = a.settings?.props?.['Identity Data']?.['Building Name'] || 'Unnamed';
        const nameB = b.settings?.props?.['Identity Data']?.['Building Name'] || 'Unnamed';
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
    
    facilitySelect.innerHTML = '';
    
    const preferredFacility = window.localStorage.getItem('tandem-emb-viewer-ai-last-facility');
    
    sortedFacilities.forEach(facility => {
        const name = facility.settings?.props?.['Identity Data']?.['Building Name'] || 'Unnamed Facility';
        const option = document.createElement('option');
        option.value = facility.twinId;
        option.textContent = name;
        option.selected = facility.twinId === preferredFacility;
        facilitySelect.appendChild(option);
    });
    
    // Load initial facility
    const selectedFacility = sortedFacilities.find(f => f.twinId === preferredFacility) || sortedFacilities[0];
    if (selectedFacility) {
        await loadFacility(selectedFacility);
    }
}

/**
 * Load a facility into the viewer
 */
async function loadFacility(facility) {
    const facilityName = facility.settings?.props?.['Identity Data']?.['Building Name'] || 'Unnamed Facility';
    
    // Check schema version BEFORE loading
    // Ensure settings are loaded
    if (!facility.settings || facility.settings.schemaVersion === undefined) {
        toggleLoading(true);
        try {
            await facility.load();
        } catch (error) {
            console.error('Error loading facility settings:', error);
            toggleLoading(false);
            return;
        }
        toggleLoading(false);
    }
    
    const schemaVersion = facility.settings?.schemaVersion;
    
    if (schemaVersion !== undefined && schemaVersion < SchemaVersion) {
        console.warn(`Facility "${facilityName}" has incompatible schema version ${schemaVersion} (required: ${SchemaVersion})`);
        
        // Show modal warning
        showSchemaWarningModal(facilityName, schemaVersion);
        
        // Revert dropdown to last loaded facility or try next
        if (lastLoadedFacilityId && facilitySelect) {
            facilitySelect.value = lastLoadedFacilityId;
        } else {
            // First load - try next compatible facility
            tryNextCompatibleFacility(facility.twinId);
        }
        return;
    }
    
    toggleLoading(true);
    
    try {
        // Clear schema cache when switching facilities
        clearSchemaCache();
        
        window.localStorage.setItem('tandem-emb-viewer-ai-last-facility', facility.twinId);
        
        await currentApp.displayFacility(facility, false, currentViewer);
        console.log('Facility loaded:', facilityName);
        
        // Track successfully loaded facility
        lastLoadedFacility = facility;
        lastLoadedFacilityId = facility.twinId;
        
        // Store current facility for stub functions
        setCurrentFacility(facility);
        
        // Render stub function UI (schemas loaded lazily when needed)
        await renderStubs(stubsContainer, facility);
        
    } catch (error) {
        console.error('Error loading facility:', error);
        
        // Revert dropdown on error
        if (lastLoadedFacilityId && facilitySelect) {
            facilitySelect.value = lastLoadedFacilityId;
        }
    } finally {
        toggleLoading(false);
    }
}

/**
 * Initialize the application
 */
async function init() {
    // Set up login/logout handlers
    loginBtn?.addEventListener('click', login);
    logoutBtn?.addEventListener('click', logout);
    
    // Check login state
    const userInfo = await checkLogin();
    updateUIForLoginState(!!userInfo, userInfo);
    
    if (!userInfo) {
        return;
    }
    
    toggleLoading(true);
    
    try {
        // Initialize LMV
        await initLMV();
        
        // Start viewer
        currentViewer = startViewer(viewerContainer);
        console.log('Tandem Viewer initialized');
        
        // Initialize DtApp
        currentApp = new Autodesk.Tandem.DtApp();
        window.DT_APP = currentApp;
        
        // Set up account/facility selection handlers
        accountSelect?.addEventListener('change', async (e) => {
            const teamName = e.target.value;
            if (teamName) {
                window.localStorage.setItem('tandem-emb-viewer-ai-last-team', teamName);
                await populateFacilitiesDropdown(teamName);
            }
        });
        
        facilitySelect?.addEventListener('change', async (e) => {
            const facilityId = e.target.value;
            const teamName = accountSelect?.value;
            const team = teams.find(t => t.name === teamName);
            const facility = team?.facilities?.find(f => f.twinId === facilityId);
            
            if (facility) {
                await loadFacility(facility);
            }
        });
        
        // Populate accounts dropdown
        await populateAccountsDropdown();
        
    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        toggleLoading(false);
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for use by stub modules
export { getDtApp, currentViewer };

