import React, { useState, useEffect } from 'react';
import { X, Crown, UserPlus, UserMinus, Settings, Trash2, Users, Hash } from 'lucide-react';
import API from '../../api/client';

function getInitials(name) {
  if (!name || typeof name !== 'string') {
    return 'U';
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function ConversationSettingsModal({ 
  isOpen, 
  onClose, 
  conversation, 
  currentUserId,
  onConversationUpdated,
  onConversationDeleted 
}) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [communityName, setCommunityName] = useState('');

  const isOwner = conversation?.createdBy === currentUserId;
  const isAdmin = conversation?.admins?.includes(currentUserId);

  useEffect(() => {
    if (isOpen && conversation) {
      setGroupName(conversation.name || '');
      setCommunityName(conversation.name || '');
      fetchUsers();
    }
  }, [isOpen, conversation]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/api/users');
      const allUsers = response.data.users || response.data || [];
      // Filter out current user and existing members
      const existingMemberIds = conversation?.members?.map(m => m._id || m) || [];
      const availableUsers = allUsers.filter(user => 
        user._id !== currentUserId && !existingMemberIds.includes(user._id)
      );
      setUsers(availableUsers);
      setFilteredUsers(availableUsers);
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

  const handleAddMember = async (userId) => {
    try {
      await API.post(`/api/conversations/${conversation._id}/add-member`, { userId });
      setSuccess('Member added successfully');
      onConversationUpdated();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add member');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await API.post(`/api/conversations/${conversation._id}/remove-member`, { userId });
      setSuccess('Member removed successfully');
      onConversationUpdated();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const isCurrentlyAdmin = conversation.admins?.includes(userId);
      if (isCurrentlyAdmin) {
        await API.post(`/api/conversations/${conversation._id}/remove-admin`, { userId });
        setSuccess('Admin removed successfully');
      } else {
        await API.post(`/api/conversations/${conversation._id}/add-admin`, { userId });
        setSuccess('Admin added successfully');
      }
      onConversationUpdated();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update admin status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateName = async () => {
    try {
      const newName = conversation.type === 'group' ? groupName : communityName;
      if (!newName.trim()) {
        setError('Name is required');
        return;
      }
      
      await API.put(`/api/conversations/${conversation._id}`, { name: newName.trim() });
      setSuccess('Name updated successfully');
      onConversationUpdated();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update name');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/api/conversations/${conversation._id}`);
      setSuccess('Conversation deleted successfully');
      onConversationDeleted();
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete conversation');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setError(null);
    setSuccess(null);
    setGroupName('');
    setCommunityName('');
    onClose();
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {conversation.type === 'dm' && <UserPlus className="h-5 w-5" />}
            {conversation.type === 'group' && <Users className="h-5 w-5" />}
            {conversation.type === 'community' && <Hash className="h-5 w-5" />}
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.type === 'dm' ? 'Direct Message Settings' :
               conversation.type === 'group' ? 'Group Settings' : 'Community Settings'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Conversation Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Conversation Info</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Members:</span> {conversation.members?.length || 0}
              </p>
              {conversation.createdAt && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {new Date(conversation.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Name Update (for Groups and Communities) */}
          {(conversation.type === 'group' || conversation.type === 'community') && isAdmin && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {conversation.type === 'group' ? 'Group Name' : 'Community Name'}
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={conversation.type === 'group' ? groupName : communityName}
                  onChange={(e) => conversation.type === 'group' ? setGroupName(e.target.value) : setCommunityName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUpdateName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* Add Members (for Groups) */}
          {conversation.type === 'group' && isAdmin && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Add Members</h3>
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs">
                          {getInitials(user.fullName || user.username)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{user.fullName || user.username}</span>
                    </div>
                    <button
                      onClick={() => handleAddMember(user._id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Members</h3>
            <div className="space-y-2">
              {conversation.members?.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.fullName || member.username} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <span className="text-blue-600 font-semibold text-sm">
                          {getInitials(member.fullName || member.username)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.fullName || member.username}
                      </p>
                      {member._id === conversation.createdBy && (
                        <span className="text-xs text-gray-500">Owner</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(conversation.type === 'group' || conversation.type === 'community') && (
                      conversation.admins?.includes(member._id) ? (
                        <span className="text-xs text-blue-600 flex items-center">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Member</span>
                      )
                    )}
                    {isOwner && member._id !== currentUserId && (conversation.type === 'group' || conversation.type === 'community') && (
                      <button
                        onClick={() => handleToggleAdmin(member._id)}
                        className={`px-2 py-1 text-xs rounded ${
                          conversation.admins?.includes(member._id)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {conversation.admins?.includes(member._id) ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    )}
                    {(isAdmin || conversation.type === 'dm') && member._id !== currentUserId && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Conversation */}
          {(conversation.type === 'dm' || isAdmin) && (
            <div className="border-t pt-4">
              <button
                onClick={handleDeleteConversation}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 