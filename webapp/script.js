/* ==============================================
   GRADE & GPA CALCULATOR — APPLICATION LOGIC
   ============================================== */

// ─── Grading Scale (10-point, VIT Bhopal) ───
const GRADING_SCALE = [
  { grade: 'S', points: 10, minPct: 90, label: 'Outstanding'    },
  { grade: 'A', points: 9,  minPct: 80, label: 'Excellent'      },
  { grade: 'B', points: 8,  minPct: 70, label: 'Very Good'      },
  { grade: 'C', points: 7,  minPct: 60, label: 'Good'           },
  { grade: 'D', points: 6,  minPct: 50, label: 'Average'        },
  { grade: 'E', points: 5,  minPct: 40, label: 'Below Average'  },
  { grade: 'F', points: 0,  minPct: 0,  label: 'Fail'           },
];

// ─── State ───
const state = {
  courses: [],          // { id, name, credits, marks, grade, gradePoints, method, relativeInfo }
  cgpaCourses: [],      // { id, semesterName, credits, gpa }
  nextId: 1,
  nextCgpaId: 1,
};

// ─── DOM Ready ───
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initToggles();
  initEventListeners();
  renderCourseList();
  renderCgpaSemesterList();
  renderGradingScale();
  updateResults();
  updateCgpaResults();
});

// ═══════════════════════════════════════
// TABS
// ═══════════════════════════════════════
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// ═══════════════════════════════════════
// TOGGLES (Optional sections)
// ═══════════════════════════════════════
function initToggles() {
  document.querySelectorAll('.toggle-row').forEach(row => {
    row.addEventListener('click', () => {
      row.classList.toggle('active');
      const target = document.getElementById(row.dataset.target);
      if (target) target.classList.toggle('open');
    });
  });
}

// ═══════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════
function initEventListeners() {
  // GPA Tab
  document.getElementById('addCourseBtn').addEventListener('click', addCourse);
  document.getElementById('clearAllBtn').addEventListener('click', clearAllCourses);
  document.getElementById('courseForm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCourse(); }
  });

  // CGPA Tab
  document.getElementById('addSemesterBtn').addEventListener('click', addSemester);
  document.getElementById('clearSemestersBtn').addEventListener('click', clearAllSemesters);
  document.getElementById('cgpaForm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSemester(); }
  });

  // Grade method toggle
  document.getElementById('gradingMethod').addEventListener('change', (e) => {
    const isRelative = e.target.value === 'relative';
    document.getElementById('absoluteInputs').style.display = isRelative ? 'none' : 'block';
    document.getElementById('relativeInputs').style.display = isRelative ? 'block' : 'none';
  });
}

// ═══════════════════════════════════════
// ABSOLUTE GRADING
// ═══════════════════════════════════════
function getAbsoluteGrade(percentage) {
  for (const row of GRADING_SCALE) {
    if (percentage >= row.minPct) return row;
  }
  return GRADING_SCALE[GRADING_SCALE.length - 1];
}

// ═══════════════════════════════════════
// RELATIVE GRADING (VIT Bhopal Official)
// ═══════════════════════════════════════

/**
 * VIT Bhopal Relative Grading (from official chart):
 *   S : Total Marks >= Mean + 1.5σ
 *   A : Total Marks >= Mean + 0.5σ  AND  < Mean + 1.5σ
 *   B : Total Marks >= Mean − 0.5σ  AND  < Mean + 0.5σ
 *   C : Total Marks >= Mean − 1.0σ  AND  < Mean − 0.5σ
 *   D : Total Marks >= Mean − 1.5σ  AND  < Mean − 1.0σ
 *   E : Total Marks <  Mean − 1.5σ  AND  TEE >= 40% & (CAT1+CAT2+TEE) >= 40%
 *   F : TEE < 40%  OR  (CAT1+CAT2+TEE) < 40%
 *
 * If std dev is not provided, estimated as (highest − lowest) / 4.
 * If TEE % is not provided, E/F is decided by the σ boundary alone.
 */
