import React, { useState, useEffect } from 'react';
import { User, Users, Hash, Plus, Search, MoreVertical } from 'lucide-react';
import SidebarConversation from '../components/messages/SidebarConversation';
import ChatWindow from '../components/messages/ChatWindow';
import ChatInput from '../components/messages/ChatInput';
import SettingsPanel from '../components/messages/SettingsPanel';
import * as conversationAPI from '../api/conversationService';
import * as messageAPI from '../api/messageService';
import { useAuth } from '../context/AuthContext';
import { useChatSocket } from '../context/ChatSocketContext';

// Placeholder for emoji list
const emojiList = ['😀','😂','😍','👍','🎉','😢','😮','🔥','🙏','❤️','🚀','😎'];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function groupMessagesByDate(messages) {
  return messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt || msg.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});
}

export default function MessagesPage() {
  const { user } = useAuth();
  const chatSocket = useChatSocket();
  const [allConversations, setAllConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('dm');
  const [starred, setStarred] = useState([]);
  const [typing, setTyping] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [reactions, setReactions] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ notifications: true, sound: true, dark: false });
  const [notification, setNotification] = useState(null);

  // Fetch conversations on mount (REST)
  useEffect(() => {
    conversationAPI.getConversations().then(res => {
      console.log('Conversations API response:', res);
      const conversations = res.data.conversations || res.data || [];
      console.log('Processed conversations:', conversations);
      
      setAllConversations([
        { section: 'Direct Messages', icon: User, items: conversations.filter(c => c.type === 'dm') },
        { section: 'Groups', icon: Users, items: conversations.filter(c => c.type === 'group') },
        { section: 'Communities', icon: Hash, items: conversations.filter(c => c.type === 'community') },
      ]);
      
      // Auto-select first conversation
      const first = conversations[0];
      if (first) {
        console.log('Auto-selecting first conversation:', first);
        handleSelect(first);
      }
    }).catch(error => {
      console.error('Error fetching conversations:', error);
    });
    // eslint-disable-next-line
  }, []);

  // Fetch messages when a conversation is selected (REST, then join room)
  useEffect(() => {
    if (selected && selected._id) {
      messageAPI.getMessages(selected._id).then(res => {
        setMessages(res.data.messages);
      });
      chatSocket.joinConversation(selected._id);
      return () => chatSocket.leaveConversation(selected._id);
    }
    // eslint-disable-next-line
  }, [selected]);

  // Real-time event listeners
  useEffect(() => {
    if (!chatSocket.socket) return;
    // New message
    chatSocket.on('chat:new', msg => {
      setMessages(prev => [...prev, msg]);
    });
    // Edit message
    chatSocket.on('chat:edit', ({ messageId, text }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, text, edited: true } : m));
    });
    // Delete message
    chatSocket.on('chat:delete', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });
    // React to message
    chatSocket.on('chat:react', ({ messageId, emoji, userId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: [...(m.reactions || []), { user: userId, emoji }] } : m));
    });
    // Unreact
    chatSocket.on('chat:unreact', ({ messageId, emoji, userId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: (m.reactions || []).filter(r => !(r.user === userId && r.emoji === emoji)) } : m));
    });
    // Typing
    chatSocket.on('chat:typing', ({ userId: typingUserId, typing }) => {
      if (typingUserId !== user.id) setTyping(typing);
    });
    return () => {
      chatSocket.off('chat:new');
      chatSocket.off('chat:edit');
      chatSocket.off('chat:delete');
      chatSocket.off('chat:react');
      chatSocket.off('chat:unreact');
      chatSocket.off('chat:typing');
    };
    // eslint-disable-next-line
  }, [chatSocket.socket, selected]);

  // Filter conversations by search
  const filteredConversations = allConversations.map(section => ({
    ...section,
    items: section.items.filter(conv => conv.name?.toLowerCase().includes(search.toLowerCase()) || conv.members?.some(m => m.fullName?.toLowerCase().includes(search.toLowerCase()))),
  }));

  const handleSelect = (conv) => {
    console.log('Selecting conversation:', conv);
    if (!conv || !conv._id) {
      console.error('Invalid conversation object:', conv);
      return;
    }
    setSelected(conv);
    setReplyTo(null);
    setShowEmojiPicker(false);
    // Optionally: mark as read via API
  };

  const handleSend = async () => {
    // Check if a conversation is selected and has an _id
    if (!selected || !selected._id) {
      console.error('No conversation selected or conversation has no _id');
      return;
    }

    // Check if there's input to send
    if (!input.trim() && !uploadFile) {
      return;
    }

    try {
      let fileMeta = null;
      if (uploadFile) {
        const res = await messageAPI.uploadMessageFile(uploadFile);
        fileMeta = res.data;
      }
      
      chatSocket.sendMessage({
        conversationId: selected._id,
        text: input.trim(),
        file: fileMeta,
        replyTo: replyTo ? replyTo._id : undefined,
      });
      
      setInput('');
      setUploadFile(null);
      setReplyTo(null);
      setTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add a notification here to show the error to the user
    }
  };

  const handleEdit = (msg) => {
    setEditMsgId(msg._id);
    setEditInput(msg.text);
  };

  const handleEditSave = async () => {
    chatSocket.editMessage({ messageId: editMsgId, text: editInput });
    setEditMsgId(null);
    setEditInput('');
  };

  const handleEditCancel = () => {
    setEditMsgId(null);
    setEditInput('');
  };

  const handleDelete = async (msgId) => {
    chatSocket.deleteMessage({ messageId: msgId });
  };

  const handleStar = (convId) => {
    setStarred(prev => prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId]);
    // Optionally: persist star via API
  };

  const handleNewConversation = async () => {
    setShowModal(false);
    // TODO: Create new conversation via API
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
  };

  const handleEmojiClick = async (emoji, msgId) => {
    chatSocket.reactMessage({ messageId: msgId, emoji });
    setShowEmojiPicker(false);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  const handleTyping = (typing) => {
    if (selected && selected._id) {
      chatSocket.sendTyping({ conversationId: selected._id, typing });
    }
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className={`flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden${settings.dark ? ' dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-80 bg-secondary-50 border-r border-secondary-200 flex flex-col">
        <div className="p-4 border-b border-secondary-200 font-bold text-lg flex items-center justify-between">
          Messages
          <button onClick={() => { setShowModal(true); setModalType('dm'); }} className="p-1 hover:bg-secondary-100 rounded"><Plus className="h-5 w-5" /></button>
        </div>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(section => (
            <div key={section.section} className="mb-4">
              <div className="flex items-center px-4 py-2 text-secondary-500 uppercase text-xs font-semibold">
                <section.icon className="h-4 w-4 mr-2" />
                {section.section}
                {section.section !== 'Direct Messages' && (
                  <button onClick={() => { setShowModal(true); setModalType(section.section.toLowerCase()); }} className="ml-auto p-1 hover:bg-secondary-100 rounded"><Plus className="h-4 w-4" /></button>
                )}
              </div>
              {section.items.map(conv => (
                <SidebarConversation
                  key={conv._id}
                  conv={conv}
                  isActive={selected && selected._id === conv._id}
                  onSelect={() => handleSelect(conv)}
                  onStar={() => handleStar(conv._id)}
                  starred={starred.includes(conv._id)}
                  getInitials={getInitials}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="border-b border-secondary-200 px-6 py-4 font-semibold text-lg bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selected && selected.avatar ? (
              <img src={selected.avatar} alt={selected.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                {selected ? getInitials(selected.name || selected.members?.find(m => m._id !== user.id)?.fullName || '') : ''}
              </div>
            )}
            <span>{selected ? selected.name || selected.members?.filter(m => m._id !== user.id).map(m => m.fullName).join(', ') : ''}</span>
            {selected && selected.status && (
              <span className={`h-3 w-3 rounded-full ${selected.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-secondary-100 rounded" title="Settings">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"></path><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.13.21.22.45.22.7 0 .25-.09.49-.22.7z"></path></svg>
            </button>
          </div>
        </div>
        {/* Reply context */}
        {replyTo && (
          <div className="px-6 py-2 bg-secondary-100 text-secondary-700 flex items-center space-x-2">
            <span>Replying to:</span>
            <span className="italic truncate max-w-xs">{replyTo.text || replyTo.file?.name}</span>
            <button onClick={() => setReplyTo(null)} className="ml-2 text-secondary-400 hover:text-secondary-600">×</button>
          </div>
        )}
        {/* Chat messages */}
        <ChatWindow
          grouped={grouped}
          selected={selected}
          reactions={reactions}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiList={emojiList}
          editMsgId={editMsgId}
          editInput={editInput}
          setEditInput={setEditInput}
          handleEditSave={handleEditSave}
          handleEditCancel={handleEditCancel}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={handleReply}
          onEmoji={handleEmojiClick}
          replyContext={replyTo}
          typing={typing}
        />
        {/* Chat input */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onFileChange={handleFileChange}
          uploadFile={uploadFile}
          onRemoveFile={handleRemoveFile}
          onShowEmojiPicker={() => setShowEmojiPicker('input')}
          onTyping={handleTyping}
        />
        {notification && (
          <div className="fixed top-6 right-6 z-50 bg-primary-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-4 text-white">×</button>
          </div>
        )}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} setSettings={setSettings} />
      </div>
      {/* New Conversation Modal (mock) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 transition-opacity animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-8 w-96">
            <h2 className="text-lg font-bold mb-4">New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h2>
            <input className="w-full mb-4 px-3 py-2 border rounded" placeholder={`Enter ${modalType} name...`} />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-secondary-100 text-secondary-700">Cancel</button>
              <button onClick={handleNewConversation} className="px-4 py-2 rounded bg-primary-500 text-white">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 