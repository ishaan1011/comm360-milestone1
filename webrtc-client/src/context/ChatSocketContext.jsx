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
    const s = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
    setSocket(s);
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    return () => s.disconnect();
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
  const joinConversation = (conversationId) => socket?.emit('joinConversation', conversationId);
  const leaveConversation = (conversationId) => socket?.emit('leaveConversation', conversationId);
  const sendMessage = (data) => socket?.emit('chat:send', data);
  const editMessage = (data) => socket?.emit('chat:edit', data);
  const deleteMessage = (data) => socket?.emit('chat:delete', data);
  const reactMessage = (data) => socket?.emit('chat:react', data);
  const unreactMessage = (data) => socket?.emit('chat:unreact', data);
  const sendTyping = (data) => socket?.emit('chat:typing', data);

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
  return useContext(ChatSocketContext);
} 