function getRelativeGrade(marks, mean, stdDev, highest, lowest, teePct, catTotalPct) {
  // Estimate std dev from range if not provided
  if (!stdDev || stdDev <= 0) {
    if (highest > 0 && lowest >= 0 && highest > lowest) {
      stdDev = (highest - lowest) / 4;
    } else {
      // Fallback: treat as absolute
      return getAbsoluteGrade(marks);
    }
  }

  // Check F condition first: TEE < 40% or total < 40%
  if (teePct !== null && teePct !== undefined && !isNaN(teePct)) {
    if (teePct < 40) {
      return { ...GRADING_SCALE.find(r => r.grade === 'F'), cutoff: '—' };
    }
  }
  if (catTotalPct !== null && catTotalPct !== undefined && !isNaN(catTotalPct)) {
    if (catTotalPct < 40) {
      return { ...GRADING_SCALE.find(r => r.grade === 'F'), cutoff: '—' };
    }
  }

  const boundaries = [
    { grade: 'S', points: 10, k:  1.5 },
    { grade: 'A', points: 9,  k:  0.5 },
    { grade: 'B', points: 8,  k: -0.5 },
    { grade: 'C', points: 7,  k: -1.0 },
    { grade: 'D', points: 6,  k: -1.5 },
  ];

  for (const b of boundaries) {
    const cutoff = mean + b.k * stdDev;
    if (marks >= cutoff) {
      const row = GRADING_SCALE.find(r => r.grade === b.grade);
      return { ...row, cutoff: cutoff.toFixed(1) };
    }
  }

  // Below Mean − 1.5σ → E (if TEE/total >= 40% or not provided)
  const eCutoff = mean - 1.5 * stdDev;
  return { ...GRADING_SCALE.find(r => r.grade === 'E'), cutoff: eCutoff.toFixed(1) };
}

// ═══════════════════════════════════════
// ADD COURSE
// ═══════════════════════════════════════
function addCourse() {
  const method = document.getElementById('gradingMethod').value;
  const name   = document.getElementById('courseName').value.trim();
  const credits = parseFloat(document.getElementById('courseCredits').value);

  if (!name) { shake('courseName'); return; }
  if (!credits || credits <= 0) { shake('courseCredits'); return; }

  let gradeInfo, marks, relativeInfo = null;

  if (method === 'absolute') {
    marks = parseFloat(document.getElementById('courseMarks').value);
    if (isNaN(marks) || marks < 0) { shake('courseMarks'); return; }
    gradeInfo = getAbsoluteGrade(marks);
  } else {
    marks    = parseFloat(document.getElementById('relMarks').value);
    const mean    = parseFloat(document.getElementById('classMean').value);
    const highest = parseFloat(document.getElementById('classHighest').value) || 0;
    const lowest  = parseFloat(document.getElementById('classLowest').value) || 0;
    const stdDev  = parseFloat(document.getElementById('classStdDev').value) || 0;
    const teePct  = parseFloat(document.getElementById('teePct').value);
    const catTotalPct = parseFloat(document.getElementById('catTotalPct').value);

    if (isNaN(marks) || marks < 0) { shake('relMarks'); return; }
    if (isNaN(mean)  || mean < 0)  { shake('classMean'); return; }

    gradeInfo = getRelativeGrade(marks, mean, stdDev, highest, lowest, teePct, catTotalPct);
    relativeInfo = {
      mean, highest, lowest, stdDev: stdDev || ((highest - lowest) / 4).toFixed(1),
      cutoff: gradeInfo.cutoff
    };
  }

  state.courses.push({
    id: state.nextId++,
    name,
    credits,
    marks,
    grade: gradeInfo.grade,
    gradePoints: gradeInfo.points,
    label: gradeInfo.label,
    method,
    relativeInfo,
  });

  clearCourseForm();
  renderCourseList();
  updateResults();
}

// ═══════════════════════════════════════
// REMOVE COURSE
// ═══════════════════════════════════════
function removeCourse(id) {
  state.courses = state.courses.filter(c => c.id !== id);
  renderCourseList();
  updateResults();
}

function clearAllCourses() {
  state.courses = [];
  renderCourseList();
  updateResults();
}

// ═══════════════════════════════════════
// RENDER COURSE LIST
// ═══════════════════════════════════════
function renderCourseList() {
  const container = document.getElementById('courseList');
  if (state.courses.length === 0) {
    container.innerHTML = `<div class="course-list__empty"><span>📚</span>No courses added yet. Fill in the form above to get started.</div>`;
    return;
  }
  container.innerHTML = state.courses.map(c => {
    const gradeClass = getGradeClass(c.grade);
    const methodTag = c.method === 'relative' ? ' · Relative' : '';
    const cutoffInfo = c.relativeInfo ? ` · Cutoff: ${c.relativeInfo.cutoff}` : '';
    return `
      <div class="course-item">
        <div class="course-item__info">
          <div class="course-item__name">${escapeHtml(c.name)}</div>
          <div class="course-item__meta">${c.credits} credits · ${c.marks} marks · ${c.label}${methodTag}${cutoffInfo}</div>
        </div>
        <div class="course-item__grade ${gradeClass}">${c.grade}</div>
        <button class="course-item__remove" onclick="removeCourse(${c.id})" title="Remove course">✕</button>
      </div>`;
  }).join('');
}

function getGradeClass(grade) {
  if (grade === 'S') return 'grade-s';
  if (grade === 'A') return 'grade-a';
  if (grade.startsWith('B')) return 'grade-b';
  if (grade.startsWith('C')) return 'grade-c';
  if (grade === 'D') return 'grade-d';
  if (grade === 'E') return 'grade-e';
  return 'grade-f';
}

