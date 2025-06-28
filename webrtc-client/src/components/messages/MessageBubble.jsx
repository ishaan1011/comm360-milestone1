import React, { useState } from 'react';
import { Smile, Edit, Trash2, Reply, Download, X, Maximize2 } from 'lucide-react';

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
  const [showImageModal, setShowImageModal] = useState(false);
  
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

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = msg.file && msg.file.type && msg.file.type.startsWith('image/');
  
  return (
    <>
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
                  {isImage ? (
                    <div className="relative group/image">
                      <img 
                        src={msg.file.url} 
                        alt={msg.file.name} 
                        className="max-w-[200px] rounded cursor-pointer hover:opacity-90 transition-opacity" 
                        onClick={() => setShowImageModal(true)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                        <div className="opacity-0 group-hover/image:opacity-100 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowImageModal(true);
                            }}
                            className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                            title="Expand"
                          >
                            <Maximize2 className="h-4 w-4 text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(msg.file.url, msg.file.name);
                            }}
                            className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <a 
                          href={msg.file.url} 
                          download={msg.file.name} 
                          className="text-blue-600 underline hover:text-blue-800" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {msg.file.name}
                        </a>
                        <p className="text-xs text-gray-500">{msg.file.type || 'Unknown type'}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(msg.file.url, msg.file.name)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
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

      {/* Image Preview Modal */}
      {showImageModal && isImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(msg.file.url, msg.file.name);
              }}
              className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 z-10"
              title="Download"
            >
              <Download className="h-6 w-6" />
            </button>
            <img 
              src={msg.file.url} 
              alt={msg.file.name} 
              className="max-w-full max-h-full object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
} 