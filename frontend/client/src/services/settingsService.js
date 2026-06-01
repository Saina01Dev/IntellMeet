import { api, getAuthHeaders } from './api';

export const getSettings = async () => {
    const response = await api.get('/settings', getAuthHeaders());
    return response.data;
};

export const updateSettings = async (data) => {
    const response = await api.put('/settings', data, getAuthHeaders());
    return response.data;
};
