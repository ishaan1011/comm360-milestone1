import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Play,
  Edit,
  Trash2,
  Copy,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const mockMeetings = [
  {
    id: 1,
    title: 'Team Standup Meeting',
    description: 'Daily team synchronization and updates',
    date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 30,
    participants: ['john@example.com', 'jane@example.com', 'bob@example.com'],
    status: 'upcoming',
    roomId: 'room123'
  },
  {
    id: 2,
    title: 'Client Presentation',
    description: 'Quarterly review with major client',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    duration: 60,
    participants: ['client@company.com', 'manager@company.com'],
    status: 'upcoming',
    roomId: 'room456'
  },
  {
    id: 3,
    title: 'Project Review',
    description: 'Weekly project status and planning',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: 45,
    participants: ['dev1@example.com', 'dev2@example.com', 'pm@example.com'],
    status: 'completed',
    roomId: 'room789'
  },
  {
    id: 4,
    title: 'Design Workshop',
    description: 'UI/UX design brainstorming session',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    duration: 90,
    participants: ['designer1@example.com', 'designer2@example.com', 'product@example.com'],
    status: 'completed',
    roomId: 'room101'
  }
];

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState(mockMeetings);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    participants: []
  });

  const filteredMeetings = meetings.filter(meeting => {
    const matchesFilter = filter === 'all' || meeting.status === filter;
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const createMeeting = () => {
    const meeting = {
      id: Date.now(),
      ...newMeeting,
      date: new Date(`${newMeeting.date}T${newMeeting.time}`),
      participants: newMeeting.participants.filter(p => p.trim()),
      status: 'upcoming',
      roomId: `room${Date.now()}`
    };
    setMeetings([meeting, ...meetings]);
    setShowCreateModal(false);
    setNewMeeting({ title: '', description: '', date: '', time: '', duration: 30, participants: [] });
  };

  const joinMeeting = (roomId) => {
    navigate(`/meeting/${roomId}`);
  };

  const copyMeetingLink = (roomId) => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${roomId}`);
  };

  const deleteMeeting = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Meetings</h1>
          <p className="text-secondary-600 mt-1">Manage your meetings and schedules</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Meeting</span>
        </motion.button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'upcoming', 'completed'].map((status) => (
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

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMeetings.map((meeting) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{meeting.title}</h3>
                  <p className="text-sm text-secondary-600">{meeting.description}</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-secondary-100 rounded">
                  <MoreVertical className="h-4 w-4 text-secondary-500" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-secondary-600">
                <Calendar className="h-4 w-4 mr-2" />
                {format(meeting.date, 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <Clock className="h-4 w-4 mr-2" />
                {format(meeting.date, 'HH:mm')} • {meeting.duration} min
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <Users className="h-4 w-4 mr-2" />
                {meeting.participants.length} participants
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                meeting.status === 'upcoming' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {meeting.status}
              </span>
              
              <div className="flex space-x-2">
                {meeting.status === 'upcoming' && (
                  <>
                    <button
                      onClick={() => joinMeeting(meeting.roomId)}
                      className="btn-primary text-sm py-1 px-3 flex items-center"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Join
                    </button>
                    <button
                      onClick={() => copyMeetingLink(meeting.roomId)}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteMeeting(meeting.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Create New Meeting</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  className="input-field"
                  placeholder="Meeting title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Meeting description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Duration (minutes)</label>
                <select
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({...newMeeting, duration: parseInt(e.target.value)})}
                  className="input-field"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={createMeeting}
                className="btn-primary flex-1"
              >
                Create Meeting
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 