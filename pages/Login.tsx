
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { DEPARTMENTS } from '../constants';
import { Mail, Lock, User, Shield, ArrowRight, Building2, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: 'employee'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop" 
          alt="Employee Attendance System Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay for readability - Green/Teal tint to match the theme */}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-teal-900/60"></div>
      </div>

      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/40 transition-all duration-300">
        <div className="p-8">
          {/* Header Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-500/30">
              <span className="text-2xl font-bold">E</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Attendance System</h2>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin ? 'Sign in to your account' : 'Create your workspace account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="relative group">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Password"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all outline-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all outline-none"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center animate-pulse border border-red-100">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
             <p className="text-sm text-slate-500 mb-4">
               {isLogin ? "Don't have an account?" : "Already have an account?"}
             </p>
             <div className="bg-slate-100/80 p-1 rounded-xl flex">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isLogin ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isLogin ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>
          </div>
        </div>
        
        {/* Demo Credentials Footer (Only visible on Login) */}
        {isLogin && (
          <div className="bg-slate-50/80 p-4 border-t border-slate-200/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">Quick Demo Access</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => { setFormData({...formData, email: 'john@company.com', password: 'password123'}); }}
                className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              >
                Employee Demo
              </button>
              <button 
                onClick={() => { setFormData({...formData, email: 'admin@company.com', password: 'password123'}); }}
                className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              >
                Manager Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};