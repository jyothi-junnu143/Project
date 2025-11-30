import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { MockService } from '../services/mockService';

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('attendflow_current_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setState({
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to parse user from local storage", error);
        // If local storage is corrupted, clear it and reset state to avoid infinite loading
        localStorage.removeItem('attendflow_current_user');
        setState(s => ({ ...s, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const user = await MockService.login(email, password);
      localStorage.setItem('attendflow_current_user', JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(s => ({ ...s, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: any) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const user = await MockService.register(data);
      localStorage.setItem('attendflow_current_user', JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
       setState(s => ({ ...s, isLoading: false }));
       throw error;
    }
  }

  const logout = () => {
    localStorage.removeItem('attendflow_current_user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (data: Partial<User>) => {
    if (state.user) {
      const newUser = { ...state.user, ...data };
      localStorage.setItem('attendflow_current_user', JSON.stringify(newUser));
      setState(s => ({ ...s, user: newUser }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};