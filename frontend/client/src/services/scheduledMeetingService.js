import { api, getAuthHeaders } from './api';

export const getScheduledMeetings = async () => {
    const response = await api.get('/scheduled-meetings', getAuthHeaders());
    return response.data;
};

export const createScheduledMeeting = async (data) => {
    const response = await api.post('/scheduled-meetings', data, getAuthHeaders());
    return response.data;
};

export const deleteScheduledMeeting = async (id) => {
    const response = await api.delete(`/scheduled-meetings/${id}`, getAuthHeaders());
    return response.data;
};
