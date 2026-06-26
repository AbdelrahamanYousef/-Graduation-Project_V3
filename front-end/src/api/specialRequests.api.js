import apiClient from './client';

export const specialRequestKeys = {
    all: ['specialRequests'],
    list: (filters) => ['specialRequests', 'list', filters],
};

export async function submitSpecialRequest(requestData) {
    const { data } = await apiClient.post('/special-requests/apply', requestData);
    return data;
}

export async function getSpecialRequests(filters = {}) {
    const { data } = await apiClient.get('/special-requests', { params: filters });
    return data;
}

export async function getSpecialRequestById(id) {
    const { data } = await apiClient.get(`/special-requests/${id}`);
    return data;
}

export async function approveSpecialRequest(id, payload = {}) {
    const { data } = await apiClient.patch(`/special-requests/${id}/approve`, payload);
    return data;
}

export async function rejectSpecialRequest(id, reason) {
    const { data } = await apiClient.patch(`/special-requests/${id}/reject`, { reason });
    return data;
}

export async function contactSpecialRequest(id, payload) {
    const { data } = await apiClient.patch(`/special-requests/${id}/contact`, payload);
    return data;
}

export async function respondSpecialRequest(id, payload) {
    const { data } = await apiClient.patch(`/special-requests/${id}/respond`, payload);
    return data;
}
