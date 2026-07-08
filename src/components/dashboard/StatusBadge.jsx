import React from 'react';

export const StatusBadge = ({ percentage }) => {
  if (percentage === null || percentage === undefined) {
    return (
      <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-400 border border-stone-200">
        No logs yet
      </span>
    );
  }

  let label = 'Danger Zone';
  let colors = 'bg-rose-50 text-rose-600 border-rose-200';

  if (percentage >= 80) {
    label = 'Safe Zone';
    colors = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (percentage >= 75) {
    label = 'Cutting Close';
    colors = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${colors}`}>
      {label}
    </span>
  );
};
