import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Discovery() {
  const navigate = useNavigate();

  // Profile pool state
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectCount, setSelectCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User profile
  const [userProfile, setUserProfile] = useState(null);

  // Matches
  const [matches, setMatches] = useState([]);

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Current profile being viewed
  const [viewingProfile, setViewingProfile] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const profileRes = await api.get('/api/users/profile/');
      if (!profileRes.data.is_approved) {
        navigate('/pending');
        return;
      }
      setUserProfile(profileRes.data);

      // Fetch pool
      const poolRes = await api.get('/api/discovery/pool/');
      setProfiles(poolRes.data.profiles);
      const selected = poolRes.data.profiles.filter(p => p.was_selected).length;
      setSelectCount(selected);

      // Fetch matches
      try {
        const matchesRes = await api.get('/api/connections/');
        setMatches(matchesRes.data);
      } catch (e) {
        console.log('No matches yet');
      }

      // Fetch conversations
      try {
        const convRes = await api.get('/api/conversation/');
        setConversations(convRes.data);
      } catch (e) {
        console.log('No conversations yet');
      }
    } catch (err) {
      console.log('Discovery load error full:', JSON.stringify(err.response?.data));
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(pool_entry_id) {
    if (selectCount >= 5) {
      setError('You have reached your daily limit of 5 selects.');
      return;
    }

    try {
      const res = await api.post(`/api/discovery/select/${pool_entry_id}/`);
      setProfiles(profiles.map(p =>
        p.pool_entry_id === pool_entry_id ? { ...p, was_selected: true } : p
      ));
      setSelectCount(selectCount + 1);

      if (res.data.match_created) {
        alert('🎉 It\'s a match!');
        // Refresh matches
        const matchesRes = await api.get('/api/connections/');
        setMatches(matchesRes.data);
      }

      // Move to next profile
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to select profile.');
    }
  }

  async function handlePass(pool_entry_id) {
    try {
      await api.post(`/api/discovery/pass/${pool_entry_id}/`);
      setProfiles(profiles.map(p =>
        p.pool_entry_id === pool_entry_id ? { ...p, was_passed: true } : p
      ));
      // Move to next profile
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pass profile.');
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <p style={styles.loading}>loading...</p>
    </div>
  );

  const currentProfile = profiles[currentIndex];

  return (
    <div style={styles.container}>

      {/* Left Sidebar */}
      <aside style={styles.sidebar}>
        {/* User profile */}
        <div style={styles.userProfile}>
          <div style={styles.userAvatar}>
            {userProfile?.photos?.[0] ? (
              <img src={`http://127.0.0.1:8000${userProfile.photos[0].image}`} alt="user" style={styles.avatarImage} />
            ) : (
              <span style={styles.avatarPlaceholder}>?</span>
            )}
          </div>
          <span style={styles.userName}>{userProfile?.name || 'User'}</span>
        </div>

        {/* Matches section */}
        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarSectionTitle}>Matches</h3>
          <div style={styles.matchesRow}>
            {matches.slice(0, 6).map(match => (
              <div key={match.id} style={styles.matchAvatar} onClick={() => navigate(`/match/${match.id}/chat`)}>
                {match.other_user_photos?.[0] ? (
                  <img src={`http://127.0.0.1:8000${match.other_user_photos[0]}`} alt={match.other_user_name} style={styles.matchAvatarImage} />
                ) : (
                  <span style={styles.matchAvatarPlaceholder}>{match.other_user_name?.[0] || '?'}</span>
                )}
              </div>
            ))}
            {matches.length === 0 && (
              <span style={styles.emptyText}>no matches yet</span>
            )}
          </div>
        </div>

        {/* Conversations section */}
        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarSectionTitle}>Conversations</h3>
          <div style={styles.conversationsList}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                style={{
                  ...styles.conversationRow,
                  backgroundColor: selectedConversation === conv.id ? '#141414' : 'transparent',
                }}
                onClick={() => {
                  setSelectedConversation(conv.id);
                  navigate(`/match/${conv.id}/chat`);
                }}
              >
                <div style={styles.convAvatar}>
                  {conv.other_user_photos?.[0] ? (
                    <img src={`http://127.0.0.1:8000${conv.other_user_photos[0]}`} alt="" style={styles.convAvatarImage} />
                  ) : (
                    <span style={styles.convAvatarPlaceholder}>{conv.other_user_name?.[0] || '?'}</span>
                  )}
                </div>
                <div style={styles.convInfo}>
                  <span style={styles.convName}>{conv.other_user_name}</span>
                  <span style={styles.convPreview}>{conv.last_message || 'start a conversation'}</span>
                </div>
                {conv.is_turn && (
                  <span style={styles.yourMovePill}>Your move</span>
                )}
              </div>
            ))}
            {conversations.length === 0 && (
              <span style={styles.emptyText}>no conversations yet</span>
            )}
          </div>
        </div>

        {/* Bottom logo */}
        <div style={styles.sidebarBottom}>
          <span style={styles.sidebarLogo}>blunt.</span>
        </div>
      </aside>

      {/* Main Area */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <h1 style={styles.mainLogo}>
            blunt<span style={styles.mainLogoPeriod}>.</span>
            <span style={styles.mainLogoEmber}></span>
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <p style={styles.error}>{error}</p>
        )}

        {/* Profile Card */}
        {currentProfile ? (
          <div style={styles.profileCard}>
            {/* Large photo */}
            <div style={styles.photoContainer}>
              {currentProfile.photos?.length > 0 ? (
                <img
                  src={`http://127.0.0.1:8000${currentProfile.photos[0].image}`}
                  alt={currentProfile.name}
                  style={styles.profilePhoto}
                  onClick={() => setViewingProfile(currentProfile)}
                />
              ) : (
                <div style={styles.noPhoto}>No photo</div>
              )}

              {/* Name & age overlay */}
              <div style={styles.photoOverlay}>
                <h2 style={styles.profileName}>{currentProfile.name}, {currentProfile.age || ''}</h2>
              </div>
            </div>

            {/* Action buttons */}
            {!currentProfile.was_selected && !currentProfile.was_passed && (
              <div style={styles.actionButtons}>
                <button
                  onClick={() => handlePass(currentProfile.pool_entry_id)}
                  style={styles.passButton}
                >
                  ✕
                </button>
                <button
                  onClick={() => handleSelect(currentProfile.pool_entry_id)}
                  style={styles.selectButton}
                >
                  ✓
                </button>
              </div>
            )}

            {/* Prompt questions */}
            {currentProfile.prompts?.length > 0 && (
              <div style={styles.promptsContainer}>
                {currentProfile.prompts.map((prompt, idx) => (
                  <div key={idx} style={styles.promptCard}>
                    <span style={styles.promptQuestion}>{prompt.question}</span>
                    <span style={styles.promptAnswer}>{prompt.answer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.noProfiles}>
            <p>no more profiles today.</p>
            <p style={styles.noProfilesSub}>check back at 8am</p>
          </div>
        )}
      </main>

      {/* Right Panel - Profile Details */}
      {viewingProfile && (
        <aside style={styles.rightPanel}>
          <button style={styles.closePanel} onClick={() => setViewingProfile(null)}>×</button>

          <div style={styles.detailSection}>
            <h3 style={styles.detailName}>{viewingProfile.name}, {viewingProfile.age || ''}</h3>
            <span style={styles.categoryPill}>{viewingProfile.category}</span>
          </div>

          <div style={styles.detailSection}>
            <span style={styles.detailLabel}>bio</span>
            <p style={styles.detailValue}>{viewingProfile.description || 'No bio yet.'}</p>
          </div>

          {viewingProfile.relationship_type && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>relationship</span>
              <span style={styles.detailValue}>{viewingProfile.relationship_type}</span>
            </div>
          )}

          {viewingProfile.religion && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>religion</span>
              <span style={styles.detailValue}>{viewingProfile.religion}</span>
            </div>
          )}

          {viewingProfile.sexuality && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>sexuality</span>
              <span style={styles.detailValue}>{viewingProfile.sexuality}</span>
            </div>
          )}

          {viewingProfile.city && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>location</span>
              <span style={styles.detailValue}>{viewingProfile.city}</span>
            </div>
          )}

          {/* Lifestyle tags */}
          <div style={styles.lifestyleRow}>
            {viewingProfile.alcohol && <span style={styles.lifestylePill}>drinks</span>}
            {viewingProfile.smoke && <span style={styles.lifestylePill}>smokes</span>}
            {viewingProfile.weed && <span style={styles.lifestylePill}>weed</span>}
            {viewingProfile.drugs && <span style={styles.lifestylePill}>drugs</span>}
          </div>
        </aside>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    backgroundColor: '#0A0A0A',
    position: 'relative',
    overflow: 'hidden',
  },
  loading: {
    color: '#888888',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    zIndex: 1,
  },

  // Sidebar
  sidebar: {
    width: '320px',
    minHeight: '100vh',
    borderRight: '1px solid #222222',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#0A0A0A',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '24px',
    borderBottom: '1px solid #222222',
    marginBottom: '24px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    color: '#555555',
    fontSize: '18px',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebarSection: {
    marginBottom: '24px',
  },
  sidebarSectionTitle: {
    color: '#555555',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  matchesRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  matchAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    flexShrink: 0,
  },
  matchAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  matchAvatarPlaceholder: {
    color: '#555555',
    fontSize: '16px',
  },
  conversationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  conversationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'none',
  },
  convAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  convAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  convAvatarPlaceholder: {
    color: '#555555',
    fontSize: '14px',
  },
  convInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  convName: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  convPreview: {
    color: '#555555',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  yourMovePill: {
    backgroundColor: '#E8512A',
    color: '#FFFFFF',
    fontSize: '10px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '4px 8px',
    borderRadius: '10px',
    flexShrink: 0,
  },
  emptyText: {
    color: '#444444',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebarBottom: {
    marginTop: 'auto',
    paddingTop: '24px',
    borderTop: '1px solid #222222',
  },
  sidebarLogo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '18px',
    color: '#333333',
    letterSpacing: '0.02em',
  },

  // Main area
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    zIndex: 1,
    overflowY: 'auto',
  },
  topBar: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '32px',
  },
  mainLogo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '22px',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    position: 'relative',
    margin: 0,
  },
  mainLogoPeriod: {
    position: 'relative',
  },
  mainLogoEmber: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    right: '-4px',
    top: '50%',
    transform: 'translateY(-50%)',
    animation: 'emberPulse 2s ease-in-out infinite',
    boxShadow: '0 0 10px 5px rgba(232, 81, 42, 0.5)',
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
  profileCard: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'none',
  },
  profilePhoto: {
    width: '100%',
    height: '70vh',
    objectFit: 'cover',
  },
  noPhoto: {
    width: '100%',
    height: '70vh',
    backgroundColor: '#141414',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555555',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '24px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  profileName: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
  },
  passButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    border: '1px solid #333333',
    color: '#888888',
    fontSize: '24px',
    cursor: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#E8512A',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '24px',
    cursor: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  promptCard: {
    backgroundColor: '#141414',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  promptQuestion: {
    fontSize: '12px',
    color: '#888888',
    fontFamily: "'DM Sans', sans-serif",
  },
  promptAnswer: {
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
  },
  noProfiles: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    color: '#555555',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
  },
  noProfilesSub: {
    fontSize: '12px',
    marginTop: '8px',
  },

  // Right panel
  rightPanel: {
    width: '280px',
    minHeight: '100vh',
    backgroundColor: '#141414',
    borderLeft: '1px solid #222222',
    padding: '24px',
    position: 'relative',
    zIndex: 2,
  },
  closePanel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#888888',
    fontSize: '24px',
    cursor: 'none',
  },
  detailSection: {
    marginBottom: '24px',
  },
  detailName: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '8px',
  },
  categoryPill: {
    backgroundColor: '#E8512A',
    color: '#FFFFFF',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '4px 12px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#555555',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
  },
  detailRow: {
    marginBottom: '16px',
  },
  lifestyleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '24px',
  },
  lifestylePill: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #222222',
    color: '#888888',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '4px 10px',
    borderRadius: '12px',
  },
};

export default Discovery;