import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatSocketContext = createContext();

export function ChatSocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const listeners = useRef({});

  useEffect(() => {
    if (!user) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    // Use the same URL format as SocketContext
    const backendRoot = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    const s = io(backendRoot, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('Chat socket connected');
    });

    s.on('disconnect', () => {
      setConnected(false);
      console.log('Chat socket disconnected');
    });

    s.on('connect_error', (err) => {
      console.error('Chat socket connection error:', err);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  // Register event listeners
  const on = (event, cb) => {
    if (!socket) return;
    socket.on(event, cb);
    listeners.current[event] = cb;
  };
  
  const off = (event) => {
    if (!socket) return;
    socket.off(event, listeners.current[event]);
    delete listeners.current[event];
  };

  // Chat actions
  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('joinConversation', conversationId);
    }
  };
  
  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('leaveConversation', conversationId);
    }
  };
  
  const sendMessage = (data) => {
    if (socket) {
      socket.emit('chat:send', data);
    }
  };
  
  const editMessage = (data) => {
    if (socket) {
      socket.emit('chat:edit', data);
    }
  };
  
  const deleteMessage = (data) => {
    if (socket) {
      socket.emit('chat:delete', data);
    }
  };
  
  const reactMessage = (data) => {
    if (socket) {
      socket.emit('chat:react', data);
    }
  };
  
  const unreactMessage = (data) => {
    if (socket) {
      socket.emit('chat:unreact', data);
    }
  };
  
  const sendTyping = (data) => {
    if (socket) {
      socket.emit('chat:typing', data);
    }
  };

  return (
    <ChatSocketContext.Provider value={{
      socket,
      connected,
      on,
      off,
      joinConversation,
      leaveConversation,
      sendMessage,
      editMessage,
      deleteMessage,
      reactMessage,
      unreactMessage,
      sendTyping,
    }}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error('useChatSocket must be used within a ChatSocketProvider');
  }
  return context;
} 