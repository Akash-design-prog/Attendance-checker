# Understanding Your Attendance Tracker — A Real Reading Guide

You didn't write this code, and that's fine — most working developers spend more time reading
code they didn't write than writing new code. This guide is built by actually reading every
file in your repo, not by guessing what a typical React app looks like. Follow it in order.

Total time if you go slow and actually type things out: **4–6 hours across a few sessions.**
Don't rush it in one sitting — you'll retain nothing.

---

## PART 0 — Before You Read Any Code

You need four concepts in your head before any of this will make sense. If you already know
them, skip to Part 1.

### 0.1 What is React, really?
Normal JavaScript updates the webpage by manually finding an element and changing it:
`document.getElementById('score').innerText = 5`.

React flips this. You describe **what the screen should look like for a given piece of data**,
and React figures out how to update the actual webpage when that data changes. You never touch
the DOM directly. This is why you'll see code that looks like it's "returning HTML" from a
function — that's JSX (see 0.2), and it's describing the *target state* of the screen, not
issuing commands.

### 0.2 What is JSX?
It's HTML-looking syntax inside JavaScript. `<div className="card">{count}</div>` is not a
string — it compiles into actual JavaScript function calls that build the UI. Two things to
remember:
- `className` instead of `class` (because `class` is a reserved word in JS)
- `{ }` lets you drop into plain JavaScript inside the markup — e.g. `{count}` or `{status === 'absent' && <Badge/>}`

### 0.3 What is "state" and why does everything say `useState`?
State = data that changes over time and that the screen needs to reflect. `useState` is a React
"hook" (a special function) that does two things at once: stores a value, and gives you a
function to update it that automatically triggers React to re-render the screen.

```js
const [count, setCount] = useState(0);
// count      = current value (starts at 0)
// setCount   = call this to change it, e.g. setCount(count + 1)
```

Whenever you see `setSomething(...)` being called anywhere in this app, that's the trigger for
"the screen is about to update because data changed."

### 0.4 What is Context, and why does this app have an `AttendanceContext.jsx`?
Normally in React, data flows one direction: parent component → child component, via "props."
If 6 components deep in the tree all need the same data (your attendance records), passing it
down through 6 layers of props is painful. **Context** is a shortcut: it puts data in a shared
box that *any* component can reach into directly, no matter how deep it is, without every
component in between having to pass it along. Your `AttendanceContext.jsx` is that shared box
for attendance records and timetables.

**Mental model check before moving on:** can you explain in your own words why an attendance
app needs "shared data that many screens can read"? (Today view writes it, Dashboard reads it,
Planner reads it — none of those screens are related to each other in the component tree.)
If yes, move on.

---

## PART 1 — The 10,000-Foot Map

Here's the actual architecture of your app, traced from your real files:

```
main.jsx
  └─ renders App.jsx
        └─ wraps everything in <AttendanceProvider> (the Context "box" from 0.4)
              └─ AppContent (the real app)
                    ├─ Header.jsx           (top bar)
                    ├─ TabBar.jsx           (bottom nav: Today / Dashboard / Planner / Timetable)
                    └─ one of these, depending on active tab:
                          ├─ TodayView.jsx      (mark attendance for a date)
                          ├─ DashboardView.jsx  (see your stats)
                          ├─ PlannerView.jsx    (bunk/recovery calculators)
                          └─ TimetableView.jsx  (weekly schedule setup)
```

Underneath all the visual components sits a layer that has **zero UI** — just calculations and
storage. This is the part you should trust the most and fear the least, because it's plain
JavaScript, no React magic:

```
src/utils/dateUtils.js       — date math (weekdays remaining, formatting, etc.)
src/utils/attendanceMath.js  — attendance % math (the actual "product" of this whole app)
src/utils/storage.js         — reading/writing to your browser's localStorage
```

And a middle layer that connects the "no-UI math" to the "UI components":

```
src/context/AttendanceContext.jsx  — the shared data box (loads/saves records + timetables)
src/hooks/useAttendanceData.js     — a thin wrapper to read from that box easily
src/hooks/useCourseStats.js        — runs attendanceMath.js functions on your real data
src/hooks/useStreak.js             — calculates your daily logging streak
src/hooks/useSemesterProjection.js — calculates remaining weeks/classes in the semester
```

**The golden rule of this codebase:** data flows in one direction.

