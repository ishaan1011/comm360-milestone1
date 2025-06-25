import React, { createContext, useState, useEffect } from 'react';
import authService from '../api/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.validateToken()
        .then(result => {
          if (result.success) {
            setUser(result.data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    setError(null);
    setLoading(true);
    
    const result = await authService.login(email, password);
    
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      setUser(result.data.user);
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }

  async function register(userData) {
    setError(null);
    setLoading(true);
    
    const result = await authService.register(userData);
    
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      setUser(result.data.user);
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }

  async function googleLogin(idToken) {
    setError(null);
    setLoading(true);
    
    const result = await authService.googleAuth(idToken);
    
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      setUser(result.data.user);
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      googleLogin, 
      logout, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}