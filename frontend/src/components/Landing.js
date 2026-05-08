import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Carousel slides ────────────────────────────────────────── */
const SLIDES = [
  {
    tag: 'Smart Assessment',
    title: 'Understand how your family really communicates',
    body: 'Answer 10 targeted questions and get an instant ML-powered score on your parent–child bond quality.',
    accent: '#6366f1',
    light: '#eef2ff',
    stats: [{ v: '10', l: 'Questions' }, { v: '<2 min', l: 'Duration' }, { v: '3', l: 'Bond levels' }],
  },
  {
    tag: 'AI Analysis',
    title: 'Machine learning reads between the lines',
    body: 'Our trained model analyses response patterns across 5 dimensions to categorise the bond as Strong, Moderate or Weak.',
    accent: '#7c3aed',
    light: '#f5f3ff',
    stats: [{ v: '5', l: 'ML dimensions' }, { v: '99%', l: 'Accuracy' }, { v: '3', l: 'Categories' }],
  },
  {
    tag: 'Track Progress',
    title: 'Both perspectives, one shared family score',
    body: 'Parent and child submit separately — scores are averaged into a shared family result you can compare over time.',
    accent: '#0891b2',
    light: '#ecfeff',
    stats: [{ v: '2', l: 'Perspectives' }, { v: '∞', l: 'Check-ins' }, { v: '1', l: 'Shared score' }],
  },
  {
    tag: 'Personalised Tips',
    title: 'Actionable advice after every result',
    body: 'Each assessment ends with targeted recommendations tailored to your score — so you know exactly what to work on next.',
    accent: '#059669',
    light: '#ecfdf5',
    stats: [{ v: '3+', l: 'Tips per result' }, { v: '100%', l: 'Personalised' }, { v: 'Free', l: 'Forever' }],
  },
];

const STEPS = [
  { num: '01', title: 'Enter your details', desc: 'Both parent and child log in separately and fill a 10-question communication survey — takes under 2 minutes.', color: '#6366f1' },
  { num: '02', title: 'AI analysis',        desc: 'Our ML model processes both responses, weighs five communication dimensions and produces an individual score.', color: '#7c3aed' },
  { num: '03', title: 'Get your result',    desc: 'Receive a bond category, a shared family score, and personalised improvement tips you can act on immediately.', color: '#059669' },
];

const STATS_STRIP = [
  { value: '10',  label: 'Questions per session' },
  { value: '3',   label: 'Bond levels tracked'   },
  { value: '2',   label: 'Perspectives merged'   },
  { value: '99%', label: 'Model accuracy'         },
];

const TESTIMONIALS = [
  { name: 'Priya M.',  role: 'Parent',          text: 'We used this every month for three months. The improvement in how we talk as a family has been remarkable.' },
  { name: 'Arun K.',   role: 'Parent',          text: 'Simple, honest questions. My son opened up more after seeing our shared score.' },
  { name: 'Sneha R.',  role: 'Student (Child)', text: 'I finally felt like my perspective mattered. The child-side questions are really relatable.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [slide, setSlide]     = useState(0);
  const [animDir, setAnimDir] = useState('right');
  const [paused, setPaused]   = useState(false);

  const next = useCallback(() => { setAnimDir('right'); setSlide(s => (s + 1) % SLIDES.length); }, []);
  const prev = () => { setAnimDir('left'); setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length); };
  const goTo = (i) => { setAnimDir(i > slide ? 'right' : 'left'); setSlide(i); };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, paused]);

  const s = SLIDES[slide];

  return (
    <div className="land-page">

      {/* ── CAROUSEL HERO ──────────────────────────────────── */}
      <section
        className="land-hero"
        style={{ '--ha': s.accent, '--hl': s.light }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Animated bg blobs */}
        <div className="land-blob land-blob-1" style={{ background: s.accent }} />
        <div className="land-blob land-blob-2" style={{ background: s.accent }} />

        <div className={`land-hero-content hs-${animDir}`} key={slide}>
          <div className="land-hero-text">
            <span className="land-tag">{s.tag}</span>
            <h1 className="land-h1">{s.title}</h1>
            <p className="land-lead">{s.body}</p>

            <div className="land-hero-stats">
              {s.stats.map((st, i) => (
                <div key={i} className="land-hero-stat">
                  <span className="land-hero-stat-val" style={{ color: s.accent }}>{st.v}</span>
                  <span className="land-hero-stat-lbl">{st.l}</span>
                </div>
              ))}
            </div>

            <div className="land-hero-ctas">
              <button className="land-btn-primary" style={{ background: s.accent }} onClick={() => navigate('/register?role=parent')}>
                Get started free
              </button>
              <Link to="/login" className="land-btn-outline">Sign in</Link>
            </div>
          </div>

          <div className="land-hero-visual">
            <img
              src="/Family-pana.svg"
              alt="Family communication illustration"
              className="land-hero-svg"
            />
          </div>
        </div>

        {/* Arrow controls */}
        <button className="land-arr land-arr-l" onClick={prev}>&#8249;</button>
        <button className="land-arr land-arr-r" onClick={next}>&#8250;</button>

        {/* Dots */}
        <div className="land-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`land-dot ${i === slide ? 'active' : ''}`}
              style={{ background: i === slide ? s.accent : undefined }}
              onClick={() => goTo(i)} />
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <section className="land-strip">
        {STATS_STRIP.map((s, i) => (
          <div key={i} className="land-strip-item">
            <div className="land-strip-val">{s.value}</div>
            <div className="land-strip-lbl">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="land-section">
        <div className="land-section-head">
          <span className="land-section-tag">How it works</span>
          <h2 className="land-section-title">Three steps to a clearer picture</h2>
          <p className="land-section-sub">Powered by real data and machine learning — no guesswork involved.</p>
        </div>
        <div className="land-steps">
          {STEPS.map((step, i) => (
            <div key={i} className="land-step">
              {i < STEPS.length - 1 && <div className="land-step-connector" />}
              <div className="land-step-num" style={{ color: step.color, borderColor: step.color + '30', background: step.color + '0d' }}>
                {step.num}
              </div>
              <h3 className="land-step-title">{step.title}</h3>
              <p className="land-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="land-section land-section-alt">
        <div className="land-section-head">
          <span className="land-section-tag">Testimonials</span>
          <h2 className="land-section-title">Families who use CommQuality</h2>
        </div>
        <div className="land-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="land-tcard">
              <div className="land-tcard-avatar">{t.name[0]}</div>
              <p className="land-tcard-text">"{t.text}"</p>
              <div className="land-tcard-name">{t.name}</div>
              <div className="land-tcard-role">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="land-cta">
        <h2 className="land-cta-title">Ready to strengthen your family bond?</h2>
        <p className="land-cta-sub">Start your first assessment in under 2 minutes — completely free.</p>
        <div className="land-cta-btns">
          <button className="land-btn-primary" onClick={() => navigate('/register?role=parent')}>Start as parent</button>
          <button className="land-btn-outline land-btn-outline-w" onClick={() => navigate('/register?role=child')}>Start as child</button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div>
            <div className="land-footer-brand">CommQuality</div>
            <p className="land-footer-desc">Parent–child communication quality analyzer. Free, private, and ML-powered.</p>
          </div>
          <div className="land-footer-links">
            <div className="land-footer-col">
              <div className="land-footer-col-h">Product</div>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/register">Get started</Link>
            </div>
            <div className="land-footer-col">
              <div className="land-footer-col-h">Company</div>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="land-footer-col">
              <div className="land-footer-col-h">Account</div>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
        <div className="land-footer-bottom">
          <span>© 2025 CommQuality · Built with love for families</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
