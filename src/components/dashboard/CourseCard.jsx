import React from 'react';
import { StatusBadge } from './StatusBadge';
import { ProgressRing } from '../shared/ProgressRing';
import { RoastMessage } from '../shared/RoastMessage';

export const CourseCard = ({ course, stats }) => {
  const { held, attended, percentage } = stats;

  return (
    <div className="bg-white hover:bg-amber-50/40 border border-stone-200 hover:border-stone-300 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between h-full shadow-sm hover:shadow-md group">
      <div>
        {/* Type & Code */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-500">
            {course.type}
          </span>
        </div>

        {/* Name & Ring */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h4 className="font-bold text-base text-stone-800 group-hover:text-stone-900 transition-colors duration-300 leading-snug line-clamp-2">
            {course.name}
          </h4>
          <div className="shrink-0">
            <ProgressRing percentage={percentage} size={56} strokeWidth={4.5} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-stone-100 mt-auto">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-stone-500 font-medium">
            Logged: <strong className="text-stone-700">{attended}</strong>/{held} classes
          </span>
          <StatusBadge percentage={percentage} />
        </div>
        <RoastMessage percentage={percentage} />
      </div>
    </div>
  );
};
