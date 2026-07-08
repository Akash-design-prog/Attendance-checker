import { useAttendanceData } from './useAttendanceData';
import { COURSES } from '../data/courses';
import { calculateCourseStats, calculateOverallStats, calculateMonthlyStats } from '../utils/attendanceMath';

export const useCourseStats = () => {
  const { records } = useAttendanceData();

  // Derived course stats
  const courseStats = {};
  COURSES.forEach((course) => {
    courseStats[course.id] = calculateCourseStats(records, course.id);
  });

  // Overall stats (Theory + Practical combined)
  const overallStats = calculateOverallStats(COURSES, records);

  // Monthly breakdown stats
  const monthlyStats = calculateMonthlyStats(COURSES, records);

  return {
    courseStats,
    overallStats,
    monthlyStats,
  };
};
