import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function ChatPanel({
  matchId,
  userId,
  chatMessages,
  chatInput,
  setChatInput,
  setChatMessages,
  setWsError,
  chatBottomRef,
  setActiveView,
  setShowRemoveModal,
  setRemoveReason,
  setRemoveError,
}) {
  const chatWsRef = useRef(null);
  const [wsError, setLocalWsError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) return;

    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/ws/chat/${matchId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    chatWsRef.current = ws;

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
    };

    ws.onmessage = (event) => {
      console.log('WS message received:', event.data);
      const data = JSON.parse(event.data);
      console.log('Parsed data:', data);
      if (data.type === 'chat_message' || data.id) {
        const content = data.content || data.message || data.text || '';
        const sender = data.sender || data.sender_id || data.user_id || null;
        const timestamp = data.sent_at || data.timestamp || new Date().toISOString();
        setChatMessages(prev => [...prev, {
          id: data.id || Date.now(),
          sender: sender,
          sender_name: data.sender_name || data.senderName || '',
          content: content,
          timestamp: timestamp,
        }]);
      }
    };

    ws.onerror = (err) => {
      console.log('WebSocket error:', err);
    };

    ws.onclose = (e) => {
      console.log('Chat WebSocket closed:', e.code, e.reason);
      if (e.code !== 1000) {
        setLocalWsError(true);
        setWsError(true);
      }
    };

    return () => {
      ws.close();
    };
  }, [matchId]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatBottomRef]);

  function sendChatMessage() {
    if (!chatInput.trim() || !chatWsRef.current) return;
    chatWsRef.current.send(JSON.stringify({ content: chatInput }));
    setChatInput('');
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 5,
      position: 'relative',
      backgroundColor: '#080808',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #1A1A1A'
      }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#444',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}
          onClick={() => setActiveView(null)}
        >
          ← back
        </button>
        <button
          style={{
            background: 'none',
            border: '1px solid #333',
            color: '#666',
            fontSize: '11px',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '2px',
            fontFamily: "'DM Sans', sans-serif"
          }}
          onClick={() => setShowRemoveModal(true)}
        >
          reject
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '16px',
        padding: '16px 24px',
        boxSizing: 'border-box',
        width: '100%',
      }}>
        {chatMessages.length === 0 && !wsError && (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: '#333',
            fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontStyle: 'italic'
          }}>
            connecting... if this persists, make sure the server is running with daphne
          </div>
        )}
        {chatMessages.length === 0 && wsError && (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: '#E8512A',
            fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontStyle: 'italic'
          }}>
            connection failed. refresh and try again.
          </div>
        )}
        {chatMessages.map((msg, idx) => {
          const isMine = msg.sender === userId;
          return (
            <div key={idx} style={{
              maxWidth: '65%',
              padding: '10px 14px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignSelf: isMine ? 'flex-end' : 'flex-start',
              backgroundColor: isMine ? '#F5F5F5' : '#141414',
              color: isMine ? '#0A0A0A' : '#F5F5F5',
            }}>
              <span style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
              }}>{msg.content}</span>
              <span style={{
                fontSize: '10px',
                color: '#888',
                marginTop: '4px',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #1A1A1A',
        padding: '16px 24px',
        boxSizing: 'border-box',
      }}>
        <input
          style={{
            flex: 1,
            backgroundColor: '#111',
            border: '1px solid #1E1E1E',
            borderRadius: '2px',
            padding: '12px 16px',
            color: '#F5F5F5',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
          }}
          placeholder="type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
        />
        <button
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#E8512A',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={sendChatMessage}
        >→</button>
      </div>
    </div>
  );
}

export default ChatPanel;