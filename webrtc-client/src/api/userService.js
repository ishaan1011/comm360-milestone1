// src/api/userService.js
import API from './client.js';

// fetch all users for the participants list
export const fetchContacts = () =>
  API.get('/api/users').then(res => res.data);