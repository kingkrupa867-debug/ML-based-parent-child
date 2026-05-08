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

    if (diff > 0.1) return { label: '↑ Improved', color: 'var(--success)' };
    if (diff < -0.1) return { label: '↓ Declined', color: 'var(--danger)' };
    return { label: '→ No change', color: 'var(--warning)' };
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
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleColor: '#e5e7eb',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Score: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        min: 1, max: 3,
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
        ticks: { color: '#94a3b8', stepSize: 0.5 },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Strong': return 'var(--success)';
      case 'Moderate': return 'var(--warning)';
      case 'Weak': return 'var(--danger)';
      default: return 'var(--muted)';
    }
  };

  if (isLoading) {
    return (
      <div className="ip-loading">
        <div className="ip-spinner" />
        <p style={{ color: '#64748b', fontSize: '.9rem' }}>Loading your dashboard…</p>
      </div>
    );
  }

  const trendBadge = progress
    ? (progress.label.includes('↑') ? 'up' : progress.label.includes('↓') ? 'down' : 'flat')
    : 'new';

  return (
    <div className="inner-wrap">
      {/* Header */}
      <div className="ip-header">
        <div>
          <h1 className="ip-title">Welcome back, {user?.username || 'User'} 👋</h1>
          <p className="ip-sub">Review your latest communication picture and keep your progress moving.</p>
        </div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <Link to="/session" className="ip-btn ip-btn-primary">New assessment</Link>
          <Link to="/history"       className="ip-btn ip-btn-ghost">View history</Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="ip-stats-grid">
        <div className="glass-card ip-stat-card">
          <div className="ip-stat-label">Total assessments</div>
          <div className="ip-stat-value">{history.length}</div>
          <span className="ip-stat-badge new">All time</span>
        </div>
        <div className="glass-card ip-stat-card">
          <div className="ip-stat-label">Latest category</div>
          <div className={`ip-stat-value ${latestResult?.category?.toLowerCase() || ''}`}>
            {latestResult ? latestResult.category : '—'}
          </div>
        </div>
        <div className="glass-card ip-stat-card">
          <div className="ip-stat-label">Latest score</div>
          <div className="ip-stat-value">{latestResult ? latestResult.score.toFixed(2) : '—'}</div>
          <div style={{ fontSize:'.75rem', color:'#94a3b8' }}>out of 3.00</div>
        </div>
        <div className="glass-card ip-stat-card">
          <div className="ip-stat-label">Trend</div>
          <div className="ip-stat-value" style={{ fontSize:'1.4rem' }}>
            {progress ? progress.label : 'New'}
          </div>
          <span className={`ip-stat-badge ${trendBadge}`}>
            {trendBadge === 'new' ? 'First result' : 'vs previous'}
          </span>
        </div>
      </div>

      {/* Family progress */}
      {familyLatest && (
        <div className="glass-card ip-panel">
          <div className="ip-panel-header">
            <div>
              <h3 className="ip-panel-title">Family progress</h3>
              <p className="ip-panel-sub">
                Shared trend for the{familyProfile ? ` ${familyProfile.surname} family` : ' connected family'}.
              </p>
            </div>
          </div>
          <div className="ip-stats-grid">
            <div className="ip-stat-card" style={{ background:'rgba(99,102,241,.04)', borderRadius:'12px' }}>
              <div className="ip-stat-label">Current family score</div>
              <div className="ip-stat-value">{(familySummary?.current_score ?? familyLatest.score).toFixed(2)}</div>
            </div>
            <div className="ip-stat-card" style={{ background:'rgba(99,102,241,.04)', borderRadius:'12px' }}>
              <div className="ip-stat-label">Previous family score</div>
              <div className="ip-stat-value">{familySummary?.previous_score ? familySummary.previous_score.toFixed(2) : (familyPrevious ? familyPrevious.score.toFixed(2) : '—')}</div>
            </div>
            <div className="ip-stat-card" style={{ background:'rgba(99,102,241,.04)', borderRadius:'12px' }}>
              <div className="ip-stat-label">Family status</div>
              <div className="ip-stat-value" style={{ fontSize:'1.1rem' }}>{familySummary?.status_text || 'First entry'}</div>
            </div>
            <div className="ip-stat-card" style={{ background:'rgba(99,102,241,.04)', borderRadius:'12px' }}>
              <div className="ip-stat-label">Family category</div>
              <div className={`ip-stat-value ${familyLatest.category?.toLowerCase()}`}>{familyLatest.category}</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {history.length > 0 && (
        <div className="glass-card ip-chart-wrap">
          <div className="ip-panel-header">
            <h3 className="ip-panel-title">Progress over time</h3>
            <Link to="/history" className="ip-btn ip-btn-ghost" style={{ fontSize:'.82rem', padding:'7px 14px' }}>See all</Link>
          </div>
          <div className="ip-chart-frame">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Latest result quick-link */}
      {latestResult && (
        <div className="glass-card ip-panel">
          <div className="ip-panel-header">
            <div>
              <h3 className="ip-panel-title">Latest assessment</h3>
              <p className="ip-panel-sub">Your most recent score — tap to see the full breakdown and tips.</p>
            </div>
            <Link to={`/results/${latestResult.id}`} className="ip-btn ip-btn-primary">
              View details
            </Link>
          </div>
          <span className={`ip-badge ${latestResult.category?.toLowerCase()}`}>
            {latestResult.category === 'Strong' ? '🌟' : latestResult.category === 'Moderate' ? '🔄' : '💭'} {latestResult.category}
          </span>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="glass-card ip-panel">
          <div className="ip-empty">
            <div className="ip-empty-icon">📋</div>
            <h3 className="ip-empty-title">No assessments yet</h3>
            <p className="ip-empty-sub">Take your first communication review to populate the dashboard.</p>
            <Link to="/session" className="ip-btn ip-btn-primary">Start assessment</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
