import { useState, useEffect } from 'react';
import api from '../api/axios';

function AdminTest() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get('/api/discovery/admin-test/users/');
      setUsers(res.data);
    } catch (err) {
      setMessage('Failed to load users. Are you logged in as admin?');
    }
  }

  async function fetchUserPool(user) {
    setSelectedUser(user);
    setPoolData(null);
    setMessage('');
    try {
      const res = await api.get(`/api/discovery/admin-test/users/${user.id}/pool/`);
      setPoolData(res.data);
    } catch (err) {
      setMessage('Failed to load pool.');
    }
  }

  async function handleSimulateSelect(selectorId, targetId) {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/discovery/admin-test/users/', {
        selector_id: selectorId,
        target_id: targetId,
      });
      setMessage(res.data.match_created
        ? `✓ Match created between users!`
        : `✓ ${res.data.message}`
      );
      // refresh pool
      fetchUserPool(selectedUser);
    } catch (err) {
      setMessage('Failed to simulate selection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>blunt. <span style={styles.badge}>admin test panel</span></h1>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.layout}>

        {/* left — user list */}
        <div style={styles.userList}>
          <p style={styles.sectionLabel}>all users</p>
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => fetchUserPool(user)}
              style={{
                ...styles.userCard,
                borderColor: selectedUser?.id === user.id ? '#F5F5F5' : '#222222',
              }}
            >
              <p style={styles.userName}>{user.name}</p>
              <p style={styles.userMeta}>{user.gender} · {user.phone_number}</p>
              {!user.is_approved && <p style={styles.unapproved}>not approved</p>}
            </div>
          ))}
        </div>

        {/* right — pool data */}
        <div style={styles.poolPanel}>
          {!selectedUser && (
            <p style={styles.muted}>select a user to see their pool</p>
          )}

          {selectedUser && !poolData && (
            <p style={styles.muted}>loading...</p>
          )}

          {poolData && (
            <>
              <p style={styles.sectionLabel}>today's pool for {poolData.user.name}</p>

              {poolData.today.length === 0 && (
                <p style={styles.muted}>no pool generated today — run generate_daily_pools()</p>
              )}

              {poolData.today.map(entry => (
                <div key={entry.pool_entry_id} style={styles.poolCard}>
                  <div style={styles.poolCardLeft}>
                    <p style={styles.candidateName}>{entry.candidate.name}</p>
                    <p style={styles.candidateMeta}>{entry.candidate.gender} · {entry.candidate.city}</p>
                  </div>
                  <div style={styles.poolCardRight}>
                    {entry.was_selected && <span style={styles.tag}>liked</span>}
                    {entry.was_passed && <span style={styles.tagGray}>passed</span>}
                    {!entry.was_selected && !entry.was_passed && <span style={styles.tagGray}>no action</span>}

                    {/* simulate this candidate liking the user back */}
                    <button
                      style={styles.likeBackBtn}
                      disabled={loading}
                      onClick={() => handleSimulateSelect(entry.candidate.id, poolData.user.id)}
                    >
                      like back
                    </button>
                  </div>
                </div>
              ))}

              {poolData.past_selections.length > 0 && (
                <>
                  <p style={{ ...styles.sectionLabel, marginTop: '32px' }}>past selections</p>
                  {poolData.past_selections.map(entry => (
                    <div key={entry.pool_entry_id} style={styles.poolCard}>
                      <div style={styles.poolCardLeft}>
                        <p style={styles.candidateName}>{entry.candidate.name}</p>
                        <p style={styles.candidateMeta}>{entry.candidate.gender} · {entry.candidate.city} · {entry.date}</p>
                      </div>
                      <span style={styles.tag}>liked</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '-1px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    fontSize: '12px',
    color: '#888888',
    fontWeight: '400',
    backgroundColor: '#141414',
    border: '1px solid #222222',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  message: {
    fontSize: '13px',
    color: '#F5F5F5',
    backgroundColor: '#141414',
    border: '1px solid #222222',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '24px',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionLabel: {
    fontSize: '11px',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  userCard: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  userMeta: {
    fontSize: '12px',
    color: '#888888',
    marginTop: '2px',
  },
  unapproved: {
    fontSize: '11px',
    color: '#ff4444',
    marginTop: '4px',
  },
  poolPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  poolCard: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poolCardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  poolCardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  candidateName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  candidateMeta: {
    fontSize: '12px',
    color: '#888888',
  },
  tag: {
    fontSize: '11px',
    color: '#F5F5F5',
    backgroundColor: '#222222',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  tagGray: {
    fontSize: '11px',
    color: '#555555',
    backgroundColor: '#141414',
    border: '1px solid #222222',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  likeBackBtn: {
    fontSize: '12px',
    padding: '4px 12px',
    backgroundColor: '#F5F5F5',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  muted: {
    fontSize: '14px',
    color: '#555555',
  },
};

export default AdminTest;