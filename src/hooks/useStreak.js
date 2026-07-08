import { useAttendanceData } from './useAttendanceData';
import { formatDate, parseDateString } from '../utils/dateUtils';

export const useStreak = () => {
  const { records } = useAttendanceData();

  if (Object.keys(records).length === 0) {
    return 0;
  }

  const todayObj = new Date();
  const todayStr = formatDate(todayObj);

  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayObj);

  let startStr = null;
  // If user logged something today, start counting from today.
  // Otherwise, if they logged yesterday, start from yesterday so streak doesn't break prematurely.
  if (records[todayStr] && Object.keys(records[todayStr]).length > 0) {
    startStr = todayStr;
  } else if (records[yesterdayStr] && Object.keys(records[yesterdayStr]).length > 0) {
    startStr = yesterdayStr;
  }

  if (!startStr) {
    return 0;
  }

  let streak = 0;
  let currentObj = parseDateString(startStr);

  while (true) {
    const currentStr = formatDate(currentObj);
    if (records[currentStr] && Object.keys(records[currentStr]).length > 0) {
      streak++;
      currentObj.setDate(currentObj.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
