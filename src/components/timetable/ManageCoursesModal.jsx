import React, { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useAttendance } from '../../context/AttendanceContext';

const COURSE_TYPES = [
  { id: 'theory', label: 'Theory' },
  { id: 'lab', label: 'Lab' },
];

const EMPTY_FORM = { name: '', type: 'theory', weeklyFreq: 2 };

// Does this course id appear in any saved timetable's weekly schedule?
const isCourseInTimetables = (courseId, timetables) => {
  return timetables.some((tt) =>
    Object.values(tt.weeklySchedule).some((dayIds) => dayIds.includes(courseId))
  );
};

// Does this course id have any logged attendance records?
const isCourseInRecords = (courseId, records) => {
  return Object.values(records).some((dayRecord) =>
    Object.prototype.hasOwnProperty.call(dayRecord, courseId)
  );
};

export const ManageCoursesModal = ({ onClose }) => {
  const { courses, addCourse, updateCourse, archiveCourse } = useCourses();
  const { timetables, records } = useAttendance();

  // 'list' | 'form'
  const [view, setView] = useState('list');
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Course pending archive confirmation, or null
  const [confirmArchiveCourse, setConfirmArchiveCourse] = useState(null);

  const openAddForm = () => {
    setEditingCourseId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setView('form');
  };

  const openEditForm = (course) => {
    setEditingCourseId(course.id);
    setFormData({ name: course.name, type: course.type, weeklyFreq: course.weeklyFreq });
    setFormError('');
    setView('form');
  };

  const backToList = () => {
    setView('list');
    setEditingCourseId(null);
    setFormError('');
  };

  const handleSubmit = () => {
    const trimmedName = formData.name.trim();
    const freq = Number(formData.weeklyFreq);

    if (!trimmedName) {
      setFormError('Course name is required.');
      return;
    }
    if (!Number.isInteger(freq) || freq < 1 || freq > 6) {
      setFormError('Weekly frequency must be a number between 1 and 6.');
      return;
    }

    const payload = { name: trimmedName, type: formData.type, weeklyFreq: freq };

    if (editingCourseId) {
      updateCourse(editingCourseId, payload);
    } else {
      addCourse(payload);
    }

    backToList();
  };

  const requestArchive = (course) => {
    setConfirmArchiveCourse(course);
  };

  const confirmArchive = () => {
    if (confirmArchiveCourse) {
      archiveCourse(confirmArchiveCourse.id);
    }
    setConfirmArchiveCourse(null);
  };

  const cancelArchive = () => {
    setConfirmArchiveCourse(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white">
          <h2 className="text-lg font-extrabold font-display text-stone-900">
            {view === 'list' ? 'Your Courses' : editingCourseId ? 'Edit Course' : 'Add Course'}
          </h2>
          <button
            onClick={view === 'list' ? onClose : backToList}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-all duration-200"
          >
            {view === 'list' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <span className="text-sm font-semibold text-stone-500">Cancel</span>
            )}
          </button>
        </div>

        <div className="p-5">
          {/* Archive confirmation */}
          {confirmArchiveCourse && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-stone-800">
                Archive "{confirmArchiveCourse.name}"?
              </p>
              {isCourseInTimetables(confirmArchiveCourse.id, timetables) && (
                <p className="text-xs text-amber-800">
                  This course is in your saved timetable. It'll be removed from the weekly grid automatically.
                </p>
              )}
              {isCourseInRecords(confirmArchiveCourse.id, records) && (
                <p className="text-xs text-stone-500">
                  Past attendance for this course will be kept — nothing gets deleted.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={confirmArchive}
                  className="flex-1 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition-all duration-200"
                >
                  Archive
                </button>
                <button
                  onClick={cancelArchive}
                  className="flex-1 py-2 bg-white border border-stone-200 text-stone-600 text-sm font-semibold rounded-lg hover:bg-stone-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* List view */}
          {view === 'list' && !confirmArchiveCourse && (
            <>
              {courses.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-6">
                  No courses yet. Add your first one below.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-400">
                            {course.type === 'theory' ? 'Theory' : 'Lab'}
                          </span>
                          <span className="text-[10px] text-stone-400">{course.weeklyFreq}×/week</span>
                        </div>
                        <p className="font-semibold text-sm text-stone-800 truncate">{course.name}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => openEditForm(course)}
                          className="p-2 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => requestArchive(course)}
                          className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-200"
                          title="Archive"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={openAddForm}
                className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                + Add Course
              </button>
            </>
          )}

          {/* Add / Edit form */}
          {view === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Maths"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COURSE_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormData((f) => ({ ...f, type: t.id }))}
                      className={`py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200 ${
                        formData.type === t.id
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-white border-stone-200 text-stone-500 hover:border-amber-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Weekly Frequency
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.weeklyFreq}
                  onChange={(e) => setFormData((f) => ({ ...f, weeklyFreq: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-medium">{formError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {editingCourseId ? 'Save Changes' : 'Add Course'}
                </button>
                <button
                  onClick={backToList}
                  className="flex-1 py-3 bg-white border border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
