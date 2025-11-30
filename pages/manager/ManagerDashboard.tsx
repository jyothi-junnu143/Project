import React, { useMemo } from 'react';
import { MockService } from '../../services/mockService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const users = MockService.getUsers().filter(u => u.role === 'employee');
  const allAttendance = MockService.getAllAttendance();
  const todayStr = new Date().toISOString().split('T')[0];

  // Stats Logic
  const todayStats = useMemo(() => {
    const records = allAttendance.filter(r => r.date === todayStr);
    const present = records.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half-Day').length;
    const late = records.filter(r => r.status === 'Late').length;
    const absent = users.length - present;
    return { present, late, absent, total: users.length };
  }, [allAttendance, users]);

  // Chart Data: Weekly Trend
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRecords = allAttendance.filter(r => r.date === dStr);
      data.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        Present: dayRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half-Day').length,
        Absent: users.length - dayRecords.length
      });
    }
    return data;
  }, [allAttendance, users]);

  // Chart Data: Department
  const departmentData = useMemo(() => {
    const depts: Record<string, number> = {};
    users.forEach(u => {
      depts[u.department] = (depts[u.department] || 0) + 1;
    });
    return Object.keys(depts).map(key => ({ name: key, value: depts[key] }));
  }, [users]);

  // Colors without Blue (Indigo/Blue removed) -> Emerald, Amber, Red, Gray
  const COLORS = ['#059669', '#d97706', '#dc2626', '#4b5563'];

  const StatCard = ({ label, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <h3 className="text-slate-500 font-medium">{label}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
        <p className="text-slate-500">Overview of team performance and daily attendance statistics.</p>
      </div>

      {/* KPI Cards - Strictly matching PDF Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Employees" 
          value={todayStats.total} 
          subtext="Registered in system"
          icon={Users} 
          color="bg-emerald-600" 
        />
        <StatCard 
          label="Present Today" 
          value={todayStats.present} 
          subtext="Checked in so far"
          icon={CheckCircle} 
          color="bg-green-600" 
        />
        <StatCard 
          label="Late Arrivals" 
          value={todayStats.late} 
          subtext="Arrived after 9:30 AM"
          icon={Clock} 
          color="bg-yellow-500" 
        />
        <StatCard 
          label="Absent Today" 
          value={todayStats.absent} 
          subtext="No check-in yet"
          icon={AlertCircle} 
          color="bg-red-600" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Weekly Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="Present" fill="#059669" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Absent" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Department-wise Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Absentees List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
           <h3 className="font-semibold text-slate-800">Absent Employees Today</h3>
        </div>
        {todayStats.absent === 0 ? (
          <div className="p-8 text-center text-slate-500">Everyone is present today! 🎉</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.filter(u => {
              const record = allAttendance.find(r => r.userId === u.id && r.date === todayStr);
              return !record || record.status === 'Absent';
            }).map(u => (
              <div key={u.id} className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors">
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full mr-3 grayscale" />
                <div>
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.department}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">Absent</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};