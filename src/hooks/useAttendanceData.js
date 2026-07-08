import { useAttendance } from '../context/AttendanceContext';

export const useAttendanceData = () => {
  const { records, markAttendance, clearAll, timetables } = useAttendance();

  const getRecordForDate = (dateStr) => {
    return records[dateStr] || {};
  };

  return {
    records,
    markAttendance,
    getRecordForDate,
    clearAll,
    timetables,
  };
};
