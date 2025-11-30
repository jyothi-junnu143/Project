import React from 'react';
import { AttendanceStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | 'Unknown';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    'Present': 'bg-green-100 text-green-800 border-green-200',
    'Absent': 'bg-red-100 text-red-800 border-red-200',
    'Late': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Half-Day': 'bg-orange-100 text-orange-800 border-orange-200',
    'Unknown': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['Unknown']}`}>
      {status}
    </span>
  );
};
