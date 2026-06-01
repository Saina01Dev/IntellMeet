import { api, getAuthHeaders } from './api';

export const getDocuments = async () => {
    const response = await api.get('/documents', getAuthHeaders());
    return response.data;
};

export const createDocument = async (data) => {
    const response = await api.post('/documents', data, getAuthHeaders());
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`, getAuthHeaders());
    return response.data;
};
