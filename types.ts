export type Role = 'employee' | 'manager';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half-Day';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed in real DB, plain for mock
  role: Role;
  employeeId: string;
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO Date String YYYY-MM-DD
  checkInTime?: string; // ISO String
  checkOutTime?: string; // ISO String
  status: AttendanceStatus;
  totalHours: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DailyStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}