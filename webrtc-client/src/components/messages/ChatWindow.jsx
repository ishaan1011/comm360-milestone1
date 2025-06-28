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
    <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-secondary-50">
      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          <div className="text-center text-xs text-secondary-400 mb-2">{date}</div>
          <div className="space-y-2">
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
                replyContext={replyContext && (replyContext._id === msg._id || replyContext.id === msg.id) ? replyContext : null}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Enhanced Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-secondary-400 p-2 bg-secondary-100 rounded-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>
            {typingUsers.length === 1 ? 'Someone is typing...' : 
             typingUsers.length === 2 ? '2 people are typing...' : 
             `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}
    </div>
  );
} 