// ═══════════════════════════════════════
// UPDATE GPA RESULTS
// ═══════════════════════════════════════
function updateResults() {
  const totalCredits = state.courses.reduce((sum, c) => sum + c.credits, 0);
  const weightedSum  = state.courses.reduce((sum, c) => sum + c.credits * c.gradePoints, 0);
  const gpa = totalCredits > 0 ? (weightedSum / totalCredits) : 0;

  document.getElementById('resGPA').textContent = gpa.toFixed(2);
  document.getElementById('resTotalCredits').textContent = totalCredits;
  document.getElementById('resTotalCourses').textContent = state.courses.length;

  // Percentage equivalent (approximate)
  const pctEquiv = totalCredits > 0 ? (gpa * 10).toFixed(1) : '—';
  document.getElementById('resPctEquiv').textContent = pctEquiv;
}

// ═══════════════════════════════════════
// CGPA TAB
// ═══════════════════════════════════════
function addSemester() {
  const name = document.getElementById('semesterName').value.trim() || `Semester ${state.cgpaCourses.length + 1}`;
  const credits = parseFloat(document.getElementById('semesterCredits').value);
  const gpa     = parseFloat(document.getElementById('semesterGPA').value);

  if (!credits || credits <= 0) { shake('semesterCredits'); return; }
  if (isNaN(gpa) || gpa < 0 || gpa > 10) { shake('semesterGPA'); return; }

  state.cgpaCourses.push({
    id: state.nextCgpaId++,
    semesterName: name,
    credits,
    gpa,
  });

  document.getElementById('semesterName').value = '';
  document.getElementById('semesterCredits').value = '';
  document.getElementById('semesterGPA').value = '';

  renderCgpaSemesterList();
  updateCgpaResults();
}

function removeSemester(id) {
  state.cgpaCourses = state.cgpaCourses.filter(s => s.id !== id);
  renderCgpaSemesterList();
  updateCgpaResults();
}

function clearAllSemesters() {
  state.cgpaCourses = [];
  renderCgpaSemesterList();
  updateCgpaResults();
}

function renderCgpaSemesterList() {
  const container = document.getElementById('semesterList');
  if (state.cgpaCourses.length === 0) {
    container.innerHTML = `<div class="course-list__empty"><span>🎓</span>No semesters added yet. Add your semester results above.</div>`;
    return;
  }
  container.innerHTML = state.cgpaCourses.map(s => {
    return `
      <div class="course-item">
        <div class="course-item__info">
          <div class="course-item__name">${escapeHtml(s.semesterName)}</div>
          <div class="course-item__meta">${s.credits} credits · GPA: ${s.gpa.toFixed(2)}</div>
        </div>
        <div class="course-item__grade grade-a">${s.gpa.toFixed(1)}</div>
        <button class="course-item__remove" onclick="removeSemester(${s.id})" title="Remove semester">✕</button>
      </div>`;
  }).join('');
}

function updateCgpaResults() {
  const totalCredits = state.cgpaCourses.reduce((sum, s) => sum + s.credits, 0);
  const weightedSum  = state.cgpaCourses.reduce((sum, s) => sum + s.credits * s.gpa, 0);
  const cgpa = totalCredits > 0 ? (weightedSum / totalCredits) : 0;

  document.getElementById('resCGPA').textContent = cgpa.toFixed(2);
  document.getElementById('resCgpaTotalCredits').textContent = totalCredits;
  document.getElementById('resCgpaSemesters').textContent = state.cgpaCourses.length;

  const pctEquiv = totalCredits > 0 ? (cgpa * 10).toFixed(1) : '—';
  document.getElementById('resCgpaPctEquiv').textContent = pctEquiv;
}

// ═══════════════════════════════════════
// GRADING SCALE TABLE
// ═══════════════════════════════════════
function renderGradingScale() {
  const tbody = document.getElementById('scaleTableBody');
  tbody.innerHTML = GRADING_SCALE.map(row => `
    <tr>
      <td><span class="course-item__grade ${getGradeClass(row.grade)}" style="font-size:0.8rem;padding:0.2rem 0.5rem;">${row.grade}</span></td>
      <td>${row.points}</td>
      <td>${row.minPct}%${row.grade !== 'F' ? ' – ' + (GRADING_SCALE[GRADING_SCALE.indexOf(row) - 1]?.minPct - 1 || 100) + '%' : ''}</td>
      <td>${row.label}</td>
    </tr>
  `).join('');
}

// ═══════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════
function clearCourseForm() {
  ['courseName', 'courseCredits', 'courseMarks', 'relMarks', 'classMean', 'classHighest', 'classLowest', 'classStdDev', 'teePct', 'catTotalPct'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('courseName').focus();
}

function shake(elementId) {
  const el = document.getElementById(elementId);
  el.classList.add('invalid');
  el.style.animation = 'none';
  el.offsetHeight; // trigger reflow
  el.style.animation = '';
  setTimeout(() => el.classList.remove('invalid'), 1500);
  el.focus();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
