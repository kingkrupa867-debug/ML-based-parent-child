import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { verifySessionCode } from '../services/api';

/* ─────────────────────────────────────────────────────────
   ChildEntry — child enters or pastes the session code
   After verification → /questionnaire?child=1
───────────────────────────────────────────────────────── */

const ChildEntry = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const parentResultId = location.state?.parentResultId;

  const [boxes,    setBoxes]    = useState(Array(8).fill(''));
  const [loading,  setLoading]  = useState(false);
  const [pasting,  setPasting]  = useState(false);
  const refs = useRef([]);

  const handleInput = (i, val) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!clean) {
      const next = [...boxes]; next[i] = ''; setBoxes(next); return;
    }
    if (clean.length > 1 && i === 0) {
      const spread = clean.slice(0, 8).split('').concat(Array(8).fill('')).slice(0, 8);
      setBoxes(spread);
      refs.current[Math.min(spread.filter(Boolean).length, 7)]?.focus();
      return;
    }
    const next = [...boxes];
    next[i] = clean[clean.length - 1];
    setBoxes(next);
    if (i < 7) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !boxes[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  /* Paste from clipboard */
  const handlePaste = async () => {
    setPasting(true);
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      if (!clean) { toast.error('No valid code found in clipboard.'); return; }
      const spread = clean.split('').concat(Array(8).fill('')).slice(0, 8);
      setBoxes(spread);
      refs.current[Math.min(clean.length, 7)]?.focus();
      toast.success('Code pasted!');
    } catch {
      toast.error('Could not read clipboard. Please type the code manually.');
    } finally {
      setPasting(false);
    }
  };

  const enteredCode = boxes.join('');

  const handleVerify = async () => {
    if (enteredCode.length < 8) {
      toast.error('Please enter the full 8-character code.');
      return;
    }
    setLoading(true);
    try {
      await verifySessionCode(enteredCode);
      toast.success('Code verified! Starting child assessment…');
      // Pass parentResultId so the child result page can show both
      navigate('/questionnaire?child=1', { state: { parentResultId } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid code. Please check with your parent.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fs-page">
      <div className="fs-card glass-card">
        <div className="fs-step fs-fade">

          {/* Header */}
          <div className="fs-icon-ring">🧒</div>
          <h1 className="fs-title">Child's turn!</h1>
          <p className="fs-sub">
            Enter or paste the 8-character code shown during parent setup.
          </p>

          {/* 8-box input */}
          <div className="fs-boxes">
            {boxes.map((ch, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className="fs-box"
                value={ch}
                maxLength={1}
                autoFocus={i === 0}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                onFocus={e => e.target.select()}
              />
            ))}
          </div>

          {/* Paste button */}
          <button
            className="fs-copy-btn"
            onClick={handlePaste}
            disabled={pasting}
          >
            {pasting ? 'Pasting…' : '📋 Paste code'}
          </button>

          {/* Verify */}
          <button
            className="ip-btn ip-btn-primary fs-full-btn"
            onClick={handleVerify}
            disabled={loading || enteredCode.length < 8}
            style={{ marginTop: '8px' }}
          >
            {loading ? <span className="auth-spinner" /> : 'Verify & Start →'}
          </button>

          <p className="fs-hint" style={{ marginTop: '12px' }}>
            The code was shown on screen when your parent started their assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChildEntry;
