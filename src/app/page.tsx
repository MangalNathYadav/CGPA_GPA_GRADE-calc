'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GpaCalculator from '../components/GpaCalculator';
import CgpaCalculator from '../components/CgpaCalculator';
import GradingScaleTab from '../components/GradingScaleTab';
import { Course, Semester } from '../types';

type TabKey = 'gpa' | 'cgpa' | 'scale';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('gpa');
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state from localStorage on client mount
  useEffect(() => {
    try {
      const savedCourses = localStorage.getItem('gpa_courses');
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses));
      }

      const savedSemesters = localStorage.getItem('cgpa_semesters');
      if (savedSemesters) {
        setSemesters(JSON.parse(savedSemesters));
      }
    } catch (e) {
      console.error('Failed to load storage data:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save courses when updated
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('gpa_courses', JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses:', e);
    }
  }, [courses, isLoaded]);

  // Save semesters when updated
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('cgpa_semesters', JSON.stringify(semesters));
    } catch (e) {
      console.error('Failed to save semesters:', e);
    }
  }, [semesters, isLoaded]);

  return (
    <main className="app-wrapper">
      <Header />

      {/* ── Tabs Navigation ── */}
      <nav className="tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'gpa' ? 'active' : ''}`}
          onClick={() => setActiveTab('gpa')}
          role="tab"
          aria-selected={activeTab === 'gpa'}
        >
          📊 GPA Calculator
        </button>
        <button
          className={`tab-btn ${activeTab === 'cgpa' ? 'active' : ''}`}
          onClick={() => setActiveTab('cgpa')}
          role="tab"
          aria-selected={activeTab === 'cgpa'}
        >
          🎓 CGPA Calculator
        </button>
        <button
          className={`tab-btn ${activeTab === 'scale' ? 'active' : ''}`}
          onClick={() => setActiveTab('scale')}
          role="tab"
          aria-selected={activeTab === 'scale'}
        >
          📋 Grading Scale
        </button>
      </nav>

      {/* ── Active Tab Panel ── */}
      {activeTab === 'gpa' && (
        <GpaCalculator courses={courses} setCourses={setCourses} />
      )}

      {activeTab === 'cgpa' && (
        <CgpaCalculator semesters={semesters} setSemesters={setSemesters} />
      )}

      {activeTab === 'scale' && <GradingScaleTab />}

      <Footer />
    </main>
  );
}
