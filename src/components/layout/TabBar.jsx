import React from 'react';
import { CalendarDays, LayoutDashboard, Sliders, Clock } from 'lucide-react';

export const TabBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today',     label: 'Today',     icon: CalendarDays },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner',   label: 'Planner',   icon: Sliders },
    { id: 'timetable', label: 'Timetable', icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:sticky sm:top-[68px] bg-[#FAF7F0]/95 sm:bg-[#FAF7F0]/90 border-t sm:border-t-0 sm:border-b border-stone-200 px-4 py-2 sm:py-0 backdrop-blur-md z-30 select-none shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-around sm:justify-start sm:gap-1.5 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 py-1.5 sm:py-2.5 rounded-xl transition-all duration-300 font-display text-[10px] sm:text-sm font-semibold tracking-wide border ${
                isActive
                  ? 'text-amber-700 bg-amber-100 border-amber-200 shadow-sm'
                  : 'text-stone-400 border-transparent hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
