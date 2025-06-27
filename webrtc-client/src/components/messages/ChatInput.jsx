import React from 'react';
import { Paperclip, Smile, X } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSend,
  onFileChange,
  uploadFile,
  onRemoveFile,
  onShowEmojiPicker,
}) {
  return (
    <div className="p-4 border-t border-secondary-200 bg-white">
      <div className="flex space-x-2 items-center">
        <label className="cursor-pointer p-2 rounded hover:bg-secondary-100">
          <Paperclip className="h-5 w-5" />
          <input type="file" className="hidden" onChange={onFileChange} />
        </label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button onClick={onShowEmojiPicker} className="p-2 rounded hover:bg-secondary-100"><Smile className="h-5 w-5" /></button>
        <button
          onClick={onSend}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >Send</button>
      </div>
      {uploadFile && (
        <div className="mt-2 flex items-center space-x-2 bg-secondary-100 p-2 rounded">
          {uploadFile.type && uploadFile.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(uploadFile)} alt={uploadFile.name} className="h-12 w-12 object-cover rounded" />
          ) : (
            <span className="text-secondary-700">{uploadFile.name}</span>
          )}
          <button onClick={onRemoveFile} className="p-1 rounded hover:bg-secondary-200"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
} 