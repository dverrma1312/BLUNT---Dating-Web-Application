const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.handlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.baseDelay = 1000;
    this.maxDelay = 30000;
    this.reconnectTimer = null;
    this.isConnecting = false;
    this.lastDisconnectTime = null;
    this.longDisconnectThreshold = 30000;
    this.longDisconnectCallback = null;
    this.isManualClose = false;
    this.subscriptions = new Set();
  }

  connect(url, options = {}) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = true;
    this.currentUrl = url;
    this.options = options;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] Connected to', url);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.lastDisconnectTime = null;
        this.isManualClose = false;
        this.emit('connected', { url });

        this.resubscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Received:', data);
          this.handleMessage(data);
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.log('[WS] Error:', error);
      };

      this.ws.onclose = (e) => {
        console.log('[WS] Closed:', e.code, e.reason);
        this.isConnecting = false;

        if (!this.isManualClose) {
          this.lastDisconnectTime = Date.now();
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    );

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.currentUrl) {
        this.connect(this.currentUrl, this.options);
      }
    }, delay);
  }

  handleMessage(data) {
    const { type } = data;

    if (type === 'match_created') {
      this.emit('match', data);
    } else if (type === 'answer_submitted') {
      this.emit('answer', data);
    } else if (type === 'chat_message') {
      this.emit('chat', data);
    } else if (type === 'notification') {
      this.emit('notification', data);
    }

    if (this.handlers.has('*')) {
      this.handlers.get('*').forEach(cb => cb(data));
    }

    if (this.handlers.has(type)) {
      this.handlers.get(type).forEach(cb => cb(data));
    }
  }

  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).forEach(cb => cb(data));
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.log('[WS] Cannot send, not connected');
    return false;
  }

  close() {
    this.isManualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Manual close');
      this.ws = null;
    }
  }

  resubscribe() {
    this.subscriptions.forEach(sub => {
      this.send(sub);
    });
  }

  subscribe(channel) {
    this.subscriptions.add(channel);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send(channel);
    }
  }

  unsubscribe(channel) {
    this.subscriptions.delete(channel);
  }
}

const wsManager = new WebSocketManager();

export function getWebSocketManager() {
  return wsManager;
}

export function createChatWebSocket(matchId, onMessage, onError, onClose) {
  const token = localStorage.getItem('access');
  if (!token) return null;

  const url = `${WS_BASE_URL}/ws/chat/${matchId}/?token=${token}`;
  const ws = new WebSocket(url);
  let reconnectAttempts = 0;
  const maxAttempts = 10;
  let reconnectTimer = null;
  let isManualClose = false;

  const scheduleReconnect = () => {
    if (reconnectAttempts >= maxAttempts || isManualClose) return;

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    console.log(`[Chat WS] Reconnecting in ${delay}ms`);

    reconnectTimer = setTimeout(() => {
      reconnectAttempts++;
      const newWs = createChatWebSocket(matchId, onMessage, onError, onClose);
      if (newWs) {
        Object.assign(ws, {
          onopen: () => { console.log('[Chat WS] Reconnected'); },
          onmessage: onMessage,
          onerror: onError,
          onclose: onClose,
        });
      }
    }, delay);
  };

  ws.onopen = () => {
    console.log('[Chat WS] Connected');
    reconnectAttempts = 0;
  };

  ws.onmessage = onMessage;

  ws.onerror = (err) => {
    console.log('[Chat WS] Error:', err);
    if (onError) onError(err);
  };

  ws.onclose = (e) => {
    console.log('[Chat WS] Closed:', e.code);
    if (onClose) onClose(e);
    if (!isManualClose && e.code !== 1000) {
      scheduleReconnect();
    }
  };

  ws.forceClose = () => {
    isManualClose = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws.close(1000, 'Manual close');
  };

  return ws;
}

export default wsManager;