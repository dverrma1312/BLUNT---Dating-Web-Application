import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BugReportButton from '../components/BugReportButton';
import ContextualSuggestion from '../components/ContextualSuggestion';

function IntentSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    what_are_you_doing: '',
    plan_flexibility: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingIntent, setHasExistingIntent] = useState(false);

  useEffect(() => {
    async function fetchExistingIntent() {
      try {
        const res = await api.get('/api/intent/');
        setForm({
          what_are_you_doing: res.data.what_are_you_doing || '',
          plan_flexibility: res.data.plan_flexibility || '',
        });
        setHasExistingIntent(true);
      } catch (err) {
        // no intent yet — form stays empty
      }
    }
    fetchExistingIntent();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFlexibilitySelect(value) {
    setForm({ ...form, plan_flexibility: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (hasExistingIntent) {
        await api.put('/api/intent/', form);
      } else {
        await api.post('/api/intent/', form);
      }
      navigate('/questions');
    } catch (err) {
      console.log('Intent setup error full:', JSON.stringify(err.response?.data));
      setError(err.response?.data?.error || 'Failed to set intent. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Get today's date formatted like "WED, 13 MAY 2026"
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const day = today.getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = today.getFullYear();
  const formattedDate = `${dayName}, ${day} ${monthName} ${year}`;

  const pillOptions = ['Fixed', "I Don't Know", 'Up To You'];

  const pillStyle = (isSelected) => ({
    padding: '10px 24px',
    backgroundColor: isSelected ? '#FFFFFF' : '#141414',
    color: isSelected ? '#0A0A0A' : '#888888',
    border: '1px solid #222222',
    borderRadius: '20px',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'none',
    transition: 'background-color 0.2s, color 0.2s',
  });

  return (
    <div style={styles.container}>
      {/* Grain texture overlay */}
      <div style={styles.grain}></div>

      {/* Blunt. wordmark with ember dot */}
      <h1 style={styles.logo}>
        blunt<span style={styles.period}>.</span>
        <span style={styles.emberDot}></span>
      </h1>

      {/* Today's date */}
      <p style={styles.date}>{formattedDate}</p>

      {/* Subtext */}
      <p style={styles.subtext}>What's the plan tonight?</p>

      {error && (
        <p style={styles.error}>{error}</p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Describe your plan */}
        <textarea
          name="what_are_you_doing"
          placeholder="Describe your plan..."
          value={form.what_are_you_doing}
          onChange={handleChange}
          rows={4}
          style={styles.textarea}
        />

        {/* Plan Flexibility - pill buttons */}
        <div style={styles.pillsContainer}>
          {pillOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleFlexibilitySelect(option)}
              style={pillStyle(form.plan_flexibility === option)}
            >
              {option}
            </button>
          ))}
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px 24px',
    position: 'relative',
  },
  grain: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    opacity: 0.05,
    pointerEvents: 'none',
    zIndex: 0,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '64px',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    position: 'relative',
    marginBottom: '4px',
    zIndex: 1,
  },
  period: {
    position: 'relative',
  },
  emberDot: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    animation: 'emberPulse 2s ease-in-out infinite',
    boxShadow: '0 0 15px 8px rgba(232, 81, 42, 0.5)',
  },
  date: {
    fontSize: '12px',
    color: '#555555',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '24px',
    zIndex: 1,
  },
  subtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#888888',
    marginBottom: '32px',
    zIndex: 1,
  },
  error: {
    fontSize: '13px',
    color: '#ff4444',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#1a0000',
    borderRadius: '8px',
    border: '1px solid #330000',
    zIndex: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '320px',
    zIndex: 1,
  },
  textarea: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 16px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    resize: 'none',
    minHeight: '120px',
    transition: 'border-color 0.2s',
  },
  pillsContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'none',
    width: '100%',
    marginTop: '8px',
  },
};

export default IntentSetup;