import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SocketProvider } from './context/SocketContext.jsx';
import { ChatSocketProvider } from './context/ChatSocketContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <SocketProvider>
        <ChatSocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChatSocketProvider>
      </SocketProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);