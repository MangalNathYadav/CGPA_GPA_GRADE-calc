export interface GradeScaleItem {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  points: number;
  minPct: number;
  label: string;
}

export type GradingMethod = 'absolute' | 'relative';

export interface RelativeInfo {
  mean: number;
  highest?: number;
  lowest?: number;
  stdDev: number | string;
  cutoff: string;
}

export interface Course {
  id: number;
  name: string;
  credits: number;
  marks: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  gradePoints: number;
  label: string;
  method: GradingMethod;
  relativeInfo?: RelativeInfo | null;
}

export interface Semester {
  id: number;
  semesterName: string;
  credits: number;
  gpa: number;
}
