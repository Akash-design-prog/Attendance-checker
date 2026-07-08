import React from 'react';
import { calculateRecoveryCount } from '../../utils/attendanceMath';

export const RecoveryCalculatorCard = ({ attended, held, remainingSessions }) => {
  const needed = calculateRecoveryCount(attended, held);
  const isImpossible = needed > remainingSessions;

  if (isImpossible) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-200 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Condonation Risk Alert</span>
            <h3 className="text-xl font-extrabold text-stone-900 mt-1">Attendance mathematically unrecoverable</h3>
            <p className="text-sm text-rose-500 mt-2 font-medium">
              &ldquo;Even if you attend every remaining class, you're not touching 75%. Talk to your HOD about condonation.&rdquo;
            </p>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Needed: <strong className="text-stone-700">{needed}</strong> consecutive classes. Remaining: <strong className="text-stone-700">{remainingSessions}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Recovery Strategy</span>
          <h3 className="text-xl font-extrabold text-stone-900 mt-1">
            Attend next <span className="text-amber-600 text-2xl">{needed}</span> classes in a row
          </h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            You must secure {needed} consecutive attendances without a single bunk to pull your stats back to the 75% boundary.
            ({remainingSessions} sessions remaining.)
          </p>
        </div>
      </div>
    </div>
  );
};
