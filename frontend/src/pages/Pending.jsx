import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Pending() {
  const navigate = useNavigate();

  // polls backend every 10 seconds to check if user got approved
  useEffect(() => {
    async function checkApproval() {
      try {
        const res = await api.get('/api/users/profile/');
        if (res.data.is_approved) {
          navigate('/discovery');  // approved — send to discovery
        }
      } catch (err) {
        navigate('/register');  // token expired — send back to register
      }
    }

    checkApproval();  // check immediately on page load

    const interval = setInterval(checkApproval, 10000);  // then every 10 seconds

    return () => clearInterval(interval);  // cleanup on unmount
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.heading}>you're on the list.</p>
        <p style={styles.subtitle}>
          our team is reviewing your profile. once approved you will get access to the app.
        </p>
        <p style={styles.hint}>this usually takes a few hours.</p>

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
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  heading: {
    fontSize: '20px',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888888',
    lineHeight: '1.6',
  },
  hint: {
    fontSize: '12px',
    color: '#555555',
  },
};

export default Pending;