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
 * Get volunteer applications of the logged in user
 */
export async function getMyVolunteerApplications() {
    const { data } = await apiClient.get('/volunteers/my-applications');
    return data;
}

/**
 * Log phone call outcome for a volunteer (admin)
 */
export async function logVolunteerCall(id, outcome, notes) {
    const { data } = await apiClient.patch(`/volunteers/${id}/log-call`, { outcome, notes });
    return data;
}

/**
 * Request additional info from volunteer applicant (admin)
 */
export async function requestVolunteerInfo(id, message) {
    const { data } = await apiClient.patch(`/volunteers/${id}/request-info`, { message });
    return data;
}

/**
 * Submit additional info / response to admin's info request (volunteer)
 */
export async function submitVolunteerInfo(id, response) {
    const { data } = await apiClient.patch(`/volunteers/${id}/submit-info`, { response });
    return data;
}
