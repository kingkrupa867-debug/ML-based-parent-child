import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const FAQ = [
  { q: 'Is CommQuality free to use?',              a: 'Yes — completely free, no subscription or hidden fees.' },
  { q: 'How accurate is the ML model?',            a: 'The Random Forest classifier achieved ~99% accuracy on the validation set during training.' },
  { q: 'Is my data private?',                      a: 'All responses are stored privately on the server and never shared with third parties.' },
  { q: 'Can a child use it without a parent?',     a: 'Yes. Each person submits their own assessment. Results are merged when both sides are available.' },
  { q: 'How often should we take the assessment?', a: 'Monthly check-ins are recommended to track meaningful change over time.' },
];

const Contact = () => {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="lp-main" style={{ background: '#f8fafc' }}>
      {/* Hero */}
      <section className="lp-about-hero">
        <span className="lp-section-tag">Get in touch</span>
        <h1 className="lp-about-title">We'd love to hear from you</h1>
        <p className="lp-about-sub">
          Have a question, suggestion, or just want to say hi? Fill in the form below or browse the FAQ.
        </p>
      </section>

      {/* Contact layout */}
      <section className="lp-section">
        <div className="lp-contact-grid">
          {/* Form */}
          <div className="lp-contact-form-wrap">
            <h3 className="lp-contact-form-title">Send us a message</h3>
            <form className="lp-contact-form" onSubmit={handleSubmit}>
              <div className="lp-form-row">
                <div className="lp-form-field">
                  <label>Name *</label>
                  <input type="text" name="name" placeholder="Your name"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div className="lp-form-field">
                  <label>Email *</label>
                  <input type="email" name="email" placeholder="your@email.com"
                    value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="lp-form-field">
                <label>Subject</label>
                <input type="text" name="subject" placeholder="What is this about?"
                  value={form.subject} onChange={handleChange} />
              </div>
              <div className="lp-form-field">
                <label>Message *</label>
                <textarea name="message" rows={5} placeholder="Write your message here…"
                  value={form.message} onChange={handleChange} required />
              </div>
              <button type="submit" className="lp-btn-primary" disabled={sending}>
                {sending ? '⏳ Sending…' : '→ Send message'}
              </button>
            </form>
          </div>

          {/* Info cards */}
          <div className="lp-contact-info">
            <div className="lp-info-card">
              <div className="lp-info-icon">📧</div>
              <div className="lp-info-title">Email</div>
              <div className="lp-info-val">support@commquality.app</div>
            </div>
            <div className="lp-info-card">
              <div className="lp-info-icon">⏰</div>
              <div className="lp-info-title">Response time</div>
              <div className="lp-info-val">Within 24 hours</div>
            </div>
            <div className="lp-info-card">
              <div className="lp-info-icon">📍</div>
              <div className="lp-info-title">Project base</div>
              <div className="lp-info-val">India · Academic project</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section lp-section-light">
        <div className="lp-section-header">
          <span className="lp-section-tag">FAQ</span>
          <h2 className="lp-section-title">Frequently asked questions</h2>
        </div>
        <div className="lp-faq">
          {FAQ.map((item, i) => (
            <div key={i} className={`lp-faq-item ${openFaq === i ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="lp-faq-q">
                <span>{item.q}</span>
                <span className="lp-faq-arrow">{openFaq === i ? '▲' : '▼'}</span>
              </div>
              {openFaq === i && <div className="lp-faq-a">{item.a}</div>}
            </div>
          ))}
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
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Account</div>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
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

export default Contact;
