import React from 'react';

export const ProgressRing = ({ percentage, size = 60, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const hasValue = percentage !== null && percentage !== undefined;
  const pct = hasValue ? Math.max(0, Math.min(100, percentage)) : 0;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  let colorClass = 'stroke-rose-400';
  if (pct >= 80) {
    colorClass = 'stroke-emerald-500';
  } else if (pct >= 75) {
    colorClass = 'stroke-amber-400';
  } else if (!hasValue) {
    colorClass = 'stroke-stone-200';
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track */}
        <circle
          className="stroke-stone-200"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <circle
          className={`transition-all duration-500 ease-out ${colorClass}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xs font-bold text-stone-700 font-display">
        {hasValue ? `${Math.round(percentage)}%` : '--'}
      </span>
    </div>
  );
};
