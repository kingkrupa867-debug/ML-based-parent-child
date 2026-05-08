import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { submitQuestionnaire } from '../services/api';

/* ── Question banks ───────────────────────────────── */
const PARENT_QUESTIONS = [
  "Do you try to understand your child's point of view before responding?",
  "Do you pay full attention when your child shares problems or feelings?",
  "Do you express your emotions clearly and respectfully to your child?",
  "Do you control your anger or frustration during conversations with your child?",
  "Do you spend quality time talking with your child daily?",
  "Do you praise or encourage your child's efforts and achievements?",
  "Do you listen without interrupting when your child is speaking?",
  "Do you discuss daily activities or school events with your child?",
  "Do you set clear and consistent boundaries while remaining respectful?",
  "Do you apologize to your child when you are wrong?",
];

const CHILD_QUESTIONS = [
  "Do you try to understand your parent's point of view before responding?",
  "Do you pay full attention when your parent shares problems or feelings?",
  "Do you express your emotions clearly and respectfully to your parent?",
  "Do you control your anger or frustration during conversations with your parent?",
  "Do you spend quality time talking with your parent daily?",
  "Do you praise or encourage your parent's efforts and achievements?",
  "Do you listen without interrupting when your parent is speaking?",
  "Do you discuss daily activities or school/work events with your parent?",
  "Do you follow your parent's rules and expectations?",
  "Do you apologize to your parent when you are wrong?",
];

/* ── Rating config ────────────────────────────────── */
const RATINGS = [
  { value: 1, emoji: '😞', label: 'Never',     color: '#ef4444', bg: '#fef2f2' },
  { value: 2, emoji: '😕', label: 'Rarely',    color: '#f97316', bg: '#fff7ed' },
  { value: 3, emoji: '😐', label: 'Sometimes', color: '#eab308', bg: '#fefce8' },
  { value: 4, emoji: '😊', label: 'Often',     color: '#22c55e', bg: '#f0fdf4' },
  { value: 5, emoji: '🌟', label: 'Always',    color: '#6366f1', bg: '#eef2ff' },
];

const FAMILY_TYPES = [
  { value: 'Nuclear',       icon: '👨‍👩‍👧',  label: 'Nuclear family'   },
  { value: 'Joint',         icon: '👨‍👩‍👧‍👦', label: 'Joint family'     },
  { value: 'Single-Parent', icon: '👩‍👦',  label: 'Single parent'    },
  { value: 'Extended',      icon: '👪',   label: 'Extended family'  },
];

/* ── Phases: info → questions → submitting ─────────── */
const PHASE = { INFO: 'info', QUESTIONS: 'questions', SUBMITTING: 'submitting', DONE: 'done' };

