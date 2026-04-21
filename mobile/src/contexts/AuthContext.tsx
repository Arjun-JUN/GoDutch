import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as SecureStore from '../utils/secureStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setUnauthorizedHandler } from '../api/client';
import {
  useGroupsStore,
  useExpensesStore,
  useSettlementsStore,
} from '../stores';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const resetAllStores = () => {
  useGroupsStore.getState().reset();
  useExpensesStore.getState().reset();
  useSettlementsStore.getState().reset();
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Stable ref so setUser inside the 401 handler doesn't depend on render closure.
  const setUserRef = useRef(setUser);
  setUserRef.current = setUser;

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        const token = await SecureStore.getItemAsync('token');

        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Error loading auth data', e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Register a single global 401 handler for the api client.
  // On 401, the client has already wiped storage — we just clear in-memory state
  // and reset domain stores so the next screen can't render stale data.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUserRef.current(null);
      resetAllStores();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = data;

    await SecureStore.setItemAsync('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post('/auth/register', { name, email, password });
    const { token, user: registeredUser } = data;

    await SecureStore.setItemAsync('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
    resetAllStores();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
