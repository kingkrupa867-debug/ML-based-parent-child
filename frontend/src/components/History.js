import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getResultsHistory } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const History = () => {
  const [history, setHistory] = useState([]);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [familySummary, setFamilySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getResultsHistory();
      setHistory(data.results || []);
      setFamilyHistory(data.family_results || []);
      setFamilySummary(data.family_summary || null);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressStatus = (currentIndex) => {
    if (currentIndex >= history.length - 1) return null;

    const current = history[currentIndex].score;
    const next = history[currentIndex + 1].score;
    const diff = next - current;

    if (diff > 0.1) return { status: 'improved', label: '↑ Improved' };
    if (diff < -0.1) return { status: 'declined', label: '↓ Declined' };
    return { status: 'no-change', label: '→ No change' };
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Strong': return 'var(--success)';
      case 'Moderate': return 'var(--warning)';
      case 'Weak': return 'var(--danger)';
      default: return 'var(--muted)';
    }
  };

  const chartData = {
    labels: history.slice().reverse().map((_, index) => `Attempt ${history.length - index}`),
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="ip-loading">
        <div className="ip-spinner" />
        <p style={{ color:'#64748b', fontSize:'.9rem' }}>Loading history…</p>
      </div>
    );
  }

  return (
    <div className="inner-wrap">
      {/* Header */}
      <div className="ip-header">
        <div>
          <h1 className="ip-title">Assessment history</h1>
          <p className="ip-sub">Track how your communication score has changed over time.</p>
        </div>
        <Link to="/dashboard" className="ip-btn ip-btn-ghost">← Dashboard</Link>
      </div>

      {/* Family summary strip */}
      {familyHistory.length > 0 && (
        <div className="ip-stats-grid" style={{ marginBottom:'24px' }}>
          <div className="glass-card ip-stat-card">
            <div className="ip-stat-label">Current family score</div>
            <div className="ip-stat-value">{(familySummary?.current_score ?? familyHistory[0]?.score ?? 0).toFixed(2)}</div>
          </div>
          <div className="glass-card ip-stat-card">
            <div className="ip-stat-label">Previous family score</div>
            <div className="ip-stat-value">{familySummary?.previous_score ? familySummary.previous_score.toFixed(2) : (familyHistory[1] ? familyHistory[1].score.toFixed(2) : '—')}</div>
          </div>
          <div className="glass-card ip-stat-card">
            <div className="ip-stat-label">Family status</div>
            <div className="ip-stat-value" style={{ fontSize:'1rem' }}>{familySummary?.status_text || 'First entry'}</div>
          </div>
          <div className="glass-card ip-stat-card">
            <div className="ip-stat-label">Family entries</div>
            <div className="ip-stat-value">{familyHistory.length}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {history.length > 0 && (
        <div className="glass-card ip-chart-wrap">
          <h3 className="ip-panel-title" style={{ marginBottom:'20px' }}>Progress over time</h3>
          <div className="ip-chart-frame">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* My assessments table */}
      {history.length > 0 ? (
        <div className="glass-card ip-panel">
          <div className="ip-panel-header">
            <div>
              <h3 className="ip-panel-title">My assessments</h3>
              <p className="ip-panel-sub">All your personal communication records.</p>
            </div>
          </div>
          <div className="ip-table-wrap">
            <table className="ip-table">
              <thead>
                <tr>
                  <th>#</th><th>Date</th><th>Score</th><th>Category</th><th>Change</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((result, index) => {
                  const prog = getProgressStatus(index);
                  const pillClass = prog
                    ? (prog.status === 'improved' ? 'improved' : prog.status === 'declined' ? 'declined' : 'no-change')
                    : (index === 0 ? 'latest' : 'no-change');
                  return (
                    <tr key={result.id}>
                      <td className="td-bold">{history.length - index}</td>
                      <td>{formatDate(result.submitted_at)}</td>
                      <td className="td-bold">{result.score.toFixed(2)}</td>
                      <td>
                        <span className={`ip-badge ${result.category?.toLowerCase()}`}>
                          {result.category}
                        </span>
                      </td>
                      <td>
                        <span className={`ip-pill ${pillClass}`}>
                          {prog ? prog.label : (index === 0 ? '✦ Latest' : '—')}
                        </span>
                      </td>
                      <td>
                        <Link to={`/results/${result.id}`} className="ip-btn ip-btn-ghost" style={{ fontSize:'.82rem', padding:'7px 14px' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card ip-panel">
          <div className="ip-empty">
            <div className="ip-empty-icon">📈</div>
            <h3 className="ip-empty-title">No history yet</h3>
            <p className="ip-empty-sub">Complete your first assessment to build a timeline here.</p>
            <Link to="/session" className="ip-btn ip-btn-primary">Start assessment</Link>
          </div>
        </div>
      )}

      {/* Family timeline */}
      {familyHistory.length > 0 && (
        <div className="glass-card ip-panel">
          <div className="ip-panel-header">
            <div>
              <h3 className="ip-panel-title">Family timeline</h3>
              <p className="ip-panel-sub">Combined records from connected family members.</p>
            </div>
          </div>
          <div className="ip-table-wrap">
            <table className="ip-table">
              <thead>
                <tr><th>Member</th><th>Role</th><th>Date</th><th>Score</th><th>Category</th></tr>
              </thead>
              <tbody>
                {familyHistory.map((result) => (
                  <tr key={`family-${result.id}`}>
                    <td className="td-bold">{result.username}</td>
                    <td style={{ textTransform:'capitalize' }}>{result.role}</td>
                    <td>{formatDate(result.submitted_at)}</td>
                    <td className="td-bold">{result.score.toFixed(2)}</td>
                    <td>
                      <span className={`ip-badge ${result.category?.toLowerCase()}`}>{result.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
