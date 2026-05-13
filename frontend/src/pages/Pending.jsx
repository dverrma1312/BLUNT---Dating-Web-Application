import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Pending() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkApproval() {
      try {
        const res = await api.get('/api/users/profile/');
        if (res.data.is_approved) {
          navigate('/discovery');
        }
      } catch (err) {
        navigate('/register');
      }
    }

    checkApproval();

    const interval = setInterval(checkApproval, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Grain texture overlay */}
      <div style={styles.grain}></div>

      {/* Blunt. wordmark with ember dot */}
      <h1 style={styles.logo}>
        blunt<span style={styles.period}>.</span>
        <span style={styles.emberDot}></span>
      </h1>

      {/* Pulsing dots animation */}
      <div style={styles.dotsContainer}>
        <span style={styles.dot}></span>
        <span style={{...styles.dot, animationDelay: '0.2s'}}></span>
        <span style={{...styles.dot, animationDelay: '0.4s'}}></span>
      </div>

      {/* Big headline */}
      <h2 style={styles.headline}>you're on the list.</h2>

      {/* Subtext */}
      <div style={styles.subtextContainer}>
        <p style={styles.subtext}>our team is reviewing your profile.</p>
        <p style={styles.subtext}>once approved, you'll get access to the app.</p>
      </div>

      {/* Hint */}
      <p style={styles.hint}>this usually takes a few hours.</p>

      {/* Bottom section */}
      <div style={styles.bottomSection}>
        <div style={styles.divider}></div>
        <p style={styles.bottomText}>made in mohali. 🔥</p>
      </div>
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
    marginBottom: '32px',
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
  dotsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    zIndex: 1,
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    animation: 'dotPulse 1.2s ease-in-out infinite',
    animationFillMode: 'both',
  },
  headline: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '72px',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    textAlign: 'center',
    marginBottom: '24px',
    animation: 'slideUpFade 0.8s ease-out forwards',
    zIndex: 1,
  },
  subtextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '400px',
    textAlign: 'center',
    marginBottom: '16px',
    zIndex: 1,
  },
  subtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#888888',
    lineHeight: 1.5,
  },
  hint: {
    fontSize: '12px',
    color: '#555555',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '60px',
    zIndex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    zIndex: 1,
  },
  divider: {
    width: '100px',
    height: '1px',
    backgroundColor: '#222222',
  },
  bottomText: {
    fontSize: '11px',
    color: '#444444',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.2em',
  },
};

export default Pending;