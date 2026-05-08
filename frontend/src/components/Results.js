import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { getResultsHistory, getRecommendations } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Results = () => {
  const { resultId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentResult, setParentResult] = useState(null); // joint session

  // Detect joint session
  const parentResultId = location.state?.parentResultId;

  useEffect(() => {
    const stateResult = location.state?.result;
    if (stateResult && String(stateResult.id || stateResult.result_id) === String(resultId)) {
      setResult(stateResult);
      setRecommendations(
        (stateResult.recommendations || []).map((item) => item.text || item)
      );
      setIsLoading(false);
      return;
    }

    const loadResult = async () => {
      try {
        const historyData = await getResultsHistory();
        const results = Array.isArray(historyData) ? historyData : (historyData.results || []);
        const foundResult = results.find((entry) => entry.id === parseInt(resultId, 10));

        if (!foundResult) {
          toast.error('Result not found');
          setIsLoading(false);
          return;
        }

        setResult(foundResult);
        if (foundResult.recommendations?.length) {
          setRecommendations(foundResult.recommendations.map((item) => item.text || item));
        }

        // Also fetch parent result for joint sessions
        if (parentResultId) {
          const pFound = results.find((e) => e.id === Number(parentResultId));
          if (pFound) setParentResult(pFound);
        }

        try {
          const recData = await getRecommendations(resultId);
          setRecommendations(recData.recommendations || []);
        } catch (recError) {
          console.error('Error fetching recommendations:', recError);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
        toast.error('Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [location.state, resultId]);

  const getCategoryConfig = (category) => {
    switch (category) {
      case 'Strong':
        return {
          tone: 'strong',
          emoji: '🌟',
          message: 'Your conversations are landing well. The current pattern shows strong connection and trust.',
          chartColor: '#34d399',
        };
      case 'Moderate':
        return {
          tone: 'moderate',
          emoji: '🔄',
          message: 'There is a healthy base here, with a few habits that still need more consistency.',
          chartColor: '#fbbf24',
        };
      case 'Weak':
        return {
          tone: 'weak',
          emoji: '💭',
          message: 'This result suggests the relationship needs steadier listening, clarity, and emotional safety.',
          chartColor: '#fb7185',
        };
      default:
        return {
          tone: 'moderate',
          emoji: '📊',
          message: 'Assessment complete.',
          chartColor: '#818cf8',
        };
    }
  };

  const getScoreChartData = () => {
    if (!result) return null;

    return {
      labels: ['Your Score', 'Remaining'],
      datasets: [
        {
          data: [result.score, 3 - result.score],
          backgroundColor: [getCategoryConfig(result.category).chartColor, 'rgba(148, 163, 184, 0.08)'],
          borderWidth: 0,
          cutout: '75%',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  if (isLoading) {
    return (
      <div className="ip-loading">
        <div className="ip-spinner" />
        <p style={{ color:'#64748b', fontSize:'.9rem' }}>Loading your result…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="inner-wrap">
        <div className="glass-card ip-panel">
          <div className="ip-empty">
            <div className="ip-empty-icon">🔍</div>
            <h2 className="ip-empty-title">Result not found</h2>
            <Link to="/dashboard" className="ip-btn ip-btn-primary">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const config = getCategoryConfig(result.category);
  const chartData = getScoreChartData();

  return (
    <div className="inner-wrap">
      {/* Breadcrumb */}
      <div className="ip-header" style={{ marginBottom:'20px' }}>
        <div>
          <h1 className="ip-title">Assessment result</h1>
          <p className="ip-sub">{config.message}</p>
        </div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <Link to="/session" className="ip-btn ip-btn-primary">New assessment</Link>
          <Link to="/history" className="ip-btn ip-btn-ghost">View history</Link>
        </div>
      </div>

      {/* ── Family session comparison banner ── */}
      {parentResult && (
        <div className="glass-card fam-compare-banner">
          <div className="fam-compare-title">
            <span>👨‍👩‍👧</span>
            <span>Family Session Results</span>
          </div>
          <div className="fam-compare-row">
            <div className="fam-compare-card fam-parent">
              <p className="fam-role">Parent</p>
              <p className="fam-score">{parentResult.score ?? parentResult.overall_score ?? '–'}<span>/50</span></p>
              <p className="fam-cat">{parentResult.category || '–'}</p>
            </div>
            <div className="fam-compare-vs">VS</div>
            <div className="fam-compare-card fam-child">
              <p className="fam-role">Child</p>
              <p className="fam-score">{result.score ?? result.overall_score ?? '–'}<span>/50</span></p>
              <p className="fam-cat">{result.category || '–'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero card */}
      <div className="glass-card ip-result-hero">
        <div>
          <span className={`ip-badge ${config.tone}`} style={{ marginBottom:'14px', display:'inline-flex' }}>
            {config.emoji} {result.category}
          </span>
          <p style={{ color:'#475569', fontSize:'1rem', lineHeight:1.75, maxWidth:'46ch', margin:'0 0 20px' }}>
            {config.message}
          </p>
          <div style={{ fontSize:'.82rem', color:'#94a3b8' }}>
            Scale: 1.00 = Weak · 2.00 = Moderate · 3.00 = Strong
          </div>
        </div>
        <div className="ip-score-ring">
          <div style={{ width:'180px', height:'180px', position:'relative' }}>
            {chartData && <Doughnut data={chartData} options={chartOptions} />}
          </div>
          <div className="ip-score-num">{result.score.toFixed(2)} / 3.00</div>
          <div className="ip-score-scale">Your score</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card ip-panel">
        <div className="ip-panel-header">
          <div>
            <h3 className="ip-panel-title">Recommendations</h3>
            <p className="ip-panel-sub">Suggestions based on this result — try applying one per week.</p>
          </div>
        </div>
        {recommendations.length > 0 ? (
          <ul className="ip-recs-list">
            {recommendations.map((rec, i) => (
              <li key={i} className="ip-rec-item">
                <div className="ip-rec-dot" />
                {rec}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color:'#94a3b8', fontSize:'.9rem', margin:0 }}>
            No recommendations returned for this result.
          </p>
        )}
      </div>
    </div>
  );
};

export default Results;
