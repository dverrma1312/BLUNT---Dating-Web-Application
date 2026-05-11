import { Link } from 'react-router-dom';

const navLinkHoverStyle = `
  .nav-link:hover { color: #FFFFFF !important; }
`;

function Landing() {
  return (
    <div style={styles.container}>
      <style>{navLinkHoverStyle}</style>
      {/* Header/Navbar */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link to="#" className="nav-link" style={styles.navLink}>Why BLUNT</Link>
          <span className="nav-link" style={styles.navLink}>Categories</span>
          <Link to="#" className="nav-link" style={styles.navLink}>Safety</Link>
          <Link to="#" className="nav-link" style={styles.navLink}>Support</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        {/* Big blunt. logo in center */}
        <h1 style={styles.heroLogo}>blunt.</h1>

        {/* Login/Signup links in center */}
        <div style={styles.authLinks}>
          <Link to="/login" style={styles.authLink}>Log In</Link>
          <Link to="/register" style={styles.authLinkPrimary}>Sign Up</Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0A0A0A',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 48px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  nav: {
    display: 'flex',
    gap: '48px',
    alignItems: 'center',
    position: 'relative',
  },
  navLink: {
    fontSize: '14px',
    color: '#888888',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontWeight: '400',
    cursor: 'pointer',
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroLogo: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 'clamp(80px, 20vw, 200px)',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
    userSelect: 'none',
    marginBottom: '32px',
  },
  authLinks: {
    display: 'flex',
    gap: '16px',
    zIndex: 1,
  },
  authLink: {
    fontSize: '16px',
    color: '#888888',
    textDecoration: 'none',
    padding: '12px 24px',
    border: '1px solid #333333',
    borderRadius: '8px',
    fontWeight: '400',
  },
  authLinkPrimary: {
    fontSize: '16px',
    color: '#0A0A0A',
    backgroundColor: '#FFFFFF',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '500',
  },
};

export default Landing;