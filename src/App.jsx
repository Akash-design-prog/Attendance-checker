import React, { useState, useMemo } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { TodayView } from './components/today/TodayView';
import { DashboardView } from './components/dashboard/DashboardView';
import { PlannerView } from './components/planner/PlannerView';
import { TimetableView } from './components/timetable/TimetableView';
import { getTodayString, parseDateString, addDays, formatDate } from './utils/dateUtils';

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const { timetables } = useAttendance();

  // Calculate week info for header based on selectedDate
  const effectiveDate = selectedDate;
  const startOfWeek = useMemo(() => {
    const date = parseDateString(effectiveDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(date.setDate(diff));
  }, [effectiveDate]);
  const endOfWeek = useMemo(() => addDays(startOfWeek, 6), [startOfWeek]); // Sunday
  const weekStartStr = formatDate(startOfWeek);
  const weekEndStr = formatDate(endOfWeek);
  const hasTimetable = timetables.length > 0;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView setActiveTab={setActiveTab} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      case 'dashboard':
        return <DashboardView />;
      case 'planner':
        return <PlannerView />;
      case 'timetable':
        return <TimetableView selectedDate={selectedDate} />;
      default:
        return <TodayView setActiveTab={setActiveTab} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 sm:pb-8">
      {activeTab === 'today' && (
        <Header 
          hasTimetable={hasTimetable}
          weekStartStr={weekStartStr}
          weekEndStr={weekEndStr}
          setActiveTab={setActiveTab}
        />
      )}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 w-full max-w-4xl mx-auto py-2">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
