import apiClient from './client';

/**
 * Get donor profile
 */
export async function getDonorProfile() {
    const { data } = await apiClient.get('/donor/profile');
    return data;
}

/**
 * Update donor profile
 */
export async function updateDonorProfile(profileData) {
    const { data } = await apiClient.put('/donor/profile', profileData);
    return data;
}

/**
 * Get donor's donation history
 */
export async function getDonorDonations(filters = {}) {
    const { data } = await apiClient.get('/donor/donations', { params: filters });
    return data;
}

/**
 * Get donor donation statistics
 */
export async function getDonorStats() {
    const { data } = await apiClient.get('/donor/stats');
    return data;
}
