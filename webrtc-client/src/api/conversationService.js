import API from './client';

export const getConversations = () => API.get('/conversations');
export const createConversation = (data) => API.post('/conversations', data);
export const getConversation = (id) => API.get(`/conversations/${id}`);
export const addMember = (id, userId) => API.post(`/conversations/${id}/add-member`, { userId });
export const removeMember = (id, userId) => API.post(`/conversations/${id}/remove-member`, { userId });
export const deleteConversation = (id) => API.delete(`/conversations/${id}`); 