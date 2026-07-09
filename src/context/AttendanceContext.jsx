import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getRecords, saveRecords, clearRecords,
  getTimetables, saveTimetables, clearTimetables,
  getCourses, saveCourses,
} from '../utils/storage';
import { DEFAULT_COURSES } from '../data/courses';

const AttendanceContext = createContext();

// Turns "Machine Learning" into "machine-learning".
// If that id already exists, appends -2, -3, etc. until it's unique.
const generateCourseId = (name, existingCourses) => {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existingIds = new Set(existingCourses.map((c) => c.id));

  if (!existingIds.has(base)) return base;

  let counter = 2;
  while (existingIds.has(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
};

export const AttendanceProvider = ({ children }) => {
  const [records, setRecords] = useState({});
  const [timetables, setTimetables] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  // Load records, timetables, and courses on mount
  useEffect(() => {
    setRecords(getRecords());
    setTimetables(getTimetables());

    const storedCourses = getCourses();
    if (storedCourses === null) {
      // Nothing in storage yet — first launch. Seed from defaults.
      saveCourses(DEFAULT_COURSES);
      setAllCourses(DEFAULT_COURSES);
    } else {
      setAllCourses(storedCourses);
    }
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

  // --- Course CRUD ---

  const addCourse = (data) => {
    setAllCourses((prev) => {
      const id = generateCourseId(data.name, prev);
      const newCourse = {
        id,
        name: data.name,
        type: data.type,
        weeklyFreq: data.weeklyFreq,
        archived: false,
      };
      const updated = [...prev, newCourse];
      saveCourses(updated);
      return updated;
    });
  };

  const updateCourse = (id, data) => {
    setAllCourses((prev) => {
      const updated = prev.map((course) =>
        course.id === id ? { ...course, ...data, id: course.id } : course
      );
      saveCourses(updated);
      return updated;
    });
  };

  // Archiving a course also strips its id from every saved timetable,
  // so it doesn't show up as a ghost entry in the weekly grid.
  // Attendance records for that course id are left untouched.
  const archiveCourse = (id) => {
    setAllCourses((prev) => {
      const updated = prev.map((course) =>
        course.id === id ? { ...course, archived: true } : course
      );
      saveCourses(updated);
      return updated;
    });

    setTimetables((prev) => {
      const updated = prev.map((tt) => {
        const strippedSchedule = {};
        Object.keys(tt.weeklySchedule).forEach((dayId) => {
          strippedSchedule[dayId] = tt.weeklySchedule[dayId].filter(
            (courseId) => courseId !== id
          );
        });
        return { ...tt, weeklySchedule: strippedSchedule };
      });
      saveTimetables(updated);
      return updated;
    });
  };

  const courses = allCourses.filter((c) => !c.archived);

  return (
    <AttendanceContext.Provider
      value={{
        records,
        markAttendance,
        clearAll,
        timetables,
        addTimetable,
        updateTimetables,
        courses,       // active (non-archived) courses — what most screens should use
        allCourses,    // everything, including archived — for the modal's list toggle
        addCourse,
        updateCourse,
        archiveCourse,
      }}
    >
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
