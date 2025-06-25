import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWebRTC } from '../hooks/useWebRTC';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings, 
  Users,
  MessageCircle,
  Share,
  CircleDot,
  StopCircle
} from 'lucide-react';

export default function MeetingPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const {
    localStream,
    remoteStreams,
    isConnecting,
    error,
    participants,
    isConnected,
    currentRoom,
    localVideoRef,
    joinMeeting,
    leaveMeeting,
    createOffer,
    addRemoteVideoRef,
    removeRemoteVideoRef,
  } = useWebRTC();

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const chatRef = useRef(null);

  // Join meeting when component mounts
  useEffect(() => {
    if (roomId && user) {
      joinMeeting(roomId);
    }
  }, [roomId, user, joinMeeting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMeeting();
    };
  }, [leaveMeeting]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Start recording
  const startRecording = () => {
    if (localStream) {
      const stream = new MediaStream();
      
      // Add local video and audio tracks
      localStream.getTracks().forEach(track => {
        stream.addTrack(track);
      });
      
      // Add remote video and audio tracks
      remoteStreams.forEach(remoteStream => {
        remoteStream.getTracks().forEach(track => {
          stream.addTrack(track);
        });
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks(chunks);
        
        // Here you could upload the recording to the server
        // uploadRecording(blob, { roomId, timestamp: Date.now() });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  // Send message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: user?.username || 'Unknown',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  // Handle key press in chat
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Leave meeting
  const handleLeaveMeeting = () => {
    leaveMeeting();
    navigate('/meetings');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Please log in to join the meeting
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-lg font-semibold">
              Meeting: {roomId}
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-300 text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">
              {participants.length} participants
            </span>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Camera Off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                You ({user?.username})
              </div>
            </motion.div>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
              <motion.div
                key={peerId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                <video
                  ref={(ref) => {
                    if (ref) {
                      addRemoteVideoRef(peerId, ref);
                    } else {
                      removeRemoteVideoRef(peerId);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                  {peerId}
                </div>
              </motion.div>
            ))}

            {/* Placeholder for more participants */}
            {Array.from({ length: Math.max(0, 6 - remoteStreams.size - 1) }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg flex items-center justify-center"
              >
                <div className="text-center">
                  <Users size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Waiting for participant...</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {isRecording ? <StopCircle size={20} /> : <CircleDot size={20} />}
            </button>

            <button
              onClick={handleLeaveMeeting}
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {(showParticipants || showChat) && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="w-80 bg-gray-800 border-l border-gray-700"
        >
          {/* Participants Panel */}
          {showParticipants && (
            <div className="p-4">
              <h3 className="text-white font-semibold mb-4">Participants ({participants.length})</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {participant.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white">{participant}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Chat</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-hidden">
                <div 
                  ref={chatRef}
                  className="h-full overflow-y-auto space-y-3"
                >
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 text-sm font-medium">
                          {message.sender}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-white text-sm mt-1">{message.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error Modal */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}