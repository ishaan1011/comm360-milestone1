import React, { useEffect, useRef } from 'react';
import { Paperclip, Smile, X } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSend,
  onFileChange,
  uploadFile,
  onRemoveFile,
  onShowEmojiPicker,
  onTyping,
}) {
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Send typing indicator
    if (onTyping) {
      onTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSend = () => {
    // Stop typing when sending
    if (onTyping) {
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    onSend();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 border-t border-secondary-200 bg-white">
      <div className="flex space-x-2 items-center">
        <label className="cursor-pointer p-2 rounded hover:bg-secondary-100" title="Upload any file type">
          <Paperclip className="h-5 w-5" />
          <input 
            type="file" 
            className="hidden" 
            onChange={onFileChange}
            accept="*/*"
          />
        </label>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button onClick={onShowEmojiPicker} className="p-2 rounded hover:bg-secondary-100"><Smile className="h-5 w-5" /></button>
        <button
          onClick={handleSend}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >Send</button>
      </div>
      {uploadFile && (
        <div className="mt-2 flex items-center space-x-2 bg-secondary-100 p-2 rounded">
          {uploadFile.type && uploadFile.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(uploadFile)} alt={uploadFile.name} className="h-12 w-12 object-cover rounded" />
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-secondary-700">{uploadFile.name}</span>
              <span className="text-xs text-secondary-500">({uploadFile.type || 'Unknown type'})</span>
            </div>
          )}
          <button onClick={onRemoveFile} className="p-1 rounded hover:bg-secondary-200"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
} 