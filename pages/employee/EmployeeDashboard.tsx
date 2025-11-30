import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MockService } from '../../services/mockService';
import { AttendanceRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Clock, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, hours: 0 });
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    if (!user) return;
    const today = MockService.getTodayStatus(user.id);
    const history = MockService.getEmployeeAttendance(user.id);
    
    // Calculate Stats for current month
    const now = new Date();
    const currentMonthHistory = history.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const present = currentMonthHistory.filter(r => r.status === 'Present').length;
    const absent = currentMonthHistory.filter(r => r.status === 'Absent').length;
    const late = currentMonthHistory.filter(r => r.status === 'Late').length;
    const hours = currentMonthHistory.reduce((acc, curr) => acc + curr.totalHours, 0);

    setTodayRecord(today);
    setStats({ present, absent, late, hours: Math.round(hours) });
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    await MockService.checkIn(user.id);
    refreshData();
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setLoading(true);
    await MockService.checkOut(user.id);
    refreshData();
    setLoading(false);
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome & Time */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good {currentTime.getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Here is your attendance overview for today.</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-3xl font-mono font-bold text-emerald-600">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-slate-400 text-sm">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Daily Attendance Action</h2>
        
        {todayRecord?.checkOutTime ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">You've completed work for today!</h3>
            <p className="text-slate-500 mt-2">Total hours: {todayRecord.totalHours} hrs</p>
          </div>
        ) : todayRecord ? (
           <div className="flex flex-col items-center">
             <div className="mb-6 flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
               <Clock className="w-4 h-4" />
               <span className="font-medium">Checked In at {new Date(todayRecord.checkInTime!).toLocaleTimeString()}</span>
             </div>
             <Button size="lg" variant="danger" onClick={handleCheckOut} isLoading={loading} className="w-full sm:w-64 h-14 text-lg shadow-red-200 shadow-lg">
               Check Out
             </Button>
           </div>
        ) : (
          <div className="flex flex-col items-center">
             <div className="mb-6 text-slate-500">
               You haven't checked in yet. Mark your attendance to start the day.
             </div>
             <Button size="lg" onClick={handleCheckIn} isLoading={loading} className="w-full sm:w-64 h-14 text-lg shadow-emerald-200 shadow-lg">
               Check In Now
             </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Days Present" value={stats.present} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Days Absent" value={stats.absent} icon={XCircle} color="bg-red-500" />
        <StatCard label="Late Arrivals" value={stats.late} icon={AlertTriangle} color="bg-yellow-500" />
        <StatCard label="Total Hours" value={stats.hours} icon={Clock} color="bg-emerald-500" />
      </div>
      
      {/* Recent History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Activity (Last 7 Days)</h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/history'}>View All</Button>
        </div>
        <div className="divide-y divide-slate-100">
          {MockService.getEmployeeAttendance(user?.id || '').slice(0, 7).map((record) => (
             <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
               <div className="flex items-center">
                 <div className="mr-4 bg-slate-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-500" />
                 </div>
                 <div>
                   <p className="font-medium text-slate-900">{new Date(record.date).toLocaleDateString()}</p>
                   <p className="text-xs text-slate-500">
                     {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} - 
                     {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                   </p>
                 </div>
               </div>
               <StatusBadge status={record.status} />
             </div>
          ))}
          {MockService.getEmployeeAttendance(user?.id || '').length === 0 && (
            <div className="p-6 text-center text-slate-500">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
};