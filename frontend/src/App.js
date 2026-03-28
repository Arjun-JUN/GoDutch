import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'sonner';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NewExpense from './pages/NewExpense';
import GroupsPage from './pages/GroupsPage';
import GroupDetail from './pages/GroupDetail';
import SettlementsPage from './pages/SettlementsPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/new-expense"
            element={
              isAuthenticated ? (
                <NewExpense onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/groups"
            element={
              isAuthenticated ? (
                <GroupsPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              isAuthenticated ? (
                <GroupDetail onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/settlements"
            element={
              isAuthenticated ? (
                <SettlementsPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;