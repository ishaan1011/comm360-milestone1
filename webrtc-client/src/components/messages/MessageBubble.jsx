import React from 'react';
import { Smile, Edit, Trash2, Reply } from 'lucide-react';

export default function MessageBubble({
  msg,
  isOwn,
  onEdit,
  onDelete,
  onReply,
  onEmoji,
  reactions = [],
  showEmojiPicker,
  setShowEmojiPicker,
  emojiList,
  editMsgId,
  editInput,
  setEditInput,
  handleEditSave,
  handleEditCancel,
  replyContext,
}) {
  const messageId = msg._id || msg.id;
  
  // Handle populated sender object or sender ID
  let senderName = 'Unknown';
  if (msg.sender) {
    if (typeof msg.sender === 'object' && msg.sender.fullName) {
      senderName = msg.sender.fullName;
    } else if (typeof msg.sender === 'object' && msg.sender.username) {
      senderName = msg.sender.username;
    } else if (typeof msg.sender === 'string') {
      senderName = msg.sender; // Fallback to ID if no populated data
    }
  } else if (msg.senderName) {
    senderName = msg.senderName;
  }
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg relative group ${isOwn ? 'bg-primary-500 text-white' : 'bg-white text-secondary-900 border border-secondary-200'}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{senderName}</div>
          <div className="text-xs text-secondary-400 ml-2">{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        {replyContext && (
          <div className="text-xs text-secondary-400 italic mb-1">Replying to: {(replyContext.text || '').slice(0, 30)}{(replyContext.text || '').length > 30 ? '...' : ''}</div>
        )}
        {editMsgId === messageId ? (
          <div className="flex items-center mt-1">
            <input value={editInput} onChange={e => setEditInput(e.target.value)} className="flex-1 px-2 py-1 border rounded mr-2 text-black" />
            <button onClick={handleEditSave} className="text-primary-600 text-xs font-semibold mr-1">Save</button>
            <button onClick={handleEditCancel} className="text-secondary-400 text-xs">Cancel</button>
          </div>
        ) : (
          <>
            <div className="text-base mt-1">{msg.text}</div>
            {msg.file && (
              <div className="mt-2">
                {msg.file.type && msg.file.type.startsWith('image/') ? (
                  <img src={msg.file.url} alt={msg.file.name} className="max-w-[200px] rounded" />
                ) : (
                  <a href={msg.file.url} download={msg.file.name} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{msg.file.name}</a>
                )}
              </div>
            )}
            {msg.edited && <span className="text-xs text-secondary-400 ml-2">(edited)</span>}
          </>
        )}
        {/* Emoji reactions */}
        <div className="flex space-x-1 mt-2">
          {(reactions || []).map((emoji, i) => (
            <span key={i} className="text-lg cursor-pointer">{emoji}</span>
          ))}
          <button onClick={() => setShowEmojiPicker(showEmojiPicker === messageId ? false : messageId)} className="ml-1 p-1 rounded hover:bg-secondary-100"><Smile className="h-4 w-4" /></button>
          {showEmojiPicker === messageId && (
            <div className="absolute z-10 bg-white border rounded shadow p-2 flex flex-wrap mt-1">
              {emojiList.map(emoji => (
                <span key={emoji} className="text-xl cursor-pointer m-1" onClick={() => onEmoji(emoji, messageId)}>{emoji}</span>
              ))}
            </div>
          )}
        </div>
        {/* Message actions */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex space-x-1">
          <button className="p-1 hover:bg-secondary-100 rounded" onClick={() => onReply(msg)}><Reply className="h-4 w-4" /></button>
          {isOwn && (
            <>
              <button onClick={() => onEdit(msg)} className="p-1 hover:bg-secondary-100 rounded"><Edit className="h-4 w-4" /></button>
              <button onClick={() => onDelete(messageId)} className="p-1 hover:bg-secondary-100 rounded"><Trash2 className="h-4 w-4" /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 