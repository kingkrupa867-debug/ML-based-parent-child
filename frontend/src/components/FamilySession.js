import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyInviteCode } from '../services/api';

/* ─────────────────────────────────────────────────────────
   FamilySession — pre-assessment gateway (Parent only)

   Flow A – Joint:
     1. "Is child available?" → YES
     2. Generate + show 8-char code (copy it)
     3. Click "Start My Questions (Parent)" → /questionnaire
        sessionStorage: jointSessionCode = CODE
     4. After parent submits → Results page shows
        "Start Child's Assessment" button → /child-entry
     5. Child enters code → verified → /questionnaire?child=1

   Flow B – Solo:
     "Is child available?" → NO → /questionnaire directly
───────────────────────────────────────────────────────── */

const STEP = {
  AVAILABILITY: 'availability',
  SHOW_CODE:    'show_code',
};

const FamilySession = () => {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(STEP.AVAILABILITY);
  const [code,    setCode]    = useState('');
  const [copied,  setCopied]  = useState(false);
  const [loading, setLoading] = useState(false);

  /* Fetch invite code when parent reaches SHOW_CODE step */
  useEffect(() => {
    if (step === STEP.SHOW_CODE && !code) {
      fetchCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const fetchCode = async () => {
    setLoading(true);
    try {
      const data = await getMyInviteCode();
      setCode(data.invite_code);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else if (status === 403) {
        toast.error('Only parent accounts can use joint mode.');
        goSolo();
      } else {
        toast.error(err.response?.data?.error || 'Could not load invite code. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success('Code copied!');
    });
  };

  /* Solo — skip straight to parent questionnaire */
  const goSolo = () => {
    sessionStorage.removeItem('jointSessionCode');
    navigate('/questionnaire');
  };

  /* Joint — store code then go to parent questionnaire */
  const startJoint = () => {
    if (!code) { toast.error('Please wait for the code to load.'); return; }
    sessionStorage.setItem('jointSessionCode', code);
    navigate('/questionnaire');
  };

  /* ── RENDER ─────────────────────────────────────────── */
  return (
    <div className="fs-page">
      <div className="fs-card glass-card">

        {/* ── STEP 1: Availability ── */}
        {step === STEP.AVAILABILITY && (
          <div className="fs-step fs-fade">
            <div className="fs-icon-ring">👨‍👩‍👧</div>
            <h1 className="fs-title">Before you begin</h1>
            <p className="fs-sub">
              Is your child available right now to take the assessment together on this device?
            </p>

            <div className="fs-choice-row">
              <button
                className="fs-choice-btn fs-choice-yes"
                onClick={() => setStep(STEP.SHOW_CODE)}
              >
                <span className="fs-choice-icon">✅</span>
                Yes, child is here
              </button>
              <button
                className="fs-choice-btn fs-choice-no"
                onClick={goSolo}
              >
                <span className="fs-choice-icon">🎯</span>
                No, solo mode
              </button>
            </div>

            <p className="fs-hint">
              Joint mode generates a session code.<br/>
              Both parent &amp; child take assessments on the same device.
            </p>
          </div>
        )}

        {/* ── STEP 2: Show code + start parent ── */}
        {step === STEP.SHOW_CODE && (
          <div className="fs-step fs-fade">
            <div className="fs-icon-ring">🔑</div>
            <h1 className="fs-title">Your session code</h1>
            <p className="fs-sub">
              Show this code to your child — they'll enter it after you finish your questions.
            </p>

            {loading ? (
              <div className="fs-spinner-wrap"><div className="ip-spinner" /></div>
            ) : (
              <>
                {/* Code display */}
                <div className="fs-code-display">
                  {(code || '········').split('').map((ch, i) => (
                    <span key={i} className="fs-code-char">{ch}</span>
                  ))}
                </div>

                <button
                  className={`fs-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={copyCode}
                  disabled={!code}
                >
                  {copied ? '✅ Copied!' : '📋 Copy code'}
                </button>

                {/* Step indicator */}
                <div className="fs-steps-strip">
                  <div className="fs-step-dot active">
                    <span>1</span>
                    <p>Parent answers</p>
                  </div>
                  <div className="fs-step-line" />
                  <div className="fs-step-dot">
                    <span>2</span>
                    <p>Child enters code</p>
                  </div>
                  <div className="fs-step-line" />
                  <div className="fs-step-dot">
                    <span>3</span>
                    <p>Child answers</p>
                  </div>
                </div>

                <div className="fs-divider"><span>Ready?</span></div>

                <button
                  className="ip-btn ip-btn-primary fs-full-btn"
                  onClick={startJoint}
                  disabled={!code}
                >
                  Start my questions (Parent) →
                </button>
                <p className="fs-hint" style={{ marginTop:'8px' }}>
                  After you finish, you'll see a button to hand the device to your child.
                </p>
              </>
            )}

            <button className="fs-back" onClick={() => setStep(STEP.AVAILABILITY)}>← Back</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FamilySession;
