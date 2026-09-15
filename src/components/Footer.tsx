import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-row">
        <span className="footer-label">Developed using</span>
        <span className="footer-badge badge--purple">Gemini 3.1 Pro</span>
        <span className="footer-badge badge--blue">Claude Opus 4.6 Thinking</span>
        <span className="footer-sep">·</span>
        <span className="footer-label">Code Editor</span>
        <span className="footer-badge badge--dark">Antigravity</span>
        <span className="footer-sep">·</span>
        <span className="footer-label">by</span>
        <span className="footer-badge badge--dark">Mangal Nath Yadav / shadowXg</span>
      </div>
      <div className="footer-copy">
        © 2026 Grade & GPA Calculator. All rights reserved.
      </div>
    </footer>
  );
}
