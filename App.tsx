import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { AttendanceHistory } from './pages/employee/AttendanceHistory';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { Reports } from './pages/manager/Reports';
import { Profile } from './pages/Profile';
import { TeamCalendar } from './pages/manager/TeamCalendar';
import { EmployeeList } from './pages/manager/EmployeeList';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'employee' | 'manager' }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'manager' ? '/manager-dashboard' : '/dashboard'} replace />;
  }

  return <Layout>{children}</Layout>;
};

// Root Redirector based on Role
const RootRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return user?.role === 'manager' 
    ? <Navigate to="/manager-dashboard" /> 
    : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<RootRedirect />} />

          {/* Shared Routes */}
           <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Employee Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute requiredRole="employee">
              <AttendanceHistory />
            </ProtectedRoute>
          } />

          {/* Manager Routes */}
          <Route path="/manager-dashboard" element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/team-calendar" element={
            <ProtectedRoute requiredRole="manager">
              <TeamCalendar />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requiredRole="manager">
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute requiredRole="manager">
              <EmployeeList />
            </ProtectedRoute>
          } />
          
          {/* Manager view of specific employee history */}
          <Route path="/attendance/:userId" element={
            <ProtectedRoute requiredRole="manager">
              <AttendanceHistory />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;