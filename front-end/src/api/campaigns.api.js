import apiClient from './client';

export const campaignKeys = {
    all: ['campaigns'],
    detail: (id) => ['campaigns', 'detail', id],
};

/**
 * Get all campaigns
 * @param {object} [params] - Query parameters
 * @param {boolean} [params.includeDeleted] - Include soft-deleted campaigns
 * @returns {Promise<object[]>}
 */
export async function getCampaigns(params = {}) {
    const { data } = await apiClient.get('/campaigns', { params });
    return data;
}

/**
 * Get a single campaign by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getCampaignById(id) {
    const { data } = await apiClient.get(`/campaigns/${id}`);
    return data;
}

/**
 * Create a campaign (admin)
 */
export async function createCampaign(campaignData) {
    const { data } = await apiClient.post('/campaigns', campaignData);
    return data;
}

/**
 * Update a campaign (admin)
 */
export async function updateCampaign(id, campaignData) {
    const { data } = await apiClient.put(`/campaigns/${id}`, campaignData);
    return data;
}

/**
 * Delete a campaign (admin, soft delete)
 */
export async function deleteCampaign(id) {
    const { data } = await apiClient.delete(`/campaigns/${id}`);
    return data;
}

export const campaigns = {
    getAll: getCampaigns,
    getById: getCampaignById,
    create: createCampaign,
    update: updateCampaign,
    delete: deleteCampaign,
    deleteCampaign: deleteCampaign
};

export const campaignsApi = campaigns;
