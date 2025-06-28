import API from './client';

export const getConversations = () => API.get('/api/conversations');
export const createConversation = (data) => API.post('/api/conversations', data);
export const getConversation = (id) => API.get(`/api/conversations/${id}`);
export const updateConversation = (id, data) => API.put(`/api/conversations/${id}`, data);
export const deleteConversation = (id) => API.delete(`/api/conversations/${id}`);
export const addMember = (id, userId) => API.post(`/api/conversations/${id}/members`, { userId });
export const removeMember = (id, userId) => API.delete(`/api/conversations/${id}/members/${userId}`);
export const addAdmin = (id, userId) => API.post(`/api/conversations/${id}/admins`, { userId });
export const removeAdmin = (id, userId) => API.delete(`/api/conversations/${id}/admins/${userId}`); 