```
localStorage  →  AttendanceContext (loads on startup)
                        │
                        ▼
                 records (state)
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   TodayView      useCourseStats    useStreak / useSemesterProjection
  (writes new         (reads,            (reads, calculates)
   records)          calculates)
        │
        ▼
  markAttendance() called
        │
        ▼
  Context updates state + calls saveRecords() → localStorage
        │
        ▼
  React re-renders every component that reads `records`
```

Once this diagram makes sense, you understand the entire app's skeleton. Everything else is
detail.

---

## PART 2 — Reading Order (with what to look for in each file)

Read them **in this exact order**. Don't skip ahead even if a later file looks more
interesting — each step assumes you understood the previous one.

### Step 1 — `package.json`
Just look at `dependencies`. You'll see `react`, `react-dom`, `lucide-react` (icon library).
That's it — no backend, no database, no external API. Everything lives in the browser. This
tells you the entire app is one static bundle of JavaScript; there is no server involved. Good
to know before you start worrying about "where's the backend."

### Step 2 — `src/data/courses.js`
This is pure data — an array of your 11 courses, each with `id`, `name`, `type`
(`'theory'` or `'lab'`), and `weeklyFreq` (how many times per week it meets). No logic here.
**This is the file you'll edit every new semester** to change your course list (until the app
gets a settings screen — see the flaws doc).

