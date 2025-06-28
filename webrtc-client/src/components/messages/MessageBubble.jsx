import React, { useState } from 'react';
import { Smile, Edit, Trash2, Reply, Download, X, Maximize2, Check, CheckCheck } from 'lucide-react';

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
  messageStatus,
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
    // Create a proper download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // For cross-origin files, we need to fetch and create a blob
    if (url.startsWith('http')) {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
          console.error('Error downloading file:', error);
          // Fallback: try to open in new tab
          window.open(url, '_blank');
        });
    } else {
      // For same-origin files
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = msg.file && msg.file.type && msg.file.type.startsWith('image/');
  
  // Get message status
  const status = messageStatus?.get(messageId) || { sent: true, delivered: false, read: false };
  
  // Render status indicator
  const renderStatusIndicator = () => {
    if (!isOwn) return null;
    
    if (status.read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (status.delivered) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    } else if (status.sent) {
      return <Check className="h-3 w-3 text-gray-400" />;
    } else {
      return <div className="h-3 w-3 rounded-full bg-gray-300 animate-pulse"></div>;
    }
  };

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-md px-4 py-3 rounded-2xl relative group shadow-sm ${
          isOwn 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
            : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300'
        }`}>
          {/* Sender name and timestamp */}
          <div className="flex items-center justify-between mb-2 min-w-0">
            <div className={`text-sm font-semibold truncate flex-1 ${isOwn ? 'text-blue-100' : 'text-gray-700'}`}>
              {senderName}
            </div>
            <div className={`flex items-center space-x-2 flex-shrink-0 ml-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              <span className="text-xs whitespace-nowrap">
                {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {renderStatusIndicator()}
            </div>
          </div>

          {/* Reply context */}
          {replyContext && (
            <div className={`text-xs mb-2 p-2 rounded-lg break-words ${
              isOwn ? 'bg-blue-400 bg-opacity-30' : 'bg-gray-100'
            }`}>
              <span className={`font-medium ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                Replying to: 
              </span>
              <span className={`italic ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                {(replyContext.text || replyContext.file?.name || '').slice(0, 50)}{(replyContext.text || replyContext.file?.name || '').length > 50 ? '...' : ''}
              </span>
            </div>
          )}

          {/* Edit mode */}
          {editMsgId === messageId ? (
            <div className="flex flex-col space-y-2">
              <input 
                value={editInput} 
                onChange={e => setEditInput(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <div className="flex space-x-2">
                <button 
                  onClick={handleEditSave} 
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                  Save
                </button>
                <button 
                  onClick={handleEditCancel} 
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Message text */}
              <div className={`text-base leading-relaxed break-words ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {msg.text}
              </div>

              {/* File attachments */}
              {msg.file && (
                <div className="mt-3">
                  {isImage ? (
                    <div className="relative group/image">
                      <img 
                        src={msg.file.url} 
                        alt={msg.file.name} 
                        className="max-w-[250px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-all duration-200 shadow-sm object-cover" 
                        onClick={() => setShowImageModal(true)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover/image:opacity-100 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowImageModal(true);
                            }}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 shadow-sm"
                            title="Expand"
                          >
                            <Maximize2 className="h-4 w-4 text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(msg.file.url, msg.file.name);
                            }}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 shadow-sm"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <a 
                          href={msg.file.url} 
                          download={msg.file.name} 
                          className="text-blue-600 hover:text-blue-800 font-medium truncate block" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {msg.file.name}
                        </a>
                        <p className="text-xs text-gray-500 mt-1 truncate">{msg.file.type || 'Unknown type'}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(msg.file.url, msg.file.name)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Edited indicator */}
              {msg.edited && (
                <span className={`text-xs mt-2 inline-block ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  (edited)
                </span>
              )}

              {/* Emoji reactions */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {(reactions || msg.reactions || []).map((reaction, i) => (
                  <span 
                    key={i} 
                    className="text-lg cursor-pointer hover:scale-110 transition-transform"
                  >
                    {reaction.emoji}
                  </span>
                ))}
                <button 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === messageId ? false : messageId)} 
                  className={`p-1 rounded-lg transition-colors ${
                    isOwn ? 'hover:bg-blue-400 hover:bg-opacity-30' : 'hover:bg-gray-100'
                  }`}
                >
                  <Smile className="h-4 w-4" />
                </button>
                {showEmojiPicker === messageId && (
                  <div className="absolute bottom-full right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-wrap gap-2 mb-2 min-w-[200px]">
                    {emojiList.map(emoji => (
                      <span 
                        key={emoji} 
                        className="text-xl cursor-pointer hover:scale-110 transition-transform" 
                        onClick={() => onEmoji(emoji, messageId)}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message actions */}
              <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity duration-200 ${
                isOwn ? 'bg-blue-500 bg-opacity-20' : 'bg-gray-100'
              } rounded-lg p-1`}>
                <button 
                  className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors" 
                  onClick={() => onReply(msg)}
                  title="Reply"
                >
                  <Reply className="h-4 w-4" />
                </button>
                {isOwn && (
                  <>
                    <button 
                      onClick={() => onEdit(msg)} 
                      className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(messageId)} 
                      className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && isImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 z-10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(msg.file.url, msg.file.name);
              }}
              className="absolute top-4 left-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 z-10 transition-colors"
              title="Download"
            >
              <Download className="h-6 w-6" />
            </button>
            <img 
              src={msg.file.url} 
              alt={msg.file.name} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
} 