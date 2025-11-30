import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../../services/mockService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { User, AttendanceRecord } from '../../types';
import { Search, MapPin, Calendar } from 'lucide-react';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const users = MockService.getUsers().filter(u => u.role === 'employee');
  const [searchTerm, setSearchTerm] = React.useState('');

  const getTodayStatus = (userId: string): AttendanceRecord | undefined => {
    return MockService.getTodayStatus(userId);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Employees</h1>
          <p className="text-slate-500">View team members and their current status.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
          const todayRecord = getTodayStatus(user.id);
          const status = todayRecord ? todayRecord.status : 'Absent'; // Default to Absent if no record found for today

          return (
            <div key={user.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full border-2 border-slate-100"
                    />
                    <div className="ml-3">
                      <h3 className="font-semibold text-slate-900">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.department}</p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="font-mono text-xs text-slate-500">{user.employeeId}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                     <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                     {todayRecord?.checkInTime ? (
                       <span>In: {new Date(todayRecord.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     ) : (
                       <span className="text-slate-400 italic">Not checked in</span>
                     )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/attendance/${user.id}`)}
                  >
                    View History
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No employees found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};