import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get('/api/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.log('Failed to fetch notifications:', err.response?.data);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await api.post(`/api/notifications/mark-read/${id}/`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.log('Failed to mark as read:', err.response?.data);
    }
  }

  async function markAllAsRead() {
    try {
      await api.post('/api/notifications/mark-all-read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.log('Failed to mark all as read:', err.response?.data);
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/discovery')}>
          ← back
        </button>
        <h1 style={styles.title}>notifications</h1>
        {unreadCount > 0 && (
          <button style={styles.markAllButton} onClick={markAllAsRead}>
            mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.emptyState}>loading...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.emptyState}>no notifications</div>
      ) : (
        <div style={styles.list}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                ...styles.card,
                backgroundColor: notification.is_read ? '#0A0A0A' : '#141414',
                borderLeft: notification.is_read ? '1px solid #1A1A1A' : '3px solid #E8512A',
              }}
              onClick={() => {
                if (!notification.is_read) markAsRead(notification.id);
              }}
            >
              {notification.notification_type === 'rejection' && (
                <div style={styles.icon}>
                  <span style={{ fontSize: '20px' }}>✕</span>
                </div>
              )}
              <div style={styles.content}>
                <span style={styles.titleText}>{notification.title}</span>
                <span style={styles.message}>{notification.message}</span>
                {notification.reason && (
                  <div style={styles.reasonBox}>
                    <span style={styles.reasonLabel}>reason:</span>
                    <span style={styles.reasonText}>"{notification.reason}"</span>
                  </div>
                )}
                <span style={styles.time}>
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              {!notification.is_read && (
                <div style={styles.unreadDot} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#080808',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#444',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    flex: 1,
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '28px',
    color: '#F5F5F5',
    fontWeight: 400,
    letterSpacing: '0.05em',
    margin: 0,
  },
  markAllButton: {
    background: 'none',
    border: '1px solid #333',
    color: '#666',
    fontSize: '11px',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '2px',
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyState: {
    textAlign: 'center',
    color: '#444',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: '40px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1A1A1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  titleText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#F5F5F5',
  },
  message: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#888',
  },
  reasonBox: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#0A0A0A',
    borderRadius: '2px',
  },
  reasonLabel: {
    fontSize: '10px',
    color: '#555',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '4px',
  },
  reasonText: {
    fontFamily: "'DM Serif Display', serif",
    fontStyle: 'italic',
    fontSize: '14px',
    color: '#F5F5F5',
  },
  time: {
    fontSize: '11px',
    color: '#444',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: '4px',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#E8512A',
    flexShrink: 0,
    marginTop: '4px',
  },
};

export default Notifications;