import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function IntentSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    what_are_you_doing: '',
    looking_for: '',
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
          looking_for: res.data.looking_for || '',
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>what are you looking for tonight</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>

          <textarea
            name="what_are_you_doing"
            placeholder="what are you doing tonight?"
            value={form.what_are_you_doing}
            onChange={handleChange}
            rows={3}
            style={styles.textarea}
          />

          <p style={styles.label}>i am looking for</p>
          <div style={styles.categoryGrid}>
            {[
              { value: 'hookup', label: 'hookup' },
              { value: 'hangout', label: 'hangout' },
              { value: 'smokeup', label: 'smoke up' },
              { value: 'coffee', label: 'coffee & chill' },
            ].map(cat => (
              <div
                key={cat.value}
                onClick={() => setForm({ ...form, looking_for: cat.value })}
                style={{
                  ...styles.categoryCard,
                  borderColor: form.looking_for === cat.value ? '#F5F5F5' : '#222222',
                  color: form.looking_for === cat.value ? '#F5F5F5' : '#888888',
                }}
              >
                {cat.label}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading || !form.looking_for}>
            {loading ? 'saving...' : 'continue'}
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
  label: {
    fontSize: '13px',
    color: '#888888',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  categoryCard: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #222222',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'border-color 0.2s, color 0.2s',
  },
};

export default IntentSetup;