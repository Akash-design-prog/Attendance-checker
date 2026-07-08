import { SEMESTER_START, SEMESTER_END } from '../constants/semester';
import { remainingTeachingWeekdays, getTodayString, remainingWeekdaysForMonth } from '../utils/dateUtils';

export const useSemesterProjection = (selectedMonthKey = 'semester') => {
  const todayStr = getTodayString();

  // If today is before semester start, calculate from the start date.
  // Otherwise, calculate from today.
  const referenceDateStr = todayStr < SEMESTER_START ? SEMESTER_START : todayStr;

  let totalTeachingWeekdays = 0;
  let remainingWeekdays = 0;

  if (selectedMonthKey === 'semester') {
    totalTeachingWeekdays = remainingTeachingWeekdays(SEMESTER_START, SEMESTER_END);
    remainingWeekdays = remainingTeachingWeekdays(referenceDateStr, SEMESTER_END);
  } else {
    // Calculate for the specific calendar month clamped within the semester
    totalTeachingWeekdays = remainingWeekdaysForMonth(SEMESTER_START, selectedMonthKey, SEMESTER_START, SEMESTER_END);
    remainingWeekdays = remainingWeekdaysForMonth(referenceDateStr, selectedMonthKey, SEMESTER_START, SEMESTER_END);
  }

  const totalWeeks = totalTeachingWeekdays / 5;
  const remainingWeeks = remainingWeekdays / 5;

  const getProjectedRemainingSessions = (weeklyFreq) => {
    const sessions = remainingWeeks * weeklyFreq;
    if (sessions > 0 && sessions < 0.5) {
      return 1; // Safeguard so we don't accidentally project 0 classes if time remains
    }
    return Math.round(sessions);
  };

  const getProjectedTotalSessions = (heldSoFar, weeklyFreq) => {
    return heldSoFar + getProjectedRemainingSessions(weeklyFreq);
  };

  return {
    todayStr,
    totalTeachingWeekdays,
    remainingWeekdays,
    totalWeeks,
    remainingWeeks,
    getProjectedRemainingSessions,
    getProjectedTotalSessions,
  };
};
