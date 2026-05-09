import { useState } from 'react';  // imports useState for form data
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function ProfileSetup() {
  const navigate = useNavigate();  // used to redirect after profile setup

  // form state
  const [form, setForm] = useState({
    description: '',
    city: '',
  });

  const [error, setError] = useState('');  // stores error message
  const [loading, setLoading] = useState(false);  // tracks if request is in progress

  // updates form state when any input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // handles form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put('/api/users/profile/', form);  // update profile via PUT request
      navigate('/photos');  // redirect to photo upload page
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* header */}
        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>tell us about yourself</p>

        {/* error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* profile setup form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          <input
            name="city"
            type="text"
            placeholder="your city"
            value={form.city}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="describe yourself in a few words"
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
            style={styles.textarea}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'saving...' : 'continue'}
          </button>

        </form>

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
    marginBottom: '32px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  textarea: {
    resize: 'none',  // prevent user from resizing textarea
  },
};

export default ProfileSetup;  // export so App.js can use it