const Questionnaire = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ?child=1 → force child questions (joint session, child’s turn)
  const isChildTurn = new URLSearchParams(location.search).get('child') === '1';

  const [user,    setUser]    = useState(null);
  const [phase,   setPhase]   = useState(PHASE.INFO);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animDir, setAnimDir] = useState('next');
  const [selected, setSelected] = useState(null);
  const [demographics, setDemographics] = useState({
    parent_age: '', child_age: '', family_type: 'Nuclear',
  });
  const [demoErrors, setDemoErrors] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));

    // Child turn: skip INFO, reuse demographics saved by parent
    if (isChildTurn) {
      const saved = sessionStorage.getItem('jointDemographics');
      if (saved) {
        setDemographics(JSON.parse(saved));
      }
      setPhase(PHASE.QUESTIONS);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const questions = isChildTurn ? CHILD_QUESTIONS
                  : (user?.role === 'child' ? CHILD_QUESTIONS : PARENT_QUESTIONS);
  const total     = questions.length;
  const progress  = ((current) / total) * 100;

  /* ── Validate demographics ─────────────────────── */
  const validateDemo = () => {
    const errs = {};
    const pa = parseInt(demographics.parent_age, 10);
    const ca = parseInt(demographics.child_age, 10);
    if (!demographics.parent_age || pa < 18 || pa > 100) errs.parent_age = 'Must be 18–100';
    if (!demographics.child_age  || ca < 3  || ca > 30)  errs.child_age  = 'Must be 3–30';
    setDemoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Select a rating then auto-advance after 600 ms ── */
  const handleSelect = useCallback((value) => {
    if (selected !== null) return; // already advancing
    setSelected(value);

    setTimeout(() => {
      const newAnswers = { ...answers, [current]: value };
      setAnswers(newAnswers);
      setSelected(null);

      if (current < total - 1) {
        setAnimDir('next');
        setCurrent(c => c + 1);
      } else {
        // Last question answered → submit
        doSubmit(newAnswers);
      }
    }, 520);
  }, [selected, answers, current, total]); // eslint-disable-line

  const handleBack = () => {
    if (current === 0) { setPhase(PHASE.INFO); return; }
    setAnimDir('prev');
    setCurrent(c => c - 1);
  };

  /* ── Submit ─────────────────────────────────────── */
  const doSubmit = async (finalAnswers) => {
    setPhase(PHASE.SUBMITTING);
    try {
      const getKey = (i) => user?.role === 'child' ? `cq${i + 1}` : `pq${i + 1}`;
      const payload = {
        parent_age:  parseInt(demographics.parent_age, 10),
        child_age:   parseInt(demographics.child_age, 10),
        family_type: demographics.family_type,
      };
      questions.forEach((_, i) => { payload[getKey(i)] = finalAnswers[i]; });

      const response = await submitQuestionnaire(payload);
      toast.success('Assessment submitted!');
      const id = response.result_id || response.id;

      const jointCode = sessionStorage.getItem('jointSessionCode');
      if (jointCode && !isChildTurn) {
        // Parent just finished — save demographics + resultId for child
        sessionStorage.setItem('jointDemographics', JSON.stringify(demographics));
        sessionStorage.setItem('parentResultId', String(id));
        navigate('/child-entry', { state: { parentResultId: id } });
      } else {
        // Solo or child finished — clean up and go to results
        const pid = sessionStorage.getItem('parentResultId');
        sessionStorage.removeItem('jointSessionCode');
        sessionStorage.removeItem('jointDemographics');
        sessionStorage.removeItem('parentResultId');
        navigate(`/results/${id}`, { state: { result: response, parentResultId: pid ? Number(pid) : null } });
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Submission failed. Please try again.';
      toast.error(msg);
      setPhase(PHASE.QUESTIONS);
    }
  };

  /* ── PHASE: INFO ──────────────────────────────────── */
  if (phase === PHASE.INFO) {
    return (
      <div className="qs-shell fade-in">
        <div className="qs-info-card">
          {/* Header */}
          <div className="qs-info-top">
            <div className="qs-info-icon">📋</div>
            <h1 className="qs-info-title">Before we begin</h1>
            <p className="qs-info-sub">
              We need a few quick details to personalise your assessment.
              This takes about 10 seconds.
            </p>
          </div>

          {/* Demographics form */}
          <div className="qs-demo-grid">
            {/* Parent age */}
            <div className="qs-demo-field">
              <label className="qs-demo-label">👨 Parent's age</label>
              <input
                type="number"
                className={`qs-demo-input ${demoErrors.parent_age ? 'error' : ''}`}
                placeholder="e.g. 38"
                value={demographics.parent_age}
                onChange={e => setDemographics(d => ({ ...d, parent_age: e.target.value }))}
                min="18" max="100"
              />
              {demoErrors.parent_age && <span className="qs-demo-error">{demoErrors.parent_age}</span>}
            </div>

            {/* Child age */}
            <div className="qs-demo-field">
              <label className="qs-demo-label">🧒 Child's age</label>
              <input
                type="number"
                className={`qs-demo-input ${demoErrors.child_age ? 'error' : ''}`}
                placeholder="e.g. 12"
                value={demographics.child_age}
                onChange={e => setDemographics(d => ({ ...d, child_age: e.target.value }))}
                min="3" max="30"
              />
              {demoErrors.child_age && <span className="qs-demo-error">{demoErrors.child_age}</span>}
            </div>
          </div>

          {/* Family type */}
          <div className="qs-family-label">👪 Family type</div>
          <div className="qs-family-grid">
            {FAMILY_TYPES.map(ft => (
              <button
                key={ft.value}
                type="button"
                className={`qs-family-btn ${demographics.family_type === ft.value ? 'active' : ''}`}
                onClick={() => setDemographics(d => ({ ...d, family_type: ft.value }))}
              >
                <span className="qs-family-icon">{ft.icon}</span>
                <span className="qs-family-name">{ft.label}</span>
              </button>
            ))}
          </div>

          {/* Start button */}
          <button
            className="qs-start-btn"
            onClick={() => { if (validateDemo()) setPhase(PHASE.QUESTIONS); }}
          >
            Start assessment →
          </button>

          <p className="qs-info-note">
            {total} questions · one at a time · under 3 minutes
          </p>
        </div>
      </div>
    );
  }

  /* ── PHASE: SUBMITTING ─────────────────────────────── */
  if (phase === PHASE.SUBMITTING) {
    return (
      <div className="qs-shell">
        <div className="qs-submitting">
          <div className="qs-submit-spinner" />
          <h2 className="qs-submit-title">Analysing your responses…</h2>
          <p className="qs-submit-sub">Our ML model is computing your communication score.</p>
        </div>
      </div>
    );
  }

  /* ── PHASE: QUESTIONS ─────────────────────────────── */
  const currentAnswer = answers[current];

  return (
    <div className="qs-shell">

      {/* Top progress bar */}
      <div className="qs-progress-bar">
        <div
          className="qs-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main question card */}
      <div className="qs-center">

        {/* Question counter */}
        <div className="qs-counter">
          Question <strong>{current + 1}</strong> of <strong>{total}</strong>
        </div>

        {/* Question card — contains question + options together */}
        <div className={`qs-question-card qs-anim-${animDir}`} key={current}>
          <div className="qs-q-number">{String(current + 1).padStart(2, '0')}</div>
          <h2 className="qs-q-text">{questions[current]}</h2>

          {/* Rating options inside the card */}
          <div className="qs-ratings-v">
            {RATINGS.map(r => {
              const isChosen = currentAnswer === r.value;
              const isJustPicked = selected === r.value;
              const active = isChosen || isJustPicked;
              return (
                <button
                  key={r.value}
                  type="button"
                  className={`qs-rating-row ${active ? 'qs-rating-row-active' : ''}`}
                  onClick={() => handleSelect(r.value)}
                  disabled={selected !== null}
                >
                  <span className="qs-radio-circle">
                    {active && <span className="qs-radio-dot" />}
                  </span>
                  <span className="qs-rating-row-label">{r.label}</span>
                  {active && <span className="qs-rating-row-check">&#10003;</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dot trail */}
        <div className="qs-dots">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`qs-dot ${i < current ? 'done' : ''} ${i === current ? 'current' : ''}`}
            />
          ))}
        </div>

        {/* Back button */}
        {current > 0 && selected === null && (
          <button className="qs-back-btn" onClick={handleBack}>
            ← Back
          </button>
        )}

        {/* Hint */}
        {selected === null && (
          <p className="qs-hint">
            {currentAnswer ? 'Tap a different option to change your answer, or continue' : 'Tap an option to answer'}
          </p>
        )}
        {selected !== null && (
          <p className="qs-hint qs-hint-advancing">
            {current < total - 1 ? 'Moving to next question…' : 'Submitting your assessment…'}
          </p>
        )}

      </div>
    </div>
  );
};

export default Questionnaire;
