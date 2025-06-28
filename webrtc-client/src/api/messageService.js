import API from './client';

export const getMessages = (conversationId) => API.get(`/api/messages/conversation/${conversationId}`);
export const sendMessage = (conversationId, data) => API.post(`/api/messages/conversation/${conversationId}`, data);
export const editMessage = (messageId, data) => API.put(`/api/messages/${messageId}`, data);
export const deleteMessage = (messageId) => API.delete(`/api/messages/${messageId}`);
export const reactMessage = (messageId, emoji) => API.post(`/api/messages/${messageId}/react`, { emoji });
export const unreactMessage = (messageId, emoji) => API.post(`/api/messages/${messageId}/unreact`, { emoji });
export const uploadMessageFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/api/messages/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getFileUrl = (filename) => {
  return `${import.meta.env.VITE_API_URL}/uploads/messages/${filename}`;
}; 