import React from 'react';
import { Star } from 'lucide-react';
import { useChatSocket } from '../../context/ChatSocketContext';

function getConversationDisplayName(conversation, currentUserId) {
  console.log('SidebarConversation getConversationDisplayName called with:', { conversation, currentUserId });
  
  try {
    if (!conversation) {
      console.log('No conversation provided, returning Unknown');
      return 'Unknown';
    }
    
    // If conversation has a name (group/community), use it
    if (conversation.name) {
      console.log('Using conversation name:', conversation.name);
      return String(conversation.name);
    }
    
    // For DMs, show the other person's name
    if (conversation.type === 'dm' && conversation.members) {
      console.log('Looking for other member in DM, members:', conversation.members);
      console.log('Current user ID:', currentUserId);
      
      const otherMember = conversation.members.find(m => {
        console.log('Checking member:', m);
        console.log('Member _id:', m?._id);
        console.log('Current user ID:', currentUserId);
        console.log('Match result:', m?._id !== currentUserId);
        return m?._id !== currentUserId;
      });
      
      console.log('Other member found:', otherMember);
      console.log('Other member type:', typeof otherMember);
      
      if (otherMember && typeof otherMember === 'object') {
        console.log('Processing other member object');
        
        // Ensure we're working with a user object and extract string values
        const fullName = otherMember.fullName;
        const username = otherMember.username;
        const email = otherMember.email;
        
        console.log('Member properties:', { fullName, username, email });
        
        const displayName = fullName || username || email || 'Unknown User';
        console.log('Final display name:', displayName, 'type:', typeof displayName);
        
        // Ensure we return a string
        const result = String(displayName);
        console.log('Returning result:', result);
        return result;
      } else {
        console.log('No valid other member found, using fallback');
        return 'Unknown User';
      }
    }
    
    // Fallback
    console.log('Using fallback name: Unknown Conversation');
    return 'Unknown Conversation';
  } catch (error) {
    console.error('Error in getConversationDisplayName:', error);
    return 'Error';
  }
}

export default function SidebarConversation({
  conv,
  isActive,
  onSelect,
  onStar,
  onDelete,
  starred,
  getInitials,
  currentUserId,
  canDelete,
}) {
  const { onlineUsers } = useChatSocket();
  
  const displayName = getConversationDisplayName(conv, currentUserId);
  const initials = getInitials(displayName);
  
  // Get the other user in DM
  const getOtherUser = () => {
    if (conv.type === 'dm' && conv.members) {
      return conv.members.find(member => member._id !== currentUserId);
    }
    return null;
  };

  const otherUser = getOtherUser();
  const isOnline = otherUser && onlineUsers.has(otherUser._id);
  
  return (
    <div
      className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary-100 rounded transition-colors ${isActive ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'}`}
      onClick={onSelect}
    >
      <div className="relative mr-3">
        {conv?.avatar ? (
          <img src={conv.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
            {initials}
          </div>
        )}
        {conv?.status && (
          <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        )}
        {/* Online status indicator for DMs */}
        {conv.type === 'dm' && isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
        )}
      </div>
      <span className="flex-1 truncate">{displayName}</span>
      <div className="flex items-center space-x-1">
        <button onClick={e => { e.stopPropagation(); onStar(); }} className="text-yellow-400 hover:text-yellow-500">
          <Star fill={starred ? 'currentColor' : 'none'} className="h-4 w-4" />
        </button>
        {canDelete && (
          <button 
            onClick={e => { e.stopPropagation(); onDelete(); }} 
            className="text-red-400 hover:text-red-500"
            title="Delete conversation"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      {conv?.unread > 0 && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
      )}
    </div>
  );
} 