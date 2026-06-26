import apiClient from './client';

export const programKeys = {
    all: ['programs'],
    detail: (id) => ['programs', 'detail', id],
};

/**
 * Get all programs
 * @returns {Promise<object[]>}
 */
export async function getPrograms() {
    const { data } = await apiClient.get('/programs');
    return data;
}

/**
 * Get a single program by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getProgramById(id) {
    const { data } = await apiClient.get(`/programs/${id}`);
    return data;
}

/**
 * Create a program (admin)
 */
export async function createProgram(programData) {
    const { data } = await apiClient.post('/programs', programData);
    return data;
}

/**
 * Update a program (admin)
 */
export async function updateProgram(id, programData) {
    const { data } = await apiClient.put(`/programs/${id}`, programData);
    return data;
}

/**
 * Delete a program (admin, soft delete)
 */
export async function deleteProgram(id) {
    const { data } = await apiClient.delete(`/programs/${id}`);
    return data;
}

/**
 * Toggle highlighted status (admin)
 */
export async function toggleProgramHighlight(id, isHighlighted) {
    const { data } = await apiClient.put(`/programs/${id}/highlight`, { isHighlighted });
    return data;
}
