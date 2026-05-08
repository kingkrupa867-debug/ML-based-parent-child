import React, { useState } from 'react';
import '../styles/splash.css';

const teamMembers = [
  { name: 'G. Krupa Prasad',      rollNo: '2023-2402018', semester: 'BCA 6' },
  { name: 'D. Siri Varshini',     rollNo: '2023-2402027', semester: 'BCA 6' },
  { name: 'S. Jagadesh Chowdary', rollNo: '2023-2402052', semester: 'BCA 6' },
];

function SplashScreen() {
  const [leaving, setLeaving] = useState(false);

  const handleGetStarted = () => {
    setLeaving(true);
    setTimeout(() => {
      // 1st priority: pywebview's native goToLanding (injected by launcher.py)
      if (window.goToLanding) {
        window.goToLanding();
        return;
      }
      // 2nd priority: pywebview JS API directly
      if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.go_home();
        return;
      }
      // 3rd fallback: regular browser navigation
      window.location.href = '/';
    }, 300);
  };

  return (
    <div className={`splash-slide ${leaving ? 'splash-leaving' : ''}`}>

      {/* ── HEADER ── */}
      <div className="splash-header-row">
        <div className="splash-logo-wrap">
          <img src="/static/img/gvp_logo.jpeg" alt="GVP" />
        </div>

        <div className="splash-college-block">
          <div className="splash-college-name">
            Gayatri Vidya Parishad<br />
            College for Degree and PG Courses (A)
          </div>
          <div className="splash-college-meta">
            (Affiliated to Andhra University &nbsp;|Reaccredited by NAAC| ISO 9001: 2015)
          </div>
          <div className="splash-college-city">Visakhapatnam-530045</div>
        </div>

        <div className="splash-logo-wrap">
          <img src="/static/img/gvp_logo.jpeg" alt="GVP CS" />
        </div>
      </div>

      {/* ── PROJECT TITLE ── */}
      <div className="splash-title-row">
        <div className="splash-main-title">
          Machine Learning Based Parent-Child<br />Communication Quality Analyzer
        </div>
      </div>

      {/* ── BODY: GUIDE + TEAM ── */}
      <div className="splash-body-row">

        {/* LEFT — Guide */}
        <div className="splash-guide-panel">
          <div className="splash-guide-title">Project Guide:</div>
          <div className="splash-guide-name">Mrs. P. Ratna Pavani</div>
          <div className="splash-guide-designation">Assistant Professor &amp; HOD of BCA</div>
          <div className="splash-guide-dept">
            Department of Computer Applications
          </div>
        </div>

        {/* RIGHT — Team */}
        <div className="splash-team-panel">
          <div className="splash-team-title">TEAM MEMBERS:</div>
          <div className="splash-team-list">
            {teamMembers.map((m, i) => (
              <div className="splash-team-row" key={i}>
                <span>{m.name}</span>
                <span>{m.rollNo}</span>
                <span>{m.semester}<sup>th</sup> Sem</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── GET STARTED BUTTON ── */}
      <div className="splash-btn-row">
        <button className="splash-cta-btn" onClick={handleGetStarted} disabled={leaving}>
          {leaving ? 'Loading…' : 'Get Started'}
          {!leaving && (
            <svg viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>

      <div className="splash-bottom-bar" />
    </div>
  );
}

export default SplashScreen;
