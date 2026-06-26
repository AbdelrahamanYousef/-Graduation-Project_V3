import apiClient from './client';

export const specialRequestKeys = {
    all: ['special-requests'],
    list: (filters) => ['special-requests', 'list', filters],
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
