import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRecords, saveRecords, clearRecords, getTimetables, saveTimetables, clearTimetables } from '../utils/storage';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [records, setRecords] = useState({});
  const [timetables, setTimetables] = useState([]);

  // Load records and timetables on mount
  useEffect(() => {
    setRecords(getRecords());
    setTimetables(getTimetables());
  }, []);

  const markAttendance = (dateStr, courseId, status) => {
    setRecords((prev) => {
      const updated = { ...prev };
      
      if (!updated[dateStr]) {
        updated[dateStr] = {};
      }

      if (status === null || status === undefined) {
        delete updated[dateStr][courseId];
        // Clean up empty date keys
        if (Object.keys(updated[dateStr]).length === 0) {
          delete updated[dateStr];
        }
      } else {
        updated[dateStr][courseId] = status;
      }

      saveRecords(updated);
      return updated;
    });
  };

  const clearAll = () => {
    clearRecords();
    setRecords({});
  };

  const addTimetable = (newTimetable) => {
    setTimetables((prev) => {
      const updated = [...prev, newTimetable];
      saveTimetables(updated);
      return updated;
    });
  };

  const updateTimetables = (updatedTimetables) => {
    setTimetables(updatedTimetables);
    saveTimetables(updatedTimetables);
  };

  return (
    <AttendanceContext.Provider value={{ records, markAttendance, clearAll, timetables, addTimetable, updateTimetables }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
