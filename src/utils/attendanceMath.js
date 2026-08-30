/**
 * Calculates attendance metrics for a single course.
 */
export const calculateCourseStats = (records, courseId) => {
  let held = 0;
  let attended = 0;

  Object.values(records).forEach((dayRecord) => {
    const status = dayRecord[courseId];
    if (status === 'present' || status === 'absent') {
      held++;
      if (status === 'present') {
        attended++;
      }
    }
  });

  const percentage = held === 0 ? null : (attended / held) * 100;

  return {
    held,
    attended,
    percentage,
  };
};

/**
 * Calculates overall attendance based on the official college formula:
 * (Theory Total % + Practical Total %) / 2
 */
export const calculateOverallStats = (courses, records) => {
  const theoryCourses = courses.filter((c) => c.type === 'theory');
  const labCourses = courses.filter((c) => c.type === 'lab');

  let theoryHeld = 0;
  let theoryAttended = 0;
  theoryCourses.forEach((course) => {
    const stats = calculateCourseStats(records, course.id);
    theoryHeld += stats.held;
    theoryAttended += stats.attended;
  });

  let labHeld = 0;
  let labAttended = 0;
  labCourses.forEach((course) => {
    const stats = calculateCourseStats(records, course.id);
    labHeld += stats.held;
    labAttended += stats.attended;
  });

  const theoryPercentage = theoryHeld === 0 ? null : (theoryAttended / theoryHeld) * 100;
  const practicalPercentage = labHeld === 0 ? null : (labAttended / labHeld) * 100;

  let overallPercentage = null;
  if (theoryPercentage !== null && practicalPercentage !== null) {
    overallPercentage = (theoryPercentage + practicalPercentage) / 2;
  } else if (theoryPercentage !== null) {
    overallPercentage = theoryPercentage;
  } else if (practicalPercentage !== null) {
    overallPercentage = practicalPercentage;
  }

  return {
    theoryHeld,
    theoryAttended,
    theoryPercentage,
    labHeld,
    labAttended,
    practicalPercentage,
    overallPercentage,
  };
};

/**
 * Calculates how many sessions can be safely skipped (bunked)
 * while maintaining >= 75% attendance.
 */
export const calculateBunkLimit = (attended, held, remaining) => {
  // Derivation: (A + (R - skips)) / (H + R) >= 0.75
  // A + R - skips >= 0.75 * H + 0.75 * R
  // skips <= A + 0.25 * R - 0.75 * H
  const maxSafeSkips = Math.floor(attended + 0.25 * remaining - 0.75 * held);
  return Math.max(0, Math.min(remaining, maxSafeSkips));
};

/**
 * Calculates how many consecutive sessions must be attended in a row
 * to recover to >= 75% attendance.
 */
export const calculateRecoveryCount = (attended, held) => {
  const currentPct = held === 0 ? 100 : (attended / held) * 100;
  if (currentPct >= 75) {
    return 0;
  }

  // Derivation: (A + n) / (H + n) >= 0.75
  // A + n >= 0.75 * H + 0.75 * n
  // 0.25 * n >= 0.75 * H - A
  // n >= (0.75 * H - A) / 0.25
  return Math.max(0, Math.ceil((0.75 * held - attended) / 0.25));
};

/**
 * Calculates attendance stats grouped by calendar month.
 */
export const calculateMonthlyStats = (courses, records) => {
  const months = {}; // key: "YYYY-MM" (e.g. "2026-07")

  // Iterate over all dates in records and group them
  Object.keys(records).forEach((dateStr) => {
    const monthKey = dateStr.substring(0, 7); // "YYYY-MM"
    if (!months[monthKey]) {
      months[monthKey] = {};
    }
    months[monthKey][dateStr] = records[dateStr];
  });

  const monthlyBreakdown = {};

  Object.keys(months).sort().forEach((monthKey) => {
    const monthRecords = months[monthKey];
    
    // Calculate stats for this specific month's records
    const courseStats = {};
    courses.forEach((course) => {
      courseStats[course.id] = calculateCourseStats(monthRecords, course.id);
    });

    const overallStats = calculateOverallStats(courses, monthRecords);
    
    const [year, month] = monthKey.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    monthlyBreakdown[monthKey] = {
      monthName,
      monthKey,
      courseStats,
      overallStats,
    };
  });

  return monthlyBreakdown;
};
