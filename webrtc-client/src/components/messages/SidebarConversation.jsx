import React from 'react';
import { Star } from 'lucide-react';

export default function SidebarConversation({
  conv,
  isActive,
  onSelect,
  onStar,
  starred,
  getInitials,
}) {
  return (
    <div
      className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary-100 rounded transition-colors ${isActive ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'}`}
      onClick={onSelect}
    >
      <div className="relative mr-3">
        {conv.avatar ? (
          <img src={conv.avatar} alt={conv.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
            {getInitials(conv.name)}
          </div>
        )}
        {conv.status && (
          <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        )}
      </div>
      <span className="flex-1 truncate">{conv.name}</span>
      <button onClick={e => { e.stopPropagation(); onStar(); }} className="ml-2 text-yellow-400 hover:text-yellow-500">
        <Star fill={starred ? 'currentColor' : 'none'} className="h-4 w-4" />
      </button>
      {conv.unread > 0 && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
      )}
    </div>
  );
} 