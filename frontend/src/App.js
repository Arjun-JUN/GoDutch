import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AuthPage from './pages/AuthPageRedesign';
import Dashboard from './pages/Dashboard';
import NewExpense from './pages/NewExpenseRedesign';
import GroupsPage from './pages/GroupsPage';
import GroupDetail from './pages/GroupDetail';
import SettlementsPage from './pages/SettlementsPageRedesign';
import ExpenseDetail from './pages/ExpenseDetail';
import ReportsPage from './pages/ReportsPage';
import UPIHome from './pages/UPIHome';
import SendMoney from './pages/SendMoney';
import AddBankAccount from './pages/AddBankAccount';
import SlateDocs from './pages/SlateDocs';

import '@/slate/styles/tokens.css';
import '@/slate/styles/base.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center text-[var(--app-muted)]">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/new-expense" element={<ProtectedRoute><NewExpense /></ProtectedRoute>} />
            <Route path="/expenses/:expenseId" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
            <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
            <Route path="/settlements" element={<ProtectedRoute><SettlementsPage /></ProtectedRoute>} />
            <Route path="/reports/:groupId" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/upi" element={<ProtectedRoute><UPIHome /></ProtectedRoute>} />
            <Route path="/upi/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
            <Route path="/upi/accounts/add" element={<ProtectedRoute><AddBankAccount /></ProtectedRoute>} />
            
            <Route path="/docs/slate" element={<SlateDocs />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
