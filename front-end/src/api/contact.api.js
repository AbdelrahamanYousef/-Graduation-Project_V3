import apiClient from './client';

export const contactKeys = {
    all: ['contact'],
};

/**
 * Submit a contact message (public)
 */
export async function submitContactMessage(messageData) {
    const { data } = await apiClient.post('/contact', messageData);
    return data;
}

/**
 * Get all contact messages (admin)
 */
export async function getContactMessages(filters = {}) {
    const { data } = await apiClient.get('/admin/messages', { params: filters });
    return data;
}

/**
 * Update contact message status (admin)
 */
export async function updateContactStatus(id, status) {
    const { data } = await apiClient.patch(`/contact/${id}/status`, { status });
    return data;
}
