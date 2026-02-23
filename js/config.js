/**
 * Environment Configuration
 * 
 * Configure your APS Client ID and environment settings here.
 * The app will automatically detect GitHub Pages deployment.
 */

const stgEnvironment = {
    name: 'stg',
    apsHost: 'https://developer-stg.api.autodesk.com',
    apsKey: 'YOUR_APS_CLIENT_ID', // TODO: Replace with your APS Key to develop locally
    loginRedirect: 'http://localhost:8000',
    tandemBaseURL: 'https://tandem-stg.autodesk.com/api/v1',
    dtLmvEnv: 'DtStaging'
};

const prodEnvironment = {
    name: 'prod',
    apsHost: 'https://developer.api.autodesk.com',
    apsKey: 'tvyaGMqCOud2PA96T0vpw5fIeZFnYXSIwSjjnE3AmGjUiTFu', // Safe to commit - PKCE flow, no secret needed
    loginRedirect: 'http://localhost:8000',
    tandemBaseURL: 'https://developer.api.autodesk.com/tandem/v1',
    dtLmvEnv: 'DtProduction'
};

const githubPagesEnvironment = {
    name: 'githubPages',
    apsHost: 'https://developer.api.autodesk.com',
    apsKey: 'tvyaGMqCOud2PA96T0vpw5fIeZFnYXSIwSjjnE3AmGjUiTFu', // Do not replace, this is for deployed version
    loginRedirect: '', // Will be set dynamically
    tandemBaseURL: 'https://developer.api.autodesk.com/tandem/v1',
    dtLmvEnv: 'DtProduction'
};

/**
 * Get the current environment configuration
 * Automatically detects GitHub Pages deployment
 */
export function getEnv() {
    if (window.location.hostname.includes('github.io')) {
        githubPagesEnvironment.loginRedirect = window.location.origin + window.location.pathname.replace(/\/$/, '');
        return githubPagesEnvironment;
    }
    
    // Default to production for local development
    return prodEnvironment;
    // return stgEnvironment; // Uncomment for staging
}

