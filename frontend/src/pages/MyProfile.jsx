import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BugReportButton from '../components/BugReportButton';

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

function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get('/api/users/profile/');
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <p style={styles.loading}>loading...</p>
    </div>
  );

  if (error) return (
    <div style={styles.container}>
      <p style={styles.error}>{error}</p>
    </div>
  );

  const age = profile?.dob ? calculateAge(profile.dob) : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/discovery')}>
          ← back
        </button>
        <h1 style={styles.title}>my profile</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.photoSection}>
          {profile?.photos?.length > 0 ? (
            <img
              src={getPhotoUrl(profile.photos[0])}
              alt="profile"
              style={styles.photo}
            />
          ) : (
            <div style={styles.noPhoto}>no photo</div>
          )}
        </div>

        <div style={styles.infoSection}>
          <h2 style={styles.name}>
            {profile?.name}
            {age && <span style={styles.age}>, {age}</span>}
          </h2>

          {profile?.category && (
            <div style={styles.category}>{profile.category}</div>
          )}

          {profile?.description && (
            <p style={styles.bio}>{profile.description}</p>
          )}

          {profile?.instagram_handle && (
            <p style={styles.instagram}>@{profile.instagram_handle}</p>
          )}

          {profile?.city && (
            <p style={styles.location}>{profile.city}</p>
          )}

          <div style={styles.lifestyleRow}>
            {profile?.alcohol && <span style={styles.pill}>drinks</span>}
            {profile?.smoke && <span style={styles.pill}>smokes</span>}
            {profile?.weed && <span style={styles.pill}>weed</span>}
            {profile?.drugs && <span style={styles.pill}>drugs</span>}
          </div>

          <button style={styles.editButton} onClick={() => navigate('/profile-setup')}>
            edit profile
          </button>
        </div>
      </div>

      <BugReportButton page="MyProfile" />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#080808',
    color: '#F5F5F5',
    fontFamily: "'DM Sans', sans-serif",
  },
  loading: {
    color: '#666',
    fontSize: '14px',
    textAlign: 'center',
    paddingTop: '40px',
  },
  error: {
    color: '#E8512A',
    fontSize: '14px',
    textAlign: 'center',
    paddingTop: '40px',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #1A1A1A',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '12px',
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '28px',
    color: '#FFFFFF',
    margin: 0,
  },
  content: {
    padding: '24px',
  },
  photoSection: {
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto 24px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#141414',
  },
  photo: {
    width: '100%',
    aspectRatio: '3/4',
    objectFit: 'cover',
  },
  noPhoto: {
    width: '100%',
    aspectRatio: '3/4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    fontSize: '14px',
  },
  infoSection: {
    maxWidth: '400px',
    margin: '0 auto',
  },
  name: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '32px',
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  age: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '24px',
    color: '#888',
  },
  category: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    backgroundColor: '#E8512A',
    marginBottom: '16px',
  },
  bio: {
    fontSize: '14px',
    color: '#888',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  instagram: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  location: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  lifestyleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
  },
  pill: {
    backgroundColor: '#141414',
    border: '1px solid #222',
    color: '#888',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    padding: '4px 10px',
    borderRadius: '12px',
  },
  editButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    color: '#080808',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default MyProfile;