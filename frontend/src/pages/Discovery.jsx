import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getWebSocketManager, createChatWebSocket } from '../api/websocket';
import FilterPanel from '../components/discovery/FilterPanel';
import BugReportButton from '../components/BugReportButton';
import ContextualSuggestion from '../components/ContextualSuggestion';

const INTENT_COLORS = {
  'Hookup': '#FF3B3B',
  'Hangout': '#FFB800',
  'Smoke Up': '#00D26A',
  'Coffee & Chill': '#A0785A',
};

function getPhotoUrl(photo) {
  if (!photo) return null;
  const url = photo.image || photo.cloudinary_image;
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:8000${url}`;
}

function calculateAge(dob) {
  if (!dob) return null;
  return new Date().getFullYear() - new Date(dob).getFullYear();
}

function Discovery() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectCount, setSelectCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [viewedProfiles, setViewedProfiles] = useState(new Set());

  const [userProfile, setUserProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);

  const [toast, setToast] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);

  // 3-panel layout state
  const [activeView, setActiveView] = useState(null); // null | { type: 'answers' | 'chat', matchId, otherUser }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatWsRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Answers state
  const [theirQuestions, setTheirQuestions] = useState([]);
  const [theirAnswers, setTheirAnswers] = useState({});
  const [myAnswers, setMyAnswers] = useState({});
  const [myQuestions, setMyQuestions] = useState([]);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerTexts, setAnswerTexts] = useState({});
  const [inlineQuestions, setInlineQuestions] = useState([]);
  const [inlineMyQuestions, setInlineMyQuestions] = useState([]);
  const [inlineAnswers, setInlineAnswers] = useState([]);
  const [inlineChatUnlocked, setInlineChatUnlocked] = useState(false);

  // Remove match modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [removeError, setRemoveError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [removeHovered, setRemoveHovered] = useState(false);
  const [removeFocus, setRemoveFocus] = useState(false);
  const [mySubmittedAnswerIds, setMySubmittedAnswerIds] = useState(new Set());
  const [wsError, setWsError] = useState(false);
  const [inlineAnswerInputs, setInlineAnswerInputs] = useState({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleFilterPanelClose = () => {
    setShowFilterPanel(false);
    fetchInitialData();
  };

  useEffect(() => {
    fetchInitialData();
    fetchNotificationCount();
    setupNotificationListener();
  }, []);

  function setupNotificationListener() {
    const wsManager = getWebSocketManager();
    const token = localStorage.getItem('access');
    if (!token) return;

    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000'}/ws/notifications/?token=${token}`;
    wsManager.connect(wsUrl);

    const unsubMatch = wsManager.on('match', (data) => {
      console.log('[Discovery] New match received:', data);
      api.get('/api/connections/matches/').then(res => {
        const activeMatches = res.data.filter(m => m.status === 'active');
        setMatches(activeMatches);
        setConversations(res.data);
        if (data.other_user_name) {
          setToast({ message: `New match: ${data.other_user_name}!`, type: 'match' });
          setTimeout(() => setToast(null), 3000);
        }
      }).catch(err => console.log('Failed to refresh matches:', err));
    });

    const unsubAnswer = wsManager.on('answer', (data) => {
      console.log('[Discovery] New answer received:', data);
      fetchInlineAnswersData(data.match_id);
    });

    return () => {
      unsubMatch();
      unsubAnswer();
    };
  }

  async function fetchNotificationCount() {
    try {
      const res = await api.get('/api/notifications/count/');
      setNotificationCount(res.data.unread_count);
    } catch (err) {
      console.log('notification count error:', err.response?.data);
    }
  }

  useEffect(() => {
    if (!activeView) {
      setInlineQuestions([]);
      setInlineMyQuestions([]);
      setInlineAnswers([]);
      setInlineChatUnlocked(false);
    } else if (activeView?.type === 'answers') {
      fetchInlineAnswersData(activeView.matchId);
    } else if (activeView?.type === 'chat' && userProfile) {
      setChatMessages([]);
      setWsError(false);
      fetchChatMessages(activeView.matchId);
      connectWebSocket(activeView.matchId);
    }
    return () => {
      if (chatWsRef.current) {
        chatWsRef.current.close();
        chatWsRef.current = null;
      }
    };
  }, [activeView, userProfile]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Reset remove modal when activeView becomes null
  useEffect(() => {
    if (!activeView) {
      setShowRemoveModal(false);
      setRemoveReason('');
      setRemoveError('');
    }
  }, [activeView]);

  // Contextual suggestions
  useEffect(() => {
    if (!userProfile) return;

    const availableProfiles = profiles.filter(p => !p.was_selected && !p.was_passed);

    if (availableProfiles.length === 0 && profiles.length === 0) {
      setSuggestion('No profiles in your pool. Try updating your daily intent to see new people.');
    } else if (availableProfiles.length === 0 && selectCount >= 5) {
      setSuggestion("You've seen everyone in your pool! Check back tomorrow for new profiles.");
    } else if (matches.length === 0 && profiles.length > 0 && selectCount === 0) {
      setSuggestion('No matches yet. Select people you like to get matched!');
    } else if (userProfile && !userProfile.is_profile_complete) {
      setSuggestion('Complete your profile to get better matches.');
    } else if (userProfile && !userProfile.photos?.length) {
      setSuggestion('Add photos to your profile to get more matches.');
    } else if (activeView?.type === 'chat' && chatMessages.length === 0) {
      setSuggestion('Break the ice! Send the first message.');
    } else {
      setSuggestion(null);
    }
  }, [profiles, matches, userProfile, selectCount, activeView, chatMessages]);

  async function fetchInitialData() {
    try {
      const profileRes = await api.get('/api/users/profile/');
      if (!profileRes.data.is_approved) {
        navigate('/pending');
        return;
      }
      setUserProfile(profileRes.data);

      const poolRes = await api.get('/api/discovery/pool/');
      setProfiles(poolRes.data.profiles);
      const selected = poolRes.data.profiles.filter(p => p.was_selected).length;
      setSelectCount(selected);

      try {
        const matchesRes = await api.get('/api/connections/matches/');
        console.log('MATCHES:', matchesRes.data);
        const activeMatches = matchesRes.data.filter(m => m.status === 'active');
        setMatches(activeMatches);
        setConversations(matchesRes.data);
      } catch (e) {
        console.log('matches error:', e.response?.status, e.response?.data);
      }
    } catch (err) {
      console.log('Discovery load error full:', JSON.stringify(err.response?.data));
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchChatMessages(matchId) {
    try {
      console.log('Fetching chat messages for match:', matchId);
      const res = await api.get(`/api/conversation/match/${matchId}/chat/`);
      console.log('Chat API response:', res.data);
      // Handle both { messages: [...] } and [...] response formats
      const msgs = Array.isArray(res.data) ? res.data : (res.data.messages || []);
      setChatMessages(msgs);
    } catch (err) {
      console.log('chat fetch error:', err.response?.data);
    }
  }

  async function connectWebSocket(matchId) {
    const token = localStorage.getItem('access');
    if (!token) return;

    if (chatWsRef.current) {
      chatWsRef.current.forceClose();
    }

    const handleMessage = (event) => {
      console.log('WS message received:', event.data);
      const data = JSON.parse(event.data);
      console.log('Parsed data:', data);
      if (data.type === 'chat_message' || data.id) {
        const content = data.content || data.message || data.text || '';
        const sender = data.sender || data.sender_id || data.user_id || null;
        const timestamp = data.sent_at || data.timestamp || new Date().toISOString();
        console.log('Adding message:', { content, sender, timestamp });
        setChatMessages(prev => {
          console.log('Current messages:', prev.length);
          return [...prev, {
            id: data.id || Date.now(),
            sender: sender,
            sender_name: data.sender_name || data.senderName || '',
            content: content,
            timestamp: timestamp,
          }];
        });
      }
    };

    const handleError = (err) => {
      console.log('WebSocket error:', err);
    };

    const handleClose = (e) => {
      console.log('Chat WebSocket closed:', e.code, e.reason);
      if (e.code !== 1000) {
        setWsError(true);
      }
    };

    const ws = createChatWebSocket(matchId, handleMessage, handleError, handleClose);
    chatWsRef.current = ws;
  }

  function sendChatMessage() {
    if (!chatInput.trim() || !chatWsRef.current) return;

    chatWsRef.current.send(JSON.stringify({ content: chatInput }));
    setChatInput('');
  }

  async function fetchAnswersData(matchId) {
    try {
      const questionsRes = await api.get(`/api/conversation/match/${matchId}/questions/`);
      setTheirQuestions(questionsRes.data.their_questions || []);
      console.log('theirQuestions:', questionsRes.data.their_questions);

      const answersRes = await api.get(`/api/conversation/match/${matchId}/answers/`);
      const theirAns = {};
      (answersRes.data.their_answers || []).forEach(a => {
        theirAns[a.question] = a.answer;
      });
      setTheirAnswers(theirAns);
      console.log('theirAnswers:', theirAns);

      const myAns = {};
      (answersRes.data.my_answers || []).forEach(a => {
        myAns[a.question] = a.answer;
      });
      setMyAnswers(myAns);
      console.log('myAnswers:', myAns);

      const myQuestionsRes = await api.get('/api/conversation/questions/');
      setMyQuestions(myQuestionsRes.data.questions || []);
      console.log('myQuestions:', myQuestionsRes.data.questions);
    } catch (err) {
      console.log('answers fetch error:', err.response?.data);
    }
  }

  async function fetchInlineAnswersData(matchId) {
    try {
      const [qRes, aRes, myQRes] = await Promise.all([
        api.get(`/api/conversation/match/${matchId}/questions/`),
        api.get(`/api/conversation/match/${matchId}/answers/`),
        api.get('/api/conversation/questions/'),
      ]);
      console.log('their questions:', qRes.data);
      console.log('answers:', aRes.data);
      console.log('my questions:', myQRes.data);
      setInlineQuestions(qRes.data.their_questions || qRes.data);
      setInlineAnswers(aRes.data);
      setInlineMyQuestions(myQRes.data.questions || myQRes.data);
      setInlineChatUnlocked(Object.keys(aRes.data.my_answers || {}).length >= 3);
    } catch (e) {
      console.error('fetchInlineAnswersData error:', e);
    }
  }

  async function handleInlineAnswer(questionId) {
    const answerText = inlineAnswerInputs[questionId];
    if (!answerText?.trim()) return;
    setAnswerLoading(true);
    try {
      await api.post(`/api/conversation/match/${activeView.matchId}/answers/`, {
        question: parseInt(questionId),
        answer: answerText,
      });
      setInlineAnswers(prev => Array.isArray(prev) ? [...prev, { question: parseInt(questionId), answer: answerText }] : [{ question: parseInt(questionId), answer: answerText }]);
      setInlineAnswerInputs(prev => ({ ...prev, [questionId]: '' }));
      setMySubmittedAnswerIds(prev => new Set([...prev, questionId]));
      await fetchInlineAnswersData(activeView.matchId);
    } catch (err) {
      console.log('submit answer error:', err.response?.data);
    } finally {
      setAnswerLoading(false);
    }
  }

  async function submitAnswer(questionId, answerText) {
    if (!answerText.trim()) return;
    setAnswerLoading(true);
    try {
      await api.post(`/api/conversation/match/${activeView.matchId}/answers/`, {
        question: questionId,
        answer: answerText,
      });
      setAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
      await fetchAnswersData(activeView.matchId);
    } catch (err) {
      console.log('submit answer error:', err.response?.data);
    } finally {
      setAnswerLoading(false);
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
      setToast({ message: 'Selected', type: 'select' });
      setTimeout(() => setToast(null), 2000);

      if (res.data.match_created) {
        alert('🎉 It\'s a match!');
        const matchesRes = await api.get('/api/connections/matches/');
        setMatches(matchesRes.data.filter(m => m.status === 'active'));
      }
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
      setToast({ message: 'Passed', type: 'pass' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pass profile.');
    }
  }

  async function handleRemoveMatch() {
    if (removeReason.trim().length < 10) {
      setRemoveError('please write at least 10 characters');
      return;
    }
    setRemoving(true);
    try {
      await api.post(`/api/connections/match/${activeView.matchId}/reject/`, {
        reason: removeReason,
      });
      setMatches(prev => prev.filter(m => m.id !== activeView.matchId));
      setConversations(prev => prev.filter(c => c.id !== activeView.matchId));
      setShowRemoveModal(false);
      setRemoveReason('');
      setRemoveError('');
      setActiveView(null);
    } catch (err) {
      setRemoveError(err.response?.data?.error || 'failed to remove match');
    } finally {
      setRemoving(false);
    }
  }

  function handleViewProfile(profile) {
    setViewingProfile(profile);
    setCurrentPhotoIndex(0);
    if (!viewedProfiles.has(profile.pool_entry_id)) {
      setViewedProfiles(new Set([...viewedProfiles, profile.pool_entry_id]));
      setViewCount(viewCount + 1);
    }
  }

  function handleImageError(poolEntryId) {
    setFailedImages(prev => ({ ...prev, [poolEntryId]: true }));
  }

  function getCategoryColor(category) {
    return INTENT_COLORS[category] || '#888888';
  }

  function getConversationProfile() {
    if (!activeView) return null;
    return activeView.otherUser;
  }

  if (loading) return (
    <div style={styles.container}>
      <p style={styles.loading}>loading...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Left Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.userProfile}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/my-profile')}>
            <div style={styles.userAvatar}>
              {userProfile?.photos?.[0] ? (
                <img src={getPhotoUrl(userProfile.photos[0])} alt="user" style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarPlaceholder}>?</span>
              )}
              <div style={styles.onlineDot} />
            </div>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{userProfile?.name || 'User'}</span>
            <span style={styles.userStats}>{selectCount} / 5 selects · {viewCount} / 10 views</span>
          </div>
          <div style={styles.notificationBell} onClick={() => navigate('/notifications')}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            {notificationCount > 0 && (
              <div style={styles.notificationBadge}>{notificationCount}</div>
            )}
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarSectionTitle}>Match Queue</h3>
          <div style={styles.matchesRow}>
            {matches.map(match => {
              const photoUrl = getPhotoUrl(match.other_user?.photos?.[0]);
              const truncatedName = match.other_user?.name?.slice(0, 8) || '?';
              const firstLetter = match.other_user?.name?.[0] || '?';
              return (
                <div
                  key={match.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    setActiveView({ type: 'answers', matchId: match.id, otherUser: match.other_user });
                    setViewingProfile(null);
                  }}
                >
                  {photoUrl ? (
                    <div style={styles.matchAvatar}>
                      <img src={photoUrl} alt={match.other_user?.name} style={styles.matchAvatarImage} />
                    </div>
                  ) : (
                    <div style={{ ...styles.matchAvatar, backgroundColor: '#1A1A1A', border: '1.5px solid #E8512A' }}>
                      <span style={{ color: '#F5F5F5', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" }}>{firstLetter}</span>
                    </div>
                  )}
                  <span style={{ color: '#555', fontSize: '10px', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: '40px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncatedName}</span>
                </div>
              );
            })}
            {matches.length === 0 && (
              <span style={styles.emptyText}>no matches yet</span>
            )}
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarSectionTitle}>Conversations</h3>
          <div style={styles.conversationsList}>
            {conversations.map(match => {
              const photoUrl = getPhotoUrl(match.other_user?.photos?.[0]);
              const firstLetter = match.other_user?.name?.[0] || '?';
              return (
                <div
                  key={match.id}
                  style={{
                    ...styles.conversationRow,
                    backgroundColor: selectedConversation === match.id ? '#141414' : 'transparent',
                  }}
                  onClick={() => {
                    setSelectedConversation(match.id);
                    setActiveView({ type: 'chat', matchId: match.id, otherUser: match.other_user });
                    setViewingProfile(null);
                  }}
                >
                  <div style={styles.convAvatar}>
                    {photoUrl ? (
                      <img src={photoUrl} alt="" style={styles.convAvatarImage} />
                    ) : (
                      <div style={{ ...styles.convAvatar, backgroundColor: '#1A1A1A' }}>
                        <span style={{ color: '#F5F5F5', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>{firstLetter}</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.convInfo}>
                    <span style={styles.convName}>{match.other_user?.name}</span>
                    <span style={styles.convPreview}>start a conversation</span>
                  </div>
                  <span style={styles.yourMovePill}>Your move →</span>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <span style={styles.emptyText}>no conversations</span>
            )}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'row', position: 'relative' }}>
        {/* Middle Panel - Discovery Grid OR Inline Answers/Chat */}
        <main style={styles.main}>
        {activeView === null ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: "32px", gap: "24px" }}>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '32px',
                fontWeight: 400,
                color: '#F5F5F5',
                letterSpacing: '0.02em',
                position: 'relative',
                margin: 0,
                display: 'inline-block',
              }}>
                BLUNT.
                <span style={{
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
                }} />
              </h1>
              <button
                onClick={() => setShowFilterPanel(true)}
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#888',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '14px' }}>⚙</span>
                Daily Intent
              </button>
            </div>
            <div style={styles.gridContainer}>
              {profiles.map((profile, idx) => {
                const profileAge = profile.dob ? calculateAge(profile.dob) : profile.age;
                const lifestylePills = [];
                if (profile.alcohol) lifestylePills.push('drinks');
                if (profile.smoke) lifestylePills.push('smokes');
                if (profile.weed) lifestylePills.push('weed');
                if (profile.drugs) lifestylePills.push('drugs');

                return (
                  <div
                    key={profile.profile_id}
                    style={{
                      ...styles.card,
                      opacity: profile.was_selected || profile.was_passed ? 0.45 : 1,
                      animationDelay: `${idx * 0.05}s`,
                    }}
                    className="card-fade-in"
                  >
                    {/* Photo - Left 55% */}
                    <div style={styles.cardPhoto} onClick={() => handleViewProfile(profile)}>
                      {profile.photos?.length > 0 && !failedImages[profile.profile_id] ? (
                        <img
                          src={getPhotoUrl(profile.photos[0])}
                          alt={profile.name}
                          style={{ ...styles.photo, display: 'block' }}
                          onError={() => handleImageError(profile.profile_id)}
                        />
                      ) : (
                        <div style={styles.noPhoto}>No photo</div>
                      )}

                      {/* Selected/Passed overlay */}
                      {profile.was_selected && (
                        <div style={styles.photoOverlay}>
                          <span style={styles.overlayText}>selected ✦</span>
                        </div>
                      )}
                      {profile.was_passed && !profile.was_selected && (
                        <div style={styles.photoOverlay}>
                          <span style={styles.overlayText}>passed</span>
                        </div>
                      )}
                    </div>

                    {/* Info - Right 45% */}
                    <div style={styles.cardInfo}>
                      <div style={styles.cardHeader}>
                        <span style={styles.cardName}>{profile.name}</span>
                        {profileAge && <span style={styles.cardAge}>, {profileAge}</span>}
                      </div>

                      {profile.category && (
                        <div style={{
                          ...styles.categoryBadge,
                          backgroundColor: getCategoryColor(profile.category),
                        }}>
                          {profile.category}
                        </div>
                      )}

                      {profile.description && (
                        <p style={styles.cardBio}>{profile.description.slice(0, 100)}...</p>
                      )}

                      {lifestylePills.length > 0 && (
                        <div style={styles.lifestyleRow}>
                          {lifestylePills.map(pill => (
                            <span key={pill} style={styles.lifestylePill}>{pill}</span>
                          ))}
                        </div>
                      )}

                      {/* Buttons */}
                      {!profile.was_selected && !profile.was_passed ? (
                        <div style={styles.cardButtons}>
                          <button style={styles.passButton} onClick={(e) => { e.stopPropagation(); handlePass(profile.pool_entry_id); }}>✕ Pass</button>
                          <button style={styles.selectButton} onClick={(e) => { e.stopPropagation(); handleSelect(profile.pool_entry_id); }}>✓ Select</button>
                        </div>
                      ) : (
                        <div style={styles.selectedButton}>
                          {profile.was_selected ? 'selected ✦' : 'passed'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {profiles.length === 0 && (
                <div style={styles.noProfiles}>
                  <p>no profiles today.</p>
                  <p style={styles.noProfilesSub}>pools refresh at 8am IST</p>
                </div>
              )}

              {suggestion && profiles.length > 0 && (
                <div style={{ marginTop: '-8px', marginBottom: '16px', padding: '0 4px' }}>
                  <ContextualSuggestion
                    suggestion={suggestion}
                    onDismiss={() => setSuggestion(null)}
                  />
                </div>
              )}
            </div>
          </>
        ) : activeView.type === 'answers' ? (
          <div style={{ ...styles.middlePanelContainer, padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
            {/* Remove Match Modal */}
            {showRemoveModal && (
              <div style={styles.removeModalOverlay}>
                <div style={styles.removeModalCard}>
                  <span style={styles.removeModalLabel}>why are you removing this match?</span>
                  <span style={{ ...styles.removeModalCharCount, color: removeReason.length >= 10 ? '#555' : '#E8512A', textAlign: 'right' }}>
                    {removeReason.length} / 100
                  </span>
                  <textarea
                    value={removeReason}
                    onChange={e => { if (e.target.value.length <= 100) setRemoveReason(e.target.value); }}
                    placeholder="be honest, they won't see your name..."
                    rows={2}
                    style={{
                      ...styles.removeModalTextarea,
                      borderColor: removeFocus ? '#E8512A' : '#1E1E1E',
                      padding: '10px 12px',
                      fontSize: '13px',
                    }}
                    onFocus={() => setRemoveFocus(true)}
                    onBlur={() => setRemoveFocus(false)}
                  />
                  {removeError && (
                    <span style={styles.removeModalError}>{removeError}</span>
                  )}
                  <div style={styles.removeModalButtons}>
                    <button
                      style={styles.removeModalCancel}
                      onClick={() => { setShowRemoveModal(false); setRemoveReason(''); setRemoveError(''); }}
                    >
                      cancel
                    </button>
                    <button
                      style={{
                        ...styles.removeModalConfirm,
                        backgroundColor: removing ? '#1A1A1A' : '#F5F5F5',
                        color: removing ? '#555' : '#0A0A0A',
                        cursor: removing ? 'not-allowed' : 'pointer',
                        padding: '8px 16px',
                      }}
                      onClick={handleRemoveMatch}
                      disabled={removing}
                    >
                      {removing ? 'removing...' : 'remove'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header with reject button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1A1A1A' }}>
              <button
                style={{ background: 'none', border: 'none', color: '#444', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setActiveView(null)}
              >
                ← back
              </button>
              <button
                style={{ background: 'none', border: '1px solid #333', color: '#666', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setShowRemoveModal(true)}
              >
                reject
              </button>
            </div>

            {/* Chat Unlocked Banner */}
            {inlineChatUnlocked && (
              <div style={styles.answersChatUnlockedBanner} onClick={() => setActiveView({ type: 'chat', matchId: activeView.matchId, otherUser: activeView.otherUser })}>
                chat unlocked — go to chat →
              </div>
            )}

            {/* Scrollable Content */}
            <div style={styles.answersScrollContent}>
              {/* Their Questions */}
              <div style={styles.answersSection}>
                <h3 style={styles.answersSectionTitle}>their questions</h3>
                {inlineQuestions.map((q, idx) => {
                  const myAnswer = Array.isArray(inlineAnswers) ? inlineAnswers.find(a => a.question === q.id) : null;
                  const wasJustSubmitted = mySubmittedAnswerIds.has(q.id);
                  return (
                    <div key={q.id || idx} style={styles.answersCard}>
                      <span style={styles.answersQuestionNumber}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={styles.answersQuestionText}>{q.text || q.question}</span>
                      {myAnswer || wasJustSubmitted ? (
                        <>
                          <span style={{
                            color: '#00D26A',
                            fontSize: '11px',
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: '0.1em',
                            marginTop: '10px',
                            display: 'block'
                          }}>✓ submitted</span>
                          <span style={{
                            display: 'block',
                            marginTop: '8px',
                            paddingLeft: '12px',
                            borderLeft: '2px solid #1E1E1E',
                            color: '#555',
                            fontSize: '13px',
                            fontFamily: "'DM Serif Display', serif",
                            fontStyle: 'italic',
                          }}>{myAnswer?.answer || inlineAnswerInputs[q.id]}</span>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                          <input
                            type="text"
                            placeholder="your answer..."
                            value={inlineAnswerInputs[q.id] || ''}
                            onChange={e => setInlineAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                            style={{
                              width: '100%',
                              backgroundColor: '#0D0D0D',
                              border: '1px solid #2A2A2A',
                              borderRadius: '2px',
                              padding: '12px 14px',
                              color: '#F5F5F5',
                              fontSize: '14px',
                              fontFamily: "'DM Sans', sans-serif",
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <button
                            onClick={() => handleInlineAnswer(q.id)}
                            style={{
                              width: 'auto',
                              alignSelf: 'flex-end',
                              padding: '8px 20px',
                              fontSize: '11px',
                            }}
                          >
                            submit →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* My Questions */}
              <div style={styles.answersSection}>
                <h3 style={styles.answersSectionTitle}>your questions</h3>
                {inlineMyQuestions.length === 0 ? (
                  <p style={{ color: '#333', fontSize: '12px', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                    you haven't set any questions yet
                  </p>
                ) : (
                  inlineMyQuestions.map((q, idx) => (
                    <div key={q.id || idx} style={styles.answersMyCard}>
                      <span style={styles.answersQuestionNumber}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={styles.answersQuestionText}>{q.text || q.question}</span>
                      {Array.isArray(inlineAnswers) && inlineAnswers.some(a => a.question === q.id) ? (
                        <span style={styles.answersAnsweredBadge}>✓ answered</span>
                      ) : (
                        <span style={styles.answersWaitingBadge}>waiting...</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Their Answers to Your Questions */}
              {(() => {
                const myQuestionIds = inlineMyQuestions.map(q => q.id || q);
                const theirAnswersToMyQ = (Array.isArray(inlineAnswers) ? inlineAnswers : []).filter(a =>
                  myQuestionIds.includes(a.question) &&
                  !mySubmittedAnswerIds.has(a.question)
                );
                return (
                  <div style={styles.answersSection}>
                    <h3 style={styles.answersSectionTitle}>their answers to your questions</h3>
                    {theirAnswersToMyQ.length === 0 && inlineMyQuestions.length > 0 ? (
                      <p style={{ color: '#333', fontSize: '12px', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                        waiting for their answers...
                      </p>
                    ) : (
                      theirAnswersToMyQ.map((a, idx) => {
                        const question = inlineMyQuestions.find(q => (q.id || q) === a.question);
                        return (
                          <div key={idx} style={{ ...styles.answersTheirCard, marginBottom: '16px' }}>
                            <span style={{ fontSize: '10px', color: '#444', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                              {question?.text || question?.question || 'your question'}
                            </span>
                            <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: '17px', color: '#F5F5F5', marginTop: '8px', display: 'block' }}>
                              {a.answer}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div style={{ ...styles.middlePanelContainer, padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
            {/* Remove Match Modal */}
            {showRemoveModal && (
              <div style={styles.removeModalOverlay}>
                <div style={styles.removeModalCard}>
                  <span style={styles.removeModalLabel}>why are you removing this match?</span>
                  <span style={{ ...styles.removeModalCharCount, color: removeReason.length >= 10 ? '#555' : '#E8512A', textAlign: 'right' }}>
                    {removeReason.length} / 100
                  </span>
                  <textarea
                    value={removeReason}
                    onChange={e => { if (e.target.value.length <= 100) setRemoveReason(e.target.value); }}
                    placeholder="be honest, they won't see your name..."
                    rows={2}
                    style={{
                      ...styles.removeModalTextarea,
                      borderColor: removeFocus ? '#E8512A' : '#1E1E1E',
                      padding: '10px 12px',
                      fontSize: '13px',
                    }}
                    onFocus={() => setRemoveFocus(true)}
                    onBlur={() => setRemoveFocus(false)}
                  />
                  {removeError && (
                    <span style={styles.removeModalError}>{removeError}</span>
                  )}
                  <div style={styles.removeModalButtons}>
                    <button
                      style={styles.removeModalCancel}
                      onClick={() => { setShowRemoveModal(false); setRemoveReason(''); setRemoveError(''); }}
                    >
                      cancel
                    </button>
                    <button
                      style={{
                        ...styles.removeModalConfirm,
                        backgroundColor: removing ? '#1A1A1A' : '#F5F5F5',
                        color: removing ? '#555' : '#0A0A0A',
                        cursor: removing ? 'not-allowed' : 'pointer',
                        padding: '8px 16px',
                      }}
                      onClick={handleRemoveMatch}
                      disabled={removing}
                    >
                      {removing ? 'removing...' : 'remove'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header with reject button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1A1A1A' }}>
              <button
                style={{ background: 'none', border: 'none', color: '#444', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setActiveView(null)}
              >
                ← back
              </button>
              <button
                style={{ background: 'none', border: '1px solid #333', color: '#666', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setShowRemoveModal(true)}
              >
                reject
              </button>
            </div>

            {/* Messages */}
            <div style={styles.chatMessages}>
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
                const isMine = msg.sender === userProfile?.id;
                return (
                  <div key={idx} style={{
                    ...styles.chatBubble,
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    backgroundColor: isMine ? '#F5F5F5' : '#141414',
                    color: isMine ? '#0A0A0A' : '#F5F5F5',
                  }}>
                    <span style={styles.chatBubbleText}>{msg.content}</span>
                    <span style={styles.chatTimestamp}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div style={styles.chatInputRow}>
              <input
                style={styles.chatInput}
                placeholder="type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button style={styles.sendButton} onClick={sendChatMessage}>→</button>
            </div>
          </div>
        )}
      </main>

      {/* Right Panel - Profile Detail OR Conversation Partner */}
      {(viewingProfile || activeView) && (
        <div style={styles.detailPanel}>
          <button style={styles.closePanel} onClick={() => { setViewingProfile(null); if (activeView) setActiveView(null); }}>✕</button>

          {activeView ? (
            <>
              {/* Chatting with label */}
              <div style={styles.chattingWithLabel}>chatting with</div>

              {/* Profile from conversation */}
              <div style={styles.photoCarousel}>
                {getConversationProfile()?.photos?.length > 0 ? (
                  <>
                    <img
                      src={getPhotoUrl(getConversationProfile().photos[0])}
                      alt=""
                      style={styles.carouselPhoto}
                    />
                    {getConversationProfile().photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i => Math.max(0, i - 1)); }}
                          style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 16,
                            display: currentPhotoIndex === 0 ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >‹</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i => Math.min(getConversationProfile().photos.length - 1, i + 1)); }}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 16,
                            display: currentPhotoIndex === getConversationProfile().photos.length - 1 ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >›</button>
                        <div style={styles.carouselDots}>
                          {getConversationProfile().photos.map((_, idx) => (
                            <div
                              key={idx}
                              style={{
                                ...styles.dot,
                                backgroundColor: idx === currentPhotoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                              }}
                              onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(idx); }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={styles.noPhotoLarge}>No photos</div>
                )}
              </div>

              <div style={styles.detailHeader}>
                <h2 style={styles.detailName}>
                  {getConversationProfile()?.name}
                  {getConversationProfile()?.dob && <span style={styles.detailAge}>, {calculateAge(getConversationProfile().dob)}</span>}
                </h2>
                {getConversationProfile()?.instagram_handle && (
                  <span style={styles.detailInstagram}>@{getConversationProfile().instagram_handle}</span>
                )}
                {getConversationProfile()?.category && (
                  <div style={{
                    ...styles.detailCategory,
                    backgroundColor: getCategoryColor(getConversationProfile().category),
                  }}>
                    {getConversationProfile().category}
                  </div>
                )}
              </div>

              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>bio</span>
                <p style={styles.detailValue}>{getConversationProfile()?.description || 'No bio yet.'}</p>
              </div>

              {getConversationProfile()?.relationship_type && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>relationship</span>
                  <span style={styles.detailValue}>{getConversationProfile().relationship_type}</span>
                </div>
              )}

              {getConversationProfile()?.religion && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>religion</span>
                  <span style={styles.detailValue}>{getConversationProfile().religion}</span>
                </div>
              )}

              {getConversationProfile()?.sexuality && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>sexuality</span>
                  <span style={styles.detailValue}>{getConversationProfile().sexuality}</span>
                </div>
              )}

              {getConversationProfile()?.city && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>location</span>
                  <span style={styles.detailValue}>{getConversationProfile().city}</span>
                </div>
              )}

              <div style={styles.lifestyleRow}>
                {getConversationProfile()?.alcohol && <span style={styles.lifestylePill}>drinks</span>}
                {getConversationProfile()?.smoke && <span style={styles.lifestylePill}>smokes</span>}
                {getConversationProfile()?.weed && <span style={styles.lifestylePill}>weed</span>}
                {getConversationProfile()?.drugs && <span style={styles.lifestylePill}>drugs</span>}
              </div>

              {getConversationProfile()?.prompts?.length > 0 && (
                <div style={styles.promptsContainer}>
                  {getConversationProfile().prompts.map((prompt, idx) => (
                    <div key={idx} style={styles.promptCard}>
                      <span style={styles.promptQuestion}>"{prompt.question}"</span>
                      <span style={styles.promptAnswer}>{prompt.answer}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Original profile detail panel */}
              <div style={styles.photoCarousel}>
                {viewingProfile.photos?.length > 0 ? (
                  <>
                    <img
                      src={getPhotoUrl(viewingProfile.photos[currentPhotoIndex])}
                      alt=""
                      style={styles.carouselPhoto}
                    />
                    {viewingProfile.photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i => Math.max(0, i - 1)); }}
                          style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 16,
                            display: currentPhotoIndex === 0 ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >‹</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i => Math.min(viewingProfile.photos.length - 1, i + 1)); }}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 16,
                            display: currentPhotoIndex === viewingProfile.photos.length - 1 ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >›</button>
                        <div style={styles.carouselDots}>
                          {viewingProfile.photos.map((_, idx) => (
                            <div
                              key={idx}
                              style={{
                                ...styles.dot,
                                backgroundColor: idx === currentPhotoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                              }}
                              onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(idx); }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={styles.noPhotoLarge}>No photos</div>
                )}
              </div>

              <div style={styles.detailHeader}>
                <h2 style={styles.detailName}>
                  {viewingProfile.name}
                  {viewingProfile.dob && <span style={styles.detailAge}>, {calculateAge(viewingProfile.dob)}</span>}
                </h2>
                {viewingProfile.category && (
                  <div style={{
                    ...styles.detailCategory,
                    backgroundColor: getCategoryColor(viewingProfile.category),
                  }}>
                    {viewingProfile.category}
                  </div>
                )}
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

              <div style={styles.lifestyleRow}>
                {viewingProfile.alcohol && <span style={styles.lifestylePill}>drinks</span>}
                {viewingProfile.smoke && <span style={styles.lifestylePill}>smokes</span>}
                {viewingProfile.weed && <span style={styles.lifestylePill}>weed</span>}
                {viewingProfile.drugs && <span style={styles.lifestylePill}>drugs</span>}
              </div>

              {viewingProfile.prompts?.length > 0 && (
                <div style={styles.promptsContainer}>
                  {viewingProfile.prompts.map((prompt, idx) => (
                    <div key={idx} style={styles.promptCard}>
                      <span style={styles.promptQuestion}>"{prompt.question}"</span>
                      <span style={styles.promptAnswer}>{prompt.answer}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {!viewingProfile.was_selected && !viewingProfile.was_passed && (
                <div style={styles.detailButtons}>
                  <button
                    style={styles.detailPassButton}
                    onClick={() => {
                      handlePass(viewingProfile.pool_entry_id);
                      setViewingProfile(null);
                    }}
                  >
                    ✕ Pass
                  </button>
                  <button
                    style={styles.detailSelectButton}
                    onClick={() => {
                      handleSelect(viewingProfile.pool_entry_id);
                      setViewingProfile(null);
                    }}
                  >
                    ✓ Select
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'select' ? '#FFFFFF' : '#1A1A1A',
          color: toast.type === 'select' ? '#080808' : '#888888',
        }}>
          {toast.message}
        </div>
      )}

      {/* Daily Intent Panel */}
      {showFilterPanel && <FilterPanel onClose={handleFilterPanelClose} />}

      <BugReportButton page="Discovery" />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-fade-in {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
        @keyframes emberPulse {
          0%, 100% { box-shadow: 0 0 12px 4px rgba(232,81,42,0.5), 0 0 30px 10px rgba(232,81,42,0.2); }
          50% { box-shadow: 0 0 20px 8px rgba(232,81,42,0.7), 0 0 50px 15px rgba(232,81,42,0.4); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#080808',
    overflow: 'hidden',
    position: 'relative',
  },
  loading: {
    color: '#666',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Sidebar
  sidebar: {
    width: '220px',
    flexShrink: 0,
    height: '100vh',
    backgroundColor: '#0C0C0C',
    borderRight: '1px solid #1A1A1A',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    position: 'relative',
    zIndex: 0,
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    borderBottom: '1px solid #1A1A1A',
    marginBottom: '24px',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    color: '#666',
    fontSize: '18px',
  },
  onlineDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#00D26A',
    borderRadius: '50%',
    border: '2px solid #0C0C0C',
    position: 'absolute',
    bottom: '2px',
    right: '2px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  notificationBell: {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#E8512A',
    color: '#FFFFFF',
    fontSize: '9px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  userName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '18px',
    color: '#FFFFFF',
  },
  userStats: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    color: '#666',
  },
  sidebarSection: {
    marginBottom: '24px',
  },
  sidebarSectionTitle: {
    color: '#666',
    fontSize: '10px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  matchesRow: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  matchAvatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  matchAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #E8512A',
  },
  matchAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  matchAvatarPlaceholder: {
    color: '#F5F5F5',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
  },
  matchAvatarName: {
    color: '#666',
    fontSize: '10px',
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'center',
    maxWidth: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
    cursor: 'pointer',
  },
  convAvatar: {
    width: '44px',
    height: '44px',
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
    color: '#666',
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
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
  },
  convPreview: {
    color: '#666',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  yourMovePill: {
    backgroundColor: '#E8512A',
    color: '#FFFFFF',
    fontSize: '9px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '3px 6px',
    borderRadius: '8px',
    flexShrink: 0,
  },
  emptyText: {
    color: '#444',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Main Grid - 2 columns
  main: {
    flex: '1 1 0%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    width: '100%',
  },
  card: {
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#0F0F0F',
    display: 'flex',
    minHeight: '280px',
  },
  cardPhoto: {
    position: 'relative',
    width: '55%',
    cursor: 'pointer',
    backgroundColor: '#141414',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#141414',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,8,8,0.4)',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  cardInfo: {
    width: '45%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'baseline',
  },
  cardName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '20px',
    color: '#FFFFFF',
  },
  cardAge: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    color: '#888',
    marginLeft: '2px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '9px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    width: 'fit-content',
  },
  cardInstagram: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
  },
  cardBio: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    color: '#666',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    margin: 0,
  },
  lifestyleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px',
  },
  lifestylePill: {
    backgroundColor: '#141414',
    border: '1px solid #222',
    color: '#888',
    fontSize: '10px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '3px 8px',
    borderRadius: '10px',
  },
  cardButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  passButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid #333',
    color: '#888',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontFamily: "'DM Sans', sans-serif",
  },
  selectButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    color: '#080808',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderRadius: '4px',
  },
  selectedButton: {
    marginTop: 'auto',
    padding: '8px',
    textAlign: 'center',
    backgroundColor: 'transparent',
    border: '1px solid #666',
    color: '#666',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '4px',
  },
  noProfiles: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    color: '#444',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
  },
  noProfilesSub: {
    fontSize: '12px',
    marginTop: '8px',
    color: '#333',
  },

  // Middle Panel (Answers/Chat)
  middlePanelContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    zIndex: 5,
    position: 'relative',
    backgroundColor: '#080808',
  },
  middleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '20px',
    borderBottom: '1px solid #1A1A1A',
    marginBottom: '20px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    padding: 0,
  },
  middleTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '22px',
    color: '#FFFFFF',
  },
  openChatButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    padding: 0,
  },
  chatUnlockedBanner: {
    backgroundColor: '#1A1A1A',
    color: '#F5F5F5',
    border: '1px solid #2A2A2A',
    padding: '12px 16px',
    borderRadius: '2px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    marginBottom: '20px',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },

  // Answers Panel Styles
  answersPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #141414',
    flexShrink: 0,
    gap: '12px',
    zIndex: 10,
    backgroundColor: '#080808',
    position: 'relative',
  },
  answersBackButton: {
    background: 'none',
    border: 'none',
    color: '#444',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.05em',
    flexShrink: 0,
    minWidth: '60px',
  },
  answersMatchName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '20px',
    color: '#F5F5F5',
    fontWeight: 400,
    flex: 1,
    textAlign: 'center',
  },
  // Chat Panel Header
  chatPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #141414',
    flexShrink: 0,
    gap: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatBackButton: {
    background: 'none',
    border: 'none',
    color: '#444',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.05em',
    flexShrink: 0,
    minWidth: '60px',
  },
  chatMatchName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '18px',
    color: '#F5F5F5',
    fontWeight: 400,
    flex: 1,
    textAlign: 'center',
  },
  answersChatUnlockedBanner: {
    backgroundColor: '#1A1A1A',
    color: '#F5F5F5',
    border: '1px solid #2A2A2A',
    padding: '12px 16px',
    borderRadius: '2px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    margin: '16px 32px',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
  answersScrollContent: {
    overflowY: 'auto',
    flex: 1,
    padding: '0 32px 40px',
  },
  answersSection: {
    marginBottom: '24px',
  },
  answersSectionTitle: {
    color: '#333',
    fontSize: '10px',
    letterSpacing: '0.2em',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    marginBottom: '16px',
    marginTop: '32px',
  },
  answersCard: {
    backgroundColor: '#0D0D0D',
    border: '1px solid #1A1A1A',
    borderRadius: '2px',
    padding: '20px 24px',
    marginBottom: '8px',
  },
  answersMyCard: {
    backgroundColor: '#0D0D0D',
    border: '1px solid #141414',
    borderRadius: '2px',
    padding: '20px 24px',
    marginBottom: '8px',
    opacity: 0.5,
  },
  answersQuestionNumber: {
    color: '#FFFFFF',
    fontSize: '9px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.2em',
    fontWeight: 600,
    display: 'block',
    marginBottom: '12px',
  },
  answersQuestionText: {
    fontFamily: "'DM Serif Display', serif",
    fontStyle: 'italic',
    fontSize: '17px',
    color: '#F5F5F5',
    lineHeight: 1.5,
    fontWeight: 400,
    display: 'block',
  },
  answersAnsweredBadge: {
    color: '#00D26A',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.1em',
    marginTop: '10px',
    display: 'block',
  },
  answersWaitingBadge: {
    color: '#333',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    fontStyle: 'italic',
    marginTop: '10px',
  },
  answersMyAnswerBlockquote: {
    display: 'block',
    marginTop: '8px',
    paddingLeft: '12px',
    borderLeft: '2px solid #222',
    color: '#666',
    fontSize: '13px',
    fontFamily: "'DM Serif Display', serif",
    fontStyle: 'italic',
  },
  answersTheirCard: {
    backgroundColor: '#0D0D0D',
    border: '1px solid #1A1A1A',
    borderRadius: '2px',
    padding: '20px 24px',
    marginBottom: '8px',
    position: 'relative',
  },
  answersTheirQuestionLabel: {
    fontSize: '11px',
    color: '#444',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '10px',
    display: 'block',
  },
  answersTheirAnswerText: {
    fontFamily: "'DM Serif Display', serif",
    fontStyle: 'italic',
    fontSize: '18px',
    color: '#F5F5F5',
    lineHeight: 1.5,
    display: 'block',
  },
  answersTheirLabel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '9px',
    color: '#333',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  headerAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#141414',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  questionsSection: {
    marginBottom: '24px',
  },
  questionsSectionTitle: {
    fontSize: '10px',
    color: '#666',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
  },
  questionCard: {
    backgroundColor: '#111',
    border: '1px solid #1E1E1E',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '12px',
  },
  questionNumber: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '10px',
    color: '#E8512A',
    display: 'block',
    marginBottom: '8px',
  },
  questionText: {
    fontFamily: "'DM Serif Display', serif",
    fontStyle: 'italic',
    fontSize: '16px',
    color: '#F5F5F5',
    display: 'block',
    marginBottom: '12px',
  },
  answeredBadge: {
    fontSize: '12px',
    color: '#00D26A',
    fontFamily: "'DM Sans', sans-serif",
  },
  notAnsweredBadge: {
    fontSize: '12px',
    color: '#555',
    fontFamily: "'DM Sans', sans-serif",
  },
  answerInputRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  answerInput: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    border: '1px solid #222',
    borderRadius: '4px',
    padding: '10px 12px',
    color: '#F5F5F5',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
  },
  submitAnswerButton: {
    backgroundColor: '#E8512A',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    color: '#FFFFFF',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },

  // Chat UI
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBottom: '16px',
    padding: '16px 24px',
    boxSizing: 'border-box',
    width: '100%',
  },
  chatBubble: {
    maxWidth: '65%',
    padding: '10px 14px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
  chatBubbleText: {
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  chatTimestamp: {
    fontSize: '10px',
    color: '#888',
    marginTop: '4px',
    fontFamily: "'DM Sans', sans-serif",
  },
  chatInputRow: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #1A1A1A',
    padding: '16px 24px',
    boxSizing: 'border-box',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#111',
    border: '1px solid #1E1E1E',
    borderRadius: '2px',
    padding: '12px 16px',
    color: '#F5F5F5',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  sendButton: {
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
  },

  // Detail Panel
  detailPanel: {
    width: '360px',
    flexShrink: 0,
    height: '100vh',
    backgroundColor: '#0C0C0C',
    borderLeft: '1px solid #1A1A1A',
    padding: '24px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    position: 'static',
  },
  closePanel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: 2,
  },
  chattingWithLabel: {
    fontSize: '10px',
    color: '#555',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '16px',
  },
  photoCarousel: {
    position: 'relative',
    width: '100%',
    aspectRatio: '3/4',
    marginBottom: '24px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#141414',
  },
  carouselPhoto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  carouselDots: {
    position: 'absolute',
    bottom: '12px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    overflowX: 'auto',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  noPhotoLarge: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    fontFamily: "'DM Sans', sans-serif",
  },
  detailHeader: {
    marginBottom: '20px',
  },
  detailName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '28px',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  detailAge: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '20px',
    color: '#888',
  },
  detailInstagram: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#888888',
    display: 'block',
    marginBottom: '8px',
  },
  detailCategory: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  detailSection: {
    marginBottom: '16px',
  },
  detailLabel: {
    fontSize: '10px',
    color: '#666',
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
    marginBottom: '12px',
  },
  lifestyleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
  },
  lifestylePill: {
    backgroundColor: '#141414',
    border: '1px solid #222',
    color: '#888',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '4px 10px',
    borderRadius: '12px',
  },
  promptsContainer: {
    marginTop: '24px',
  },
  promptCard: {
    backgroundColor: '#141414',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  promptQuestion: {
    fontFamily: "'DM Serif Display', serif",
    fontStyle: 'italic',
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    display: 'block',
  },
  promptAnswer: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '16px',
    color: '#FFFFFF',
    display: 'block',
  },
  detailButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #1A1A1A',
  },
  detailPassButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '4px',
  },
  detailSelectButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    color: '#080808',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderRadius: '4px',
  },

  // Toast
  toast: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: '24px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    zIndex: 100,
    animation: 'toastFade 0.3s ease',
  },

  // Remove match button
  removeButton: {
    background: 'none',
    border: '1px solid #1A1A1A',
    color: '#333',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.1em',
    padding: '6px 12px',
    borderRadius: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },

  // Remove match modal
  removeModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,8,8,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backdropFilter: 'blur(4px)',
  },
  removeModalCard: {
    backgroundColor: '#0D0D0D',
    border: '1px solid #1A1A1A',
    borderRadius: '4px',
    padding: '24px',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  removeModalTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '22px',
    color: '#F5F5F5',
    fontWeight: 400,
    margin: 0,
  },
  removeModalSubtitle: {
    fontSize: '12px',
    color: '#444',
    fontFamily: "'DM Sans', sans-serif",
    margin: 0,
  },
  removeModalCharCount: {
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
  },
  removeModalLabel: {
    fontSize: '13px',
    color: '#888',
    fontFamily: "'DM Sans', sans-serif",
  },
  removeModalTextarea: {
    width: '100%',
    backgroundColor: '#111',
    border: '1px solid #1E1E1E',
    borderRadius: '2px',
    padding: '14px',
    color: '#F5F5F5',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
  },
  removeModalError: {
    fontSize: '12px',
    color: '#E8512A',
    fontFamily: "'DM Sans', sans-serif",
  },
  removeModalButtons: {
    display: 'flex',
    gap: '12px',
  },
  removeModalCancel: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #1A1A1A',
    color: '#555',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '2px',
    cursor: 'pointer',
  },
  removeModalConfirm: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#F5F5F5',
    color: '#0A0A0A',
    border: 'none',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderRadius: '2px',
    cursor: 'pointer',
  },
};

export default Discovery;