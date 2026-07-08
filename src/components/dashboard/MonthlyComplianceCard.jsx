import React from 'react';

export const MonthlyComplianceCard = ({ monthlyStats, courses }) => {
  const monthKeys = Object.keys(monthlyStats).sort();

  if (monthKeys.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center shadow-sm">
        <p className="text-xs text-stone-400 font-medium">
          No monthly logs compiled yet. Complete logs on the Today page to view monthly compliance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Monthly 75% Compliance Checklist
        </h3>
        <span className="text-[10px] text-stone-400 font-medium italic">
          Every month must individually maintain &ge; 75%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monthKeys.map((monthKey) => {
          const { monthName, courseStats, overallStats } = monthlyStats[monthKey];
          const monthlyPct = overallStats.overallPercentage;
          const isMonthSafe = monthlyPct === null || monthlyPct >= 75;

          const failingCourses = courses.filter((course) => {
            const pct = courseStats[course.id]?.percentage;
            return pct !== null && pct !== undefined && pct < 75;
          });

          return (
            <div
              key={monthKey}
              className={`border rounded-2xl p-5 transition-all duration-300 shadow-sm ${
                isMonthSafe && failingCourses.length === 0
                  ? 'bg-gradient-to-br from-white to-emerald-50 border-emerald-200'
                  : 'bg-gradient-to-br from-white to-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-bold text-sm text-stone-800">{monthName}</h4>
                  <span className="text-[10px] text-stone-400">
                    Averaged Score: <strong className="text-stone-600">{monthlyPct !== null ? `${monthlyPct.toFixed(1)}%` : '--'}</strong>
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                  isMonthSafe && failingCourses.length === 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {isMonthSafe && failingCourses.length === 0 ? '🟢 Safe' : '🔴 Danger'}
                </span>
              </div>

              <div className="pt-2.5 border-t border-stone-100 space-y-1.5">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Subject Status
                </span>
                {failingCourses.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-rose-500 font-medium">⚠️ Failing compliance in:</p>
                    <ul className="list-disc list-inside text-xs text-stone-500 space-y-1 pl-1">
                      {failingCourses.map((course) => (
                        <li key={course.id} className="truncate">
                          <span className="text-stone-700 font-semibold">{course.name}</span>:{' '}
                          <span className="text-rose-500 font-bold">
                            {courseStats[course.id].percentage.toFixed(1)}%
                          </span>{' '}
                          ({courseStats[course.id].attended}/{courseStats[course.id].held} classes)
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    ✨ All classes kept above 75% for this month!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
