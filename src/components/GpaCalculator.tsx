'use client';

import React, { useState } from 'react';
import { Course, GradingMethod } from '../types';
import {
  calculateGPA,
  getAbsoluteGrade,
  getGradeBadgeClass,
  getRelativeGrade,
} from '../utils/calculator';

interface GpaCalculatorProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

export default function GpaCalculator({ courses, setCourses }: GpaCalculatorProps) {
  const [method, setMethod] = useState<GradingMethod>('absolute');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [marks, setMarks] = useState('');

  // Relative grading inputs
  const [relMarks, setRelMarks] = useState('');
  const [classMean, setClassMean] = useState('');
  const [classHighest, setClassHighest] = useState('');
  const [classLowest, setClassLowest] = useState('');
  const [classStdDev, setClassStdDev] = useState('');

  // Optional pass criteria
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [teePct, setTeePct] = useState('');
  const [catTotalPct, setCatTotalPct] = useState('');

  // Validation shake tracking
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  const triggerShake = (field: string) => {
    setInvalidFields((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setInvalidFields((prev) => ({ ...prev, [field]: false }));
    }, 1500);
  };

  const handleAddCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let hasError = false;

    if (!name.trim()) {
      triggerShake('name');
      hasError = true;
    }

    const credVal = parseFloat(credits);
    if (isNaN(credVal) || credVal <= 0) {
      triggerShake('credits');
      hasError = true;
    }

    if (method === 'absolute') {
      const marksVal = parseFloat(marks);
      if (isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
        triggerShake('marks');
        hasError = true;
      }
      if (hasError) return;

      const gradeInfo = getAbsoluteGrade(marksVal);
      const newCourse: Course = {
        id: Date.now(),
        name: name.trim(),
        credits: credVal,
        marks: marksVal,
        grade: gradeInfo.grade,
        gradePoints: gradeInfo.points,
        label: gradeInfo.label,
        method: 'absolute',
      };

      setCourses((prev) => [...prev, newCourse]);
      resetForm();
    } else {
      const marksVal = parseFloat(relMarks);
      const meanVal = parseFloat(classMean);

      if (isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
        triggerShake('relMarks');
        hasError = true;
      }
      if (isNaN(meanVal) || meanVal < 0 || meanVal > 100) {
        triggerShake('classMean');
        hasError = true;
      }
      if (hasError) return;

      const highestVal = classHighest ? parseFloat(classHighest) : undefined;
      const lowestVal = classLowest ? parseFloat(classLowest) : undefined;
      const stdDevVal = classStdDev ? parseFloat(classStdDev) : undefined;
      const teeVal = teePct ? parseFloat(teePct) : undefined;
      const catVal = catTotalPct ? parseFloat(catTotalPct) : undefined;

      const gradeInfo = getRelativeGrade(
        marksVal,
        meanVal,
        stdDevVal,
        highestVal,
        lowestVal,
        teeVal,
        catVal
      );

      const effectiveSd =
        stdDevVal && stdDevVal > 0
          ? stdDevVal
          : highestVal !== undefined && lowestVal !== undefined && highestVal > lowestVal
          ? ((highestVal - lowestVal) / 4).toFixed(1)
          : '—';

      const newCourse: Course = {
        id: Date.now(),
        name: name.trim(),
        credits: credVal,
        marks: marksVal,
        grade: gradeInfo.grade,
        gradePoints: gradeInfo.points,
        label: gradeInfo.label,
        method: 'relative',
        relativeInfo: {
          mean: meanVal,
          highest: highestVal,
          lowest: lowestVal,
          stdDev: effectiveSd,
          cutoff: gradeInfo.cutoff,
        },
      };

      setCourses((prev) => [...prev, newCourse]);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setCredits('');
    setMarks('');
    setRelMarks('');
    setClassMean('');
    setClassHighest('');
    setClassLowest('');
    setClassStdDev('');
    setTeePct('');
    setCatTotalPct('');
  };

  const handleRemoveCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    if (courses.length === 0) return;
    setCourses([]);
  };

  const stats = calculateGPA(courses);

  return (
    <section className="tab-panel active">
      {/* ── Results Overview ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.15s both' }}>
        <div className="results-grid">
          <div className="result-card">
            <div className="result-card__label">Semester GPA</div>
            <div className="result-card__value">{stats.gpa}</div>
            <div className="result-card__sub">out of 10.00</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Total Credits</div>
            <div className="result-card__value success-gradient">{stats.totalCredits}</div>
            <div className="result-card__sub">credits attempted</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Courses</div>
            <div className="result-card__value warm-gradient">{stats.totalCourses}</div>
            <div className="result-card__sub">added</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">% Equivalent</div>
            <div className="result-card__value">{stats.pctEquiv}</div>
            <div className="result-card__sub">approximate</div>
          </div>
        </div>
      </div>

      {/* ── Add Course Form ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.25s both' }}>
        <div className="card__title">➕ Add Course</div>
        <form onSubmit={handleAddCourse}>
          {/* Grading Method */}
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group full-width">
              <label>
                Grading Method
                <span
                  className="info-tip"
                  data-tip="Absolute: uses fixed percentage ranges. Relative: uses class statistics (mean, std dev) to assign grades."
                >
                  ?
                </span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as GradingMethod)}
              >
                <option value="absolute">Absolute Grading (Fixed %)</option>
                <option value="relative">Relative Grading (Curve-based)</option>
              </select>
            </div>
          </div>

          {/* Core Inputs */}
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>
                Course Name <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Data Structures"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={invalidFields['name'] ? 'invalid' : ''}
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label>
                Credits <span className="req">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 4"
                min="0.5"
                step="0.5"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className={invalidFields['credits'] ? 'invalid' : ''}
              />
            </div>
          </div>

          {/* Absolute Inputs */}
          {method === 'absolute' && (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  Marks / Percentage <span className="req">*</span>
                  <span
                    className="info-tip"
                    data-tip="Enter your percentage score (0–100). The grade will be assigned using the fixed grading scale."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 85"
                  min="0"
                  max="100"
                  step="0.1"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className={invalidFields['marks'] ? 'invalid' : ''}
                />
              </div>
            </div>
          )}

          {/* Relative Inputs */}
          {method === 'relative' && (
            <div>
              <div className="card__title" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                📈 Your Score & Class Statistics
              </div>

              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>
                    Your Marks <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    min="0"
                    max="100"
                    step="0.1"
                    value={relMarks}
                    onChange={(e) => setRelMarks(e.target.value)}
                    className={invalidFields['relMarks'] ? 'invalid' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Class Average (Mean) <span className="req">*</span>
                    <span
                      className="info-tip"
                      data-tip="The average marks of the entire class. This is the most critical value for relative grading."
                    >
                      ?
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    min="0"
                    max="100"
                    step="0.1"
                    value={classMean}
                    onChange={(e) => setClassMean(e.target.value)}
                    className={invalidFields['classMean'] ? 'invalid' : ''}
                  />
                </div>
              </div>

              <div className="form-grid three-col">
                <div className="form-group">
                  <label>
                    Highest Mark <span className="opt">(optional)</span>
                    <span
                      className="info-tip"
                      data-tip="Used to estimate standard deviation if not provided directly. Enter the highest mark scored in the class."
                    >
                      ?
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 95"
                    min="0"
                    max="100"
                    step="0.1"
                    value={classHighest}
                    onChange={(e) => setClassHighest(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Lowest Mark <span className="opt">(optional)</span>
                    <span
                      className="info-tip"
                      data-tip="Used with highest mark to estimate std dev: σ ≈ (highest − lowest) / 4"
                    >
                      ?
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    min="0"
                    max="100"
                    step="0.1"
                    value={classLowest}
                    onChange={(e) => setClassLowest(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Std Deviation (σ) <span className="opt">(optional)</span>
                    <span
                      className="info-tip"
                      data-tip="Standard deviation of class marks. If you don't have this, provide highest and lowest marks — we'll estimate it."
                    >
                      ?
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    min="0"
                    step="0.1"
                    value={classStdDev}
                    onChange={(e) => setClassStdDev(e.target.value)}
                  />
                </div>
              </div>

              {/* Optional exam passing criteria */}
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                >
                  {showAdvanced ? '▼ Hide Exam Criteria' : '▶ Advanced: TEE / CAT Pass Criteria (Optional)'}
                </button>
              </div>

              {showAdvanced && (
                <div className="form-grid" style={{ marginTop: '0.75rem', animation: 'fadeIn 0.2s ease' }}>
                  <div className="form-group">
                    <label>
                      TEE Score % <span className="opt">(optional)</span>
                      <span className="info-tip" data-tip="Terminal Exam % (minimum 40% required to avoid F grade)">?</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      min="0"
                      max="100"
                      step="0.1"
                      value={teePct}
                      onChange={(e) => setTeePct(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      CAT Total % <span className="opt">(optional)</span>
                      <span className="info-tip" data-tip="Continuous Assessment total % (minimum 40% combined required)">?</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      min="0"
                      max="100"
                      step="0.1"
                      value={catTotalPct}
                      onChange={(e) => setCatTotalPct(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="btn-row">
            <button type="submit" className="btn btn--primary">
              ➕ Add Course
            </button>
            <button
              type="button"
              className="btn btn--danger-ghost btn--sm"
              onClick={handleClearAll}
              disabled={courses.length === 0}
            >
              🗑️ Clear All
            </button>
          </div>
        </form>
      </div>

      {/* ── Added Courses List ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.35s both' }}>
        <div className="card__title">📚 Added Courses</div>
        <div className="course-list">
          {courses.length === 0 ? (
            <div className="course-list__empty">
              <span>📚</span>
              No courses added yet. Fill in the form above to get started.
            </div>
          ) : (
            courses.map((c) => {
              const gradeClass = getGradeBadgeClass(c.grade);
              const methodTag = c.method === 'relative' ? ' · Relative' : '';
              const cutoffInfo =
                c.relativeInfo && c.relativeInfo.cutoff !== '—'
                  ? ` · Cutoff: ${c.relativeInfo.cutoff}`
                  : '';
              return (
                <div key={c.id} className="course-item">
                  <div className="course-item__info">
                    <div className="course-item__name">{c.name}</div>
                    <div className="course-item__meta">
                      {c.credits} credits · {c.marks} marks · {c.label}
                      {methodTag}
                      {cutoffInfo}
                    </div>
                  </div>
                  <div className={`course-item__grade ${gradeClass}`}>{c.grade}</div>
                  <button
                    className="course-item__remove"
                    onClick={() => handleRemoveCourse(c.id)}
                    title="Remove course"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
