const STORAGE_KEY = 'attendance-records';
const TIMETABLE_KEY = 'attendance-timetables';

export const getRecords = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse attendance records from storage', error);
    return {};
  }
};

export const saveRecords = (records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save attendance records to storage', error);
  }
};

export const clearRecords = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear attendance records', error);
  }
};

export const getTimetables = () => {
  try {
    const data = localStorage.getItem(TIMETABLE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse timetables from storage', error);
    return [];
  }
};

export const saveTimetables = (timetables) => {
  try {
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetables));
  } catch (error) {
    console.error('Failed to save timetables to storage', error);
  }
};

export const clearTimetables = () => {
  try {
    localStorage.removeItem(TIMETABLE_KEY);
  } catch (error) {
    console.error('Failed to clear timetables', error);
  }
};