# Multi-Year Attendance Tracker: Flaws & Architectural Scalability Analysis

If this application is to serve as a reliable tool across your **2nd, 3rd, and 4th years** (encompassing 6 semesters total), the current single-semester hardcoded blueprint has several critical flaws. 

Below is an analysis of the structural, architectural, and data-modeling limitations of the current blueprint, along with the required solutions to make it a sustainable multi-year application.

---

## 1. The Hardcoding Flaw (Code Modifications Required for Every Semester)

### The Issue
Currently, your courses (`data/courses.js`) and semester dates (`constants/semester.js`) are hardcoded directly into the JavaScript bundle. 
* To start a new semester, you would have to edit the source code, update the course list, reset dates, and re-deploy the application.
* You would lose history of the previous semester when overwriting these files, as the course IDs would change or overlap.

### The Multi-Year Solution
Transition from **static config files** to **runtime configuration**.
* Create a **Settings/Configuration View** where you can create new semesters (e.g., "Semester 3 - Fall 2026").
* Create/Edit/Delete courses dynamically in the UI and store the course configuration inside the storage engine, rather than in source code files.

---

## 2. Flat Data Model Flaw (Data Overlapping & Loss of History)

### The Issue
The current attendance record schema is flat and assumes a single global context:
```json
{
  "2026-07-06": {
    "dsa-theory": "present",
    "coa": "absent"
  }
}
```
* If you have a course named "Mini Project" in Semester 3 and another course named "Mini Project" in Semester 5, their records will overwrite or conflict if they share similar IDs.
* Streaks, overall percentages, and stats will calculate across the *entire history* of the application instead of being isolated to a specific academic term.

### The Multi-Year Solution
Namespace all records under a **Semester ID**. The data structure should group courses, dates, and attendance records under their respective terms:
```json
{
  "semesters": {
    "sem-3-2026": {
      "name": "Semester 3 (Fall 2026)",
      "startDate": "2026-07-06",
      "endDate": "2026-11-20",
      "courses": [
        { "id": "dsa-theory", "name": "DSA", "type": "theory", "weeklyFreq": 3 }
      ],
      "attendance": {
        "2026-07-06": { "dsa-theory": "present" }
      }
    },
    "sem-4-2027": {
      "name": "Semester 4 (Spring 2027)",
      "startDate": "2027-01-10",
      "endDate": "2027-05-28",
      "courses": [...],
      "attendance": {...}
    }
  },
  "activeSemesterId": "sem-3-2026"
}
```

---

## 3. Storage Vulnerability Flaw (Browser Eviction & Data Loss)

### The Issue
The blueprint relies on `localStorage` as the primary persistence layer.
* **Size Cap:** `localStorage` is capped at ~5MB depending on the browser. Although text data is small, multiple years of logs, custom configurations, notes, and timetable data will crowd this.
* **Storage Eviction:** Modern mobile browsers (especially Safari/iOS WebViews if saved as a PWA) automatically delete `localStorage` data if the app is not opened for a few weeks, or during system-wide low storage events. If this happens, you lose 3 years of attendance logs instantly.

### The Multi-Year Solution
1. **Request Storage Persistence:** Programmatically request non-volatile storage using the browser API:
   ```javascript
   if (navigator.storage && navigator.storage.persist) {
     const isPersisted = await navigator.storage.persist();
     console.log(`Persisted storage granted: ${isPersisted}`);
   }
   ```
2. **Cloud/File Backups:** Implement an **Export Data as JSON** and **Import Data** utility. At the end of every week or month, you can export a backup file.
3. **Upgrade Storage Engine:** Use IndexedDB (via a lightweight wrapper like `idb-keyval` or `localForage`) instead of `localStorage` for improved limits and durability.

---

## 4. Hardcoded Grading & Attendance Formulas

### The Issue
The formula `OverallAttendance% = (TheoryTotal% + PracticalTotal%) / 2` is tailored precisely to your current semester's curriculum structure (which features both theory and labs).
* In later semesters (e.g., 4th year), you might have semesters comprised *only* of industrial projects, seminars, or internships with zero labs.
* If a semester has no lab courses, `PracticalTotal%` becomes `NaN`, and the formula crashes or outputs incorrect percentages.
* The 75% threshold is currently fixed globally. Certain elective courses or specific subjects might carry different compliance criteria.

### The Multi-Year Solution
* **Safe Fallbacks:** Ensure the formulas handle zero-course buckets gracefully:
  ```javascript
  const hasTheory = theoryCourses.length > 0;
  const hasLab = labCourses.length > 0;
  
  let overall = 0;
  if (hasTheory && hasLab) {
    overall = (theoryTotal + labTotal) / 2;
  } else if (hasTheory) {
    overall = theoryTotal;
  } else if (hasLab) {
    overall = labTotal;
  }
  ```
* **Per-Semester Calculation Logic:** Allow selecting the calculation method (e.g., "Averaged Theory/Lab split", "Pooled aggregate of all hours", or "Custom Weighting") in the semester settings panel.

---

## 5. Lack of a Recurring Schedule/Timetable Interface

### The Issue
The current blueprint requires you to select courses manually using a "Quick Add" panel every single day.
* Over 3 years, this becomes a major point of friction, causing you to stop using the app.
* If you follow a semi-regular schedule, adding the same classes week after week is tedious.

### The Multi-Year Solution
* Build a **Timetable Setup** for each semester.
* For each day of the week (Mon–Fri), define which classes occur (e.g., Monday has DSA Theory, DSA Lab, and Math).
* When you open the "Today View", the app should pre-populate the day's class checklist based on the current weekday, leaving you to simply tap "Present", "Absent", or "Cancelled" with single clicks.

---

## 6. Projections Fail Around Holidays & Non-Standard Weeks

### The Issue
The projection model (`useSemesterProjection.js`) simply counts total remaining weekdays and multiplies by weekly frequency.
* Over a 3-year span, you will experience extended holidays (festivals, mid-term breaks, study holidays) where no lectures happen.
* Because the calculator doesn't know about these breaks, it will assume classes are still scheduled, causing the **Bunk Calculator** to overestimate your "safe bunks".

### The Multi-Year Solution
* Allow configuring a list of **Exclusion Ranges** (Holidays/Breaks) in the Semester configuration screen.
* The weekday projection counter must skip these dates entirely when determining remaining teaching days.
