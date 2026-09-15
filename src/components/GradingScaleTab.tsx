'use client';

import React from 'react';
import { GRADING_SCALE, getGradeBadgeClass } from '../utils/calculator';

export default function GradingScaleTab() {
  return (
    <section className="tab-panel active">
      {/* ── 10-Point Absolute Scale ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.15s both' }}>
        <div className="card__title">📋 10-Point Grading Scale</div>
        <table className="scale-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Grade Points</th>
              <th>Percentage Range</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {GRADING_SCALE.map((row, index) => {
              const maxPct =
                index === 0
                  ? 100
                  : GRADING_SCALE[index - 1].minPct - 1;
              const rangeText =
                row.grade === 'F'
                  ? '< 40%'
                  : `${row.minPct}% – ${maxPct}%`;

              return (
                <tr key={row.grade}>
                  <td>
                    <span
                      className={`course-item__grade ${getGradeBadgeClass(row.grade)}`}
                      style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                    >
                      {row.grade}
                    </span>
                  </td>
                  <td>{row.points}</td>
                  <td>{rangeText}</td>
                  <td>{row.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Relative Grading Architecture ── */}
      <div className="card" style={{ animation: 'fadeSlideIn 0.5s 0.25s both' }}>
        <div className="card__title">📈 How Relative Grading Works</div>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            marginBottom: '1rem',
          }}
        >
          In relative grading, your grade depends on how you perform{' '}
          <strong>relative to your classmates</strong>, rather than against fixed percentage
          cutoffs. The system calculates boundaries using the{' '}
          <strong>class mean (average)</strong> and{' '}
          <strong>standard deviation (σ)</strong>.
        </p>
        <table className="scale-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Boundary Cutoff</th>
              <th>Performance Band</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="course-item__grade grade-s" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  S
                </span>
              </td>
              <td>≥ Mean + 1.5σ</td>
              <td>Top performers, well above class average</td>
            </tr>
            <tr>
              <td>
                <span className="course-item__grade grade-a" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  A
                </span>
              </td>
              <td>≥ Mean + 0.5σ</td>
              <td>Significantly above average</td>
            </tr>
            <tr>
              <td>
                <span className="course-item__grade grade-b" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  B
                </span>
              </td>
              <td>≥ Mean − 0.5σ</td>
              <td>Above or around the class average</td>
            </tr>
            <tr>
              <td>
                <span className="course-item__grade grade-c" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  C
                </span>
              </td>
              <td>≥ Mean − 1.0σ</td>
              <td>Within average distribution</td>
            </tr>
            <tr>
              <td>
                <span className="course-item__grade grade-d" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  D
                </span>
              </td>
              <td>≥ Mean − 1.5σ</td>
              <td>Below class average</td>
            </tr>
            <tr>
              <td>
                <span className="course-item__grade grade-e" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  E
                </span>
              </td>
              <td>&lt; Mean − 1.5σ</td>
              <td>Passing threshold (requires TEE & total ≥ 40%)</td>
            </tr>
            <tr>
              <td>
                <span className="course-item__grade grade-f" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                  F
                </span>
              </td>
              <td>Below pass threshold</td>
              <td>Fail (TEE &lt; 40% or Total &lt; 40%)</td>
            </tr>
          </tbody>
        </table>
        <p
          style={{
            color: 'var(--text-tertiary)',
            fontSize: '0.78rem',
            marginTop: '1rem',
          }}
        >
          💡 <strong>Tip:</strong> If you don&apos;t know the standard deviation, provide the highest
          and lowest marks scored in the class. We estimate σ ≈ (highest − lowest) / 4.
        </p>
      </div>
    </section>
  );
}
