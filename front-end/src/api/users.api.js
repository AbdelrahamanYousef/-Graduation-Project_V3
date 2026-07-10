import apiClient from './client';

export const userKeys = {
    all: ['admin', 'users'],
};

/**
 * Fetch all users (Admin only)
 */
export async function getUsers() {
    const { data } = await apiClient.get('/admin/users');
    return data;
}

/**
 * Create a new user (Admin only)
 */
export async function createUser(userData) {
    const { data } = await apiClient.post('/admin/users', userData);
    return data;
}

/**
 * Update an existing user (Admin only)
 */
export async function updateUser(id, updateData) {
    const { data } = await apiClient.put(`/admin/users/${id}`, updateData);
    return data;
}

/**
 * Delete a user (Admin only, soft delete)
 */
export async function deleteUser(id) {
    const { data } = await apiClient.delete(`/admin/users/${id}`);
    return data;
}
