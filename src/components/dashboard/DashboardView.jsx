import React, { useMemo } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useCourseStats } from '../../hooks/useCourseStats';
import { useStreak } from '../../hooks/useStreak';
import { OverallSummaryCard } from './OverallSummaryCard';
import { CourseCard } from './CourseCard';
import { StreakDisplay } from './StreakDisplay';
import { MonthlyComplianceCard } from './MonthlyComplianceCard';

export const DashboardView = ({ setActiveTab }) => {
  const { courses } = useCourses();
  const { courseStats, overallStats, monthlyStats } = useCourseStats();
  const streak = useStreak();

  // Sort courses by danger/risk so the ones needing attention float to top
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const pctA = courseStats[a.id]?.percentage;
      const pctB = courseStats[b.id]?.percentage;

      // No data yet goes to bottom
      if (pctA === null && pctB !== null) return 1;
      if (pctB === null && pctA !== null) return -1;
      if (pctA === null && pctB === null) return a.name.localeCompare(b.name);

      // Lower percentage (higher risk) goes to top
      return pctA - pctB;
    });
  }, [courses, courseStats]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold font-display text-stone-900 tracking-tight">
            Academic Status
          </h1>
          <p className="text-xs text-stone-400">Real-time attendance ledger</p>
        </div>
        <StreakDisplay streak={streak} />
      </div>

      {/* Main Overall Percentage Banner */}
      <OverallSummaryCard overallStats={overallStats} />

      {/* Monthly Compliance Summary Checklist */}
      <MonthlyComplianceCard monthlyStats={monthlyStats} courses={courses} />

      {/* 11 Course Grid Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Risk Analysis Grid
          </h3>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors duration-200"
            >
              Manage courses →
            </button>
          )}
        </div>
        
        {/* Course Cards Grid */}
        {sortedCourses.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-200 rounded-xl p-8 text-center">
            <span className="text-stone-400 text-sm">No active courses. Add one from the Timetable tab.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedCourses.map((course) => (
              <div key={course.id} id={`course-card-${course.id}`}>
                <CourseCard course={course} stats={courseStats[course.id]} />
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};
