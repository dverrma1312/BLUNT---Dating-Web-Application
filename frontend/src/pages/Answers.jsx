import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getWebSocketManager } from '../api/websocket';

function Answers() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [existingAnswers, setExistingAnswers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatUnlocked, setChatUnlocked] = useState(false);

  useEffect(() => {
    fetchData();
    setupRealtimeUpdates();
  }, [id]);

  function setupRealtimeUpdates() {
    const wsManager = getWebSocketManager();
    const token = localStorage.getItem('access');
    if (!token) return;

    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000'}/ws/notifications/?token=${token}`;
    if (wsManager.ws?.readyState !== WebSocket.OPEN) {
      wsManager.connect(wsUrl);
    }

    const unsubAnswer = wsManager.on('answer', (data) => {
      console.log('[Answers] New answer received:', data);
      if (data.match_id === parseInt(id)) {
        fetchData();
      }
    });

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 15000);

    return () => {
      unsubAnswer();
      clearInterval(pollInterval);
    };
  }

  async function fetchData() {
    try {
      // fetch existing answers for this match
      const answersRes = await api.get(`/api/conversation/match/${id}/answers/`);
      setExistingAnswers(answersRes.data);

      // fetch the other user's questions directly via match
      const questionsRes = await api.get(`/api/conversation/match/${id}/questions/`);
      setQuestions(questionsRes.data);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(question_id) {
    const answer = answers[question_id];
    if (!answer?.trim()) return;
    setError('');

    try {
      const res = await api.post(`/api/conversation/match/${id}/answers/`, {
        question: question_id,
        answer,
      });

      setExistingAnswers([...existingAnswers, { question: question_id, answer }]);
      setAnswers({ ...answers, [question_id]: '' });

      if (res.data.chat_unlocked) {
        setChatUnlocked(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer.');
    }
  }

  function isAnswered(question_id) {
    return existingAnswers.some(a => a.question === question_id);
  }

  if (loading) return <div style={styles.center}><p style={styles.muted}>loading...</p></div>;

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <p style={styles.back} onClick={() => navigate('/matches')}>← back</p>
        <h1 style={styles.title}>answer questions</h1>
      </div>

      <p style={styles.subtitle}>answer your match's questions to unlock chat</p>

      {error && <p style={styles.error}>{error}</p>}

      {chatUnlocked && (
        <div style={styles.unlockedBanner}>
          <p>chat is unlocked 🎉</p>
          <p style={styles.chatLink} onClick={() => navigate(`/match/${id}/chat`)}>
            go to chat →
          </p>
        </div>
      )}

      <div style={styles.questionsList}>
        {questions.map(q => (
          <div key={q.id} style={styles.questionCard}>
            <p style={styles.questionText}>{q.question}</p>

            {!isAnswered(q.id) ? (
              <div style={styles.answerForm}>
                <input
                  type="text"
                  placeholder="your answer..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
                <button onClick={() => handleAnswer(q.id)}>submit</button>
              </div>
            ) : (
              <p style={styles.answeredTag}>answered ✓</p>
            )}
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <p style={styles.muted}>your match has not set any questions yet.</p>
      )}

    </div>
  );
}

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
  unlockedBanner: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  chatLink: {
    color: '#F5F5F5',
    cursor: 'pointer',
    fontSize: '13px',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionCard: {
    backgroundColor: '#141414',
    borderRadius: '8px',
    border: '1px solid #222222',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionText: {
    fontSize: '14px',
  },
  answerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  answeredTag: {
    fontSize: '12px',
    color: '#555555',
  },
  muted: {
    fontSize: '14px',
    color: '#888888',
  },
};

export default Answers;