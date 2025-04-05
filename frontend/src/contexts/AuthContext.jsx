import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "https://legendary-space-adventure-w6q44575754c7pp-8000.app.github.dev";

  // Función para guardar tokens en localStorage
  const saveTokens = useCallback((access, refresh = null) => {
    if (access) {
      localStorage.setItem('accessToken', access);
      setAccessToken(access);
    }
    
    if (refresh) {
      localStorage.setItem('refreshToken', refresh);
      setRefreshToken(refresh);
    }
  }, []);

  // Función para limpiar tokens al cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Función para refrescar el token de acceso
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return false;
    
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      saveTokens(data.access_token);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, [API_URL, refreshToken, saveTokens]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      saveTokens(data.access_token, data.refresh_token);
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer peticiones autenticadas con auto-refresh si es necesario
  const authFetch = useCallback(async (url, options = {}) => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Configurar headers con token de autenticación
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': options.headers?.['Content-Type'] || 'application/json',
    };

    try {
      // Intento inicial con el token actual
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Si el token expiró, intentar refrescarlo y reintentar
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          // Reintentar con el nuevo token
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': options.headers?.['Content-Type'] || 'application/json',
            },
          });
        } else {
          // Si no se pudo refrescar, cerrar sesión
          logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      console.error('Auth fetch error:', error);
      throw error;
    }
  }, [accessToken, refreshAccessToken, logout]);

  // Valores del contexto
  const value = {
    accessToken,
    refreshToken,
    isLoading,
    user,
    login,
    logout,
    authFetch,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};