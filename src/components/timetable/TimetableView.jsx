import React, { useState, useMemo, useEffect } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useAttendance } from '../../context/AttendanceContext';
import { getTodayString, parseDateString, addDays, formatDate, getActiveTimetableForDate, getDayOfWeekId } from '../../utils/dateUtils';
import { ManageCoursesModal } from './ManageCoursesModal';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export const TimetableView = ({ selectedDate }) => {
  const { timetables, addTimetable, updateTimetables } = useAttendance();
  const { courses } = useCourses();
  const today = getTodayString();

  const [isManageCoursesOpen, setIsManageCoursesOpen] = useState(false);

  // Initialize selectedWeekDate from prop or today
  const [selectedWeekDate, setSelectedWeekDate] = useState(selectedDate || today);
  // Initialize selectedDayId from selectedWeekDate
  const initialDayId = getDayOfWeekId(selectedWeekDate);
  const [selectedDayId, setSelectedDayId] = useState(initialDayId);

  // Calculate week dates for prompt based on selectedWeekDate
  const weekStartStr = useMemo(() => {
    const date = parseDateString(selectedWeekDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const startOfWeek = new Date(date.setDate(diff));
    return formatDate(startOfWeek);
  }, [selectedWeekDate]);

  const weekEndStr = useMemo(() => {
    const start = parseDateString(weekStartStr);
    return formatDate(addDays(start, 6)); // Sunday
  }, [weekStartStr]);

  // Find active timetable for current week
  const activeTimetable = useMemo(() => {
    return getActiveTimetableForDate(timetables, weekStartStr);
  }, [timetables, weekStartStr]);

  // Initialize weeklySchedule from activeTimetable
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    if (activeTimetable) {
      return activeTimetable.weeklySchedule;
    }
    return {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
  });

  // Update weeklySchedule when activeTimetable changes
  useEffect(() => {
    if (activeTimetable) {
      setWeeklySchedule(activeTimetable.weeklySchedule);
    } else {
      setWeeklySchedule({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      });
    }
  }, [activeTimetable]);

  // Update selectedWeekDate when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedWeekDate(selectedDate);
    }
  }, [selectedDate]);

  // Update selectedDayId when selectedWeekDate changes
  useEffect(() => {
    setSelectedDayId(getDayOfWeekId(selectedWeekDate));
  }, [selectedWeekDate]);

  const toggleCourse = (courseId) => {
    setWeeklySchedule((prev) => {
      const current = prev[selectedDayId];
      if (current.includes(courseId)) {
        return { ...prev, [selectedDayId]: current.filter((id) => id !== courseId) };
      } else {
        return { ...prev, [selectedDayId]: [...current, courseId] };
      }
    });
  };

  const handleSave = (applyTo) => {
    const newTimetable = {
      startDate: weekStartStr,
      endDate: applyTo === 'this-week' ? weekEndStr : null,
      weeklySchedule,
    };

    if (timetables.length === 0) {
      addTimetable(newTimetable);
    } else {
      updateTimetables([newTimetable]);
    }

    alert('Timetable saved!');
  };

  const selectedDay = DAYS_OF_WEEK.find(d => d.id === selectedDayId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header with week picker */}
      <div className="flex items-center justify-between">
      <div>
          <h2 className="text-2xl font-extrabold font-display text-stone-900 tracking-tight">
            Set Up Your Timetable
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Select which courses you have each day
          </p>
          <button
            onClick={() => setIsManageCoursesOpen(true)}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
          >
            Manage courses →
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-stone-700">
            {weekStartStr} – {weekEndStr}
          </span>
          <div className="relative">
            <input
              type="date"
              value={selectedWeekDate}
              onChange={(e) => setSelectedWeekDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="bg-amber-100 hover:bg-amber-200 p-3 rounded-xl border border-amber-300 transition-all duration-200">
              <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="9" y1="4" x2="9" y2="10" />
                <line x1="15" y1="4" x2="15" y2="10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Day selector dropdown */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <label className="block text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
          Select Day
        </label>
        <select
          value={selectedDayId}
          onChange={(e) => setSelectedDayId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-300 focus:ring-2 focus:ring-amber-50 outline-none"
        >
          {DAYS_OF_WEEK.map((day) => (
            <option key={day.id} value={day.id}>{day.label}</option>
          ))}
        </select>
      </div>

      {/* Courses for selected day */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-3">{selectedDay?.label}</h3>
        {courses.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-stone-500 mb-3">No active courses yet.</p>
            <button
              onClick={() => setIsManageCoursesOpen(true)}
              className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all duration-200 text-sm"
            >
              Add your first course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => toggleCourse(course.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  weeklySchedule[selectedDayId]?.includes(course.id)
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-100'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">{course.name}</p>
                  <p className="text-xs text-stone-500">
                    {course.type === 'theory' ? 'Theory' : 'Lab'}
                  </p>
                </div>
                {weeklySchedule[selectedDayId]?.includes(course.id) && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Apply timetable section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
          Apply timetable to:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleSave('this-week')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-2xl hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
          >
            <span className="text-lg font-bold text-stone-800">Just This Week</span>
            <span className="text-xs text-stone-500">
              {weekStartStr} – {weekEndStr}
            </span>
          </button>
          <button
            onClick={() => handleSave('all-future')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-2xl hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
          >
            <span className="text-lg font-bold text-stone-800">This Week & All Future</span>
            <span className="text-xs text-stone-500">
              Starting {weekStartStr}
            </span>
          </button>
        </div>
      </div>

      {isManageCoursesOpen && (
        <ManageCoursesModal onClose={() => setIsManageCoursesOpen(false)} />
      )}
    </div>
  );
};
