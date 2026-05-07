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

    if (diff > 0.1) return { status: 'improved', label: 'Improved' };
    if (diff < -0.1) return { status: 'declined', label: 'Declined' };
    return { status: 'no-change', label: 'No change' };
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

  const chartData = {
    labels: history.slice().reverse().map((_, index) => `Attempt ${history.length - index}`),
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
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="dashboard-title">Assessment history</h1>
          <p className="dashboard-subtitle">See how your communication score has changed over time.</p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary-custom">Back to dashboard</Link>
      </div>

      {familyHistory.length > 0 && (
        <section className="surface-panel">
          <h3 className="section-title">Family comparison</h3>
          <div className="stats-grid" style={{ marginTop: '18px' }}>
            <div className="stat-card">
              <div className="stat-label">Present score</div>
              <div className="stat-value">{familySummary?.current_score ? familySummary.current_score.toFixed(2) : familyHistory[0].score.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Previous score</div>
              <div className="stat-value">{familySummary?.previous_score ? familySummary.previous_score.toFixed(2) : (familyHistory[1] ? familyHistory[1].score.toFixed(2) : 'N/A')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ fontSize: '1.45rem' }}>{familySummary?.status_text || 'Needs first comparison'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Entries in family timeline</div>
              <div className="stat-value">{familyHistory.length}</div>
            </div>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">Progress over time</h3>
          <div className="chart-frame">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {history.length > 0 ? (
        <section className="surface-panel">
          <h3 className="section-title">All assessments</h3>
          <div className="table-shell" style={{ marginTop: '18px' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Category</th>
                  <th>Progress</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((result, index) => {
                  const progress = getProgressStatus(index);
                  return (
                    <tr key={result.id}>
                      <td>{history.length - index}</td>
                      <td>{formatDate(result.submitted_at)}</td>
                      <td>{result.score.toFixed(2)}</td>
                      <td style={{ color: getCategoryColor(result.category), fontWeight: 700 }}>{result.category}</td>
                      <td>
                        {progress ? (
                          <span className={`status-pill ${progress.status}`}>{progress.label}</span>
                        ) : (
                          <span className="visually-muted">{index === 0 ? 'Latest' : '-'}</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/results/${result.id}`} className="btn btn-secondary-custom">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="surface-panel empty-state">
          <h3 className="empty-title">No history yet</h3>
          <p className="empty-copy">Complete your first assessment to build a timeline here.</p>
          <Link to="/questionnaire" className="btn btn-primary-custom">Start assessment</Link>
        </section>
      )}

      {familyHistory.length > 0 && (
        <section className="surface-panel">
          <h3 className="section-title">Family timeline</h3>
          <div className="table-shell" style={{ marginTop: '18px' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {familyHistory.map((result) => (
                  <tr key={`family-${result.id}`}>
                    <td>{result.username}</td>
                    <td style={{ textTransform: 'capitalize' }}>{result.role}</td>
                    <td>{formatDate(result.submitted_at)}</td>
                    <td>{result.score.toFixed(2)}</td>
                    <td style={{ color: getCategoryColor(result.category), fontWeight: 700 }}>{result.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default History;
