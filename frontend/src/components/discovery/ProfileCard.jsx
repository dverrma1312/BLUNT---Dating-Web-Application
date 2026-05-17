import { getPhotoUrl } from './utils';

const INTENT_COLORS = {
  'Hookup': '#FF3B3B',
  'Hangout': '#FFB800',
  'Smoke Up': '#00D26A',
  'Coffee & Chill': '#A0785A',
};

function ProfileCard({
  profile,
  onViewProfile,
  onPass,
  onSelect,
  failedImages,
  onImageError,
}) {
  const lifestylePills = [];
  if (profile.alcohol) lifestylePills.push('drinks');
  if (profile.smoke) lifestylePills.push('smokes');
  if (profile.weed) lifestylePills.push('weed');
  if (profile.drugs) lifestylePills.push('drugs');

  const getCategoryColor = (category) => INTENT_COLORS[category] || '#888888';

  const cardStyle = {
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#0F0F0F',
    display: 'flex',
    minHeight: '280px',
    opacity: profile.was_selected || profile.was_passed ? 0.45 : 1,
  };

  const cardPhotoStyle = {
    position: 'relative',
    width: '55%',
    cursor: 'pointer',
    backgroundColor: '#141414',
  };

  const cardInfoStyle = {
    width: '45%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  return (
    <div style={cardStyle} className="card-fade-in">
      {/* Photo - Left 55% */}
      <div style={cardPhotoStyle} onClick={() => onViewProfile(profile)}>
        {profile.photos?.length > 0 && !failedImages[profile.profile_id] ? (
          <img
            src={getPhotoUrl(profile.photos[0])}
            alt={profile.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={() => onImageError(profile.profile_id)}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
          }}>No photo</div>
        )}

        {/* Selected/Passed overlay */}
        {profile.was_selected && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(8,8,8,0.4)',
          }}>
            <span style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>selected ✦</span>
          </div>
        )}
        {profile.was_passed && !profile.was_selected && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(8,8,8,0.4)',
          }}>
            <span style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>passed</span>
          </div>
        )}
      </div>

      {/* Info - Right 45% */}
      <div style={cardInfoStyle}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '20px',
            color: '#FFFFFF',
          }}>{profile.name}</span>
          {profile.age && <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#888',
            marginLeft: '2px',
          }}>, {profile.age}</span>}
        </div>

        {profile.category && (
          <div style={{
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
            backgroundColor: getCategoryColor(profile.category),
          }}>
            {profile.category}
          </div>
        )}

        {profile.description && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: '#666',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            overflow: 'hidden',
            margin: 0,
          }}>{profile.description.slice(0, 100)}...</p>
        )}

        {lifestylePills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {lifestylePills.map(pill => (
              <span key={pill} style={{
                backgroundColor: '#141414',
                border: '1px solid #222',
                color: '#888',
                fontSize: '10px',
                fontFamily: "'DM Sans', sans-serif",
                padding: '3px 8px',
                borderRadius: '10px',
              }}>{pill}</span>
            ))}
          </div>
        )}

        {/* Buttons */}
        {!profile.was_selected && !profile.was_passed ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid #333',
                color: '#888',
                fontSize: '12px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onPass(profile.pool_entry_id);
              }}
            >✕ Pass</button>
            <button
              style={{
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
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(profile.pool_entry_id);
              }}
            >✓ Select</button>
          </div>
        ) : (
          <div style={{
            marginTop: 'auto',
            padding: '8px',
            textAlign: 'center',
            backgroundColor: 'transparent',
            border: '1px solid #666',
            color: '#666',
            fontSize: '11px',
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: '4px',
          }}>
            {profile.was_selected ? 'selected ✦' : 'passed'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;