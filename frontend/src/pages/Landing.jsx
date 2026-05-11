import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const categories = ['Hangout', 'Smokeup', 'Coffee', 'Hookup', 'Nightout', 'Linkup', 'Tripout', 'Workout'];

function Landing() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  const handleCategorySelect = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      {/* Header/Navbar */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link to="#" style={styles.navLink}>Why BLUNT</Link>
          <div
            style={styles.dropdownContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span style={styles.navLink}>
              Categories
            </span>
            {dropdownOpen && (
              <div style={styles.dropdown} onMouseEnter={handleMouseEnter}>
                {categories.map((cat) => (
                  <div
                    key={cat}
                    style={styles.dropdownItem}
                    onClick={handleCategorySelect}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="#" style={styles.navLink}>Safety</Link>
          <Link to="#" style={styles.navLink}>Support</Link>
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
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '12px',
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '8px',
    padding: '8px 0',
    minWidth: '140px',
    zIndex: 200,
  },
  dropdownItem: {
    fontSize: '14px',
    color: '#F5F5F5',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
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