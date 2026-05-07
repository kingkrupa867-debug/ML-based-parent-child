import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { submitQuestionnaire } from '../services/api';

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

const RATING_LABELS = {
  1: 'Never',
  2: 'Rarely',
  3: 'Sometimes',
  4: 'Often',
  5: 'Always',
};

const FAMILY_TYPES = [
  { value: 'Nuclear', label: 'Nuclear family' },
  { value: 'Joint', label: 'Joint family' },
  { value: 'Single-Parent', label: 'Single parent' },
  { value: 'Extended', label: 'Extended family' },
];

const Questionnaire = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [demographics, setDemographics] = useState({
    parent_age: '',
    child_age: '',
    family_type: 'Nuclear',
  });
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDemographicChange = (e) => {
    setDemographics({
      ...demographics,
      [e.target.name]: e.target.value,
    });
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers({
      ...answers,
      [questionIndex]: value,
    });
  };

  const getQuestions = () => (user?.role === 'child' ? CHILD_QUESTIONS : PARENT_QUESTIONS);

  const getQuestionKey = (index) => (user?.role === 'child' ? `cq${index + 1}` : `pq${index + 1}`);

  const validateDemographics = () => {
    if (!demographics.parent_age || !demographics.child_age) {
      toast.error('Please fill in all age fields');
      return false;
    }
    const parentAge = parseInt(demographics.parent_age, 10);
    const childAge = parseInt(demographics.child_age, 10);
    if (parentAge < 18 || parentAge > 100) {
      toast.error('Parent age must be between 18 and 100');
      return false;
    }
    if (childAge < 3 || childAge > 30) {
      toast.error('Child age must be between 3 and 30');
      return false;
    }
    return true;
  };

  const validateAnswers = () => {
    const questions = getQuestions();
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateDemographics()) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      return;
    }

    setIsLoading(true);

    try {
      const questions = getQuestions();
      const payload = {
        parent_age: parseInt(demographics.parent_age, 10),
        child_age: parseInt(demographics.child_age, 10),
        family_type: demographics.family_type,
      };

      questions.forEach((_, index) => {
        payload[getQuestionKey(index)] = answers[index];
      });

      const response = await submitQuestionnaire(payload);
      toast.success('Assessment submitted successfully!');
      const newResultId = response.result_id || response.id;
      navigate(`/results/${newResultId}`, { state: { result: response } });
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to submit questionnaire';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const questions = getQuestions();
  const progress = ((step - 1) / 2) * 100;

  return (
    <div className="questionnaire-container fade-in">
      <div className="progress-shell">
        <div className="progress-meta">
          <span>{step === 1 ? 'Step 1: Basic information' : 'Step 2: Communication review'}</span>
          <span>{step}/2</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {step === 1 && (
        <section className="surface-panel">
          <div className="assessment-header">
            <h2 className="section-title">Basic information</h2>
            <p className="section-copy">Set the context for the communication review before answering the questions.</p>
          </div>

          <div className="form-row" style={{ marginTop: '20px' }}>
            <div className="form-field">
              <label className="form-label-custom">Parent's age</label>
              <input
                type="number"
                name="parent_age"
                className="form-control-custom"
                placeholder="Enter parent's age"
                value={demographics.parent_age}
                onChange={handleDemographicChange}
                min="18"
                max="100"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label-custom">Child's age</label>
              <input
                type="number"
                name="child_age"
                className="form-control-custom"
                placeholder="Enter child's age"
                value={demographics.child_age}
                onChange={handleDemographicChange}
                min="3"
                max="30"
                required
              />
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '16px' }}>
            <label className="form-label-custom">Family type</label>
            <select
              name="family_type"
              className="select-custom"
              value={demographics.family_type}
              onChange={handleDemographicChange}
            >
              {FAMILY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="action-row" style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-primary-custom" onClick={handleNext}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <>
          <section className="surface-panel">
            <div className="assessment-header">
              <h2 className="section-title">Communication assessment</h2>
              <p className="section-copy">
                Rate how often each statement feels true for you. Use the same scale all the way through.
              </p>
            </div>
          </section>

          {questions.map((question, index) => (
            <div key={index} className="question-card">
              <p className="question-text">
                <span className="question-number">{index + 1}.</span> {question}
              </p>
              <div className="rating-options">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`rating-btn ${answers[index] === value ? 'selected' : ''}`}
                    onClick={() => handleAnswerChange(index, value)}
                  >
                    <div className="rating-value">{value}</div>
                    <span className="rating-label">{RATING_LABELS[value]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="action-row" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-secondary-custom" onClick={handleBack}>
              Back
            </button>
            <button type="button" className="btn btn-primary-custom" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit assessment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Questionnaire;
