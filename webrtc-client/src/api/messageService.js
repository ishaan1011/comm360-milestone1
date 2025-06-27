import API from './client';

export const getMessages = (conversationId) => API.get(`/messages/conversation/${conversationId}`);
export const sendMessage = (conversationId, data) => API.post(`/messages/conversation/${conversationId}`, data);
export const editMessage = (messageId, data) => API.put(`/messages/${messageId}`, data);
export const deleteMessage = (messageId) => API.delete(`/messages/${messageId}`);
export const reactMessage = (messageId, emoji) => API.post(`/messages/${messageId}/react`, { emoji });
export const unreactMessage = (messageId, emoji) => API.post(`/messages/${messageId}/unreact`, { emoji });
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/messages/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}; 