import API from './client';

export const getConversations = () => API.get('/api/conversations');
export const createConversation = (data) => API.post('/api/conversations', data);
export const deleteConversation = (conversationId) => API.delete(`/api/conversations/${conversationId}`);
export const getConversation = (conversationId) => API.get(`/api/conversations/${conversationId}`);
export const updateConversation = (conversationId, data) => API.put(`/api/conversations/${conversationId}`, data);
export const addMembers = (conversationId, memberIds) => API.post(`/api/conversations/${conversationId}/members`, { memberIds });
export const removeMembers = (conversationId, memberIds) => API.delete(`/api/conversations/${conversationId}/members`, { data: { memberIds } });
export const addMember = (id, userId) => API.post(`/api/conversations/${id}/members`, { userId });
export const removeMember = (id, userId) => API.delete(`/api/conversations/${id}/members/${userId}`);
export const addAdmin = (id, userId) => API.post(`/api/conversations/${id}/admins`, { userId });
export const removeAdmin = (id, userId) => API.delete(`/api/conversations/${id}/admins/${userId}`); 