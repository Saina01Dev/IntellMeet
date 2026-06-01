import { api, getAuthHeaders } from './api';

export const getMessages = async () => {
    const response = await api.get('/chat/messages', getAuthHeaders());
    return response.data;
};
