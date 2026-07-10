import apiClient from './client';

export const specialRequestKeys = {
    all: ['special-requests'],
    list: (filters) => ['special-requests', 'list', filters],
    assigned: () => ['special-requests', 'assigned'],
};

/**
 * Submit a special aid request (public / auth-optional)
 */
export async function submitSpecialRequest(requestData) {
    const { data } = await apiClient.post('/special-requests', requestData);
    return data;
}

/**
 * Get all special aid requests (admin)
 */
export async function getSpecialRequests(filters = {}) {
    const { data } = await apiClient.get('/special-requests', { params: filters });
    return data;
}

/**
 * Fetch special requests of the logged-in user
 */
export async function getMyRequests() {
    const { data } = await apiClient.get('/special-requests/my-requests');
    return data;
}

/**
 * Fetch special requests assigned to the logged-in researcher
 */
export async function getAssignedRequests() {
    const { data } = await apiClient.get('/special-requests/assigned');
    return data;
}

/**
 * Get details of a specific special request
 */
export async function getSpecialRequestById(id) {
    const { data } = await apiClient.get(`/special-requests/${id}`);
    return data;
}

/**
 * Assign a researcher to a request (admin)
 */
export async function assignResearcher(id, researcherId) {
    const { data } = await apiClient.patch(`/special-requests/${id}/assign`, { researcherId });
    return data;
}

/**
 * Upload a document to a case (user / researcher / admin)
 */
export async function uploadRequestDocument(id, docType, fileUrl) {
    const { data } = await apiClient.post(`/special-requests/${id}/documents`, { docType, fileUrl });
    return data;
}

/**
 * Submit a field report (researcher / admin)
 */
export async function submitFieldReport(id, reportData) {
    const { data } = await apiClient.post(`/special-requests/${id}/field-report`, reportData);
    return data;
}

/**
 * Update request status (admin)
 */
export async function updateSpecialRequestStatus(id, status, notes) {
    const { data } = await apiClient.patch(`/special-requests/${id}/status`, { status, notes });
    return data;
}

/**
 * Allocate aid for approved requests (admin)
 */
export async function allocateSpecialRequestAid(id, allocationData) {
    const { data } = await apiClient.patch(`/special-requests/${id}/allocate`, allocationData);
    return data;
}

/**
 * Set status to PENDING_DOCS (researcher / admin)
 */
export async function setPendingDocs(id) {
    const { data } = await apiClient.patch(`/special-requests/${id}/set-pending-docs`);
    return data;
}
