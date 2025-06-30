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
  return API.post('/api/messages/upload', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('Upload progress:', percentCompleted);
    }
  });
};
export const getFileUrl = (filename) => {
  return `${import.meta.env.VITE_API_URL}/uploads/messages/${filename}`;
};

// File type utilities
export const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('application/pdf') || 
      mimeType.includes('document') || 
      mimeType.includes('spreadsheet') || 
      mimeType.includes('presentation')) return 'document';
  if (mimeType.includes('zip') || 
      mimeType.includes('rar') || 
      mimeType.includes('compressed') || 
      mimeType.includes('tar')) return 'archive';
  if (mimeType.startsWith('text/') || 
      mimeType.includes('json') || 
      mimeType.includes('xml') || 
      mimeType.includes('javascript')) return 'code';
  return 'other';
};

export const getFileIcon = (category, mimeType) => {
  // Icons for different file categories
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    code: '💻',
    other: '📎'
  };

  // Specific icons for common file types
  const specificIcons = {
    'application/pdf': '📕',
    'application/msword': '📘',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
    'application/vnd.ms-excel': '📗',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗',
    'application/vnd.ms-powerpoint': '📙',
    'application/vnd.openxmlformats-officedocument.presentationml.sheet': '📙',
    'text/plain': '📝',
    'text/csv': '📊',
    'text/html': '🌐',
    'text/css': '🎨',
    'text/javascript': '⚡',
    'application/json': '📋',
    'application/xml': '📄',
    'application/zip': '🗜️',
    'application/x-rar-compressed': '🗜️',
    'application/x-7z-compressed': '🗜️',
    'application/gzip': '🗜️',
    'application/x-tar': '🗜️',
    'audio/mpeg': '🎵',
    'audio/wav': '🎵',
    'audio/ogg': '🎵',
    'audio/aac': '🎵',
    'video/mp4': '🎬',
    'video/webm': '🎬',
    'video/ogg': '🎬',
    'video/avi': '🎬',
    'video/mov': '🎬',
    'video/wmv': '🎬',
    'image/jpeg': '🖼️',
    'image/jpg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️',
    'image/svg+xml': '🖼️'
  };

  // Return specific icon if available, otherwise category icon
  return specificIcons[mimeType] || icons[category] || icons.other;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Enhanced file download function with better error handling
export const downloadFile = async (url, filename, mimeType) => {
  try {
    // For same-origin files, use direct download
    if (url.startsWith(window.location.origin) || url.startsWith('/')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For cross-origin files, try multiple approaches
    try {
      // First attempt: Fetch with CORS
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (fetchError) {
      console.warn('CORS fetch failed, trying download endpoint:', fetchError);
      
      // Second attempt: Try the download endpoint with auth
      try {
        // Extract filename from URL
        const urlParts = url.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        
        // Use the file endpoint
        const downloadUrl = `${import.meta.env.VITE_API_URL}/api/files/${originalFilename}`;
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/octet-stream',
        };
        
        // Add auth header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(downloadUrl, {
          method: 'GET',
          mode: 'cors',
          headers,
        });

        if (!response.ok) {
          throw new Error(`File endpoint failed with status: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      } catch (downloadEndpointError) {
        console.warn('File endpoint also failed:', downloadEndpointError);
      }
      
      // Third attempt: Try direct URL with different approach (for 426 errors)
      try {
        // For 426 Upgrade Required errors, try opening in new tab directly
        if (fetchError.message.includes('426') || fetchError.message.includes('Upgrade Required')) {
          console.log('Detected 426 error, opening in new tab');
          window.open(url, '_blank');
          return;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors',
        });
        
        if (response.type === 'opaque') {
          // For opaque responses, we can't access the content directly
          // So we'll fall back to opening in a new tab
          throw new Error('Opaque response, cannot download directly');
        }
      } catch (noCorsError) {
        console.warn('No-cors fetch also failed:', noCorsError);
      }
      
      // Fourth attempt: Try XMLHttpRequest
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.withCredentials = false;
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          } else {
            throw new Error(`XHR failed with status: ${xhr.status}`);
          }
        };
        
        xhr.onerror = function() {
          throw new Error('XHR request failed');
        };
        
        xhr.send();
        return; // Exit early if XHR succeeds
      } catch (xhrError) {
        console.warn('XHR also failed:', xhrError);
      }
      
      // Final fallback: Open in new tab
      console.log('All download methods failed, opening in new tab as fallback');
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Download failed:', error);
    
    // Ultimate fallback: try to open in new tab
    try {
      window.open(url, '_blank');
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      throw new Error('Download failed. Please try again or contact support.');
    }
  }
};

// Preview functions for different file types
export const canPreview = (category, mimeType) => {
  const previewableTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac',
    'application/pdf',
    'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml'
  ];

  return previewableTypes.includes(mimeType);
};

export const getPreviewUrl = (file) => {
  if (!file || !canPreview(file.category, file.type)) {
    return null;
  }

  // For images, videos, and audio, return the direct URL
  if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    return file.url;
  }

  // For PDFs, return the URL for iframe embedding
  if (file.type === 'application/pdf') {
    return file.url;
  }

  // For text files, we might want to fetch and display content
  if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/xml') {
    return file.url;
  }

  return null;
};

// File validation
export const validateFile = (file, maxSize = 50 * 1024 * 1024) => {
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.sheet',
    'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    'application/gzip', 'application/x-tar',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/webm',
    // Video
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv',
    // Code files
    'application/json', 'application/xml', 'text/xml',
    // Other common types
    'application/octet-stream'
  ];

  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type not allowed: ${file.type}`);
  }

  return true;
}; 