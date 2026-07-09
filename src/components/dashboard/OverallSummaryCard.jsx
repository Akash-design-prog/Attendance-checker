import React from 'react';
import { StatusBadge } from './StatusBadge';
import { ProgressRing } from '../shared/ProgressRing';

export const OverallSummaryCard = ({ overallStats }) => {
  const {
    theoryHeld, theoryAttended, theoryPercentage, theoryCourseCount,
    labHeld, labAttended, practicalPercentage, labCourseCount,
    overallPercentage,
  } = overallStats;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50/80 border border-stone-200 rounded-3xl p-6 shadow-md">
      {/* Decorative glows */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">

        {/* Left: overall ring */}
        <div className="flex items-center gap-5">
          <div className="shrink-0 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm">
            <ProgressRing percentage={overallPercentage} size={88} strokeWidth={7.5} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              College Combined Score
            </span>
            <h2 className="text-2xl font-extrabold text-stone-900 mt-0.5 tracking-tight font-display">
              {overallPercentage !== null ? `${overallPercentage.toFixed(1)}%` : 'No logs yet'}
            </h2>
            <div className="mt-1.5">
              <StatusBadge percentage={overallPercentage} />
            </div>
          </div>
        </div>

        {/* Right: breakdown cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">

          {/* Theory */}
          <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">Theory Total</span>
              <span className={`text-xs font-bold ${theoryPercentage >= 75 ? 'text-emerald-600' : theoryPercentage === null ? 'text-stone-400' : 'text-rose-500'}`}>
                {theoryPercentage !== null ? `${theoryPercentage.toFixed(1)}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${theoryPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-400'}`}
                style={{ width: `${theoryPercentage || 0}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-400 font-medium flex justify-between">
              <span>Attended: {theoryAttended}/{theoryHeld}</span>
              <span>{theoryCourseCount} {theoryCourseCount === 1 ? 'Course' : 'Courses'}</span>
            </div>
          </div>

          {/* Practical */}
          <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">Practical Total</span>
              <span className={`text-xs font-bold ${practicalPercentage >= 75 ? 'text-emerald-600' : practicalPercentage === null ? 'text-stone-400' : 'text-rose-500'}`}>
                {practicalPercentage !== null ? `${practicalPercentage.toFixed(1)}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${practicalPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-400'}`}
                style={{ width: `${practicalPercentage || 0}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-400 font-medium flex justify-between">
              <span>Attended: {labAttended}/{labHeld}</span>
              <span>{labCourseCount} {labCourseCount === 1 ? 'Lab' : 'Labs'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
