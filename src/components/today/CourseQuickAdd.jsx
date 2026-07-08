import React, { useState } from 'react';

export const CourseQuickAdd = ({ courses, loggedCourseIds, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableCourses = courses.filter(c => !loggedCourseIds.includes(c.id));

  if (availableCourses.length === 0) return null;

  return (
    <div className="relative mt-4">
      <button
        id="btn-quick-add-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto px-5 py-2.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all duration-300 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
      >
        <span>➕ Log Another Course</span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-full sm:w-72 bg-white border border-stone-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
            <div className="p-2">
              {availableCourses.map((course) => (
                <button
                  key={course.id}
                  id={`quick-add-course-${course.id}`}
                  onClick={() => { onSelect(course.id); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-amber-50 hover:text-stone-800 transition-all duration-200 flex items-center justify-between"
                >
                  <span className="font-medium truncate mr-2">{course.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-400 shrink-0">
                    {course.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
