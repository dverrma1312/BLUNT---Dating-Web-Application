import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={styles.container}>
      {/* Header/Navbar */}
      <header style={styles.header}>
        <div style={styles.logo}>BLUNT</div>
        <nav style={styles.nav}>
          <Link to="#" style={styles.navLink}>Categories</Link>
          <Link to="#" style={styles.navLink}>Why BLUNT</Link>
          <Link to="#" style={styles.navLink}>Safety</Link>
          <Link to="#" style={styles.navLink}>Support</Link>
        </nav>
        <div style={styles.placeholder}></div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        {/* Big BLUNT logo in center */}
        <h1 style={styles.heroLogo}>BLUNT</h1>

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
    justifyContent: 'space-between',
    padding: '20px 48px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#F5F5F5',
    letterSpacing: '-1px',
  },
  nav: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    fontSize: '14px',
    color: '#888888',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  placeholder: {
    width: '80px',
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
    fontSize: 'clamp(120px, 30vw, 320px)',
    fontWeight: '700',
    color: '#141414',
    letterSpacing: '-8px',
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