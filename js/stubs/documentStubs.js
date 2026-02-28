/**
 * Document Stub Functions
 * 
 * Demonstrates Tandem SDK document-related operations.
 * Output goes to the browser console.
 */

import { getCurrentFacility } from '../viewer.js';

/**
 * Get all documents attached to the facility
 */
export async function getFacilityDocuments() {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: getFacilityDocuments()');

    const docs = facility.settings.docs;
    console.table(docs);

    console.groupEnd();
}

/**
 * Get a specific document by URN
 */
export async function getDocument(docURN) {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: getDocument()');

    const doc = await facility.getDocument(docURN);
    console.log('Document', doc);

    console.groupEnd();
}

/**
 * Delete a document by URN
 */
export async function deleteDocument(docURN) {
    const facility = getCurrentFacility();
    if (!facility) {
        console.warn('No facility loaded');
        return;
    }

    console.group('STUB: deleteDocument()');

    // deleteDocument() requires ALManage access level on the server side -
    // calling it with lower access returns 403 Forbidden.
    if (!facility.canManage()) {
        console.log('(skipped - requires Manage or Owner access level)');
        console.groupEnd();
        return;
    }

    await facility.deleteDocument(docURN);
    console.log('Document deleted');

    console.groupEnd();
}

