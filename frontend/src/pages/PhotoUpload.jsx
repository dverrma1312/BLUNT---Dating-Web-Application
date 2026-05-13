import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function PhotoUpload() {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (photos.length >= 4) {
      setError('Maximum 4 photos allowed.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/api/users/photos/', formData);
      setPhotos([...photos, { id: res.data.photo_id, url: URL.createObjectURL(file) }]);
    } catch (err) {
      console.log('Photo upload error full:', JSON.stringify(err.response?.data));
      setError(err.response?.data?.error || 'Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(photo_id) {
    try {
      await api.delete(`/api/users/photos/${photo_id}/`);
      setPhotos(photos.filter(p => p.id !== photo_id));
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    }
  }

  return (
    <div style={styles.container}>
      {/* Grain texture overlay */}
      <div style={styles.grain}></div>

      {/* Blunt. wordmark with ember dot */}
      <h1 style={styles.logo}>
        blunt<span style={styles.period}>.</span>
        <span style={styles.emberDot}></span>
      </h1>

      {/* Subtext */}
      <p style={styles.subtext}>Add your photos.</p>
      <p style={styles.hint}>Add up to 4 photos. First one is your main photo.</p>

      {/* Error message */}
      {error && (
        <p style={styles.error}>{error}</p>
      )}

      {/* Photo grid - always show 4 slots */}
      <div style={styles.grid}>
        {[0, 1, 2, 3].map((index) => {
          const photo = photos[index];
          const isEmpty = !photo;

          return (
            <div key={index} style={styles.slotWrapper}>
              {isEmpty ? (
                <label style={styles.emptySlot}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                  />
                  <span style={styles.plusIcon}>+</span>
                </label>
              ) : (
                <div style={styles.filledSlot}>
                  <img src={photo.url} alt="profile" style={styles.photo} />
                  <button
                    onClick={() => handleDelete(photo.id)}
                    style={styles.deleteButton}
                  >
                    ×
                  </button>
                </div>
              )}
              {/* Main label for first slot */}
              {index === 0 && (
                <span style={styles.mainLabel}>main</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={() => navigate('/intent')}
        disabled={loading || photos.length === 0}
        style={{
          ...styles.button,
          opacity: photos.length === 0 ? 0.5 : 1,
          cursor: photos.length === 0 ? 'none' : 'none',
        }}
      >
        {loading ? 'Uploading...' : 'Continue'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px 24px',
    position: 'relative',
  },
  grain: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    opacity: 0.05,
    pointerEvents: 'none',
    zIndex: 0,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '64px',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    position: 'relative',
    marginBottom: '8px',
    zIndex: 1,
  },
  period: {
    position: 'relative',
  },
  emberDot: {
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
  },
  subtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#888888',
    marginBottom: '4px',
    zIndex: 1,
  },
  hint: {
    fontSize: '12px',
    color: '#555555',
    marginBottom: '32px',
    fontFamily: "'DM Sans', sans-serif",
    zIndex: 1,
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
    maxWidth: '440px',
    zIndex: 1,
  },
  slotWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  emptySlot: {
    width: '100%',
    aspectRatio: '200/260',
    backgroundColor: '#141414',
    borderRadius: '8px',
    border: '2px dashed #333333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    transition: 'border-color 0.2s',
  },
  filledSlot: {
    width: '100%',
    aspectRatio: '200/260',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  plusIcon: {
    fontSize: '32px',
    color: '#444444',
    transition: 'color 0.2s',
  },
  deleteButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#E8512A',
    color: '#FFFFFF',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    padding: 0,
    border: 'none',
  },
  mainLabel: {
    fontSize: '10px',
    color: '#E8512A',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontFamily: "'DM Sans', sans-serif",
  },
  button: {
    backgroundColor: '#FFFFFF',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
    maxWidth: '440px',
    marginTop: '32px',
    zIndex: 1,
  },
};

export default PhotoUpload;