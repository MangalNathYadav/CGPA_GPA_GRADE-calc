'use client';

import React, { useState } from 'react';
import { Semester } from '../types';
import { calculateCGPA } from '../utils/calculator';

interface CgpaCalculatorProps {
  semesters: Semester[];
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
}

export default function CgpaCalculator({ semesters, setSemesters }: CgpaCalculatorProps) {
  const [semesterName, setSemesterName] = useState('');
  const [credits, setCredits] = useState('');
  const [gpa, setGpa] = useState('');
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  const triggerShake = (field: string) => {
    setInvalidFields((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setInvalidFields((prev) => ({ ...prev, [field]: false }));
    }, 1500);
  };

  const handleAddSemester = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let hasError = false;
    const credVal = parseFloat(credits);
    const gpaVal = parseFloat(gpa);

    if (isNaN(credVal) || credVal <= 0) {
      triggerShake('credits');
      hasError = true;
    }

    if (isNaN(gpaVal) || gpaVal < 0 || gpaVal > 10) {
      triggerShake('gpa');
      hasError = true;
    }

    if (hasError) return;

    const name = semesterName.trim() || `Semester ${semesters.length + 1}`;
    const newSemester: Semester = {
      id: Date.now(),
      semesterName: name,
      credits: credVal,
      gpa: gpaVal,
    };

    setSemesters((prev) => [...prev, newSemester]);
    setSemesterName('');
    setCredits('');
    setGpa('');
  };

  const handleRemoveSemester = (id: number) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAll = () => {
    if (semesters.length === 0) return;
    setSemesters([]);
  };

  const stats = calculateCGPA(semesters);

  return (
    <section className="tab-panel active">
      {/* ── CGPA Results Overview ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.15s both' }}>
        <div className="results-grid">
          <div className="result-card">
            <div className="result-card__label">Cumulative GPA</div>
            <div className="result-card__value">{stats.cgpa}</div>
            <div className="result-card__sub">out of 10.00</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Total Credits</div>
            <div className="result-card__value success-gradient">{stats.totalCredits}</div>
            <div className="result-card__sub">all semesters</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">Semesters</div>
            <div className="result-card__value warm-gradient">{stats.totalSemesters}</div>
            <div className="result-card__sub">recorded</div>
          </div>
          <div className="result-card">
            <div className="result-card__label">% Equivalent</div>
            <div className="result-card__value">{stats.pctEquiv}</div>
            <div className="result-card__sub">approximate</div>
          </div>
        </div>
      </div>

      {/* ── Add Semester Form ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.25s both' }}>
        <div className="card__title">➕ Add Semester</div>
        <form onSubmit={handleAddSemester}>
          <div className="form-grid three-col">
            <div className="form-group">
              <label>
                Semester Name <span className="opt">(optional)</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. Semester ${semesters.length + 1}`}
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label>
                Credits Earned <span className="req">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 22"
                min="0.5"
                step="0.5"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className={invalidFields['credits'] ? 'invalid' : ''}
              />
            </div>
            <div className="form-group">
              <label>
                Semester GPA <span className="req">*</span>
                <span
                  className="info-tip"
                  data-tip="Enter the GPA for this semester on a 10-point scale."
                >
                  ?
                </span>
              </label>
              <input
                type="number"
                placeholder="e.g. 8.54"
                min="0"
                max="10"
                step="0.01"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className={invalidFields['gpa'] ? 'invalid' : ''}
              />
            </div>
          </div>

          <div className="btn-row">
            <button type="submit" className="btn btn--success">
              ➕ Add Semester
            </button>
            <button
              type="button"
              className="btn btn--danger-ghost btn--sm"
              onClick={handleClearAll}
              disabled={semesters.length === 0}
            >
              🗑️ Clear All
            </button>
          </div>
        </form>
      </div>

      {/* ── Semester Records List ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.35s both' }}>
        <div className="card__title">🎓 Semester Records</div>
        <div className="course-list">
          {semesters.length === 0 ? (
            <div className="course-list__empty">
              <span>🎓</span>
              No semesters added yet. Add your semester results above.
            </div>
          ) : (
            semesters.map((s) => (
              <div key={s.id} className="course-item">
                <div className="course-item__info">
                  <div className="course-item__name">{s.semesterName}</div>
                  <div className="course-item__meta">
                    {s.credits} credits · GPA: {s.gpa.toFixed(2)}
                  </div>
                </div>
                <div className="course-item__grade grade-a">{s.gpa.toFixed(2)}</div>
                <button
                  className="course-item__remove"
                  onClick={() => handleRemoveSemester(s.id)}
                  title="Remove semester"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
