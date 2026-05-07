import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getResultsHistory } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [familySummary, setFamilySummary] = useState(null);
  const [familyProfile, setFamilyProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getResultsHistory();
      setHistory(data.results || []);
      setFamilyHistory(data.family_results || []);
      setSummary(data.summary || null);
      setFamilySummary(data.family_summary || null);
      setFamilyProfile(data.family_profile || null);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestResult = () => {
    if (history.length === 0) return null;
    return history[0];
  };

  const getProgressStatus = () => {
    if (history.length < 2) return null;

    const latest = history[0].score;
    const previous = history[1].score;
    const diff = latest - previous;

    if (diff > 0.1) return { label: 'Improved', color: 'var(--success)' };
    if (diff < -0.1) return { label: 'Declined', color: 'var(--danger)' };
    return { label: 'No change', color: 'var(--warning)' };
  };

  const latestResult = getLatestResult();
  const progress = summary?.status_text ? { label: summary.status_text, color: getProgressStatus()?.color || 'var(--muted)' } : getProgressStatus();
  const familyLatest = familyHistory[0] || null;
  const familyPrevious = familyHistory[1] || null;

  const chartData = {
    labels: history.slice().reverse().map((_, index) => `Attempt ${index + 1}`),
    datasets: [
      {
        label: 'Communication Score',
        data: history.slice().reverse().map((result) => result.score),
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.14)',
        fill: true,
        tension: 0.32,
        pointBackgroundColor: '#2dd4bf',
        pointBorderColor: '#0d1320',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151f2e',
        titleColor: '#e5e7eb',
        bodyColor: '#a8b3c5',
        borderColor: 'rgba(148, 163, 184, 0.18)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Score: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        min: 1,
        max: 3,
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          color: '#a8b3c5',
          stepSize: 0.5,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#a8b3c5',
        },
      },
    },
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Strong':
        return 'var(--success)';
      case 'Moderate':
        return 'var(--warning)';
      case 'Weak':
        return 'var(--danger)';
      default:
        return 'var(--muted)';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.username || 'User'}.</h1>
          <p className="dashboard-subtitle">
            Review the latest communication picture and keep your progress moving.
          </p>
        </div>
        <div className="button-row-inline">
          <Link to="/questionnaire" className="btn btn-primary-custom">New assessment</Link>
          <Link to="/history" className="btn btn-secondary-custom">Open history</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total assessments</div>
          <div className="stat-value">{history.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Latest category</div>
          <div className="stat-value" style={{ color: latestResult ? getCategoryColor(latestResult.category) : 'var(--text)' }}>
            {latestResult ? latestResult.category : 'N/A'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Latest score</div>
          <div className="stat-value">{latestResult ? latestResult.score.toFixed(2) : '0.00'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Trend</div>
          <div className="stat-value" style={{ color: progress?.color || 'var(--muted)', fontSize: '1.8rem' }}>
            {progress ? progress.label : 'New'}
          </div>
        </div>
      </div>

      {familyLatest && (
        <section className="surface-panel">
          <div className="page-header">
            <div>
              <h3 className="section-title">Family progress</h3>
              <p className="section-copy">
                Shared trend for the
                {familyProfile ? ` ${familyProfile.surname} family` : ' connected family'}.
              </p>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Present family score</div>
              <div className="stat-value">{familySummary?.current_score ? familySummary.current_score.toFixed(2) : familyLatest.score.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Previous family score</div>
              <div className="stat-value">{familySummary?.previous_score ? familySummary.previous_score.toFixed(2) : (familyPrevious ? familyPrevious.score.toFixed(2) : 'N/A')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Family status</div>
              <div className="stat-value" style={{ fontSize: '1.45rem' }}>{familySummary?.status_text || 'Needs first comparison'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Latest family result</div>
              <div className="stat-value" style={{ color: getCategoryColor(familyLatest.category) }}>{familyLatest.category}</div>
            </div>
          </div>
        </section>
      )}

      <section className="surface-panel">
        <div className="page-header">
          <div>
            <h3 className="section-title">What to do next</h3>
            <p className="section-copy">Start a new review or compare today with previous assessments.</p>
          </div>
          <div className="button-row-inline">
            <Link to="/questionnaire" className="btn btn-primary-custom">Start review</Link>
            <Link to="/history" className="btn btn-secondary-custom">Compare results</Link>
          </div>
        </div>
      </section>

      {history.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">Progress over time</h3>
          <div className="chart-frame">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {history.length === 0 && (
        <section className="surface-panel empty-state">
          <h3 className="empty-title">No assessments yet</h3>
          <p className="empty-copy">Take your first communication review to populate the dashboard.</p>
          <Link to="/questionnaire" className="btn btn-primary-custom">Start assessment</Link>
        </section>
      )}

      {latestResult && (
        <section className="surface-panel">
          <div className="page-header">
            <div>
              <h3 className="section-title">Latest assessment</h3>
              <p className="section-copy">Your most recent score is ready to review in more detail.</p>
            </div>
            <Link to={`/results/${latestResult.id}`} className="btn btn-secondary-custom">View details</Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
