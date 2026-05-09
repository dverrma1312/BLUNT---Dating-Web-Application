import { useState } from 'react';  // imports useState for form data
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function VerifyOTP() {
  const navigate = useNavigate();  // used to redirect after verification

  const [code, setCode] = useState('');  // stores OTP code input
  const [error, setError] = useState('');  // stores error message
  const [loading, setLoading] = useState(false);  // tracks if request is in progress
  const [otpSent, setOtpSent] = useState(false);  // tracks if OTP has been sent

  const phone_number = localStorage.getItem('phone_number');  // get phone number saved during registration

  // sends OTP to user's phone number
  async function handleSendOTP() {
    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/send-otp/', { phone_number });  // send OTP request to backend
      setOtpSent(true);  // show OTP input
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // verifies OTP and logs user in
  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/users/verify-otp/', { phone_number, code });  // verify OTP
      localStorage.setItem('access', res.data.access);    // save access token
      localStorage.setItem('refresh', res.data.refresh);  // save refresh token
      navigate('/profile-setup');  // redirect to profile setup
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* header */}
        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>verify your number</p>
        <p style={styles.phone}>{phone_number}</p>

        {/* error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* send otp button — shown before otp is sent */}
        {!otpSent ? (
          <button onClick={handleSendOTP} disabled={loading}>
            {loading ? 'sending...' : 'send otp'}
          </button>
        ) : (
          // otp input form — shown after otp is sent
          <form onSubmit={handleVerify} style={styles.form}>
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
            {/* resend otp link */}
            <p style={styles.resend} onClick={handleSendOTP}>
              resend otp
            </p>
          </form>
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
    marginBottom: '8px',
  },
  phone: {
    fontSize: '16px',
    fontWeight: '500',
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
  resend: {
    fontSize: '13px',
    color: '#888888',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default VerifyOTP;  // export so App.js can use it