import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

export default function MeetingPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { socket, isConnected } = useContext(SocketContext);
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    initializeMeeting();
    
    return () => {
      cleanup();
    };
  }, [roomId, user]);

  const initializeMeeting = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join room via socket
      if (socket) {
        socket.emit('joinRoom', { roomId, username: user.username });
      }

    } catch (err) {
      setError('Failed to access camera/microphone: ' + err.message);
      console.error('Media access error:', err);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

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

  const startRecording = () => {
    if (localStream) {
      const stream = new MediaStream();
      localStream.getTracks().forEach(track => stream.addTrack(track));
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => stream.addTrack(track));
      }

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
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const leaveMeeting = () => {
    cleanup();
    navigate('/meetings');
  };

  if (!user) {
    return (
      <div className="container py-5">
        <h2>Please log in to join the meeting</h2>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 h-100">
      {/* Header */}
      <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">Meeting: {roomId}</h4>
          <small className="text-muted">
            {isConnected ? 'Connected' : 'Connecting...'}
          </small>
        </div>
        <button 
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate('/meetings')}
        >
          Back to Meetings
        </button>
      </div>

      {/* Main Content */}
      <div className="row g-0 h-100">
        {/* Video Area */}
        <div className="col-md-9 p-3">
          <div className="row h-100">
            {/* Local Video */}
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body p-0 position-relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: '300px' }}
                  />
                  {!isVideoEnabled && (
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <i className="fas fa-video-slash fa-3x text-muted"></i>
                      <p className="text-muted mt-2">Camera Off</p>
                    </div>
                  )}
                  <div className="position-absolute bottom-0 start-0 m-2">
                    <span className="badge bg-dark">You ({user.username})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remote Video */}
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body p-0 position-relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: '300px' }}
                  />
                  {!remoteStream && (
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <i className="fas fa-user fa-3x text-muted"></i>
                      <p className="text-muted mt-2">Waiting for participant...</p>
                    </div>
                  )}
                  {remoteStream && (
                    <div className="position-absolute bottom-0 start-0 m-2">
                      <span className="badge bg-primary">Remote Participant</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="col-md-3 bg-light p-3">
          <h5>Controls</h5>
          
          {/* Audio Control */}
          <div className="mb-3">
            <button
              onClick={toggleAudio}
              className={`btn w-100 ${isAudioEnabled ? 'btn-success' : 'btn-danger'}`}
            >
              <i className={`fas fa-microphone${isAudioEnabled ? '' : '-slash'}`}></i>
              {isAudioEnabled ? ' Mute' : ' Unmute'}
            </button>
          </div>

          {/* Video Control */}
          <div className="mb-3">
            <button
              onClick={toggleVideo}
              className={`btn w-100 ${isVideoEnabled ? 'btn-success' : 'btn-danger'}`}
            >
              <i className={`fas fa-video${isVideoEnabled ? '' : '-slash'}`}></i>
              {isVideoEnabled ? ' Stop Video' : ' Start Video'}
            </button>
          </div>

          {/* Recording Control */}
          <div className="mb-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`btn w-100 ${isRecording ? 'btn-danger' : 'btn-warning'}`}
            >
              <i className={`fas fa-${isRecording ? 'stop' : 'record-vinyl'}`}></i>
              {isRecording ? ' Stop Recording' : ' Start Recording'}
            </button>
          </div>

          {/* Leave Meeting */}
          <div className="mb-3">
            <button
              onClick={leaveMeeting}
              className="btn btn-danger w-100"
            >
              <i className="fas fa-phone-slash"></i> Leave Meeting
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          )}

          {/* Connection Status */}
          <div className="mt-4">
            <h6>Connection Status</h6>
            <div className="d-flex align-items-center">
              <div className={`w-2 h-2 rounded-circle me-2 ${isConnected ? 'bg-success' : 'bg-warning'}`}></div>
              <span className="small">{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}