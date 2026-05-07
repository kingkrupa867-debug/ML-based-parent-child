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
          message: 'Your conversations are landing well. The current pattern shows strong connection and trust.',
          chartColor: '#1f8f58',
        };
      case 'Moderate':
        return {
          tone: 'moderate',
          message: 'There is a healthy base here, with a few habits that still need more consistency.',
          chartColor: '#b86a14',
        };
      case 'Weak':
        return {
          tone: 'weak',
          message: 'This result suggests the relationship needs steadier listening, clarity, and emotional safety.',
          chartColor: '#c2483f',
        };
      default:
        return {
          tone: 'moderate',
          message: 'Assessment complete.',
          chartColor: '#2dd4bf',
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
          backgroundColor: [getCategoryConfig(result.category).chartColor, 'rgba(148, 163, 184, 0.14)'],
          borderWidth: 0,
          cutout: '72%',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-container">
        <section className="surface-panel empty-state">
          <h2 className="empty-title">Result not found</h2>
          <Link to="/dashboard" className="btn btn-primary-custom">Back to dashboard</Link>
        </section>
      </div>
    );
  }

  const config = getCategoryConfig(result.category);
  const chartData = getScoreChartData();

  return (
    <div className="results-container fade-in">
      <section className="result-hero">
        <div className="result-copy">
          <span className={`category-badge ${config.tone}`}>{result.category}</span>
          <h1 className="result-title">Assessment result</h1>
          <p className="hero-subtitle">{config.message}</p>
          <div className="action-row">
            <Link to="/questionnaire" className="btn btn-primary-custom">Take another assessment</Link>
            <Link to="/history" className="btn btn-secondary-custom">View history</Link>
          </div>
        </div>

        <div className="score-panel">
          <div style={{ width: '220px', height: '220px' }}>
            {chartData && <Doughnut data={chartData} options={chartOptions} />}
          </div>
          <div className="score-number">{result.score.toFixed(2)} / 3.00</div>
          <div className="visually-muted">Scale: 1 weak, 2 moderate, 3 strong</div>
        </div>
      </section>

      <section className="surface-panel">
        <h3 className="section-title">Recommendations</h3>
        <p className="section-copy">These suggestions are based on the latest result and can guide your next few conversations.</p>
        {recommendations.length > 0 ? (
          <ul className="recommendations-list" style={{ marginTop: '18px' }}>
            {recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">{rec}</li>
            ))}
          </ul>
        ) : (
          <p className="muted-copy" style={{ marginTop: '18px' }}>No recommendations were returned for this result.</p>
        )}
      </section>
    </div>
  );
};

export default Results;
