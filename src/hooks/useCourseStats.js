import { useAttendanceData } from './useAttendanceData';
import { useCourses } from './useCourses';
import { calculateCourseStats, calculateOverallStats, calculateMonthlyStats } from '../utils/attendanceMath';

export const useCourseStats = () => {
  const { records } = useAttendanceData();
  const { courses } = useCourses();

  // Derived course stats
  const courseStats = {};
  courses.forEach((course) => {
    courseStats[course.id] = calculateCourseStats(records, course.id);
  });

  // Overall stats (Theory + Practical combined)
  const overallStats = calculateOverallStats(courses, records);

  // Monthly breakdown stats
  const monthlyStats = calculateMonthlyStats(courses, records);

  return {
    courseStats,
    overallStats,
    monthlyStats,
  };
};
