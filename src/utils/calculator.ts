import { Course, GradeScaleItem, Semester } from '../types';

export const GRADING_SCALE: GradeScaleItem[] = [
  { grade: 'S', points: 10, minPct: 90, label: 'Outstanding' },
  { grade: 'A', points: 9, minPct: 80, label: 'Excellent' },
  { grade: 'B', points: 8, minPct: 70, label: 'Very Good' },
  { grade: 'C', points: 7, minPct: 60, label: 'Good' },
  { grade: 'D', points: 6, minPct: 50, label: 'Average' },
  { grade: 'E', points: 5, minPct: 40, label: 'Below Average' },
  { grade: 'F', points: 0, minPct: 0, label: 'Fail' },
];

export function getAbsoluteGrade(percentage: number): GradeScaleItem & { cutoff?: string } {
  for (const row of GRADING_SCALE) {
    if (percentage >= row.minPct) return row;
  }
  return GRADING_SCALE[GRADING_SCALE.length - 1];
}

/**
 * VIT Bhopal Relative Grading:
 * S: >= Mean + 1.5σ
 * A: >= Mean + 0.5σ
 * B: >= Mean - 0.5σ
 * C: >= Mean - 1.0σ
 * D: >= Mean - 1.5σ
 * E: <  Mean - 1.5σ (if TEE & total >= 40%)
 * F: TEE < 40% OR total < 40%
 */
export function getRelativeGrade(
  marks: number,
  mean: number,
  stdDevInput?: number,
  highestInput?: number,
  lowestInput?: number,
  teePct?: number,
  catTotalPct?: number
): GradeScaleItem & { cutoff: string; effectiveStdDev: number } {
  let stdDev = stdDevInput && stdDevInput > 0 ? stdDevInput : 0;
  const highest = highestInput && highestInput > 0 ? highestInput : 0;
  const lowest = lowestInput !== undefined && lowestInput >= 0 ? lowestInput : 0;

  if (stdDev <= 0) {
    if (highest > 0 && highest > lowest) {
      stdDev = (highest - lowest) / 4;
    } else {
      const abs = getAbsoluteGrade(marks);
      return { ...abs, cutoff: '—', effectiveStdDev: 0 };
    }
  }

  // F condition checks if exam percentages are provided
  if (teePct !== undefined && !isNaN(teePct) && teePct < 40) {
    const fRow = GRADING_SCALE.find((r) => r.grade === 'F')!;
    return { ...fRow, cutoff: '—', effectiveStdDev: stdDev };
  }
  if (catTotalPct !== undefined && !isNaN(catTotalPct) && catTotalPct < 40) {
    const fRow = GRADING_SCALE.find((r) => r.grade === 'F')!;
    return { ...fRow, cutoff: '—', effectiveStdDev: stdDev };
  }

  const boundaries: { grade: GradeScaleItem['grade']; k: number }[] = [
    { grade: 'S', k: 1.5 },
    { grade: 'A', k: 0.5 },
    { grade: 'B', k: -0.5 },
    { grade: 'C', k: -1.0 },
    { grade: 'D', k: -1.5 },
  ];

  for (const b of boundaries) {
    const cutoff = mean + b.k * stdDev;
    if (marks >= cutoff) {
      const row = GRADING_SCALE.find((r) => r.grade === b.grade)!;
      return { ...row, cutoff: cutoff.toFixed(1), effectiveStdDev: stdDev };
    }
  }

  const eCutoff = mean - 1.5 * stdDev;
  const eRow = GRADING_SCALE.find((r) => r.grade === 'E')!;
  return { ...eRow, cutoff: eCutoff.toFixed(1), effectiveStdDev: stdDev };
}

export function getGradeBadgeClass(grade: string): string {
  switch (grade) {
    case 'S':
      return 'grade-s';
    case 'A':
      return 'grade-a';
    case 'B':
      return 'grade-b';
    case 'C':
      return 'grade-c';
    case 'D':
      return 'grade-d';
    case 'E':
      return 'grade-e';
    default:
      return 'grade-f';
  }
}

export function calculateGPA(courses: Course[]) {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const weightedSum = courses.reduce((sum, c) => sum + c.credits * c.gradePoints, 0);
  const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const pctEquiv = totalCredits > 0 ? (gpa * 10).toFixed(1) : '—';

  return {
    gpa: gpa.toFixed(2),
    totalCredits,
    totalCourses: courses.length,
    pctEquiv,
  };
}

export function calculateCGPA(semesters: Semester[]) {
  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const weightedSum = semesters.reduce((sum, s) => sum + s.credits * s.gpa, 0);
  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const pctEquiv = totalCredits > 0 ? (cgpa * 10).toFixed(1) : '—';

  return {
    cgpa: cgpa.toFixed(2),
    totalCredits,
    totalSemesters: semesters.length,
    pctEquiv,
  };
}
