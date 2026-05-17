import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function VerifyOTP() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const phone_number = localStorage.getItem('phone_number');

  async function handleSendOTP() {
    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/send-otp/', { phone_number });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/users/verify-otp/', { phone_number, code });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
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
      <p style={styles.subtext}>Verify your number.</p>

      {/* Phone display */}
      <p style={styles.phoneDisplay}>{phone_number}</p>

      {/* Error message */}
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

      {/* Send OTP button — shown before OTP is sent */}
      {!otpSent ? (
        <div style={styles.form}>
          <button onClick={handleSendOTP} disabled={loading} style={styles.button}>
            {loading ? 'sending...' : 'send otp'}
          </button>
        </div>
      ) : (
        // OTP input form — shown after OTP is sent
        <form onSubmit={handleVerify} style={styles.form}>
          <input
            type="text"
            placeholder="enter otp"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'verifying...' : 'verify'}
          </button>
          {/* Resend OTP link */}
          <p style={styles.linkText} onClick={handleSendOTP}>
            resend otp
          </p>
        </form>
      )}
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
    padding: '24px',
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
    boxShadow: '0 0 20px 10px rgba(232, 81, 42, 0.6)',
  },
  subtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#888888',
    marginBottom: '32px',
    zIndex: 1,
  },
  phoneDisplay: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#FFFFFF',
    marginBottom: '16px',
    textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif",
    zIndex: 1,
  },
  error: {
    fontSize: '13px',
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
    zIndex: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '320px',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 16px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    cursor: 'none',
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
    cursor: 'none',
    width: '100%',
  },
  linkText: {
    fontSize: '14px',
    color: '#888888',
    textAlign: 'center',
    cursor: 'none',
    marginTop: '8px',
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default VerifyOTP;