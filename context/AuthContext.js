import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import gunDataService from '../lib/gunDataService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = gunDataService.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error("AuthContext fetchUser error:", e);
      setUser(null);
      setError('An unexpected error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUser();
    }
  }, [fetchUser, mounted]);

  const register = async (email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.suggestion || data.error || 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (e) {
      console.error("Registration error:", e);
      const errorMessage = e.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.suggestion || data.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setUser(data.user);
      router.push('/items/scan');
      return { success: true, user: data.user };
    } catch (e) {
      console.error("Login error:", e);
      const errorMessage = e.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Logout warning:', data.error);
      }

      setUser(null);
      router.push('/onboarding');
      return { success: true };
    } catch (e) {
      console.error("Logout error:", e);
      // Even if logout fails, clear local state
      setUser(null);
      router.push('/onboarding');
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};