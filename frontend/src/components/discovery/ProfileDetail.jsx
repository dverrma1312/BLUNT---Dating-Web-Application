import { useState } from 'react';
import { getPhotoUrl, calculateAge } from './utils';

const INTENT_COLORS = {
  'Hookup': '#FF3B3B',
  'Hangout': '#FFB800',
  'Smoke Up': '#00D26A',
  'Coffee & Chill': '#A0785A',
};

const styles = {
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
};

function PhotoCarousel({ photos, currentPhotoIndex, setCurrentPhotoIndex }) {
  if (!photos || photos.length === 0) {
    return <div style={styles.noPhotoLarge}>No photos</div>;
  }

  return (
    <div style={styles.photoCarousel}>
      <img
        src={getPhotoUrl(photos[currentPhotoIndex])}
        alt=""
        style={styles.carouselPhoto}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhotoIndex(i => Math.max(0, i - 1));
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhotoIndex(i => Math.min(photos.length - 1, i + 1));
            }}
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
              display: currentPhotoIndex === photos.length - 1 ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >›</button>
          <div style={styles.carouselDots}>
            {photos.map((_, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.dot,
                  backgroundColor: idx === currentPhotoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(idx);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProfileDetail({ profile, onClose, onPass, onSelect }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!profile) return null;

  const getCategoryColor = (category) => INTENT_COLORS[category] || '#888888';

  return (
    <div style={styles.detailPanel}>
      <button style={styles.closePanel} onClick={onClose}>✕</button>

      <PhotoCarousel
        photos={profile.photos}
        currentPhotoIndex={currentPhotoIndex}
        setCurrentPhotoIndex={setCurrentPhotoIndex}
      />

      <div style={styles.detailHeader}>
        <h2 style={styles.detailName}>
          {profile.name}
          {profile.dob && <span style={styles.detailAge}>, {calculateAge(profile.dob)}</span>}
        </h2>
        {profile.category && (
          <div style={{
            ...styles.detailCategory,
            backgroundColor: getCategoryColor(profile.category),
          }}>
            {profile.category}
          </div>
        )}
      </div>

      <div style={styles.detailSection}>
        <span style={styles.detailLabel}>bio</span>
        <p style={styles.detailValue}>{profile.description || 'No bio yet.'}</p>
      </div>

      {profile.relationship_type && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>relationship</span>
          <span style={styles.detailValue}>{profile.relationship_type}</span>
        </div>
      )}

      {profile.religion && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>religion</span>
          <span style={styles.detailValue}>{profile.religion}</span>
        </div>
      )}

      {profile.sexuality && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>sexuality</span>
          <span style={styles.detailValue}>{profile.sexuality}</span>
        </div>
      )}

      {profile.city && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>location</span>
          <span style={styles.detailValue}>{profile.city}</span>
        </div>
      )}

      <div style={styles.lifestyleRow}>
        {profile.alcohol && <span style={styles.lifestylePill}>drinks</span>}
        {profile.smoke && <span style={styles.lifestylePill}>smokes</span>}
        {profile.weed && <span style={styles.lifestylePill}>weed</span>}
        {profile.drugs && <span style={styles.lifestylePill}>drugs</span>}
      </div>

      {profile.prompts?.length > 0 && (
        <div style={styles.promptsContainer}>
          {profile.prompts.map((prompt, idx) => (
            <div key={idx} style={styles.promptCard}>
              <span style={styles.promptQuestion}>"{prompt.question}"</span>
              <span style={styles.promptAnswer}>{prompt.answer}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!profile.was_selected && !profile.was_passed && (
        <div style={styles.detailButtons}>
          <button
            style={styles.detailPassButton}
            onClick={() => {
              onPass(profile.pool_entry_id);
              onClose();
            }}
          >
            ✕ Pass
          </button>
          <button
            style={styles.detailSelectButton}
            onClick={() => {
              onSelect(profile.pool_entry_id);
              onClose();
            }}
          >
            ✓ Select
          </button>
        </div>
      )}
    </div>
  );
}

function MatchProfileDetail({ profile, onClose }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!profile) return null;

  const getCategoryColor = (category) => INTENT_COLORS[category] || '#888888';

  return (
    <div style={styles.detailPanel}>
      <button style={styles.closePanel} onClick={onClose}>✕</button>

      <div style={styles.chattingWithLabel}>chatting with</div>

      <PhotoCarousel
        photos={profile.photos}
        currentPhotoIndex={currentPhotoIndex}
        setCurrentPhotoIndex={setCurrentPhotoIndex}
      />

      <div style={styles.detailHeader}>
        <h2 style={styles.detailName}>
          {profile.name}
          {profile.dob && <span style={styles.detailAge}>, {calculateAge(profile.dob)}</span>}
        </h2>
        {profile.instagram_handle && (
          <span style={styles.detailInstagram}>@{profile.instagram_handle}</span>
        )}
        {profile.category && (
          <div style={{
            ...styles.detailCategory,
            backgroundColor: getCategoryColor(profile.category),
          }}>
            {profile.category}
          </div>
        )}
      </div>

      <div style={styles.detailSection}>
        <span style={styles.detailLabel}>bio</span>
        <p style={styles.detailValue}>{profile.description || 'No bio yet.'}</p>
      </div>

      {profile.relationship_type && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>relationship</span>
          <span style={styles.detailValue}>{profile.relationship_type}</span>
        </div>
      )}

      {profile.religion && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>religion</span>
          <span style={styles.detailValue}>{profile.religion}</span>
        </div>
      )}

      {profile.sexuality && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>sexuality</span>
          <span style={styles.detailValue}>{profile.sexuality}</span>
        </div>
      )}

      {profile.city && (
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>location</span>
          <span style={styles.detailValue}>{profile.city}</span>
        </div>
      )}

      <div style={styles.lifestyleRow}>
        {profile.alcohol && <span style={styles.lifestylePill}>drinks</span>}
        {profile.smoke && <span style={styles.lifestylePill}>smokes</span>}
        {profile.weed && <span style={styles.lifestylePill}>weed</span>}
        {profile.drugs && <span style={styles.lifestylePill}>drugs</span>}
      </div>

      {profile.prompts?.length > 0 && (
        <div style={styles.promptsContainer}>
          {profile.prompts.map((prompt, idx) => (
            <div key={idx} style={styles.promptCard}>
              <span style={styles.promptQuestion}>"{prompt.question}"</span>
              <span style={styles.promptAnswer}>{prompt.answer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { ProfileDetail, MatchProfileDetail };