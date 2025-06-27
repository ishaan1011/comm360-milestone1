import React, { useState } from 'react';
import { User, Users, Hash, Plus, Circle, Star, Search, MoreVertical, Edit, Trash2, Reply, Paperclip, Smile } from 'lucide-react';

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

  // Filter conversations by search
  const filteredConversations = allConversations.map(section => ({
    ...section,
    items: section.items.filter(conv => conv.name.toLowerCase().includes(search.toLowerCase())),
  }));

  const handleSelect = (conv) => {
    setSelected(conv);
    // Mark as read (mock)
    setAllConversations(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item => item.id === conv.id ? { ...item, unread: 0 } : item)
    })));
  };

  const handleSend = () => {
    if (input.trim()) {
      const newMsg = {
        id: Date.now(),
        sender: 'You',
        text: input,
        timestamp: new Date().toISOString(),
      };
      setSelected(prev => ({
        ...prev,
        messages: [...prev.messages, newMsg],
      }));
      setInput('');
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
      messages: prev.messages.map(m => m.id === editMsgId ? { ...m, text: editInput } : m),
    }));
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
      // Add a mock message for the file
      const newMsg = {
        id: Date.now(),
        sender: 'You',
        text: '',
        file: {
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
        },
        timestamp: new Date().toISOString(),
      };
      setSelected(prev => ({
        ...prev,
        messages: [...prev.messages, newMsg],
      }));
    }
  };

  const handleEmojiClick = (emoji, msgId) => {
    setReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] ? [...prev[msgId], emoji] : [emoji],
    }));
    setShowEmojiPicker(false);
  };

  // Group messages by date
  const grouped = groupMessagesByDate(selected.messages);

  return (
    <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
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
                <div
                  key={conv.id}
                  className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary-100 rounded transition-colors ${selected.id === conv.id ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'}`}
                  onClick={() => handleSelect(conv)}
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
                  <button onClick={e => { e.stopPropagation(); handleStar(conv.id); }} className="ml-2 text-yellow-400 hover:text-yellow-500">
                    <Star fill={starred.includes(conv.id) ? 'currentColor' : 'none'} className="h-4 w-4" />
                  </button>
                  {conv.unread > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{conv.unread}</span>
                  )}
                </div>
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
          <button className="p-2 hover:bg-secondary-100 rounded"><MoreVertical className="h-5 w-5" /></button>
        </div>
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-secondary-50">
          {Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center text-xs text-secondary-400 mb-2">{date}</div>
              <div className="space-y-2">
                {msgs.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg relative group ${msg.sender === 'You' ? 'bg-primary-500 text-white' : 'bg-white text-secondary-900 border border-secondary-200'}`}> 
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{msg.sender}</div>
                        <div className="text-xs text-secondary-400 ml-2">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {editMsgId === msg.id ? (
                        <div className="flex items-center mt-1">
                          <input value={editInput} onChange={e => setEditInput(e.target.value)} className="flex-1 px-2 py-1 border rounded mr-2 text-black" />
                          <button onClick={handleEditSave} className="text-primary-600 text-xs font-semibold mr-1">Save</button>
                          <button onClick={() => setEditMsgId(null)} className="text-secondary-400 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="text-base mt-1">{msg.text}</div>
                          {msg.file && (
                            <div className="mt-2">
                              {msg.file.type.startsWith('image/') ? (
                                <img src={msg.file.url} alt={msg.file.name} className="max-w-[200px] rounded" />
                              ) : (
                                <a href={msg.file.url} download={msg.file.name} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{msg.file.name}</a>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {/* Emoji reactions */}
                      <div className="flex space-x-1 mt-2">
                        {(reactions[msg.id] || []).map((emoji, i) => (
                          <span key={i} className="text-lg cursor-pointer">{emoji}</span>
                        ))}
                        <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? false : msg.id)} className="ml-1 p-1 rounded hover:bg-secondary-100"><Smile className="h-4 w-4" /></button>
                        {showEmojiPicker === msg.id && (
                          <div className="absolute z-10 bg-white border rounded shadow p-2 flex flex-wrap mt-1">
                            {emojiList.map(emoji => (
                              <span key={emoji} className="text-xl cursor-pointer m-1" onClick={() => handleEmojiClick(emoji, msg.id)}>{emoji}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Message actions */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex space-x-1">
                        <button className="p-1 hover:bg-secondary-100 rounded"><Reply className="h-4 w-4" /></button>
                        {msg.sender === 'You' && (
                          <>
                            <button onClick={() => handleEdit(msg)} className="p-1 hover:bg-secondary-100 rounded"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(msg.id)} className="p-1 hover:bg-secondary-100 rounded"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Typing indicator (mock) */}
          {typing && <div className="text-xs text-secondary-400">Someone is typing...</div>}
        </div>
        {/* Chat input */}
        <div className="p-4 border-t border-secondary-200 bg-white">
          <div className="flex space-x-2 items-center">
            <label className="cursor-pointer p-2 rounded hover:bg-secondary-100">
              <Paperclip className="h-5 w-5" />
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setTyping(true); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >Send</button>
          </div>
        </div>
      </div>
      {/* New Conversation Modal (mock) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
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