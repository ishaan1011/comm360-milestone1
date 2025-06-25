import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const s = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      s.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Socket connected');
      });

      s.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      s.on('connect_error', (err) => {
        setError('Connection failed: ' + err.message);
        console.error('Socket connection error:', err);
      });

      s.on('roomParticipants', (participantsList) => {
        setParticipants(participantsList);
      });

      s.on('availableOffers', (offers) => {
        setAvailableOffers(offers);
      });

      s.on('newOfferAwaiting', (offers) => {
        setAvailableOffers(prev => [...prev, ...offers]);
      });

      s.on('answerResponse', (offerObj) => {
        // Handle answer response
        console.log('Received answer response:', offerObj);
      });

      s.on('receivedIceCandidateFromServer', (iceCandidate) => {
        // Handle ICE candidate from server
        console.log('Received ICE candidate from server:', iceCandidate);
      });

      s.on('hangup', (userName) => {
        console.log('User hung up:', userName);
        setParticipants(prev => prev.filter(p => p !== userName));
      });

      s.on('receiveMessage', ({ userName, message }) => {
        console.log('Received message:', { userName, message });
      });

      s.on('avatarOutput', (json) => {
        console.log('Avatar output:', json);
      });

      s.on('avatarNavigate', ({ index }) => {
        console.log('Avatar navigate:', index);
      });

      setSocket(s);

      return () => {
        s.disconnect();
      };
    }
  }, [user]);

  const joinRoom = (roomId) => {
    if (socket && roomId) {
      socket.auth = { 
        ...socket.auth, 
        roomId 
      };
      socket.connect();
      setCurrentRoom(roomId);
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('hangup');
      setCurrentRoom(null);
      setParticipants([]);
      setAvailableOffers([]);
    }
  };

  const sendOffer = (offer) => {
    if (socket) {
      socket.emit('newOffer', offer);
    }
  };

  const sendAnswer = (offerObj, callback) => {
    if (socket) {
      socket.emit('newAnswer', offerObj, callback);
    }
  };

  const sendIceCandidate = (iceObj) => {
    if (socket) {
      socket.emit('sendIceCandidateToSignalingServer', iceObj);
    }
  };

  const sendMessage = (message) => {
    if (socket) {
      socket.emit('sendMessage', message);
    }
  };

  const sendAvatarOutput = (json) => {
    if (socket) {
      socket.emit('avatarOutput', json);
    }
  };

  const sendAvatarNavigate = (index) => {
    if (socket) {
      socket.emit('avatarNavigate', { index });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      currentRoom,
      participants,
      availableOffers,
      error,
      joinRoom,
      leaveRoom,
      sendOffer,
      sendAnswer,
      sendIceCandidate,
      sendMessage,
      sendAvatarOutput,
      sendAvatarNavigate,
    }}>
      {children}
    </SocketContext.Provider>
  );
}