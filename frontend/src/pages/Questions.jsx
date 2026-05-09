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

  if (loading) return <div style={styles.center}><p style={styles.muted}>loading...</p></div>;

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <p style={styles.back} onClick={() => navigate('/matches')}>← back</p>
        <h1 style={styles.title}>your questions</h1>
      </div>

      <p style={styles.subtitle}>write up to 5 questions for your match to answer</p>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.questionsList}>
        {questions.map(q => (
          <div key={q.id} style={styles.questionCard}>
            <p style={styles.questionText}>{q.question}</p>
            <p style={styles.deleteLink} onClick={() => handleDelete(q.id)}>delete</p>
          </div>
        ))}
      </div>

      {questions.length < 5 && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input
            type="text"
            placeholder="write a question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            required
          />
          <button type="submit">add question</button>
        </form>
      )}

      <p style={styles.count}>{questions.length}/5 questions</p>

      {questions.length > 0 && (
        <button onClick={() => navigate('/discovery')} style={{ marginTop: '24px', width: '100%' }}>
          done →
        </button>
      )}

    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', padding: '24px', maxWidth: '480px', margin: '0 auto' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' },
  back: { fontSize: '14px', color: '#888888', cursor: 'pointer' },
  title: { fontSize: '24px', fontWeight: '600', letterSpacing: '-1px' },
  subtitle: { fontSize: '13px', color: '#888888', marginBottom: '24px' },
  error: { fontSize: '13px', color: '#ff4444', marginBottom: '16px', padding: '12px', backgroundColor: '#1a0000', borderRadius: '8px', border: '1px solid #330000' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  questionCard: { backgroundColor: '#141414', borderRadius: '8px', border: '1px solid #222222', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  questionText: { fontSize: '14px', flex: 1 },
  deleteLink: { fontSize: '12px', color: '#555555', cursor: 'pointer', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  count: { fontSize: '12px', color: '#555555', textAlign: 'center' },
  muted: { fontSize: '14px', color: '#888888' },
};

export default Questions;