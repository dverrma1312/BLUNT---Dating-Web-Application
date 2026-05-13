import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Questions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await api.get('/api/conversation/questions/');
      setQuestions(res.data);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setError('');

    try {
      const res = await api.post('/api/conversation/questions/', { question: newQuestion });
      setQuestions([...questions, res.data]);
      setNewQuestion('');
    } catch (err) {
      console.log('Add question error full:', JSON.stringify(err.response?.data));
      setError(err.response?.data?.error || 'Failed to add question.');
    }
  }

  async function handleDelete(question_id) {
    try {
      await api.delete(`/api/conversation/questions/${question_id}/`);
      setQuestions(questions.filter(q => q.id !== question_id));
    } catch (err) {
      setError('Failed to delete question.');
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.grain}></div>
      <p style={styles.loading}>loading...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Grain texture overlay */}
      <div style={styles.grain}></div>

      {/* Back button */}
      <button onClick={() => navigate('/matches')} style={styles.backButton}>
        ← back
      </button>

      {/* Blunt. wordmark with ember dot */}
      <h1 style={styles.logo}>
        blunt<span style={styles.period}>.</span>
        <span style={styles.emberDot}></span>
      </h1>

      {/* Subtext */}
      <p style={styles.subtitle}>Your questions.</p>
      <p style={styles.hint}>Write up to 5 questions for your match to answer.</p>

      {/* Error message */}
      {error && (
        <p style={styles.error}>{error}</p>
      )}

      {/* Questions list */}
      <div style={styles.questionsList}>
        {questions.map(q => (
          <div key={q.id} style={styles.questionCard}>
            <p style={styles.questionText}>{q.question}</p>
            <button
              onClick={() => handleDelete(q.id)}
              style={styles.deleteButton}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add question form */}
      {questions.length < 5 && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input
            type="text"
            placeholder="Write a question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.addButton}>
            Add question
          </button>
        </form>
      )}

      {/* Counter */}
      <p style={styles.counter}>{questions.length}/5 questions</p>

      {/* Done button */}
      {questions.length > 0 && (
        <button onClick={() => navigate('/discovery')} style={styles.doneButton}>
          Done
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
  backButton: {
    position: 'absolute',
    top: '60px',
    left: '24px',
    background: 'none',
    border: 'none',
    color: '#555555',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.1em',
    cursor: 'none',
    padding: 0,
    zIndex: 1,
    transition: 'color 0.2s',
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '64px',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    position: 'relative',
    marginBottom: '24px',
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
  subtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#888888',
    marginBottom: '4px',
    zIndex: 1,
  },
  hint: {
    fontSize: '12px',
    color: '#555555',
    fontFamily: "'DM Sans', sans-serif",
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
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '320px',
    marginBottom: '16px',
    zIndex: 1,
  },
  questionCard: {
    backgroundColor: '#141414',
    borderRadius: '4px',
    border: '1px solid #222222',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  questionText: {
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    flex: 1,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#555555',
    fontSize: '18px',
    cursor: 'none',
    padding: 0,
    lineHeight: 1,
    transition: 'color 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '320px',
    marginBottom: '16px',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 16px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  },
  addButton: {
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
    transition: 'background-color 0.2s',
  },
  counter: {
    fontSize: '12px',
    color: '#555555',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.1em',
    textAlign: 'center',
    marginBottom: '24px',
    zIndex: 1,
  },
  doneButton: {
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
    maxWidth: '320px',
    zIndex: 1,
  },
  loading: {
    fontSize: '14px',
    color: '#888888',
    fontFamily: "'DM Sans', sans-serif",
    zIndex: 1,
  },
};

export default Questions;