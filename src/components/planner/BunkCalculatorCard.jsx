import React from 'react';
import { calculateBunkLimit } from '../../utils/attendanceMath';

export const BunkCalculatorCard = ({ attended, held, remainingSessions }) => {
  const maxSafeSkips = calculateBunkLimit(attended, held, remainingSessions);
  const finalPercentageIfSkipped = held + remainingSessions > 0
    ? ((attended + (remainingSessions - maxSafeSkips)) / (held + remainingSessions)) * 100
    : 100;

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Skips Authorized</span>
          <h3 className="text-xl font-extrabold text-stone-900 mt-1">
            You can skip <span className="text-emerald-600 text-2xl">{maxSafeSkips}</span> more classes
          </h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            If you skip all {maxSafeSkips} classes, your end-of-period attendance will rest at{' '}
            <strong className="text-stone-700">{finalPercentageIfSkipped.toFixed(1)}%</strong> (safely above the 75% boundary).
          </p>
        </div>
      </div>
    </div>
  );
};
