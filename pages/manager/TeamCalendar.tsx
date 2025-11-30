import React, { useState, useMemo } from 'react';
import { MockService } from '../../services/mockService';
import { User, AttendanceRecord } from '../../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export const TeamCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const users = MockService.getUsers().filter(u => u.role === 'employee');
  const allAttendance = MockService.getAllAttendance();

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  // Generate stats per day
  const getStatsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const records = allAttendance.filter(r => r.date === dateStr);
    
    // Logic: Absent = Total Employees - (Present + Late + HalfDay)
    const presentCount = records.filter(r => r.status === 'Present').length;
    const lateCount = records.filter(r => r.status === 'Late').length;
    const halfDayCount = records.filter(r => r.status === 'Half-Day').length;
    
    // Note: If an "Absent" record is explicitly created, count it. 
    // Otherwise assume anyone without a record is Absent if the day is in the past.
    // For simplicity in this view, we count explicit records.
    const explicitAbsent = records.filter(r => r.status === 'Absent').length;
    const implicitAbsent = users.length - records.length; // Everyone else
    
    // Only count implicit absent for past days
    const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
    const totalAbsent = explicitAbsent + (isPast ? implicitAbsent : 0);

    return { 
      present: presentCount, 
      late: lateCount, 
      absent: totalAbsent, 
      halfDay: halfDayCount,
      dateStr
    };
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Modal Data
  const selectedDayDetails = useMemo(() => {
    if (!selectedDay) return null;
    const records = allAttendance.filter(r => r.date === selectedDay);
    
    return users.map(user => {
      const record = records.find(r => r.userId === user.id);
      return {
        user,
        status: record ? record.status : (new Date(selectedDay) < new Date() ? 'Absent' : 'No Record'),
        checkIn: record?.checkInTime,
        checkOut: record?.checkOutTime
      };
    });
  }, [selectedDay, allAttendance, users]);

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Team Attendance Calendar</h1>
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
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white h-32" />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const stats = getStatsForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDay(stats.dateStr)}
                className={`bg-white h-32 p-2 hover:bg-slate-50 cursor-pointer transition-colors relative ${isToday ? 'ring-2 ring-inset ring-emerald-400' : ''}`}
              >
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>
                  {day}
                </span>
                <div className="mt-2 space-y-1">
                  {stats.present > 0 && (
                    <div className="flex items-center text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                      {stats.present} Present
                    </div>
                  )}
                  {stats.late > 0 && (
                    <div className="flex items-center text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                       <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
                       {stats.late} Late
                    </div>
                  )}
                  {stats.absent > 0 && (
                    <div className="flex items-center text-xs text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                       <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                       {stats.absent} Absent
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Details for {new Date(selectedDay).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </h2>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="space-y-4">
                {selectedDayDetails?.map((detail, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center">
                      <img src={detail.user.avatar} alt={detail.user.name} className="w-8 h-8 rounded-full mr-3" />
                      <div>
                        <p className="font-medium text-slate-900">{detail.user.name}</p>
                        <p className="text-xs text-slate-500">{detail.user.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1
                         ${detail.status === 'Present' ? 'bg-green-100 text-green-700' : 
                           detail.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                           detail.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                         {detail.status}
                       </span>
                       {detail.checkIn && (
                         <p className="text-xs text-slate-400">
                           {new Date(detail.checkIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                         </p>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};