### Step 3 — `src/constants/semester.js`
Two dates (`SEMESTER_START`, `SEMESTER_END`) and an `EXAM_OVERLAP_BLOCKS` array (currently just
informational labels — doesn't change any math, we confirmed that earlier). This is the other
file you edit every semester.

### Step 4 — `src/utils/dateUtils.js`
Pure functions, no React. Read each function top to bottom and predict what it returns before
you look at the return statement. Key ones:
- `formatDate` / `parseDateString` — converting between JS `Date` objects and `"YYYY-MM-DD"`
  strings. The app standardizes on strings for storage because they're easy to use as object
  keys and to compare (`"2026-08-01" < "2026-09-01"` works correctly as a string comparison).
- `remainingTeachingWeekdays(from, to)` — counts Mon–Fri between two dates. This is the engine
  behind every "X classes remaining" number in the app.
- `getActiveTimetableForDate` — given a list of timetables (each with a start/end date) and a
  target date, finds which timetable was "in effect" on that date. This exists because your
  weekly schedule might change mid-semester (e.g. new lab slot added in week 5).

**Exercise:** Open your browser console (F12), paste in a couple of dates, and manually verify
`remainingTeachingWeekdays` gives you the number you'd expect by counting on a calendar.

### Step 5 — `src/utils/storage.js`
The entire browser-storage layer. Every function follows the same pattern:
```js
try {
  localStorage.setItem(KEY, JSON.stringify(data));  // write
} catch (error) {
  console.error(...);  // fails silently to console, doesn't crash the app
}
```
`localStorage` only stores strings, which is why everything gets `JSON.stringify`'d going in
and `JSON.parse`'d coming out. Two keys are used: `'attendance-records'` and
`'attendance-timetables'`.

**Try this:** open DevTools → Application tab → Local Storage → your site. You'll see these two
keys with raw JSON. Mark an attendance entry in the app and refresh that panel — you'll watch
your click become a stored string in real time. This is the single best way to *see* what this
app actually does under the hood.

### Step 6 — `src/utils/attendanceMath.js` — the most important file in the whole repo
This is where the actual product logic lives — everything else is plumbing to get data in and
out of this file. Four functions, read them in this order:

1. **`calculateCourseStats(records, courseId)`** — loops over every day, counts how many times
   that course was `held` (present or absent both count as "held" — cancelled doesn't) and how
   many times you were `attended` (present only). Returns a percentage, or `null` if the course
   has never been held (avoids a `0/0` division).

2. **`calculateOverallStats(courses, records)`** — splits courses into theory vs. lab, sums up
   each bucket separately using function #1, then averages the two percentages. This mirrors
   your college's official formula: `(Theory% + Practical%) / 2`.

3. **`calculateBunkLimit(attended, held, remaining)`** — "how many more can I skip and stay
   ≥75%?" This is solving an inequality. Try deriving it yourself on paper before reading the
   comment in the code:
   - You want: `(attended + futurePresent) / (held + remaining) ≥ 0.75`
   - `futurePresent = remaining - skips`
   - Solve for `skips` → you'll land on the same formula that's in the code.
   Doing this derivation yourself once is worth more than reading it ten times.

4. **`calculateRecoveryCount(attended, held)`** — "how many classes in a row do I need to
   attend to get back to 75%?" Same idea, solved for a different variable (`n`, sessions
   needed, where every one of those `n` sessions is assumed attended).

**Exercise:** Pick real numbers — say you've attended 20 of 28 held classes (71.4%). Manually
work out with pen and paper how many classes in a row you'd need to attend to hit 75%. Then run
that same input through `calculateRecoveryCount` (call it directly in the browser console, or
just trace through the code by hand) and confirm your answer matches.

### Step 7 — `src/context/AttendanceContext.jsx`
This is where Part 0.4's "shared box" concept becomes real code. Read it function by function:

- `useState({})` for `records`, `useState([])` for `timetables` — these start empty.
- `useEffect(() => { ... }, [])` — this runs **once**, right after the component first mounts
  (the empty `[]` at the end means "don't re-run this"). It calls `getRecords()` and
  `getTimetables()` from storage.js and loads them into state. This is the answer to "how does
  my saved data reappear when I reopen the app" — it's this one effect.
- `markAttendance(dateStr, courseId, status)` — the single function that changes attendance
  data anywhere in this app. Notice the pattern: it builds a new object (`{ ...prev }`, never
  mutates the old one directly — this is a strict React rule), updates it, calls
  `saveRecords(updated)` to persist it, and returns `updated` so React state updates too. One
  function, does both jobs (memory + disk) every time.
- `useAttendance()` at the bottom — this is the "reach into the shared box" function every
  other component uses.

**Question to answer yourself:** why does `markAttendance` call `saveRecords` *inside* the
`setRecords` callback, rather than as two separate lines? (Hint: it needs the freshly-computed
`updated` value, not the stale `records` from before the update — reading `records` directly
outside the callback would be one render behind.)

### Step 8 — The hooks, read together
- `useAttendanceData.js` — thin convenience wrapper around the context, adds
  `getRecordForDate(dateStr)` so components don't have to write `records[dateStr] || {}`
  everywhere.
- `useCourseStats.js` — pulls `records`, runs every function from Step 6's math file over them,
  returns `courseStats`, `overallStats`, `monthlyStats`. This is what feeds the Dashboard.
- `useStreak.js` — walks backward day by day from today (or yesterday, if you haven't logged
  today yet) counting consecutive logged days until it hits a gap.
- `useSemesterProjection.js` — combines `dateUtils.js`'s weekday counting with `semester.js`'s
  dates to answer "how many classes are left this semester/month for a course meeting N times a
  week."

Notice none of these hooks contain any JSX (visual markup). They're **pure calculation glue** —
this separation (logic in hooks/utils, visuals in components) is genuinely good practice and
part of why this codebase is more readable than a lot of AI-generated apps.

### Step 9 — `App.jsx` and `main.jsx`
`main.jsx` is three lines: find the `<div id="root">` in `index.html`, render `<App />` into
it. That's the entire "boot sequence" of the app.

`App.jsx` — `AppContent` holds `activeTab` state (which of the 4 tabs is showing) and
`selectedDate` state (which day Today-view is showing). `renderActiveView()` is a plain
`switch` statement choosing which big view component to show. This is the whole "routing"
system — no routing library, just a switch on a string.

### Step 10 — The components, view by view
Now that you understand the data layer completely, the component files should read almost like
plain English, because all the hard logic already happened in Steps 6–8. For each view file
(`TodayView.jsx`, `DashboardView.jsx`, `PlannerView.jsx`, `TimetableView.jsx`), do this same
3-pass read:
1. **Imports at the top** — tells you exactly which hooks/utils this screen depends on.
2. **The logic block before the `return`** — this is where hook results get transformed into
   whatever shape the JSX below needs (e.g. `TodayView` splits `COURSES` into `activeCourses`
   vs `unmarkedCourses` before rendering).
3. **The JSX in the `return`** — by this point you already know what every variable it
   references means, so you're just reading "what does the screen look like."

Suggested order within Step 10: `TodayView` → `DashboardView` (and its 5 small subcomponents in
`components/dashboard/`) → `PlannerView` (and its 3 subcomponents) → `TimetableView`.

---

## PART 3 — Trace One Full User Action, Start to Finish

Do this after finishing Part 2. Pick the single most common action in the app — tapping
"Present" on a course — and write out, in your own words, every step between the click and the
screen updating. Here's the actual chain, but try writing it yourself first before reading this:

1. You tap "Present" in `MarkButtons.jsx` (inside `TodayView.jsx`)
2. That calls the `onMark` prop, which was wired up in `TodayView.jsx` as `handleMark`
3. `handleMark(courseId, status)` calls `markAttendance(selectedDate, courseId, status)` — a
   function that came from `useAttendanceData()` → which got it from `useAttendance()` →
   which got it from `AttendanceContext.jsx`
4. Inside `AttendanceContext.jsx`, `markAttendance` builds a new `records` object, calls
   `saveRecords(updated)` (writes to `localStorage`), and calls `setRecords(updated)`
5. `setRecords` tells React "this state changed" → React re-renders every component that reads
   `records` from context — that means `TodayView` (button now shows "Present" highlighted),
   and if you had Dashboard open, `useCourseStats` would recompute and the percentages update

If you can explain this chain out loud without looking at the code, you understand this app's
architecture better than most people who "vibe-code" their way through a bootcamp project.

---

## PART 4 — Reality Check: Read the Flaws Doc Now

You already have `multi-year-flaws-analysis.md` in your repo. Read it **now**, after doing
Parts 1–3, not before — it'll actually mean something now that you know what "flat data model"
or "hardcoded formula" refers to concretely. That file is an honest list of what's incomplete.
Cross-reference each flaw against the actual file it's describing.

---

## PART 5 — Test Yourself (no answers given — actually try these)

1. Add a 12th course to `courses.js`. Does the Dashboard automatically pick it up without
   touching any other file? Why or why not?
2. Manually delete the `'attendance-records'` key from localStorage in DevTools. What happens
   to the Dashboard when you refresh? Trace *why* using what you now know about `useEffect` in
   `AttendanceContext.jsx`.
3. Find the one line in `attendanceMath.js` that prevents a divide-by-zero crash when a course
   has never met yet. What would happen without it?
4. In `useStreak.js`, why does it check *yesterday* as a fallback, not just today? What user
   scenario is this protecting against?
5. Explain in one sentence why `markAttendance` never does `records[dateStr][courseId] = status`
   directly on the existing object, but instead spreads it into a new object first
   (`{ ...prev }`). What would break in React if it mutated directly?

If you can answer all five without opening the files again, you've actually internalized this
codebase — not just skimmed it.

---

## Quick Reference: Every File, One Sentence Each

| File | What it does |
|---|---|
| `src/main.jsx` | Boots the app, mounts it to the HTML page |
| `src/App.jsx` | Top-level layout, tab switching, week calculation for header |
| `src/data/courses.js` | Your hardcoded list of courses |
| `src/constants/semester.js` | Hardcoded semester start/end dates + exam-week labels |
| `src/utils/dateUtils.js` | All date math — weekdays remaining, formatting, timetable lookup |
| `src/utils/storage.js` | Read/write to browser localStorage |
| `src/utils/attendanceMath.js` | All attendance % calculations — the core "product logic" |
| `src/context/AttendanceContext.jsx` | The shared data store every screen reads/writes through |
| `src/hooks/useAttendanceData.js` | Convenience wrapper over the context |
| `src/hooks/useCourseStats.js` | Runs attendanceMath.js over your real records |
| `src/hooks/useStreak.js` | Calculates your daily logging streak |
| `src/hooks/useSemesterProjection.js` | Calculates remaining weeks/classes |
| `src/components/layout/*` | Header + bottom tab bar |
| `src/components/today/*` | The "mark attendance today" screen |
| `src/components/dashboard/*` | The stats screen |
| `src/components/planner/*` | Bunk/recovery calculators |
| `src/components/timetable/*` | Weekly schedule setup screen |

---

**When you're done with all 5 parts**, you'll be in a genuinely rare position: someone who can
both read AND meaningfully modify an AI-generated codebase, instead of just prompting an AI to
change things you don't understand. That's the actual skill worth building here — not memorizing
this specific app, but the muscle of tracing data flow through someone else's React code.
