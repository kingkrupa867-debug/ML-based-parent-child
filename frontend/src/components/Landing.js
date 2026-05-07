import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const COMMUNICATION_QUOTES = [
  "The single most important habit you can develop as a parent is listening to your child as if it matters. Because it does.",
  "Communication is the bridge between confusion and clarity. In family, it's the foundation of trust.",
  "Every child needs to feel heard, not just listened to. There's a world of difference.",
  "The way we talk to our children becomes their inner voice. Choose your words with love.",
  "Children are not just smaller versions of us. They have their own thoughts, feelings, and dreams.",
  "A parent's voice can be the most comforting sound in the world, or the most frightening. The choice is ours.",
  "Good communication with children doesn't mean having all the answers. It means being present for the questions.",
  "The best conversations happen not when we're trying to teach, but when we're simply listening.",
];

const Landing = () => {
  const [quote] = useState(() => COMMUNICATION_QUOTES[Math.floor(Math.random() * COMMUNICATION_QUOTES.length)]);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="page-shell fade-in">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">Communication review for families</span>
          <h1 className="hero-title">See how your family conversations are really going.</h1>
          <p className="hero-subtitle">
            This tool turns a short communication assessment into a clear score, a bond category,
            and practical guidance you can come back to over time.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10</div>
              <div className="hero-stat-label">core questions per review</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">3</div>
              <div className="hero-stat-label">bond levels to track</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">1</div>
              <div className="hero-stat-label">shared progress timeline</div>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary-custom" onClick={() => handleRoleSelect('parent')}>
              Continue as parent
            </button>
            <button className="btn btn-secondary-custom" onClick={() => handleRoleSelect('child')}>
              Continue as child
            </button>
          </div>
        </div>

        <div className="landing-side">
          <div className="quote-panel">
            <blockquote>"{quote}"</blockquote>
            <cite>Family communication principle</cite>
          </div>

          <div className="role-grid">
            <button className="role-card" onClick={() => handleRoleSelect('parent')}>
              <span className="role-chip">Parent flow</span>
              <h3>Track patterns and strengths</h3>
              <p>Review how you listen, respond, encourage, and set boundaries.</p>
            </button>

            <button className="role-card" onClick={() => handleRoleSelect('child')}>
              <span className="role-chip">Child flow</span>
              <h3>Share your side honestly</h3>
              <p>Capture how supported, heard, and respected communication feels.</p>
            </button>
          </div>

          <p className="muted-copy">
            Already registered? <Link to="/login" style={{ color: 'var(--primary-deep)', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
