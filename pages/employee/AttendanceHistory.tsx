import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MockService } from '../../services/mockService';
import { AttendanceStatus, AttendanceRecord } from '../../types';
import { ChevronLeft, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AttendanceHistory: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<{record: AttendanceRecord | undefined, date: Date} | null>(null);

  // Determine which user's history to show
  const targetUserId = (currentUser?.role === 'manager' && userId) ? userId : currentUser?.id;
  
  // If manager is viewing another user, fetch that user's details
  const targetUser = targetUserId === currentUser?.id 
    ? currentUser 
    : MockService.getUsers().find(u => u.id === targetUserId);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const records = MockService.getEmployeeAttendance(targetUserId || '');

  const getRecordForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return records.find(r => r.date === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present': return 'bg-green-100 border-green-200 text-green-700';
      case 'Absent': return 'bg-red-100 border-red-200 text-red-700';
      case 'Late': return 'bg-yellow-100 border-yellow-200 text-yellow-700';
      case 'Half-Day': return 'bg-orange-100 border-orange-200 text-orange-700';
      default: return 'bg-white hover:bg-slate-50';
    }
  };

  if (!targetUserId) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentUser?.role === 'manager' && userId && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {userId ? `${targetUser?.name}'s Attendance` : 'Attendance History'}
            </h1>
            {userId && <p className="text-slate-500 text-sm">{targetUser?.department} • {targetUser?.employeeId}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-semibold text-slate-700 w-32 text-center">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px border-b border-slate-200">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white h-32 md:h-40" />
          ))}

          {/* Days */}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const record = getRecordForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

            return (
              <div 
                key={day} 
                onClick={() => setSelectedRecord({ record, date: dateObj })}
                className={`bg-white h-32 md:h-40 p-2 flex flex-col justify-between transition-colors relative cursor-pointer hover:bg-slate-50 ${isToday ? 'ring-2 ring-inset ring-emerald-400' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>
                    {day}
                  </span>
                </div>
                
                {record && (
                  <div className={`mt-2 p-2 rounded text-xs border ${getStatusColor(record.status)}`}>
                    <p className="font-bold">{record.status}</p>
                    {record.status !== 'Absent' && (
                       <p className="mt-1 opacity-90">{record.totalHours} hrs</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
           
           {/* Trailing empty cells to fill grid if needed (optional) */}
           {Array.from({ length: (7 - (days + firstDay) % 7) % 7 }).map((_, i) => (
               <div key={`empty-end-${i}`} className="bg-white h-32 md:h-40" />
           ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2" /> Present</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2" /> Absent</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" /> Late</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-500 mr-2" /> Half-Day</div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
             <div className="flex items-center justify-between p-4 border-b border-slate-100">
               <h3 className="font-bold text-slate-900">
                 {selectedRecord.date.toLocaleDateString(undefined, {weekday: 'long', month:'long', day:'numeric'})}
               </h3>
               <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-slate-100 rounded">
                 <X className="w-5 h-5 text-slate-500" />
               </button>
             </div>
             <div className="p-6 space-y-4">
                {selectedRecord.record ? (
                   <>
                     <div className="flex justify-center">
                       <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(selectedRecord.record.status)}`}>
                         {selectedRecord.record.status}
                       </span>
                     </div>
                     <div className="grid grid-cols-2 gap-4 text-center">
                       <div className="bg-slate-50 p-3 rounded-lg">
                         <p className="text-xs text-slate-500 uppercase">Check In</p>
                         <p className="font-mono font-medium mt-1">
                           {selectedRecord.record.checkInTime 
                             ? new Date(selectedRecord.record.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                             : '--:--'}
                         </p>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg">
                         <p className="text-xs text-slate-500 uppercase">Check Out</p>
                         <p className="font-mono font-medium mt-1">
                           {selectedRecord.record.checkOutTime 
                             ? new Date(selectedRecord.record.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                             : '--:--'}
                         </p>
                       </div>
                     </div>
                     <div className="text-center pt-2">
                       <p className="text-sm text-slate-600">Total Hours Worked: <span className="font-bold text-slate-900">{selectedRecord.record.totalHours}</span></p>
                     </div>
                   </>
                ) : (
                  <div className="text-center py-4">
                     {selectedRecord.date > new Date() ? (
                        <p className="text-slate-500">No attendance data for future dates.</p>
                     ) : (
                        <div className="space-y-2">
                          <p className="text-red-600 font-medium">Marked as Absent</p>
                          <p className="text-sm text-slate-500">No check-in record found for this day.</p>
                        </div>
                     )}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};