import { useState, useEffect } from 'react';  // imports hooks
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance
import { getWebSocketManager } from '../api/websocket';

function Matches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);  // stores all matches
  const [loading, setLoading] = useState(true);  // tracks if data is loading
  const [error, setError] = useState('');  // stores error message

  // fetch matches when page loads and set up polling
  useEffect(() => {
    fetchMatches();
    setupRealtimeUpdates();
  }, []);

  function setupRealtimeUpdates() {
    const wsManager = getWebSocketManager();
    const token = localStorage.getItem('access');
    if (!token) return;

    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000'}/ws/notifications/?token=${token}`;
    if (wsManager.ws?.readyState !== WebSocket.OPEN) {
      wsManager.connect(wsUrl);
    }

    const unsubMatch = wsManager.on('match', (data) => {
      console.log('[Matches] New match received:', data);
      fetchMatches();
    });

    const pollInterval = setInterval(fetchMatches, 10000);

    return () => {
      unsubMatch();
      clearInterval(pollInterval);
    };
  }

  async function fetchMatches() {
    try {
      const res = await api.get('/api/connections/matches/');  // fetch all matches
      setMatches(res.data);
    } catch (err) {
      setError('Failed to load matches.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={styles.center}><p style={styles.muted}>loading...</p></div>;

  return (
    <div style={styles.container}>

      {/* header */}
      <div style={styles.header}>
        <p style={styles.back} onClick={() => navigate('/discovery')}>← back</p>
        <h1 style={styles.title}>matches</h1>
      </div>

      {/* error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* empty state */}
      {matches.length === 0 && (
        <p style={styles.muted}>no matches yet. keep selecting.</p>
      )}

      {/* matches list */}
      <div style={styles.matchList}>
        {matches.map(match => (
          <div key={match.id} style={styles.matchCard}>

            {/* match info */}
            <div style={styles.matchInfo}>
              <h2 style={styles.name}>{match.other_user.name}</h2>
              <p style={styles.city}>{match.other_user.city}</p>
              <p style={styles.status}>{match.status}</p>
            </div>

            {/* action buttons */}
            {match.status === 'active' && (
              <div style={styles.actions}>
                <button
                  onClick={() => navigate(`/match/${match.id}/answers`)}
                  style={styles.answerButton}
                >
                  answer questions
                </button>
                <button
                  onClick={() => navigate(`/match/${match.id}/chat`)}
                  style={styles.chatButton}
                >
                  chat
                </button>
              </div>
            )}

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
    marginBottom: '32px',
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
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  matchCard: {
    backgroundColor: '#141414',
    borderRadius: '12px',
    border: '1px solid #222222',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  matchInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    fontSize: '18px',
    fontWeight: '500',
  },
  city: {
    fontSize: '13px',
    color: '#888888',
  },
  status: {
    fontSize: '12px',
    color: '#555555',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  answerButton: {
    backgroundColor: '#141414',
    color: '#F5F5F5',
    border: '1px solid #222222',
    fontSize: '13px',
  },
  chatButton: {
    backgroundColor: '#F5F5F5',
    color: '#0A0A0A',
    fontSize: '13px',
  },
};

export default Matches;  // export so App.js can use it