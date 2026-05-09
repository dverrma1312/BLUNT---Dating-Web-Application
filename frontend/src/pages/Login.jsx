import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSendOTP(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/send-otp/', { phone_number: phone });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No account found with this number.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setError('');
    setResending(true);

    try {
      await api.post('/api/users/send-otp/', { phone_number: phone });
      setError('OTP resent successfully.');  // use error state as info message
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/users/verify-otp/', { phone_number: phone, code });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      const profileRes = await api.get('/api/users/profile/');
      const user = profileRes.data;

      if (!user.description || !user.city) {
        navigate('/profile-setup');
      } else if (!user.photos || user.photos.length === 0) {
        navigate('/photos');
      } else if (!user.is_approved) {
        navigate('/pending');
      } else {
        navigate('/discovery');
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>welcome back</p>

        {error && (
          <p style={{
            ...styles.error,
            color: error.includes('resent') ? '#44ff88' : '#ff4444',
            backgroundColor: error.includes('resent') ? '#001a0a' : '#1a0000',
            border: error.includes('resent') ? '1px solid #003300' : '1px solid #330000',
          }}>
            {error}
          </p>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOTP} style={styles.form}>
            <input
              type="tel"
              placeholder="phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'sending...' : 'send otp'}
            </button>
            <p style={styles.link} onClick={() => navigate('/register')}>
              don't have an account? register
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={styles.form}>
            <p style={styles.phone}>{phone}</p>
            <input
              type="text"
              placeholder="enter otp"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'verifying...' : 'verify'}
            </button>
            <p style={styles.link} onClick={handleResendOTP}>
              {resending ? 'resending...' : 'resend otp'}
            </p>
            <p style={styles.link} onClick={() => setOtpSent(false)}>
              change number
            </p>
          </form>
        )}

      </div>
    </div>
  );
}

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
  phone: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  error: {
    fontSize: '13px',
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  link: {
    fontSize: '13px',
    color: '#888888',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: '4px',
  },
};

export default Login;