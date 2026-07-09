import { useAttendance } from '../context/AttendanceContext';

// Thin wrapper around AttendanceContext, scoped to courses only.
// Screens that only care about courses import this instead of
// pulling the whole attendance context and cherry-picking fields.
export const useCourses = () => {
  const { courses, allCourses, addCourse, updateCourse, archiveCourse } = useAttendance();

  return {
    courses,        // active (non-archived) — use this for Today, Dashboard, Planner, Timetable
    allCourses,      // includes archived — use this only in the Manage Courses modal
    addCourse,
    updateCourse,
    archiveCourse,
  };
};
