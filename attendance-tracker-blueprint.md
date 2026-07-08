# Attendance HQ — System Blueprint
### Sem 3 Attendance Tracker

---

## 1. The Problem, Precisely

- 11 trackable course-components (theory + lab split separately, since they're separate course codes)
- 75% minimum required **per course**, not just overall
- No fixed timetable — classes get marked day-of, whatever actually runs
- Cancelled lectures must never count against you
- Semester: 6 July 2026 → 20 Nov 2026, Mon–Fri, ~20 teaching weeks (CIA-I week and Quiz week still have regular lectures — exams just layer on top, so they're included, not excluded)

This is a **local-first single-user tool**. No login, no backend server needed. Everything lives in the browser, persisted to disk.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React + Vite** | You already know this from CityFlow AI — reuse the mental model |
| Styling | **Tailwind CSS** | Fast to write, no separate CSS files to manage, great for mobile-responsive |
| State | **React hooks (useState/useReducer) + Context** | No need for Redux/Zustand at this scale — 11 courses is small state |
| Persistence | **localStorage** (upgrade path: IndexedDB via `idb` if data grows) | Zero backend, data survives refresh/close |
| Dates | **native `Date` + small custom utils** (or `date-fns` if you want a library) | Avoid moment.js, it's bloated/deprecated |
| Icons | **lucide-react** | Clean, consistent, matches Tailwind aesthetic |
| Deployment | **Vercel or Netlify (free tier)**, or just run locally | You want this on your phone — deploy it so you can open it as a bookmarked PWA |
| Optional stretch | **vite-plugin-pwa** | Makes it installable on your phone home screen like a real app |

No backend. No database server. No auth. This keeps 100% of your effort on the actual logic and UI — which is where the learning is.

---

## 3. Folder Structure

```
attendance-hq/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # Root: tab navigation (Today / Dashboard / Planner)
│   │
│   ├── data/
│   │   └── courses.js             # Hardcoded list of your 11 courses (source of truth)
│   │
│   ├── constants/
│   │   └── semester.js            # Start date, end date, exam-block date ranges
│   │
│   ├── utils/
│   │   ├── dateUtils.js           # Weekday math, date formatting, "today" helpers
│   │   ├── attendanceMath.js      # Bunk calc, recovery calc, % calc — pure functions
│   │   └── storage.js             # get/set wrappers around localStorage
│   │
│   ├── hooks/
│   │   ├── useAttendanceData.js   # Loads/saves all records, exposes CRUD functions
│   │   ├── useCourseStats.js      # Derives attended/held/% per course from raw records
│   │   ├── useSemesterProjection.js # Computes remaining teaching days/sessions from "today"
│   │   └── useStreak.js           # Computes current daily-logging streak
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TabBar.jsx         # Bottom/top nav: Today | Dashboard | Planner
│   │   │   └── Header.jsx
│   │   │
│   │   ├── today/
│   │   │   ├── TodayView.jsx      # Main daily-marking screen
│   │   │   ├── CourseQuickAdd.jsx # "Add a class that happened today" picker
│   │   │   └── MarkButtons.jsx    # Present / Absent / Cancelled tap buttons
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardView.jsx
│   │   │   ├── OverallSummaryCard.jsx   # Theory%, Practical%, and combined Overall% (matches official college formula)
│   │   │   ├── CourseCard.jsx           # Per-course % + status color + attended/held
│   │   │   ├── StatusBadge.jsx          # Safe / Cutting it Close / Danger Zone
│   │   │   └── StreakDisplay.jsx
│   │   │
│   │   ├── planner/
│   │   │   ├── PlannerView.jsx
│   │   │   ├── BunkCalculatorCard.jsx   # "You can skip X more"
│   │   │   ├── RecoveryCalculatorCard.jsx # "Attend next X in a row"
│   │   │   └── WhatIfSimulator.jsx      # Slider-based live projection
│   │   │
│   │   └── shared/
│   │       ├── ProgressRing.jsx   # Circular % indicator
│   │       └── RoastMessage.jsx   # Blunt status-line generator
│   │
│   └── styles/
│       └── index.css              # Tailwind directives + any global overrides
```

**Why this structure:** `utils/` holds pure functions (no React, fully unit-testable), `hooks/` bridges pure logic to React state, `components/` is purely presentational and grouped by the 3 views. This separation means you can test your attendance math in isolation before ever touching UI — good practice, and it'll save you debugging time.

---

## 4. Data Models

### `data/courses.js` — the fixed source of truth

```js
export const COURSES = [
  { id: 'dsa-theory',  name: 'Data Structures & Algorithms', code: 'STENCS019V0', type: 'theory', weeklyFreq: 3 },
  { id: 'dsa-lab',     name: 'DSA Lab',                       code: 'STENCS024V0', type: 'lab',    weeklyFreq: 1 },
  { id: 'oop-theory',  name: 'Coding Café – OOP',              code: 'STENCS020V0', type: 'theory', weeklyFreq: 2 },
  { id: 'oop-lab',     name: 'Mini Project (OOP Lab)',         code: 'DFPST02',     type: 'lab',    weeklyFreq: 2 },
  { id: 'coa',         name: 'Computer Organization & Architecture', code: 'STENCS021V0', type: 'theory', weeklyFreq: 3 },
  { id: 'maths',       name: 'Essential Maths for ML & DS',    code: 'STENCS108V0', type: 'theory', weeklyFreq: 3 },
  { id: 'entrepreneur',name: 'Entrepreneurship & Startup Studio', code: 'STENCS022V0', type: 'theory', weeklyFreq: 2 },
  { id: 'uhv',         name: 'Universal Human Values & Ethics', code: 'STENCS215V0', type: 'theory', weeklyFreq: 2 },
  { id: 'mdm-theory',  name: 'MDM – Embedded Systems',         code: 'STENCS106V0', type: 'theory', weeklyFreq: 3 },
  { id: 'mdm-lab',     name: 'MDM – Embedded Systems Lab',     code: 'STENCS107V0', type: 'lab',    weeklyFreq: 1 },
  { id: 'evs',         name: 'Environmental Studies',          code: 'STPHGP002V0', type: 'theory', weeklyFreq: 2 },
];
```

### `constants/semester.js`

```js
export const SEMESTER_START = '2026-07-06';
export const SEMESTER_END   = '2026-11-20';

// CIA-I (17-21 Aug) and Quiz Week (7-11 Sept) still have regular lectures —
// exams just run after/before class or replace a single period. NOT excluded
// from the teaching-day count. Kept here only as a reference/label, not used
// to zero out projections.
export const EXAM_OVERLAP_BLOCKS = [
  { start: '2026-08-17', end: '2026-08-21', label: 'CIA-I Examination (lectures still run)' },
  { start: '2026-09-07', end: '2026-09-11', label: 'Quiz Examination Unit 3 (lectures still run)' },
];
```

### The attendance record — how a single day is stored

Stored in localStorage under key `attendance-records`, shape:

```js
{
  "2026-07-06": {
    "dsa-theory":  "present",
    "coa":         "absent",
    "mdm-lab":     "cancelled"
  },
  "2026-07-07": {
    "oop-theory":  "present",
    ...
  }
}
```

**Why keyed by date → courseId → status, not a flat array:** O(1) lookups for "what did I mark today," trivial to compute streaks (iterate date keys), and trivial to derive per-course stats (loop all dates, tally by courseId). Only allowed status values: `"present" | "absent" | "cancelled"`.

---

## 5. Core Algorithms (write these as pure functions first, test them standalone before wiring to UI)

### 5.1 Per-course stats (`useCourseStats.js` logic)

For a given course, scan all date records:
```
held     = count of days where status is "present" OR "absent"   (cancelled excluded entirely)
attended = count of days where status is "present"
percentage = held === 0 ? null : (attended / held) * 100
```

### 5.1b Overall % — matching your college's official formula

Your Sem 1 attendance report confirms the college computes this as **(Total Theory% + Total Practical%) ÷ 2**, NOT a simple pooled attended/total across all 11 courses. This is the number that actually matters for compliance, so the Dashboard must replicate it exactly:

```
theoryCourses = COURSES.filter(c => c.type === 'theory')   // 8 courses
labCourses    = COURSES.filter(c => c.type === 'lab')      // 3 courses

theoryHeld     = sum of held across all theoryCourses
theoryAttended = sum of attended across all theoryCourses
TheoryTotal%   = (theoryAttended / theoryHeld) * 100

labHeld        = sum of held across all labCourses
labAttended    = sum of attended across all labCourses
PracticalTotal% = (labAttended / labHeld) * 100

OverallAttendance% = (TheoryTotal% + PracticalTotal%) / 2
```

Important: this is an average of two *percentages*, not a pooled average of raw counts — a course with fewer sessions still weighs equally within its Theory/Practical bucket's percentage, which is exactly why this can diverge from a simple pooled total. Show both `TheoryTotal%` and `PracticalTotal%` on the Dashboard alongside the combined `OverallAttendance%`, since that's the actual breakdown the college shows on official reports — you'll want to see all three, not just the final average.

### 5.2 Remaining teaching days (`useSemesterProjection.js` logic)

```
function remainingTeachingWeekdays(fromDate, semesterEnd):
    count = 0
    for each day d from fromDate to semesterEnd:
        if d.weekday is Mon-Fri:
            count += 1
    return count
```
Full semester = 6 July → 20 Nov 2026 = **100 weekdays ≈ 20 teaching weeks** (CIA-I and Quiz weeks included — lectures still run then, exams just run alongside).

Then: `remainingWeeks = remainingTeachingWeekdays / 5`
And per course: `projectedRemainingSessions = round(remainingWeeks * course.weeklyFreq)`

This is still just a *starting estimate*. As you mark daily, `useCourseStats` uses real held/attended counts — the projection only fills in the *unmarked future*, so any real gaps (a lecture actually skipped by faculty, a genuine holiday) self-correct automatically instead of needing to be predicted in advance.

### 5.3 Bunk Calculator — "how many can I safely skip"

Let:
- `A` = attended so far
- `H` = held so far
- `R` = projected remaining sessions (from 5.2)

```
maxSafeSkips = floor(A + 0.25*R - 0.75*H)
clamp maxSafeSkips between 0 and R
```

*Derivation:* you want `(A + attended_future) / (H + R) ≥ 0.75`, where `attended_future = R - skips`. Solving for `skips` gives the formula above. If the result is negative, you can't safely skip anything — show 0, and the recovery calculator becomes relevant instead.

### 5.4 Recovery Calculator — "how many must I attend in a row to get back to 75%"

Only relevant when current `A/H < 0.75`.

```
needed = ceil( (0.75*H - A) / 0.25 )
```

*Derivation:* attending `n` more in a row (assume no more absences): `(A+n)/(H+n) ≥ 0.75` → `A+n ≥ 0.75H + 0.75n` → `0.25n ≥ 0.75H - A` → solve for `n`. Cap display at `min(needed, R)` — if `needed > R`, the course is mathematically unrecoverable this semester, and the UI should say that plainly (roast mode: *"Even if you attend every remaining DSA lab, you're not touching 75%. Talk to your HOD about condonation."*)

### 5.5 What-If Simulator

Live slider from `0` to `R` (remaining sessions). As the user drags to value `n` (hypothetical future skips):
```
projected% = ((A + (R-n)) / (H+R)) * 100
```
Render this updating in real time — no need to touch stored data, purely a preview calc.

### 5.7 Overall Projection (combined Theory/Practical threshold)

Since the college's 75% rule also applies to the combined `OverallAttendance%` (not just individual subjects), the Planner needs a way to answer "if I keep attending at my current pace, where does my Overall% land by semester end?" — separate from per-subject bunk/recovery, since Overall% is an average of two percentages, not a simple pooled count, so a single "skip count" doesn't map cleanly onto it the way it does for one subject.

Approach — a live projection, not an exact optimizer:
```
for each course:
    projectedFinalAttended = attended + (remainingSessions * (attended/held))   // assumes current ratio holds
    projectedFinalHeld     = held + remainingSessions

projectedTheoryTotal%    = sum(projectedFinalAttended for theory) / sum(projectedFinalHeld for theory) * 100
projectedPracticalTotal% = sum(projectedFinalAttended for lab)    / sum(projectedFinalHeld for lab)    * 100
projectedOverall%        = (projectedTheoryTotal% + projectedPracticalTotal%) / 2
```
Show this as a single "Projected Overall% at semester end (if current pace holds)" line on the Planner — green/yellow/red same as elsewhere. This is intentionally a *trend indicator*, not a precise bunk count, because exactly how many total skips you can afford depends on *which* subjects you skip (theory vs lab pull the average differently) — the per-subject calculators remain your actual planning tool; this is the sanity-check on top.

### 5.6 Streak

```
streak = 0
d = today
while records[d] exists and has at least one entry:
    streak += 1
    d = d - 1 day
return streak
```

---

## 6. Status Thresholds (for card colors / badges)

| Range | Status | Color |
|---|---|---|
| ≥ 80% | Safe Zone | Green |
| 75–79.9% | Cutting It Close | Yellow |
| < 75% | Danger Zone | Red |
| No data yet | — | Gray |

---

## 7. Screens — What Each One Actually Shows

### Today
- Date header (defaults to today, but allow going back to backfill a missed day)
- List of your 11 courses as tap-targets: tap a course → 3-button choice (Present / Absent / Cancelled) appears
- Only courses NOT yet marked today are prominent; already-marked ones show a checkmark and can be edited
- Nothing forces you to mark all 11 — mark only what actually had a class

### Dashboard
- Top: Three numbers, matching your official college report layout — **Theory Total%**, **Practical Total%**, and the combined **Overall Attendance%** = average of the two
- Streak counter, small, top corner
- Grid of 11 CourseCards below, sorted by risk (Danger Zone courses float to top — the ones needing attention shouldn't be buried)
- Each card: name, %, "14/18 attended", status badge, one-line roast/status message

### Planner
- Course selector (dropdown/tabs)
- Bunk Calculator card (if safe) OR Recovery Calculator card (if below threshold) — show whichever is relevant, don't show both confusingly
- What-If Simulator slider below, always available regardless of current status

---

## 8. Build Order (Phases)

**Phase 1 — Data layer (no UI yet)**
1. `data/courses.js`, `constants/semester.js`
2. `utils/storage.js` — get/set/clear wrappers
3. `utils/dateUtils.js`, `utils/attendanceMath.js` — write and manually test these functions in isolation (console.log them with fake data) before touching React

**Phase 2 — Marking + raw display**
4. `useAttendanceData` hook wired to storage
5. `TodayView` — get marking working end-to-end, confirm data actually persists across refresh

**Phase 3 — Dashboard**
6. `useCourseStats`, `CourseCard`, `StatusBadge`, `OverallSummaryCard`
7. Get the 11-card grid rendering real percentages correctly

**Phase 4 — Planner**
8. `useSemesterProjection`
9. `BunkCalculatorCard`, `RecoveryCalculatorCard`, `WhatIfSimulator`

**Phase 5 — Polish**
10. Streak, roast messages, responsive/mobile pass, empty states ("no classes marked yet — add today's first class below")
11. Optional: PWA install support so it lives on your phone home screen

---

## 9. Edge Cases to Handle (don't skip these — this is where 90% of bugs hide)

- User backfills a day from last week — stats must recompute correctly, not just append
- A course marked "cancelled" should never appear in denominator anywhere, including the What-If simulator
- Editing an already-marked entry (tapped Present, meant Absent) — must overwrite, not duplicate
- Course with 0 held sessions yet — percentage is undefined, show "No data yet," not "0%" or "NaN%" or a crash
- `maxSafeSkips` or `needed` going negative — clamp and message appropriately instead of showing "-2"
- Semester end date passed — projections should show "Semester over" instead of computing nonsense negative remaining weeks

---

## 10. What I'd Leave Out of v1

- Login/accounts — you're the only user, don't build auth for a personal tool
- Backend/database — localStorage is genuinely sufficient at this scale (11 courses × ~90 days × a few bytes each is nothing)
- Notifications/push — browser push requires a backend + service worker complexity that isn't worth it for v1; a glance at the dashboard each morning does the job

---

Build it in the phase order above — each phase is independently testable before you move to the next. Ping me when you get stuck on a specific piece (the bunk-calc math, a React hook not updating, whatever) and we'll debug that piece specifically rather than the whole thing at once.
