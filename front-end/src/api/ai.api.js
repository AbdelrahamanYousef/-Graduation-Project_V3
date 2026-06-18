import apiClient from './client';

export const aiChat = (message, projects = [], campaigns = []) =>
    apiClient.post('/ai/chat', { message, projects, campaigns }).then(res => res.data);

export const aiRecommend = (interest, projects = []) =>
    apiClient.post('/ai/recommend', { interest, projects }).then(res => res.data);
