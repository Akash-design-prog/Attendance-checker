/**
 * Formats a Date object to YYYY-MM-DD string in local time.
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
export const getTodayString = () => {
  return formatDate(new Date());
};

/**
 * Parses YYYY-MM-DD string into a local Date object set at midnight.
 */
export const parseDateString = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Adds a number of days to a date.
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculates number of weekdays (Mon-Fri) remaining between fromDateStr and endDateStr.
 * Includes both boundaries if they are weekdays.
 */
export const remainingTeachingWeekdays = (fromDateStr, endDateStr) => {
  const fromDate = parseDateString(fromDateStr);
  const endDate = parseDateString(endDateStr);

  if (fromDate > endDate) {
    return 0;
  }

  let count = 0;
  let current = new Date(fromDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Formatting helper for user friendly dates (e.g. "Mon, 6 Jul")
 */
export const formatFriendlyDate = (dateStr) => {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Returns all calendar months (keys and user-friendly names) spanning from start date to end date.
 */
export const getSemesterMonths = (startDateStr, endDateStr) => {
  const start = parseDateString(startDateStr);
  const end = parseDateString(endDateStr);

  const months = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    months.push({ key: monthKey, name: monthName });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
};

/**
 * Computes the start and end teaching bounds of a monthKey clamped inside the semester range.
 */
export const getMonthlyTeachingBounds = (monthKey, semesterStart, semesterEnd) => {
  const [year, month] = monthKey.split('-').map(Number);

  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);

  const startLimit = parseDateString(semesterStart);
  const endLimit = parseDateString(semesterEnd);

  const start = firstOfMonth < startLimit ? startLimit : firstOfMonth;
  const end = lastOfMonth > endLimit ? endLimit : lastOfMonth;

  return { start, end };
};

/**
 * Calculates how many teaching weekdays (Mon-Fri) remain in a specific month
 * from the referenceDateStr onwards.
 */
export const remainingWeekdaysForMonth = (referenceDateStr, monthKey, semesterStart, semesterEnd) => {
  const { start, end } = getMonthlyTeachingBounds(monthKey, semesterStart, semesterEnd);
  const referenceDate = parseDateString(referenceDateStr);

  if (referenceDate > end) {
    return 0;
  }

  const calculationStart = referenceDate > start ? referenceDate : start;
  let count = 0;
  let current = new Date(calculationStart);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

export const getDayOfWeekId = (dateStr) => {
  const date = parseDateString(dateStr);
  const day = date.getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[day];
};

export const getActiveTimetableForDate = (timetables, dateStr) => {
  const date = parseDateString(dateStr);
  for (let i = timetables.length - 1; i >= 0; i--) {
    const tt = timetables[i];
    const start = parseDateString(tt.startDate);
    if (date < start) continue;
    if (tt.endDate === null) return tt;
    const end = parseDateString(tt.endDate);
    if (date <= end) return tt;
  }
  return null;
};
