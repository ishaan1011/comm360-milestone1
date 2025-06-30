import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Users, 
  Clock, 
  Calendar,
  Plus,
  Phone,
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ScheduleMeetingModal from '../components/ScheduleMeetingModal.jsx';
import API from '../api/client.js';

const stats = [
  { name: 'Total Meetings', value: '24', icon: Video, change: '+12%', changeType: 'positive' },
  { name: 'Active Contacts', value: '156', icon: Users, change: '+8%', changeType: 'positive' },
  { name: 'Hours This Week', value: '18.5', icon: Clock, change: '+5%', changeType: 'positive' },
  { name: 'Upcoming', value: '3', icon: Calendar, change: '0%', changeType: 'neutral' },
];

const recentMeetings = [
  { id: 1, title: 'Team Standup', participants: 8, duration: '30m', date: '2 hours ago', status: 'completed' },
  { id: 2, title: 'Client Presentation', participants: 12, duration: '1h 15m', date: 'Yesterday', status: 'completed' },
  { id: 3, title: 'Project Review', participants: 5, duration: '45m', date: '2 days ago', status: 'completed' },
  { id: 4, title: 'Weekly Sync', participants: 15, duration: '1h', date: '3 days ago', status: 'completed' },
];

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    // Fetch active rooms
    API.get('/api/rooms')
      .then(res => {
        setRooms(res.data.rooms || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rooms:', err);
        setLoading(false);
      });
  }, []);

  const createNewMeeting = () => {
    const roomId = Date.now().toString();
    navigate(`/meeting/${roomId}`);
  };

  const joinMeeting = (roomId) => {
    navigate(`/meeting/${roomId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome back, {user?.fullName || user?.username}!
            </h1>
            <p className="text-secondary-600 mt-1">
              Here's what's happening with your meetings today.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewMeeting}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Meeting</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-secondary-500'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rooms */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Active Rooms</h2>
            <Activity className="h-5 w-5 text-primary-600" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <div className="space-y-3">
              {rooms.slice(0, 5).map((room) => (
                <motion.div
                  key={room.roomId}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer"
                  onClick={() => joinMeeting(room.roomId)}
                >
                  <div>
                    <p className="font-medium text-secondary-900">Room {room.roomId}</p>
                    <p className="text-sm text-secondary-600">{room.participants || 0} participants</p>
                  </div>
                  <button className="btn-primary text-sm py-1 px-3">
                    Join
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-secondary-400 mx-auto mb-3" />
              <p className="text-secondary-600">No active rooms</p>
              <button 
                onClick={createNewMeeting}
                className="btn-primary mt-3"
              >
                Start a meeting
              </button>
            </div>
          )}
        </div>

        {/* Recent Meetings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Meetings</h2>
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Video className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{meeting.title}</p>
                    <p className="text-sm text-secondary-600">
                      {meeting.participants} participants • {meeting.duration}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary-500">{meeting.date}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {meeting.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewMeeting}
            className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Video className="h-8 w-8 text-primary-600 mb-2" />
            <span className="font-medium text-primary-700">New Meeting</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/contacts')}
            className="flex flex-col items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            <Users className="h-8 w-8 text-secondary-600 mb-2" />
            <span className="font-medium text-secondary-700">Add Contact</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/meetings')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Calendar className="h-8 w-8 text-green-600 mb-2" />
            <span className="font-medium text-green-700">Schedule</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/messages')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
            <span className="font-medium text-purple-700">Messages</span>
          </motion.button>
        </div>
      </div>
      <ScheduleMeetingModal
        open={scheduling}
        onClose={() => setScheduling(false)}
      />
    </div>
  );
} 