import { getPhotoUrl } from './utils';

const styles = {
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
};

function Sidebar({ userProfile, matches, conversations, selectCount, viewCount, notificationCount, onNavigate, onSelectMatch, onSelectConversation, selectedConversation }) {
  return (
    <aside style={styles.sidebar}>
      {/* User Profile */}
      <div style={styles.userProfile}>
        <div style={{ cursor: 'pointer' }} onClick={() => onNavigate('/my-profile')}>
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
        <div style={styles.notificationBell} onClick={() => onNavigate('/notifications')}>
          <span style={{ fontSize: '18px' }}>🔔</span>
          {notificationCount > 0 && (
            <div style={styles.notificationBadge}>{notificationCount}</div>
          )}
        </div>
      </div>

      {/* Match Queue */}
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
                onClick={() => onSelectMatch(match)}
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

      {/* Conversations */}
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
                onClick={() => onSelectConversation(match)}
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
  );
}

export { styles as sidebarStyles };
export default Sidebar;