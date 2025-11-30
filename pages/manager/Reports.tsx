import React, { useState, useMemo } from 'react';
import { MockService } from '../../services/mockService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Download, Filter, Search } from 'lucide-react';
import { AttendanceStatus } from '../../types';

export const Reports: React.FC = () => {
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const allAttendance = MockService.getAllAttendance();
  const users = MockService.getUsers().filter(u => u.role === 'employee');

  const filteredData = useMemo(() => {
    return allAttendance.filter(record => {
      const recordDate = record.date;
      const isDateInRange = recordDate >= startDate && recordDate <= endDate;
      const isEmployeeMatch = filterEmployee === 'all' || record.userId === filterEmployee;
      const isStatusMatch = filterStatus === 'all' || record.status === filterStatus;
      return isDateInRange && isEmployeeMatch && isStatusMatch;
    });
  }, [allAttendance, startDate, endDate, filterEmployee, filterStatus]);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const downloadCSV = () => {
    const headers = ['Date', 'Employee Name', 'Status', 'Check In', 'Check Out', 'Total Hours'];
    const rows = filteredData.map(r => [
      r.date,
      getUserName(r.userId),
      r.status,
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-',
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-',
      r.totalHours.toString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
           <p className="text-slate-500">View and export detailed attendance logs.</p>
        </div>
        <Button onClick={downloadCSV} variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
           <div className="relative">
             <select 
               className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
               value={filterEmployee}
               onChange={(e) => setFilterEmployee(e.target.value)}
             >
               <option value="all">All Employees</option>
               {users.map(u => (
                 <option key={u.id} value={u.id}>{u.name}</option>
               ))}
             </select>
           </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
           <div className="relative">
             <select 
               className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="all">All Statuses</option>
               <option value="Present">Present</option>
               <option value="Absent">Absent</option>
               <option value="Late">Late</option>
               <option value="Half-Day">Half-Day</option>
             </select>
           </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
      
      <div className="text-sm text-slate-500">
          Showing {filteredData.length} records
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check In/Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{getUserName(record.userId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-900">
                        In: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.totalHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};