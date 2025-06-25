import React, { useEffect, useRef, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share, 
  MoreVertical,
  Users,
  MessageSquare,
  Settings,
  Maximize,
  Minimize,
  Copy,
  LogOut
} from 'lucide-react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext.jsx';
import API from '../api/client.js';
import toast from 'react-hot-toast';

export default function MeetingPage() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    // Initialize media & socket
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem('token') },
      query: { roomId }
    });

    socket.on('roomParticipants', setParticipants);
    socket.on('userJoined', (user) => {
      toast.success(`${user.name} joined the meeting`);
    });
    socket.on('userLeft', (user) => {
      toast.success(`${user.name} left the meeting`);
    });

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
        // TODO: set up WebRTC peer connections using socket signaling
      })
      .catch(err => {
        console.error('Error accessing media devices:', err);
        toast.error('Unable to access camera/microphone');
      });

    return () => {
      socket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideo.current) {
          localVideo.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } else {
        if (localVideo.current) {
          localVideo.current.srcObject = localStream;
        }
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      toast.error('Unable to share screen');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${roomId}`);
    toast.success('Meeting link copied to clipboard');
  };

  const leaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  return (
    <div className="h-screen bg-secondary-900 flex flex-col">
      {/* Header */}
      <div className="bg-secondary-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">Meeting Room: {roomId}</h1>
          <div className="flex items-center space-x-2 text-secondary-300">
            <Users className="h-4 w-4" />
            <span>{participants.length + 1} participants</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyMeetingLink}
            className="btn-outline text-sm py-2 px-3 text-white border-secondary-600 hover:bg-secondary-700"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Link
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn-outline text-sm py-2 px-3 text-white border-secondary-600 hover:bg-secondary-700"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 p-4">
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Local Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-secondary-800 rounded-lg overflow-hidden"
              >
                <video
                  ref={localVideo}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-secondary-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-secondary-400">
                          {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <p className="text-secondary-400 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  You {!isAudioEnabled && '(Muted)'}
                </div>
              </motion.div>

              {/* Remote Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative bg-secondary-800 rounded-lg overflow-hidden"
              >
                <video
                  ref={remoteVideo}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-secondary-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="h-8 w-8 text-secondary-400" />
                    </div>
                    <p className="text-secondary-400 text-sm">Waiting for others to join...</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-secondary-800 border-l border-secondary-700"
          >
            {showParticipants && (
              <div className="p-4">
                <h3 className="text-white font-semibold mb-4">Participants ({participants.length + 1})</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-secondary-700 rounded-lg">
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {user?.fullName || user?.username} (You)
                      </p>
                      <p className="text-secondary-400 text-xs">Host</p>
                    </div>
                  </div>
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-secondary-700 rounded-lg">
                      <div className="h-8 w-8 bg-secondary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{participant.name}</p>
                        <p className="text-secondary-400 text-xs">Participant</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-secondary-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled 
                ? 'bg-secondary-600 hover:bg-secondary-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoEnabled 
                ? 'bg-secondary-600 hover:bg-secondary-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleScreenShare}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-secondary-600 hover:bg-secondary-500 text-white'
            }`}
          >
            <Share className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowParticipants(!showParticipants)}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              showParticipants 
                ? 'bg-primary-600 hover:bg-primary-500 text-white' 
                : 'bg-secondary-600 hover:bg-secondary-500 text-white'
            }`}
          >
            <Users className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              showChat 
                ? 'bg-primary-600 hover:bg-primary-500 text-white' 
                : 'bg-secondary-600 hover:bg-secondary-500 text-white'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={leaveMeeting}
            className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}