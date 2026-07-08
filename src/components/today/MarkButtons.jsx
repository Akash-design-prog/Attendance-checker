import React from 'react';

export const MarkButtons = ({ status, onMark }) => {
  const options = [
    {
      value: 'present',
      label: 'Present',
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      activeClass: 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-md shadow-emerald-200',
    },
    {
      value: 'absent',
      label: 'Absent',
      colorClass: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100',
      activeClass: 'bg-rose-500 text-white border-rose-500 font-bold shadow-md shadow-rose-200',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      colorClass: 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200',
      activeClass: 'bg-stone-500 text-white border-stone-500 font-bold shadow-md shadow-stone-200',
    },
    {
      value: 'not-held',
      label: 'Not Held',
      colorClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      activeClass: 'bg-blue-500 text-white border-blue-500 font-bold shadow-md shadow-blue-200',
    },
  ];

  return (
    <div className="flex gap-2 w-full mt-2 sm:mt-0 sm:w-auto">
      {options.map((opt) => {
        const isActive = status === opt.value;
        return (
          <button
            key={opt.value}
            id={`btn-mark-${opt.value}`}
            onClick={() => onMark(isActive ? null : opt.value)}
            className={`flex-1 sm:flex-initial px-4 py-2 text-sm rounded-lg border transition-all duration-300 ${
              isActive ? opt.activeClass : opt.colorClass
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
