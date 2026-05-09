import { useState, useEffect } from 'react';  // imports hooks
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function Rejections() {
  const navigate = useNavigate();

  const [rejections, setRejections] = useState([]);  // stores all rejections
  const [loading, setLoading] = useState(true);  // tracks if data is loading
  const [error, setError] = useState('');  // stores error message

  // fetch rejections when page loads
  useEffect(() => {
    fetchRejections();
  }, []);

  async function fetchRejections() {
    try {
      const res = await api.get('/api/connections/rejections/');  // fetch rejections
      setRejections(res.data);
    } catch (err) {
      setError('Failed to load rejections.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={styles.center}><p style={styles.muted}>loading...</p></div>;

  return (
    <div style={styles.container}>

      {/* header */}
      <div style={styles.header}>
        <p style={styles.back} onClick={() => navigate('/matches')}>← back</p>
        <h1 style={styles.title}>feedback</h1>
      </div>

      <p style={styles.subtitle}>anonymous feedback from people who passed on you</p>

      {/* error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* empty state */}
      {rejections.length === 0 && (
        <p style={styles.muted}>no feedback yet.</p>
      )}

      {/* rejections list */}
      <div style={styles.rejectionsList}>
        {rejections.map((rejection, index) => (
          <div key={index} style={styles.rejectionCard}>
            <p style={styles.reason}>{rejection.reason}</p>
            <p style={styles.date}>
              {new Date(rejection.rejected_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

// styles
const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  back: {
    fontSize: '14px',
    color: '#888888',
    cursor: 'pointer',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#888888',
    marginBottom: '24px',
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
  muted: {
    fontSize: '14px',
    color: '#888888',
  },
  rejectionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  rejectionCard: {
    backgroundColor: '#141414',
    borderRadius: '8px',
    border: '1px solid #222222',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  reason: {
    fontSize: '14px',
    flex: 1,
    lineHeight: '1.5',
  },
  date: {
    fontSize: '12px',
    color: '#555555',
    flexShrink: 0,
  },
};

export default Rejections;  // export so App.js can use it