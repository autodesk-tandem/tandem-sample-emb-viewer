/**
 * Viewer Module
 * 
 * Initializes and manages the Autodesk Tandem embedded viewer.
 * Handles viewer configuration, startup, and token integration.
 */

import { getEnv } from './config.js';
import { getAccessToken } from './auth.js';

// Module-level state for current facility
let currentFacility = null;

/**
 * Initialize the LMV (Large Model Viewer) environment
 * Must be called before creating a viewer instance
 */
export function initLMV() {
    return new Promise((resolve) => {
        Autodesk.Viewing.Initializer({
            env: getEnv().dtLmvEnv,
            api: 'dt',
            useCookie: false,
            useCredentials: true,
            shouldInitializeAuth: false,
            opt_out_tracking_by_default: true,
            productId: 'Digital Twins',
            corsWorker: true,
            config3d: {
                extensions: [
                    'Autodesk.BoxSelection',
                    'Autodesk.CompGeom'
                ],
                screenModeDelegate: Autodesk.Viewing.NullScreenModeDelegate,
            },
        }, function() {
            Autodesk.Viewing.Private.logger.setLevel(5);
            resolve();
        });
    });
}

/**
 * Create and start the viewer in the specified container
 * @param {HTMLElement} container - DOM element to host the viewer
 * @returns {Autodesk.Viewing.GuiViewer3D} The viewer instance
 */
export function startViewer(container) {
    const viewerElement = document.createElement('div');
    viewerElement.style.width = '100%';
    viewerElement.style.height = '100%';
    container.appendChild(viewerElement);
    
    const viewer = new Autodesk.Viewing.GuiViewer3D(viewerElement, {
        extensions: ['Autodesk.BoxSelection'],
        screenModeDelegate: Autodesk.Viewing.NullScreenModeDelegate,
        theme: 'dark-theme',
    });
    
    viewer.start();
    
    // Set authorization header for viewer requests
    Autodesk.Viewing.endpoint.HTTP_REQUEST_HEADERS['Authorization'] = 'Bearer ' + getAccessToken();
    
    // Store viewer globally for STUB functions
    window.viewer = viewer;
    window.NOP_VIEWER = viewer;
    
    return viewer;
}

/**
 * Get the current viewer instance
 */
export function getViewer() {
    return window.viewer || window.NOP_VIEWER;
}

/**
 * Get the current DtApp instance
 */
export function getDtApp() {
    return window.DT_APP;
}

/**
 * Get the currently loaded facility
 */
export function getCurrentFacility() {
    return currentFacility;
}

/**
 * Set the currently loaded facility
 * Called by app.js when a facility is loaded
 */
export function setCurrentFacility(facility) {
    currentFacility = facility;
}

