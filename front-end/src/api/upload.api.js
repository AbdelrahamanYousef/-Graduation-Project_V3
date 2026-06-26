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

export async function uploadImage(file) {
    const form = new FormData();
    form.append('image', file);
    const { data } = await apiClient.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

/**
 * Upload a CV PDF to the server (public / guest)
 * @param {File} file
 */
export async function uploadCv(file) {
    const formData = new FormData();
    formData.append('cv', file);

    const { data } = await apiClient.post('/upload/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
