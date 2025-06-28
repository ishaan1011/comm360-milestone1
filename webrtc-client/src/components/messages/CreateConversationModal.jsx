import React, { useState, useEffect } from 'react';
import { Search, User, Users, Hash, X, Plus } from 'lucide-react';
import API from '../../api/client';

function getInitials(name) {
  if (!name || typeof name !== 'string') {
    return 'U';
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function CreateConversationModal({ isOpen, onClose, onConversationCreated, currentUserId }) {
  const [conversationType, setConversationType] = useState('dm');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [communityName, setCommunityName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/api/users');
      const allUsers = response.data.users || response.data || [];
      const otherUsers = allUsers.filter(user => user._id !== currentUserId);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleUserToggle = (user) => {
    if (conversationType === 'dm') {
      handleCreateConversation([user._id]);
    } else if (conversationType === 'group') {
      setSelectedUsers(prev => {
        const isSelected = prev.find(u => u._id === user._id);
        if (isSelected) {
          return prev.filter(u => u._id !== user._id);
        } else {
          return [...prev, user];
        }
      });
    }
  };

  const handleCreateConversation = async (memberIds = selectedUsers.map(u => u._id)) => {
    if (conversationType === 'dm' && memberIds.length !== 1) {
      setError('Direct messages can only have one other member');
      return;
    }
    
    if (conversationType === 'group' && (!groupName.trim() || memberIds.length === 0)) {
      setError('Group name and at least one member are required');
      return;
    }
    
    if (conversationType === 'community' && !communityName.trim()) {
      setError('Community name is required');
      return;
    }

    try {
      const conversationData = {
        type: conversationType,
        memberIds: conversationType === 'community' ? [] : memberIds
      };

      if (conversationType === 'group') {
        conversationData.name = groupName.trim();
      } else if (conversationType === 'community') {
        conversationData.name = communityName.trim();
      }

      const response = await API.post('/api/conversations', conversationData);
      
      // Check if this is an existing DM being returned
      if (response.data.message && response.data.message.includes('already exists')) {
        // Existing DM found, just select it
        onConversationCreated(response.data.conversation);
        handleClose();
        return;
      }
      
      onConversationCreated(response.data.conversation);
      handleClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError(error.response?.data?.message || 'Failed to create conversation');
    }
  };

  const handleClose = () => {
    setConversationType('dm');
    setSearchTerm('');
    setError(null);
    setGroupName('');
    setSelectedUsers([]);
    setCommunityName('');
    onClose();
  };

  const isUserSelected = (user) => {
    return selectedUsers.find(u => u._id === user._id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Conversation</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setConversationType('dm')}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                conversationType === 'dm' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Direct Message</span>
            </button>
            <button
              onClick={() => setConversationType('group')}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                conversationType === 'group' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Group</span>
            </button>
            <button
              onClick={() => setConversationType('community')}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                conversationType === 'community' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Hash className="h-4 w-4" />
              <span className="text-sm font-medium">Community</span>
            </button>
          </div>
        </div>

        {(conversationType === 'group' || conversationType === 'community') && (
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {conversationType === 'group' ? 'Group Name' : 'Community Name'}
            </label>
            <input
              type="text"
              placeholder={conversationType === 'group' ? 'Enter group name...' : 'Enter community name...'}
              value={conversationType === 'group' ? groupName : communityName}
              onChange={(e) => conversationType === 'group' ? setGroupName(e.target.value) : setCommunityName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {conversationType === 'group' && selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Members ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-2 bg-blue-100 px-2 py-1 rounded-full">
                  <span className="text-sm text-blue-700">{user.fullName || user.username}</span>
                  <button
                    onClick={() => setSelectedUsers(prev => prev.filter(u => u._id !== user._id))}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={conversationType === 'dm' ? 'Search users...' : 'Search users to add...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserToggle(user)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                    isUserSelected(user) 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName || user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {getInitials(user.fullName || user.username)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.fullName || user.username}
                    </p>
                    {user.fullName && (
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    )}
                  </div>
                  {conversationType === 'group' && (
                    <div className="flex items-center">
                      {isUserSelected(user) ? (
                        <Plus className="h-4 w-4 text-blue-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {conversationType === 'group' && selectedUsers.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => handleCreateConversation()}
              disabled={!groupName.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Create Group
            </button>
          </div>
        )}
        
        {conversationType === 'community' && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => handleCreateConversation([])}
              disabled={!communityName.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Create Community
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
