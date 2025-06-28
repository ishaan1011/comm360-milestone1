import React from 'react';
import { Star } from 'lucide-react';

function getConversationDisplayName(conversation, currentUserId) {
  if (!conversation) return 'Unknown';
  
  // If conversation has a name (group/community), use it
  if (conversation.name) {
    return conversation.name;
  }
  
  // For DMs, show the other person's name
  if (conversation.type === 'dm' && conversation.members) {
    const otherMember = conversation.members.find(m => m._id !== currentUserId);
    if (otherMember) {
      return otherMember.fullName || otherMember.username || otherMember.email || 'Unknown User';
    }
  }
  
  // Fallback
  return 'Unknown Conversation';
}

export default function SidebarConversation({
  conv,
  isActive,
  onSelect,
  onStar,
  starred,
  getInitials,
  currentUserId,
}) {
  const displayName = getConversationDisplayName(conv, currentUserId);
  
  return (
    <div
      className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary-100 rounded transition-colors ${isActive ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'}`}
      onClick={onSelect}
    >
      <div className="relative mr-3">
        {conv.avatar ? (
          <img src={conv.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
            {getInitials(displayName)}
          </div>
        )}
        {conv.status && (
          <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        )}
      </div>
      <span className="flex-1 truncate">{displayName}</span>
      <button onClick={e => { e.stopPropagation(); onStar(); }} className="ml-2 text-yellow-400 hover:text-yellow-500">
        <Star fill={starred ? 'currentColor' : 'none'} className="h-4 w-4" />
      </button>
      {conv.unread > 0 && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
      )}
    </div>
  );
} 