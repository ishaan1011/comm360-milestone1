import React, { useState, useEffect } from 'react';
import { X, Crown, Users, Hash, Edit, Save, X as CloseIcon, Plus, UserPlus, UserMinus, Shield, MoreVertical } from 'lucide-react';
import API from '../../api/client';

function getInitials(name) {
  if (!name || typeof name !== 'string') {
    return 'U';
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function ConversationDetailsModal({ 
  isOpen, 
  onClose, 
  conversation, 
  currentUserId,
  onConversationUpdated
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(null);
  const [memberActionMenu, setMemberActionMenu] = useState(null);

  useEffect(() => {
    if (isOpen && conversation) {
      setName(conversation.name || '');
      setDescription(conversation.description || '');
      fetchAllUsers();
    }
  }, [isOpen, conversation]);

  const fetchAllUsers = async () => {
    try {
      const response = await API.get('/api/users');
      const users = response.data.users || response.data || [];
      // Filter out users who are already members
      const nonMembers = users.filter(user => 
        user._id !== currentUserId && 
        !conversation.members?.some(member => member._id === user._id)
      );
      setAllUsers(nonMembers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const isOwner = conversation?.createdBy === currentUserId;
  const isAdmin = conversation?.admins?.includes(currentUserId);
  const canEdit = isAdmin || conversation?.type === 'dm';
  const canManageMembers = isAdmin && conversation?.type !== 'dm';

  const handleSaveName = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      await API.put(`/api/conversations/${conversation._id}`, { name: name.trim() });
      setIsEditingName(false);
      setSuccess('Name updated successfully');
      onConversationUpdated();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update name');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSaveDescription = async () => {
    try {
      await API.put(`/api/conversations/${conversation._id}`, { description: description.trim() });
      setIsEditingDescription(false);
      setSuccess('Description updated successfully');
      onConversationUpdated();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update description');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await API.post(`/api/conversations/${conversation._id}/admins`, { userId });
      setSuccess('Admin added successfully');
      onConversationUpdated();
      setMemberActionMenu(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add admin');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      await API.delete(`/api/conversations/${conversation._id}/admins/${userId}`);
      setSuccess('Admin removed successfully');
      onConversationUpdated();
      setMemberActionMenu(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove admin');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await API.delete(`/api/conversations/${conversation._id}/members/${userId}`);
      setSuccess('Member removed successfully');
      onConversationUpdated();
      setMemberActionMenu(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;
    
    try {
      await API.post(`/api/conversations/${conversation._id}/members`, { userId: selectedUserToAdd._id });
      setSuccess('Member added successfully');
      onConversationUpdated();
      setShowAddMemberModal(false);
      setSelectedUserToAdd(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add member');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClose = () => {
    setIsEditingName(false);
    setIsEditingDescription(false);
    setError(null);
    setSuccess(null);
    setShowAddMemberModal(false);
    setSelectedUserToAdd(null);
    setMemberActionMenu(null);
    onClose();
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {conversation.type === 'dm' && <Users className="h-5 w-5" />}
            {conversation.type === 'group' && <Users className="h-5 w-5" />}
            {conversation.type === 'community' && <Hash className="h-5 w-5" />}
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.type === 'dm' ? 'Direct Message' :
               conversation.type === 'group' ? 'Group Details' : 'Community Details'}
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
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Members:</span> {conversation.members?.length || 0} total
              </p>
              {conversation.createdAt && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {new Date(conversation.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Name Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {conversation.type === 'dm' ? 'Direct Message' : 
                 conversation.type === 'group' ? 'Group Name' : 'Community Name'}
              </h3>
              {canEdit && !isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            {isEditingName ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setName(conversation.name || '');
                  }}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-900 font-medium">{conversation.name || 'Unnamed'}</p>
              </div>
            )}
          </div>

          {/* Description Section (for Groups and Communities) */}
          {(conversation.type === 'group' || conversation.type === 'community') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                {canEdit && !isEditingDescription && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter description..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveDescription}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setDescription(conversation.description || '');
                      }}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-700">
                    {conversation.description || 'No description available'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                Members ({conversation.members?.length || 0})
              </h3>
              {canManageMembers && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Member</span>
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {conversation.members?.map((member) => (
                <div key={member._id} className="relative">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName || member.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
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
                        <div className="flex items-center space-x-2">
                          {member._id === conversation.createdBy && (
                            <span className="text-xs text-purple-600 font-medium">Owner</span>
                          )}
                          {conversation.admins?.includes(member._id) && (
                            <span className="text-xs text-blue-600 flex items-center">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canManageMembers && member._id !== currentUserId && (
                      <button
                        onClick={() => setMemberActionMenu(memberActionMenu === member._id ? null : member._id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  
                  {/* Member Action Menu */}
                  {memberActionMenu === member._id && canManageMembers && member._id !== currentUserId && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                      {!conversation.admins?.includes(member._id) ? (
                        <button
                          onClick={() => handleMakeAdmin(member._id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Make Admin</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(member._id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                        >
                          <UserMinus className="h-4 w-4" />
                          <span>Remove Admin</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                      >
                        <UserMinus className="h-4 w-4" />
                        <span>Remove Member</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-80 max-h-[60vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>
                <button 
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {allUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No users available to add</p>
                ) : (
                  <div className="space-y-2">
                    {allUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => setSelectedUserToAdd(user)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                          selectedUserToAdd?._id === user._id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName || user.username}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-sm">
                              {getInitials(user.fullName || user.username)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.fullName || user.username}
                          </p>
                          {user.fullName && (
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedUserToAdd}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 