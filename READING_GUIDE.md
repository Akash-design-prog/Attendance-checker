# Attendance HQ: Step-by-Step Reading Guide

A complete order to read every file and understand how this app works!


## Phase 1: The "What Is This?" Files
Start here to get the big picture!

1. **`package.json`** – List of dependencies/scripts
2. **`index.html`** – The root HTML file (where React mounts)
3. **`attendance-tracker-blueprint.md`** – The original plan!


## Phase 2: The "Static Data" Files
These don't change—they're just info we use!

4. **`src/constants/semester.js`** – Semester start/end dates
5. **`src/data/courses.js`** – All your courses (names/codes/type)


## Phase 3: The "Utility Helpers" (No React Here!)
Pure JS functions that do calculations—testable and simple!

6. **`src/utils/dateUtils.js`** – Date formatting/helpers
7. **`src/utils/storage.js`** – Save/load to `localStorage`
8. **`src/utils/attendanceMath.js`** – *Most important!* All attendance calculations!


## Phase 4: Context (Global State)
How we share data across all components!

9. **`src/context/AttendanceContext.jsx`** – Holds attendance records globally


## Phase 5: Custom Hooks
Reusable logic that connects React to our utilities!

10. **`src/hooks/useAttendanceData.js`** – Wraps `AttendanceContext` for easy use
11. **`src/hooks/useCourseStats.js`** – Calculates stats for all courses
12. **`src/hooks/useSemesterProjection.js`** – Calculates remaining classes/weeks
13. **`src/hooks/useStreak.js`** – Calculates your daily logging streak


## Phase 6: Shared Components
Small reusable UI pieces used in multiple places!

14. **`src/components/shared/ProgressRing.jsx`** – Circular percentage indicator
15. **`src/components/shared/RoastMessage.jsx`** – Funny status messages based on attendance


## Phase 7: Layout Components
The "frame" of the app!

16. **`src/components/layout/Header.jsx`** – Top app bar
17. **`src/components/layout/TabBar.jsx`** – Bottom navigation (Today/Dashboard/Planner)


## Phase 8: The "Today" View (Mark Attendance!)
Where you log your attendance daily!

18. **`src/components/today/MarkButtons.jsx`** – Present/Absent/Cancelled buttons
19. **`src/components/today/CourseQuickAdd.jsx`** – Dropdown to pick courses (not used much)
20. **`src/components/today/TodayView.jsx`** – *Main Today view!*


## Phase 9: The "Dashboard" View (See Your Stats!)
Overview of all your attendance!

21. **`src/components/dashboard/StatusBadge.jsx`** – Safe/Cutting It Close/Danger badges
22. **`src/components/dashboard/StreakDisplay.jsx`** – Shows your current streak
23. **`src/components/dashboard/OverallSummaryCard.jsx`** – Top banner with Theory/Practical/Overall %
24. **`src/components/dashboard/CourseCard.jsx`** – Individual course stats card
25. **`src/components/dashboard/MonthlyComplianceCard.jsx`** – Monthly compliance checklist
26. **`src/components/dashboard/DashboardView.jsx`** – *Main Dashboard view!*


## Phase 10: The "Planner" View (Calculate Skips/Recovery!)
Plan how many classes you can skip or need to attend!

27. **`src/components/planner/BunkCalculatorCard.jsx`** – Shows how many you can safely skip
28. **`src/components/planner/RecoveryCalculatorCard.jsx`** – Shows how many to attend in a row
29. **`src/components/planner/WhatIfSimulator.jsx`** – Slider to simulate skips and see result
30. **`src/components/planner/PlannerView.jsx`** – *Main Planner view!*


## Phase 11: The Root Files (Tie It All Together!)
The entry points that put everything on screen!

31. **`src/styles/index.css`** – Tailwind setup and global styles
32. **`src/App.jsx`** – *Main App component!* Routes between tabs
33. **`src/main.jsx`** – Renders `App` into the DOM


## Pro Tip!
When you read each file:
1. Look at the imports first to see what it depends on
2. Read the code top to bottom
3. Ask "What does this do?" for every function/component
4. Change a tiny thing and refresh to see what happens!