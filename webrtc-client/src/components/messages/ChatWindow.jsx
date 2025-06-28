import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({
  grouped,
  selected,
  reactions,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiList,
  editMsgId,
  editInput,
  setEditInput,
  handleEditSave,
  handleEditCancel,
  onEdit,
  onDelete,
  onReply,
  onEmoji,
  replyContext,
  typing,
  currentUserId,
  messageStatus,
  onlineUsers,
}) {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [grouped, typing]);

  // Get typing users
  const typingUsers = Object.keys(typing || {}).filter(userId => 
    typing[userId] && userId !== currentUserId
  );

  return (
    <div ref={chatRef} className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-4 space-y-6">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            {/* Date separator with better styling */}
            <div className="flex items-center justify-center my-6">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-600">{date}</span>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="space-y-3">
              {msgs.map(msg => (
                <MessageBubble
                  key={msg._id || msg.id}
                  msg={msg}
                  isOwn={
                    (msg.senderId === currentUserId) || 
                    (msg.sender === currentUserId) || 
                    (msg.sender && typeof msg.sender === 'object' && msg.sender._id === currentUserId)
                  }
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  onEmoji={onEmoji}
                  reactions={reactions[msg._id || msg.id]}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  emojiList={emojiList}
                  editMsgId={editMsgId}
                  editInput={editInput}
                  setEditInput={setEditInput}
                  handleEditSave={handleEditSave}
                  handleEditCancel={handleEditCancel}
                  replyContext={msg.replyTo || (replyContext && (replyContext._id === msg._id || replyContext.id === msg.id) ? replyContext : null)}
                  messageStatus={messageStatus}
                  onlineUsers={onlineUsers}
                />
              ))}
            </div>
          </div>
        ))}
        
        {/* Enhanced Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-xs">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {typingUsers.length === 1 ? 'Someone is typing...' : 
               typingUsers.length === 2 ? '2 people are typing...' : 
               `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 