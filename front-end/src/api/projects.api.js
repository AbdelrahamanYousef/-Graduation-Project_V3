import apiClient from './client';

export const projectKeys = {
    all: ['projects'],
    list: (filters) => ['projects', 'list', filters],
    detail: (id) => ['projects', 'detail', id],
    featured: ['projects', 'featured'],
};

/**
 * Get all projects (paginated)
 * @param {object} [filters] - { programId, status, search, featured, page, limit }
 */
export async function getProjects(filters = {}) {
    const { data } = await apiClient.get('/projects', { params: filters });
    return data;
}

/**
 * Get featured projects
 */
export async function getFeaturedProjects() {
    const { data } = await apiClient.get('/projects/featured');
    return data;
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id) {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
}

/**
 * Create a project (admin)
 */
export async function createProject(projectData) {
    const { data } = await apiClient.post('/projects', projectData);
    return data;
}

/**
 * Update a project (admin)
 */
export async function updateProject(id, projectData) {
    const { data } = await apiClient.put(`/projects/${id}`, projectData);
    return data;
}

/**
 * Toggle featured status (admin)
 */
export async function toggleProjectFeatured(id) {
    const { data } = await apiClient.put(`/projects/${id}/featured`);
    return data;
}

/**
 * Toggle highlighted status (admin)
 */
export async function toggleProjectHighlight(id, isHighlighted) {
    const { data } = await apiClient.put(`/projects/${id}/highlight`, { isHighlighted });
    return data;
}

/**
 * Delete a project (admin, soft delete)
 */
export async function deleteProject(id) {
    const { data } = await apiClient.delete(`/projects/${id}`);
    return data;
}

export const projects = {
    getAll: getProjects,
    getById: getProjectById,
    create: createProject,
    update: updateProject,
    delete: deleteProject,
    deleteProject: deleteProject
};

export const projectsApi = projects;
