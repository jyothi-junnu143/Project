import { User, AttendanceRecord } from './types';

export const DEPARTMENTS = ['Engineering', 'HR', 'Sales', 'Marketing', 'Product'];

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Manager',
    email: 'admin@company.com',
    role: 'manager',
    employeeId: 'MGR001',
    department: 'Engineering',
    avatar: 'https://picsum.photos/200/200',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'u2',
    name: 'John Developer',
    email: 'john@company.com',
    role: 'employee',
    employeeId: 'EMP001',
    department: 'Engineering',
    avatar: 'https://picsum.photos/201/201',
    createdAt: '2023-01-15T00:00:00.000Z'
  },
  {
    id: 'u3',
    name: 'Sarah Designer',
    email: 'sarah@company.com',
    role: 'employee',
    employeeId: 'EMP002',
    department: 'Product',
    avatar: 'https://picsum.photos/202/202',
    createdAt: '2023-02-01T00:00:00.000Z'
  },
  {
    id: 'u4',
    name: 'Mike Sales',
    email: 'mike@company.com',
    role: 'employee',
    employeeId: 'EMP003',
    department: 'Sales',
    avatar: 'https://picsum.photos/203/203',
    createdAt: '2023-02-15T00:00:00.000Z'
  }
];

// Helper to generate some fake past attendance
const generatePastAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  SEED_USERS.forEach(user => {
    if (user.role === 'manager') return; // Managers don't track strictly in this seed

    for (let i = 1; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const createdAt = date.toISOString();
      
      // Randomize status
      const rand = Math.random();
      let status: any = 'Present';
      let hours = 8 + Math.random();
      
      if (rand > 0.9) {
        status = 'Absent';
        hours = 0;
      } else if (rand > 0.8) {
        status = 'Late';
        hours = 7.5;
      } else if (rand > 0.75) {
        status = 'Half-Day';
        hours = 4;
      }

      if (status !== 'Absent') {
        records.push({
          id: `att-${user.id}-${i}`,
          userId: user.id,
          date: dateStr,
          checkInTime: new Date(date.setHours(9, 0, 0)).toISOString(),
          checkOutTime: new Date(date.setHours(9 + Math.floor(hours), 30, 0)).toISOString(),
          status,
          totalHours: Number(hours.toFixed(2)),
          createdAt
        });
      } else {
         records.push({
          id: `att-${user.id}-${i}`,
          userId: user.id,
          date: dateStr,
          status,
          totalHours: 0,
          createdAt
        });
      }
    }
  });
  return records;
};

export const SEED_ATTENDANCE: AttendanceRecord[] = generatePastAttendance();