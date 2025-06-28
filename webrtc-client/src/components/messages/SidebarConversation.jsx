import React from 'react';
import { Star } from 'lucide-react';

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
  starred,
  getInitials,
  currentUserId,
}) {
  console.log('SidebarConversation render with conv:', conv);
  console.log('Conv type:', typeof conv);
  console.log('Conv members:', conv?.members);
  
  try {
    const displayName = getConversationDisplayName(conv, currentUserId);
    console.log('Final displayName:', displayName, 'type:', typeof displayName);
    
    // Ensure displayName is a string
    const safeDisplayName = String(displayName || 'Unknown');
    console.log('Safe displayName:', safeDisplayName);
    
    // Ensure getInitials is a function and safeDisplayName is a string
    const initials = typeof getInitials === 'function' ? getInitials(safeDisplayName) : 'U';
    console.log('Initials:', initials);
    
    return (
      <div
        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary-100 rounded transition-colors ${isActive ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'}`}
        onClick={onSelect}
      >
        <div className="relative mr-3">
          {conv?.avatar ? (
            <img src={conv.avatar} alt={safeDisplayName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
              {initials}
            </div>
          )}
          {conv?.status && (
            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          )}
        </div>
        <span className="flex-1 truncate">{safeDisplayName}</span>
        <button onClick={e => { e.stopPropagation(); onStar(); }} className="ml-2 text-yellow-400 hover:text-yellow-500">
          <Star fill={starred ? 'currentColor' : 'none'} className="h-4 w-4" />
        </button>
        {conv?.unread > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in SidebarConversation render:', error);
    return (
      <div className="flex items-center px-4 py-2 text-red-500">
        <span>Error loading conversation</span>
      </div>
    );
  }
} 