import React from 'react';

export const Header = ({ hasTimetable, weekStartStr, weekEndStr, setActiveTab, selectedDate }) => {
  const today = new Date().toISOString().split('T')[0];
  const effectiveDate = selectedDate || today;

  return (
    <header className="sticky top-0 bg-[#FAF7F0]/90 border-b border-stone-200 px-6 py-4 backdrop-blur-md z-30 select-none shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" role="img" aria-label="calendar">📅</span>
          <div>
            <h1 className="text-lg font-black font-display text-stone-900 tracking-tight leading-tight">
              ATTENDANCE HQ
            </h1>
            <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">
              Sem 3 Tracker
            </p>
          </div>
        </div>

        {hasTimetable ? (
          <button
            onClick={() => setActiveTab('timetable')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-all duration-200 cursor-pointer"
          >
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
              Week • {weekStartStr} – {weekEndStr}
            </span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
