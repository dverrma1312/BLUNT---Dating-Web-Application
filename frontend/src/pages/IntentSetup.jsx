import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function IntentSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    what_are_you_doing: '',
    plan_flexibility: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingIntent, setHasExistingIntent] = useState(false);

  const [flexibilityHover, setFlexibilityHover] = useState(false);
  const [flexibilityFocus, setFlexibilityFocus] = useState(false);

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
      setError(err.response?.data?.error || 'Failed to set intent. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: flexibilityHover ? '#1a1a1a' : '#141414',
    color: '#F5F5F5',
    border: flexibilityFocus ? '1px solid #FFFFFF' : (flexibilityHover ? '1px solid #888888' : '1px solid #333333'),
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>What Are You Looking For Tonight?</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>

          <textarea
            name="what_are_you_doing"
            placeholder="How's The Plan Tonight?"
            value={form.what_are_you_doing}
            onChange={handleChange}
            rows={3}
            style={styles.textarea}
          />

          <div onMouseEnter={() => setFlexibilityHover(true)} onMouseLeave={() => setFlexibilityHover(false)}>
            <select
              name="plan_flexibility"
              value={form.plan_flexibility}
              onChange={handleChange}
              onFocus={() => setFlexibilityFocus(true)}
              onBlur={() => setFlexibilityFocus(false)}
              style={selectStyle}
            >
              <option value="">Plan Flexibility</option>
              <option value="Fixed">Fixed</option>
              <option value="I Don't Know">I Don't Know</option>
              <option value="Up To You">Up To You</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </button>

        </form>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888888',
    marginBottom: '32px',
  },
  error: {
    fontSize: '13px',
    color: '#ff4444',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#1a0000',
    borderRadius: '8px',
    border: '1px solid #330000',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  textarea: {
    resize: 'none',
  },
};

export default IntentSetup;