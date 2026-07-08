import React from 'react';

export const StreakDisplay = ({ streak }) => {
  if (streak === 0) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full select-none"
      title="Daily logging streak!"
    >
      <span className="text-sm animate-pulse">🔥</span>
      <span className="text-xs font-bold tracking-wide font-display">
        {streak} Day Streak
      </span>
    </div>
  );
};
