import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const bottomRef = useRef(null);
  const wsRef = useRef(null);  // stores the WebSocket instance

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchMessages();
  }, []);

  // open WebSocket once we have myId
  useEffect(() => {
    if (!myId) return;

    const token = localStorage.getItem('access');
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection failed.');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, [myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchProfile() {
    try {
      const res = await api.get('/api/users/profile/');
      setMyId(res.data.id);
    } catch (err) {
      console.error('Failed to fetch profile.');
    }
  }

  async function fetchMessages() {
    try {
      const res = await api.get(`/api/conversation/match/${id}/chat/`);
      setMessages(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Connection lost. Please refresh.');
      return;
    }
    wsRef.current.send(JSON.stringify({ content: newMessage }));
    setNewMessage('');
  }

  if (loading) return <div style={styles.center}><p style={styles.muted}>loading...</p></div>;

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <p style={styles.back} onClick={() => navigate('/matches')}>← back</p>
        <h1 style={styles.title}>chat</h1>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.messagesList}>
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            style={{
              ...styles.messageBubble,
              alignSelf: msg.sender === myId ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === myId ? '#F5F5F5' : '#141414',
              color: msg.sender === myId ? '#0A0A0A' : '#F5F5F5',
            }}
          >
            <p style={styles.messageContent}>{msg.content}</p>
            <p style={styles.messageTime}>
              {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          placeholder="type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.sendButton}>send</button>
      </form>

    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px', maxWidth: '480px', margin: '0 auto' },
  center: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexShrink: 0 },
  back: { fontSize: '14px', color: '#888888', cursor: 'pointer' },
  title: { fontSize: '24px', fontWeight: '600', letterSpacing: '-1px' },
  error: { fontSize: '13px', color: '#ff4444', marginBottom: '16px', padding: '12px', backgroundColor: '#1a0000', borderRadius: '8px', border: '1px solid #330000', flexShrink: 0 },
  messagesList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  messageContent: { fontSize: '14px', lineHeight: '1.4' },
  messageTime: { fontSize: '10px', opacity: 0.5, alignSelf: 'flex-end' },
  inputForm: { display: 'flex', gap: '8px', flexShrink: 0 },
  input: { flex: 1 },
  sendButton: { width: 'auto', paddingLeft: '20px', paddingRight: '20px' },
  muted: { fontSize: '14px', color: '#888888' },
};

export default Chat;