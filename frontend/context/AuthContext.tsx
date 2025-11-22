'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';

/**
 * SECURITY WARNING: Storing tokens in localStorage is vulnerable to XSS attacks
 * 
 * TODO (Future Security Enhancement):
 * - Migrate to HttpOnly cookies for refresh tokens
 * - Keep only access token in memory (not localStorage)
 * - Implement CSRF protection when using cookies
 * - See: https://auth0.com/docs/secure/security-guidance/data-security/token-storage
 * 
 * Current implementation acceptable for MVP but should be addressed before production.
 */

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Načíst oba tokeny z localStorage
    const storedToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedToken && storedRefreshToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else if (storedRefreshToken) {
      // Pokud máme jen refresh token, zkusíme získat nový access token
      refreshAccessToken(storedRefreshToken);
    } else {
      setLoading(false);
    }

    // Nastavit automatické obnovování tokenu každých 14 minut (access token vyprší za 15min)
    const intervalId = setInterval(() => {
      const refreshTok = localStorage.getItem('refreshToken');
      if (refreshTok) {
        refreshAccessToken(refreshTok);
      }
    }, 14 * 60 * 1000); // 14 minut

    return () => clearInterval(intervalId);
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      const response = await authApi.getMe(authToken);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Pokud selže, zkusíme refresh token
      const refreshTok = localStorage.getItem('refreshToken');
      if (refreshTok) {
        await refreshAccessToken(refreshTok);
      } else {
        clearAuthData();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async (refreshTok: string): Promise<boolean> => {
    try {
      const response = await authApi.refresh(refreshTok);
      setToken(response.accessToken);
      setUser(response.user);
      localStorage.setItem('accessToken', response.accessToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearAuthData();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register(email, password, name);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  };

  const logout = async () => {
    const refreshTok = localStorage.getItem('refreshToken');
    if (refreshTok) {
      try {
        await authApi.logout(refreshTok);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    clearAuthData();
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshTok = localStorage.getItem('refreshToken');
    if (!refreshTok) return false;
    return await refreshAccessToken(refreshTok);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
