import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Phone,
  Mail,
  Video,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockContacts = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
    status: 'online',
    favorite: true,
    department: 'Engineering'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 234-5678',
    avatar: null,
    status: 'offline',
    favorite: false,
    department: 'Design'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 (555) 345-6789',
    avatar: null,
    status: 'online',
    favorite: true,
    department: 'Product'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '+1 (555) 456-7890',
    avatar: null,
    status: 'away',
    favorite: false,
    department: 'Marketing'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    phone: '+1 (555) 567-8901',
    avatar: null,
    status: 'online',
    favorite: false,
    department: 'Sales'
  }
];

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'favorites' && contact.favorite) ||
                         (filter === 'online' && contact.status === 'online');
    return matchesSearch && matchesFilter;
  });

  const addContact = () => {
    const contact = {
      id: Date.now(),
      ...newContact,
      avatar: null,
      status: 'offline',
      favorite: false
    };
    setContacts([contact, ...contacts]);
    setShowAddModal(false);
    setNewContact({ name: '', email: '', phone: '', department: '' });
  };

  const toggleFavorite = (id) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, favorite: !contact.favorite } : contact
    ));
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const startVideoCall = (contact) => {
    const roomId = Date.now().toString();
    navigate(`/meeting/${roomId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Contacts</h1>
          <p className="text-secondary-600 mt-1">Manage your contacts and team members</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Contact</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'favorites', 'online'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {getInitials(contact.name)}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor(contact.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{contact.name}</h3>
                  <p className="text-sm text-secondary-600">{contact.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleFavorite(contact.id)}
                  className={`p-1 rounded ${contact.favorite ? 'text-yellow-500' : 'text-secondary-400 hover:text-yellow-500'}`}
                >
                  <Star className={`h-4 w-4 ${contact.favorite ? 'fill-current' : ''}`} />
                </button>
                <button className="p-1 text-secondary-400 hover:text-secondary-600 rounded">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-secondary-600">
                <Mail className="h-4 w-4 mr-2" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{contact.phone}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => startVideoCall(contact)}
                className="btn-primary flex-1 text-sm py-2 flex items-center justify-center"
              >
                <Video className="h-4 w-4 mr-1" />
                Call
              </button>
              <button className="btn-outline text-sm py-2 px-3">
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteContact(contact.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Add New Contact</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="input-field"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="input-field"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Department</label>
                <select
                  value={newContact.department}
                  onChange={(e) => setNewContact({...newContact, department: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={addContact}
                className="btn-primary flex-1"
              >
                Add Contact
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 