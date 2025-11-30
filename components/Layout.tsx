import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Users, 
  FileBarChart, 
  LogOut, 
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
    <Link
      to={path}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
        isActive(path) 
          ? 'bg-emerald-50 text-emerald-700 font-medium' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive(path) ? 'text-emerald-600' : 'text-slate-400'}`} />
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
             <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-sm font-bold text-slate-800 leading-tight">Employee<br/>Attendance System</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto lg:hidden text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {user?.role === 'employee' ? (
            <>
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/history" icon={History} label="My Attendance" />
              <NavItem path="/profile" icon={UserIcon} label="My Profile" />
            </>
          ) : (
            <>
              <NavItem path="/manager-dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/team-calendar" icon={Calendar} label="Team Calendar" />
              <NavItem path="/reports" icon={FileBarChart} label="Reports" />
              <NavItem path="/employees" icon={Users} label="Employees" />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden">
          <div className="flex items-center">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                 <span className="text-white font-bold">E</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">Employee Attendance System</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};