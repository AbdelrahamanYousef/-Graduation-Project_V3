import apiClient from './client';

export const volunteerKeys = {
    all: ['volunteers'],
    list: (filters) => ['volunteers', 'list', filters],
    detail: (id) => ['volunteers', 'detail', id],
};

/**
 * Submit a volunteer application (public)
 */
export async function applyAsVolunteer(applicationData) {
    const { data } = await apiClient.post('/volunteers/apply', applicationData);
    return data;
}

/**
 * Get all volunteer applications (admin)
 */
export async function getVolunteers(filters = {}) {
    const { data } = await apiClient.get('/volunteers', { params: filters });
    return data;
}

/**
 * Get a single volunteer application (admin)
 */
export async function getVolunteerById(id) {
    const { data } = await apiClient.get(`/volunteers/${id}`);
    return data;
}

/**
 * Approve a volunteer application (admin)
 */
export async function approveVolunteer(id, payload = {}) {
    const { data } = await apiClient.patch(`/volunteers/${id}/approve`, payload);
    return data;
}

/**
 * Reject a volunteer application (admin)
 */
export async function rejectVolunteer(id, reason) {
    const { data } = await apiClient.patch(`/volunteers/${id}/reject`, { reason });
    return data;
}

/**
 * Mark volunteer as contacted (admin)
 */
export async function contactVolunteer(id, payload) {
    const { data } = await apiClient.patch(`/volunteers/${id}/contact`, payload);
    return data;
}

/**
 * Record volunteer's response (admin)
 */
export async function respondVolunteer(id, payload) {
    const { data } = await apiClient.patch(`/volunteers/${id}/respond`, payload);
    return data;
}
