import apiClient from './client';

/**
 * Get organization settings (admin)
 */
export async function getSettings() {
    const { data } = await apiClient.get('/settings');
    return data;
}

/**
 * Update organization settings (admin)
 */
export async function updateSettings(settingsData) {
    const { data } = await apiClient.put('/settings', settingsData);
    return data;
}
