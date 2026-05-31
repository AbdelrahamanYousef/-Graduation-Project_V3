import apiClient from './client';

export const volunteerKeys = {
    all: ['volunteers'],
    list: (filters) => ['volunteers', 'list', filters],
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
 * Approve a volunteer application (admin)
 */
export async function approveVolunteer(id) {
    const { data } = await apiClient.patch(`/volunteers/${id}/approve`);
    return data;
}

/**
 * Reject a volunteer application (admin)
 */
export async function rejectVolunteer(id, reason) {
    const { data } = await apiClient.patch(`/volunteers/${id}/reject`, { reason });
    return data;
}
