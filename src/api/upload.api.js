import apiClient from './client';

/**
 * Upload a profile photo to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<{ url: string, filename: string }>}
 */
export async function uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    const { data } = await apiClient.post('/upload/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
