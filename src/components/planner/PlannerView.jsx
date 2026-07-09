import React, { useState, useMemo } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { SEMESTER_START, SEMESTER_END } from '../../constants/semester';
import { useCourseStats } from '../../hooks/useCourseStats';
import { useSemesterProjection } from '../../hooks/useSemesterProjection';
import { useAttendanceData } from '../../hooks/useAttendanceData';
import { calculateCourseStats } from '../../utils/attendanceMath';
import { getSemesterMonths, getTodayString } from '../../utils/dateUtils';
import { BunkCalculatorCard } from './BunkCalculatorCard';
import { RecoveryCalculatorCard } from './RecoveryCalculatorCard';
import { WhatIfSimulator } from './WhatIfSimulator';

export const PlannerView = () => {
  const allMonths = useMemo(() => getSemesterMonths(SEMESTER_START, SEMESTER_END), []);
  const todayStr = getTodayString();
  const currentMonthKey = todayStr.substring(0, 7);

  // Default to current month if it's in the semester, else first month
  const defaultMonth = allMonths.find(m => m.key === currentMonthKey)?.key || allMonths[0]?.key || 'semester';

  const { courses } = useCourses();

  const [selectedMonthKey, setSelectedMonthKey] = useState(defaultMonth);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? null);

  const { records } = useAttendanceData();
  const { monthlyStats } = useCourseStats();
  const { remainingWeekdays, remainingWeeks, getProjectedRemainingSessions } = useSemesterProjection(selectedMonthKey);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) ?? courses[0] ?? null;

  // Pull ONLY this month's records for the selected course
  const monthStats = useMemo(() => {
    if (!selectedCourse) return { attended: 0, held: 0, percentage: null };
    // Filter records to only those in the selected month
    const monthRecords = {};
    Object.keys(records).forEach(dateStr => {
      if (dateStr.startsWith(selectedMonthKey)) {
        monthRecords[dateStr] = records[dateStr];
      }
    });
    return calculateCourseStats(monthRecords, selectedCourse.id);
  }, [records, selectedMonthKey, selectedCourse]);

  const remainingSessions = selectedCourse
    ? getProjectedRemainingSessions(selectedCourse.weeklyFreq)
    : 0;
  const isSafe = monthStats.percentage === null || monthStats.percentage >= 75;

  // Label helper
  const selectedMonthName = allMonths.find(m => m.key === selectedMonthKey)?.name || selectedMonthKey;
  const isMonthPast = remainingWeekdays === 0;
  const isMonthFuture = !Object.keys(records).some(d => d.startsWith(selectedMonthKey));

  // Monthly overall status (from the already computed monthlyStats)
  const monthlyOverall = monthlyStats[selectedMonthKey]?.overallStats?.overallPercentage ?? null;

  if (courses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-stone-500 font-medium">
            No active courses yet. Add a course from the Timetable tab to start planning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold font-display text-stone-900 tracking-tight">
            Monthly Planner
          </h1>
          <p className="text-xs text-stone-400">Per-month 75% compliance tools</p>
        </div>

        {/* Month overall compliance badge */}
        {monthlyOverall !== null && (
          <div className={`self-start rounded-xl px-3 py-1.5 text-[11px] font-bold border ${
            monthlyOverall >= 75
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {selectedMonthName} Overall: {monthlyOverall.toFixed(1)}%
            {monthlyOverall >= 75 ? ' 🟢' : ' 🔴'}
          </div>
        )}
      </div>

      {/* Two-selector row: Month + Course */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Month Selector */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
          <label htmlFor="month-select-dropdown" className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
            📅 Select Month
          </label>
          <select
            id="month-select-dropdown"
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="w-full bg-white border border-stone-300 focus:border-amber-500 text-stone-800 px-3 py-2.5 rounded-xl focus:outline-none transition duration-300 font-medium text-sm"
          >
            {allMonths.map((m) => {
              const isPast = m.key < currentMonthKey;
              const isCurrent = m.key === currentMonthKey;
              return (
                <option key={m.key} value={m.key}>
                  {m.name}{isCurrent ? ' (Current)' : isPast ? ' ✓' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Course Selector */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
          <label htmlFor="course-select-dropdown" className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
            📚 Select Course
          </label>
          <select
            id="course-select-dropdown"
            value={selectedCourse?.id ?? ''}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-white border border-stone-300 focus:border-amber-500 text-stone-800 px-3 py-2.5 rounded-xl focus:outline-none transition duration-300 font-medium text-sm"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.type === 'theory' ? 'Theory' : 'Lab'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Info Strip */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-stone-500 font-medium shadow-sm">
          Remaining this month: <strong className="text-stone-700">{remainingWeekdays}</strong> weekdays
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-stone-500 font-medium shadow-sm">
          This course logged: <strong className="text-stone-700">{monthStats.attended}/{monthStats.held}</strong> classes
        </div>
        {monthStats.percentage !== null && (
          <div className={`rounded-xl px-3 py-1.5 font-bold border ${
            monthStats.percentage >= 75
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {monthStats.percentage.toFixed(1)}% this month
          </div>
        )}
      </div>

      {/* Month Status Messages */}
      {isMonthFuture && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-xs text-stone-500 font-medium">
            📭 No classes logged for <strong className="text-stone-700">{selectedMonthName}</strong> yet. 
            Projections are based on your weekly frequency ({selectedCourse.weeklyFreq}×/week) only.
          </p>
        </div>
      )}

      {isMonthPast && !isMonthFuture && (
        <div className={`rounded-2xl p-4 text-center border shadow-sm ${
          monthStats.percentage !== null && monthStats.percentage >= 75
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-rose-50 border-rose-200'
        }`}>
          <p className={`text-xs font-bold ${
            monthStats.percentage !== null && monthStats.percentage >= 75 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {monthStats.percentage !== null && monthStats.percentage >= 75
              ? `✅ ${selectedMonthName} is complete — you stayed above 75%!`
              : `❌ ${selectedMonthName} is over — attendance fell below 75% for this course.`}
          </p>
        </div>
      )}

      {/* Compliance Analyzer */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
          {selectedMonthName} — Compliance Analyzer
        </h3>

        {isSafe ? (
          <BunkCalculatorCard
            attended={monthStats.attended}
            held={monthStats.held}
            remainingSessions={remainingSessions}
          />
        ) : (
          <RecoveryCalculatorCard
            attended={monthStats.attended}
            held={monthStats.held}
            remainingSessions={remainingSessions}
          />
        )}
      </div>

      {/* What-If Simulator */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
          {selectedMonthName} — What-If Simulator
        </h3>
        <WhatIfSimulator
          attended={monthStats.attended}
          held={monthStats.held}
          remainingSessions={remainingSessions}
        />
      </div>

    </div>
  );
};
