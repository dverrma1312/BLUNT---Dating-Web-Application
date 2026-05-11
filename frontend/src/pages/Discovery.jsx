import { useState, useEffect } from 'react';  // imports hooks
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function Discovery() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);  // stores today's pool profiles
  const [loading, setLoading] = useState(true);  // tracks if data is loading
  const [error, setError] = useState('');  // stores error message
  const [selectCount, setSelectCount] = useState(0);  // tracks how many selects made today

  // fetch today's pool when page loads
  useEffect(() => {
    fetchPool();
  }, []);

  async function fetchPool() {
    try {
      // check if user is approved first
      const profileRes = await api.get('/api/users/profile/');
      if (!profileRes.data.is_approved) {
        navigate('/pending');  // redirect to pending page if not approved
        return;
      }

      const res = await api.get('/api/discovery/pool/');
      setProfiles(res.data.profiles);
      const selected = res.data.profiles.filter(p => p.was_selected).length;
      setSelectCount(selected);
    } catch (err) {
      setError('No profiles available yet. Check back at 8am.');
    } finally {
      setLoading(false);
    }
  }
  // handles selecting a profile
  async function handleSelect(pool_entry_id) {
    if (selectCount >= 5) {
      setError('You have reached your daily limit of 5 selects.');
      return;
    }

    try {
      const res = await api.post(`/api/discovery/select/${pool_entry_id}/`);  // select profile
      // update local state
      setProfiles(profiles.map(p =>
        p.pool_entry_id === pool_entry_id ? { ...p, was_selected: true } : p
      ));
      setSelectCount(selectCount + 1);

      // if match was created — notify user
      if (res.data.match_created) {
        alert('🎉 It\'s a match!');  // we will make this nicer later
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to select profile.');
    }
  }

  // handles passing on a profile
  async function handlePass(pool_entry_id) {
    try {
      await api.post(`/api/discovery/pass/${pool_entry_id}/`);  // pass profile
      // update local state
      setProfiles(profiles.map(p =>
        p.pool_entry_id === pool_entry_id ? { ...p, was_passed: true } : p
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pass profile.');
    }
  }

  if (loading) return <div style={styles.center}><p style={styles.muted}>loading...</p></div>;

  return (
    <div style={styles.container}>

      {/* header */}
      <div style={styles.header}>
        <h1 style={styles.title}>blunt.</h1>
        <div style={styles.headerRight}>
          <p style={styles.selectCount}>{selectCount}/5 Selects</p>
          <p style={styles.navLink} onClick={() => navigate('/matches')}>Matches</p>
        </div>
      </div>

      {/* error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* profiles list */}
      <div style={styles.profilesList}>
        {profiles.map(profile => (
          <div key={profile.pool_entry_id} style={styles.profileCard}>

            {/* photo */}
            {profile.photos.length > 0 && (
              <img
                src={`http://127.0.0.1:8000${profile.photos[0].image}`}
                alt={profile.name}
                style={styles.photo}
              />
            )}

            {/* profile info */}
            <div style={styles.profileInfo}>
              <div style={styles.profileTop}>
                <h2 style={styles.name}>
                  {profile.name}, {profile.dob ? Math.floor((new Date() - new Date(profile.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : ''}
                </h2>
                <p style={styles.city}>{profile.city}</p>
              </div>
              <p style={styles.description}>{profile.description}</p>

              {/* pills: category, relationship, religion, sexuality */}
              <div style={styles.pillsRow}>
                <span style={styles.pill}>{profile.category}</span>
                {profile.relationship_type && <span style={styles.pill}>{profile.relationship_type}</span>}
                {profile.religion && <span style={styles.pill}>{profile.religion}</span>}
                {profile.sexuality && <span style={styles.pill}>{profile.sexuality}</span>}
              </div>

              {/* lifestyle tags: drinks, smoke, weed, drugs */}
              <div style={styles.pillsRow}>
                {profile.alcohol && <span style={styles.smallPill}>Drinks</span>}
                {profile.smoke && <span style={styles.smallPill}>Smokes</span>}
                {profile.weed && <span style={styles.smallPill}>Weed</span>}
                {profile.drugs && <span style={styles.smallPill}>Drugs</span>}
              </div>
            </div>

            {/* action buttons — only show if not acted yet */}
            {!profile.was_selected && !profile.was_passed && (
              <div style={styles.actions}>
                <button
                  onClick={() => handlePass(profile.pool_entry_id)}
                  style={styles.passButton}
                >
                  pass
                </button>
                <button
                  onClick={() => handleSelect(profile.pool_entry_id)}
                  style={styles.selectButton}
                >
                  select
                </button>
              </div>
            )}

            {/* show status if already acted */}
            {profile.was_selected && <p style={styles.selectedTag}>selected</p>}
            {profile.was_passed && <p style={styles.passedTag}>passed</p>}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '-1px',
  },
  selectCount: {
    fontSize: '13px',
    color: '#888888',
  },
  navLink: {
    fontSize: '13px',
    color: '#888888',
    cursor: 'pointer',
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
  profilesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  profileCard: {
    backgroundColor: '#141414',
    borderRadius: '12px',
    border: '1px solid #222222',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    aspectRatio: '4/5',
    objectFit: 'cover',
  },
  profileInfo: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  profileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#F5F5F5',
  },
  city: {
    fontSize: '13px',
    color: '#888888',
  },
  description: {
    fontSize: '14px',
    color: '#AAAAAA',
    lineHeight: '1.5',
  },
  category: {
    fontSize: '12px',
    color: '#555555',
  },
  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px',
  },
  pill: {
    backgroundColor: '#1a1a1a',
    color: '#888888',
    border: '1px solid #222222',
    borderRadius: '999px',
    padding: '2px 10px',
    fontSize: '12px',
  },
  smallPill: {
    backgroundColor: '#1a1a1a',
    color: '#666666',
    border: '1px solid #222222',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '11px',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    padding: '16px',
    paddingTop: '0',
  },
  passButton: {
    backgroundColor: '#141414',
    color: '#888888',
    border: '1px solid #222222',
  },
  selectButton: {
    backgroundColor: '#F5F5F5',
    color: '#0A0A0A',
  },
  selectedTag: {
    fontSize: '12px',
    color: '#F5F5F5',
    textAlign: 'center',
    padding: '12px',
    borderTop: '1px solid #222222',
  },
  passedTag: {
    fontSize: '12px',
    color: '#555555',
    textAlign: 'center',
    padding: '12px',
    borderTop: '1px solid #222222',
  },
  muted: {
    color: '#888888',
    fontSize: '14px',
  },
};

export default Discovery;  // export so App.js can use it