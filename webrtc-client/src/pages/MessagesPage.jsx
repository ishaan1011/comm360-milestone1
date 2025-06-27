import React, { useState } from 'react';
import { User, Users, Hash, Plus, Search, MoreVertical } from 'lucide-react';
import SidebarConversation from '../components/messages/SidebarConversation';
import ChatWindow from '../components/messages/ChatWindow';
import ChatInput from '../components/messages/ChatInput';
import SettingsPanel from '../components/messages/SettingsPanel';

const mockDMs = [
  { id: 'dm-1', name: 'John Doe', avatar: null, status: 'online', unread: 2, type: 'dm', messages: [
    { id: 1, sender: 'John Doe', text: 'Hey there!', timestamp: '2024-06-01T09:00:00' },
    { id: 2, sender: 'You', text: 'Hi John!', timestamp: '2024-06-01T09:01:00' },
    { id: 3, sender: 'John Doe', text: 'How are you?', timestamp: '2024-06-02T10:00:00' },
  ] },
  { id: 'dm-2', name: 'Jane Smith', avatar: null, status: 'offline', unread: 0, type: 'dm', messages: [
    { id: 1, sender: 'Jane Smith', text: 'Ready for the meeting?', timestamp: '2024-06-01T10:00:00' },
    { id: 2, sender: 'You', text: 'Yes, joining now.', timestamp: '2024-06-01T10:01:00' },
  ] },
];

const mockGroups = [
  { id: 'group-1', name: 'Project Alpha', avatar: null, unread: 1, type: 'group', messages: [
    { id: 1, sender: 'Alice', text: "Let's sync up at 2pm.", timestamp: '2024-06-01T08:30:00' },
    { id: 2, sender: 'Bob', text: 'Works for me!', timestamp: '2024-06-01T08:31:00' },
    { id: 3, sender: 'You', text: "I'll be there!", timestamp: '2024-06-02T11:00:00' },
  ] },
];

const mockCommunities = [
  { id: 'community-1', name: 'Engineering', avatar: null, unread: 0, type: 'community', messages: [
    { id: 1, sender: 'Charlie', text: 'Welcome to the channel!', timestamp: '2024-06-01T12:00:00' },
  ] },
];

const allConversationsData = [
  { section: 'Direct Messages', icon: User, items: mockDMs },
  { section: 'Groups', icon: Users, items: mockGroups },
  { section: 'Communities', icon: Hash, items: mockCommunities },
];

const emojiList = ['😀','😂','😍','👍','🎉','😢','😮','🔥','🙏','❤️','🚀','😎'];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function groupMessagesByDate(messages) {
  return messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});
}

export default function MessagesPage() {
  const [allConversations, setAllConversations] = useState(allConversationsData);
  const [selected, setSelected] = useState(mockDMs[0]);
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

  // Filter conversations by search
  const filteredConversations = allConversations.map(section => ({
    ...section,
    items: section.items.filter(conv => conv.name.toLowerCase().includes(search.toLowerCase())),
  }));

  const handleSelect = (conv) => {
    setSelected(conv);
    setReplyTo(null);
    setShowEmojiPicker(false);
    // Mark as read (mock)
    setAllConversations(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item => item.id === conv.id ? { ...item, unread: 0 } : item)
    })));
  };

  const handleSend = () => {
    if (input.trim() || uploadFile) {
      const newMsg = {
        id: Date.now(),
        sender: 'You',
        text: input,
        file: uploadFile
          ? {
              name: uploadFile.name,
              type: uploadFile.type,
              url: URL.createObjectURL(uploadFile),
            }
          : undefined,
        timestamp: new Date().toISOString(),
        replyTo: replyTo ? replyTo.id : undefined,
      };
      setSelected(prev => ({
        ...prev,
        messages: [...prev.messages, newMsg],
      }));
      setInput('');
      setUploadFile(null);
      setReplyTo(null);
      setTyping(false);
    }
  };

  const handleEdit = (msg) => {
    setEditMsgId(msg.id);
    setEditInput(msg.text);
  };

  const handleEditSave = () => {
    setSelected(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === editMsgId ? { ...m, text: editInput, edited: true } : m),
    }));
    setEditMsgId(null);
    setEditInput('');
  };

  const handleEditCancel = () => {
    setEditMsgId(null);
    setEditInput('');
  };

  const handleDelete = (msgId) => {
    setSelected(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== msgId),
    }));
  };

  const handleStar = (convId) => {
    setStarred(prev => prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId]);
  };

  // Modal for new DM/Group/Community (mock)
  const handleNewConversation = () => {
    setShowModal(false);
    // Add a new mock conversation (not persistent)
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

  const handleEmojiClick = (emoji, msgId) => {
    setReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] ? [...prev[msgId], emoji] : [emoji],
    }));
    setShowEmojiPicker(false);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  // Group messages by date
  const grouped = groupMessagesByDate(selected.messages);

  // Mock real-time bot/user
  React.useEffect(() => {
    if (!selected) return;
    const botNames = ['Bot Alice', 'Bot Bob'];
    const botInterval = setInterval(() => {
      // Only send if user is not viewing the bot's conversation
      const botConv = allConversations.flatMap(s => s.items).find(c => c.name === 'Bot Alice');
      if (botConv && selected.id !== botConv.id) {
        const newMsg = {
          id: Date.now(),
          sender: 'Bot Alice',
          text: 'This is a real-time mock message! ' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
        };
        setAllConversations(prev => prev.map(section => ({
          ...section,
          items: section.items.map(item => item.id === botConv.id ? { ...item, messages: [...item.messages, newMsg], unread: (item.unread || 0) + 1 } : item)
        })));
        if (settings.notifications) {
          setNotification({
            message: `New message from ${botConv.name}`,
            convId: botConv.id,
          });
          if (settings.sound) {
            const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c7b.mp3');
            audio.play();
          }
        }
      }
    }, 10000);
    return () => clearInterval(botInterval);
  }, [selected, allConversations, settings.notifications, settings.sound]);

  // Dismiss notification on conversation open
  React.useEffect(() => {
    if (notification && selected.id === notification.convId) {
      setNotification(null);
    }
  }, [selected, notification]);

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
                  key={conv.id}
                  conv={conv}
                  isActive={selected.id === conv.id}
                  onSelect={() => handleSelect(conv)}
                  onStar={() => handleStar(conv.id)}
                  starred={starred.includes(conv.id)}
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
            {selected.avatar ? (
              <img src={selected.avatar} alt={selected.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                {getInitials(selected.name)}
              </div>
            )}
            <span>{selected.name}</span>
            {selected.status && (
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