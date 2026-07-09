import React, { useState, useMemo } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { MarkButtons } from './MarkButtons';
import { CourseQuickAdd } from './CourseQuickAdd';

import { formatDate, parseDateString, formatFriendlyDate, getTodayString, getDayOfWeekId, getActiveTimetableForDate } from '../../utils/dateUtils';
import { useAttendanceData } from '../../hooks/useAttendanceData';

export const TodayView = ({ setActiveTab, selectedDate, setSelectedDate }) => {
  const { getRecordForDate, markAttendance, timetables } = useAttendanceData();
  const { courses } = useCourses();
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const hasTimetable = timetables.length > 0;

  // Get scheduled courses for selected date
  const scheduledCourseIds = useMemo(() => {
    if (!hasTimetable) return courses.map((c) => c.id);
    const activeTimetable = getActiveTimetableForDate(timetables, selectedDate);
    if (!activeTimetable) return courses.map((c) => c.id);
    const dayId = getDayOfWeekId(selectedDate);
    const daySchedule = activeTimetable.weeklySchedule[dayId] || [];
    return daySchedule.length > 0 ? daySchedule : courses.map((c) => c.id);
  }, [timetables, selectedDate, hasTimetable, courses]);

  const currentRecord = getRecordForDate(selectedDate);
  const loggedCourseIds = Object.keys(currentRecord);

  const changeDateByDays = (days) => {
    const dateObj = parseDateString(selectedDate);
    dateObj.setDate(dateObj.getDate() + days);
    setSelectedDate(formatDate(dateObj));
    setExpandedCourseId(null);
  };



  const handleMark = (courseId, status) => {
    markAttendance(selectedDate, courseId, status);
  };

  const activeCourses = courses.filter(c => loggedCourseIds.includes(c.id) && scheduledCourseIds.includes(c.id));
  const unmarkedCourses = courses.filter(c => !loggedCourseIds.includes(c.id) && scheduledCourseIds.includes(c.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">


      {/* Date Header */}
      <div className="flex flex-col gap-4 bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-3 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-xl font-bold font-display text-stone-800">
            {formatFriendlyDate(selectedDate)}
          </h2>

          <button
            onClick={() => changeDateByDays(1)}
            className="p-3 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => { if (e.target.value) { setSelectedDate(e.target.value); setExpandedCourseId(null); } }}
          className="w-full text-center text-lg font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-300"
        />
      </div>

      {/* Timetable Setup Prompt (only if no timetable) */}
      {!hasTimetable && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📅</div>
            <div className="flex-1">
              <h3 className="font-bold text-stone-800 text-lg">
                Set up your weekly timetable!
              </h3>
              <p className="text-sm text-stone-600 mt-1">
                Save time by only showing the courses you actually have each day.
              </p>
              <button
                onClick={() => setActiveTab('timetable')}
                className="mt-3 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Set Up Timetable
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Logged Courses */}
        {activeCourses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Logged Classes</h3>
            {activeCourses.map((course) => {
              const status = currentRecord[course.id];
              const isExpanded = expandedCourseId === course.id;

              let statusText = 'Present';
              let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (status === 'absent') { statusText = 'Absent'; statusColor = 'bg-rose-50 text-rose-600 border-rose-200'; }
              else if (status === 'cancelled') { statusText = 'Cancelled'; statusColor = 'bg-stone-100 text-stone-500 border-stone-200'; }
              else if (status === 'not-held') { statusText = 'Not Held'; statusColor = 'bg-blue-50 text-blue-700 border-blue-200'; }

              return (
                <div key={course.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:border-stone-300 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0" onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-400">{course.type}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-stone-700 truncate cursor-pointer hover:text-stone-900">{course.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button onClick={() => setExpandedCourseId(isExpanded ? null : course.id)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-300 ${statusColor}`}>
                        {statusText}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="text-xs text-stone-400">Update status:</span>
                      <MarkButtons status={status} onMark={(s) => { handleMark(course.id, s); if (!s) setExpandedCourseId(null); }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Remaining to Log */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Remaining to Log</h3>
          {unmarkedCourses.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-stone-200 rounded-xl">
              <span className="text-stone-400 text-sm">🎉 All courses logged for this day!</span>
            </div>
          ) : (
            <div className="grid gap-3">
              {unmarkedCourses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                return (
                  <div key={course.id} className="bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-4 transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-400">{course.type}</span>
                        </div>
                        <h4 className="font-medium text-sm text-stone-500 truncate hover:text-stone-800">{course.name}</h4>
                      </div>
                      <span className="text-xs text-stone-400 hover:text-amber-600 font-medium shrink-0 ml-4">{isExpanded ? 'Collapse' : 'Log'}</span>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-xs text-stone-400">Mark as:</span>
                        <MarkButtons status={null} onMark={(s) => { handleMark(course.id, s); setExpandedCourseId(null); }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
