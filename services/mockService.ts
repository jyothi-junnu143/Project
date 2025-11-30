import { User, AttendanceRecord, AttendanceStatus } from '../types';
import { SEED_USERS, SEED_ATTENDANCE } from '../constants';

// Simulated LocalStorage Keys
const USERS_KEY = 'attendflow_users';
const ATTENDANCE_KEY = 'attendflow_attendance';

// Initialize Data
const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    // Add createdAt to seed users if missing
    const usersWithMeta = SEED_USERS.map(u => ({
      ...u,
      createdAt: new Date().toISOString(),
      password: 'password123' // Default password for seeds
    }));
    localStorage.setItem(USERS_KEY, JSON.stringify(usersWithMeta));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    const attendanceWithMeta = SEED_ATTENDANCE.map(a => ({
      ...a,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceWithMeta));
  }
};

initializeData();

const getUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const getAttendance = (): AttendanceRecord[] => JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');

const saveAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const MockService = {
  login: async (email: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getUsers();
        // In a real app, we would hash the password. 
        // For this mock, we just check if the user exists. 
        // Added simple password check for the "Register" flow completeness.
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          if (password && user.password && user.password !== password) {
             reject(new Error('Invalid password'));
             return;
          }
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  register: async (data: Partial<User> & { password: string }): Promise<User> => {
     return new Promise((resolve, reject) => {
       setTimeout(() => {
         const users = getUsers();
         if (users.find(u => u.email.toLowerCase() === data.email?.toLowerCase())) {
           reject(new Error('Email already exists'));
           return;
         }

         const newUser: User = {
           id: `u-${Date.now()}`,
           name: data.name || 'New User',
           email: data.email!,
           password: data.password,
           role: data.role || 'employee', // Use provided role or default
           employeeId: data.role === 'manager' 
             ? `MGR${Math.floor(100 + Math.random() * 900)}` 
             : `EMP${Math.floor(100 + Math.random() * 900)}`,
           department: data.department || 'Engineering',
           avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
           createdAt: new Date().toISOString()
         };

         users.push(newUser);
         saveUsers(users);
         resolve(newUser);
       }, 800);
     });
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
      const users = getUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) {
        reject(new Error('User not found'));
        return;
      }
      
      const updatedUser = { ...users[index], ...data };
      users[index] = updatedUser;
      saveUsers(users);
      resolve(updatedUser);
    });
  },

  getEmployeeAttendance: (userId: string): AttendanceRecord[] => {
    const all = getAttendance();
    return all.filter(r => r.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getAllAttendance: (): AttendanceRecord[] => {
    return getAttendance().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  checkIn: async (userId: string): Promise<AttendanceRecord> => {
    return new Promise((resolve) => {
      const all = getAttendance();
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      
      const existing = all.find(r => r.userId === userId && r.date === todayStr);
      if (existing) {
        resolve(existing);
        return;
      }

      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        userId,
        date: todayStr,
        checkInTime: now.toISOString(),
        status: isLate ? 'Late' : 'Present',
        totalHours: 0,
        createdAt: now.toISOString()
      };

      saveAttendance([...all, newRecord]);
      resolve(newRecord);
    });
  },

  checkOut: async (userId: string): Promise<AttendanceRecord> => {
     return new Promise((resolve, reject) => {
      const all = getAttendance();
      const todayStr = new Date().toISOString().split('T')[0];
      const recordIndex = all.findIndex(r => r.userId === userId && r.date === todayStr);

      if (recordIndex === -1) {
        reject(new Error("No check-in record found for today."));
        return;
      }

      const record = all[recordIndex];
      const now = new Date();
      const checkIn = new Date(record.checkInTime!);
      const diffMs = now.getTime() - checkIn.getTime();
      const hours = diffMs / (1000 * 60 * 60);

      // Half day logic
      let status: AttendanceStatus = record.status;
      if (hours < 4 && status !== 'Late') {
          status = 'Half-Day';
      }

      const updatedRecord = {
        ...record,
        checkOutTime: now.toISOString(),
        totalHours: Number(hours.toFixed(2)),
        status
      };

      all[recordIndex] = updatedRecord;
      saveAttendance(all);
      resolve(updatedRecord);
     });
  },

  getTodayStatus: (userId: string): AttendanceRecord | undefined => {
    const all = getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    return all.find(r => r.userId === userId && r.date === todayStr);
  },
  
  getUsers: (): User[] => getUsers()
};