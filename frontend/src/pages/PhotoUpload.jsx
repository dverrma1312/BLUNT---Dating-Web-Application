import { useState } from 'react';  // imports useState for managing photos
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function PhotoUpload() {
  const navigate = useNavigate();  // used to redirect after photo upload

  const [photos, setPhotos] = useState([]);  // stores uploaded photos
  const [error, setError] = useState('');  // stores error message
  const [loading, setLoading] = useState(false);  // tracks if request is in progress

  // handles photo upload when user selects a file
  async function handleUpload(e) {
    const file = e.target.files[0];  // get the selected file
    if (!file) return;  // if no file selected do nothing

    setError('');
    setLoading(true);

    const formData = new FormData();  // FormData is used to send files to backend
    formData.append('image', file);  // attach the image file

    try {
      const res = await api.post('/api/users/photos/', formData);  // upload photo to backend
      setPhotos([...photos, { id: res.data.photo_id, url: URL.createObjectURL(file) }]);  // add photo to local state
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // handles photo deletion
  async function handleDelete(photo_id) {
    try {
      await api.delete(`/api/users/photos/${photo_id}/`);  // delete photo from backend
      setPhotos(photos.filter(p => p.id !== photo_id));  // remove photo from local state
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* header */}
        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>Add Your Photos</p>
        <p style={styles.hint}>Add Up To 4 Photos</p>

        {/* error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* photo grid */}
        <div style={styles.grid}>
          {photos.map(photo => (
            <div key={photo.id} style={styles.photoWrapper}>
              <img src={photo.url} alt="profile" style={styles.photo} />
              <button
                onClick={() => handleDelete(photo.id)}
                style={styles.deleteButton}
              >
                ✕
              </button>
            </div>
          ))}

          {/* upload button — only show if less than 4 photos */}
          {photos.length < 4 && (
            <label style={styles.uploadBox}>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                style={{ display: 'none' }}  // hide default file input
              />
              <span style={styles.uploadIcon}>+</span>
            </label>
          )}
        </div>

        {/* continue button — only show if at least 1 photo uploaded */}
        {photos.length > 0 && (
          <button
            onClick={() => navigate('/intent')}
            disabled={loading}
            style={{ marginTop: '24px' }}
          >
            {loading ? 'uploading...' : 'continue'}
          </button>
        )}

      </div>
    </div>
  );
}

// styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888888',
    marginBottom: '4px',
  },
  hint: {
    fontSize: '12px',
    color: '#555555',
    marginBottom: '24px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',  // 2 columns
    gap: '12px',
  },
  photoWrapper: {
    position: 'relative',
    aspectRatio: '1',  // square
    borderRadius: '8px',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',  // fill the box without stretching
  },
  deleteButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#F5F5F5',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '0',
  },
  uploadBox: {
    aspectRatio: '1',
    borderRadius: '8px',
    border: '1px dashed #333333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  uploadIcon: {
    fontSize: '24px',
    color: '#555555',
  },
};

export default PhotoUpload;  // export so App.js can use it