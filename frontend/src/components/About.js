import React from 'react';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'ML Engineer', role: 'Built the Random Forest prediction model', emoji: '🤖' },
  { name: 'Backend Dev', role: 'Django REST API & database design', emoji: '⚙️' },
  { name: 'Frontend Dev', role: 'React SPA & UX design', emoji: '🎨' },
  { name: 'Data Analyst', role: 'Dataset curation & model validation', emoji: '📊' },
];

const FEATURES = [
  { icon: '🧠', title: 'Machine Learning Core', desc: 'Trained on real family communication data. Classifies bond quality across 5 weighted dimensions.' },
  { icon: '🔒', title: 'Private by design', desc: 'All data stays on your device or encrypted on-server. No third-party analytics or ads.' },
  { icon: '👨‍👩‍👧', title: 'Both perspectives', desc: 'Parent and child submit separately. Scores are averaged into a single family result.' },
  { icon: '📈', title: 'Progress over time', desc: 'Every assessment is saved. Track improvement across weeks and months with a visual timeline.' },
  { icon: '💡', title: 'Actionable tips', desc: 'Each result comes with at least 3 personalised recommendations you can act on immediately.' },
  { icon: '🆓', title: 'Completely free', desc: 'No subscription. No hidden fees. CommQuality is an open academic project.' },
];

const About = () => {
  return (
    <div className="lp-main" style={{ background: '#f8fafc' }}>

        {/* Hero */}
        <section className="lp-about-hero">
          <span className="lp-section-tag">About CommQuality</span>
          <h1 className="lp-about-title">Built to bring families closer through honest conversation</h1>
          <p className="lp-about-sub">
            CommQuality is an academic ML project that measures parent–child communication quality
            using a trained classifier. It gives both parent and child a voice — then combines them into
            a single actionable family score.
          </p>
        </section>

        {/* Features grid */}
        <section className="lp-section">
          <div className="lp-section-header">
            <span className="lp-section-tag">What we offer</span>
            <h2 className="lp-section-title">Everything you need to understand your family bond</h2>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div className="lp-feature-card" key={i}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="lp-section lp-section-light">
          <div className="lp-section-header">
            <span className="lp-section-tag">The Team</span>
            <h2 className="lp-section-title">Who built this</h2>
          </div>
          <div className="lp-team-grid">
            {TEAM.map((m, i) => (
              <div className="lp-team-card" key={i}>
                <div className="lp-team-emoji">{m.emoji}</div>
                <div className="lp-team-name">{m.name}</div>
                <div className="lp-team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="lp-cta-banner">
          <h2>Try it for free today</h2>
          <p>No signup fees. No subscriptions. Just better family conversations.</p>
          <div className="lp-cta-buttons">
            <Link to="/register" className="lp-btn-primary lp-btn-lg" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              Get started →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <div className="lp-footer-logo">💬 CommQuality</div>
              <p>Parent–child communication quality analyzer. Free, private, and ML-powered.</p>
            </div>
            <div className="lp-footer-links">
              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Product</div>
                <Link to="/">Home</Link>
                <Link to="/about">How it works</Link>
                <Link to="/register">Get started</Link>
              </div>
              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Company</div>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2025 CommQuality · Built with ❤️ for families</span>
            <span>Privacy · Terms</span>
          </div>
        </footer>
    </div>
  );
};


export default About;
