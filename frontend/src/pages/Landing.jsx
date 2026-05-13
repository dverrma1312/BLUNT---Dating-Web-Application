import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const navLinkHoverStyle = `
  .nav-link:hover { color: #FFFFFF !important; }
`;

function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const heroRef = useRef(null);
  const sectionTwoRef = useRef(null);
  const sectionThreeRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const hero = heroRef.current;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionTwoRef.current) observer.observe(sectionTwoRef.current);
    if (sectionThreeRef.current) observer.observe(sectionThreeRef.current);
    if (footerRef.current) observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollProgress * 2);
  const heroTransform = `translateX(${scrollProgress * 50}%) scale(${1 - scrollProgress * 0.5})`;
  const dockedScale = Math.min(1, scrollProgress * 2);
  const dockedOpacity = Math.max(0, (scrollProgress - 0.3) / 0.7);

  return (
    <div style={styles.container}>
      <style>{navLinkHoverStyle}</style>

      {/* Header/Navbar */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link to="#" className="nav-link" style={styles.navLink}>Why blunt</Link>
          <span className="nav-link" style={styles.navLink}>Categories</span>
          <Link to="#" className="nav-link" style={styles.navLink}>Safety</Link>
          <Link to="#" className="nav-link" style={styles.navLink}>Support</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} style={styles.hero}>
        {/* Big blunt. logo in center - transforms on scroll */}
        <h1 style={{
          ...styles.heroLogo,
          opacity: heroOpacity,
          transform: heroTransform,
        }}>
          blunt<span style={styles.period}>.</span>
          <span style={styles.emberTip}></span>
        </h1>

        {/* Docked blunt. in corner */}
        <h1 style={{
          ...styles.dockedLogo,
          opacity: dockedOpacity,
          transform: `scale(${dockedScale})`,
        }}>
          blunt<span style={styles.period}>.</span>
        </h1>

        {/* Login/Signup links in center */}
        <div style={{...styles.authLinks, opacity: heroOpacity}}>
          <Link to="/login" style={styles.authLink}>Log In</Link>
          <Link to="/register" style={styles.authLinkPrimary}>Sign Up</Link>
        </div>

        {/* Scroll Indicator */}
        <div style={{...styles.scrollIndicator, opacity: heroOpacity}}>
          <span style={styles.scrollLabel}>SCROLL</span>
          <div style={styles.scrollLine}></div>
        </div>
      </section>

      {/* Second Section - No filters, just vibes */}
      <section style={{
        ...styles.sectionTwo,
        opacity: Math.max(0, (scrollProgress - 0.5) * 2),
        transform: `translateY(${(1 - Math.max(0, (scrollProgress - 0.5) * 2)) * 50}px)`,
      }}>
        <div style={styles.splitContent}>
          {/* Left side - Headline */}
          <div style={styles.leftContent}>
            <h2 style={styles.headline}>
              <span style={{...styles.headlineWord, opacity: scrollProgress > 0.6 ? 1 : 0, transform: scrollProgress > 0.6 ? 'translateY(0)' : 'translateY(30px)'}}>No filters.</span>
            </h2>
            <h2 style={styles.headline}>
              <span style={{...styles.headlineWord, opacity: scrollProgress > 0.7 ? 1 : 0, transform: scrollProgress > 0.7 ? 'translateY(0)' : 'translateY(30px)', transitionDelay: '0.1s'}}>Just vibes.</span>
            </h2>
            <p style={styles.subtext}>Be honest about what you want. Find someone who wants the same.</p>
            <Link to="/register" style={styles.darkCTA}>Get Started</Link>
          </div>

          {/* Right side - Orbit design */}
          <div style={styles.rightContent}>
            <div style={styles.orbitContainer}>
              {/* Orbit track (dashed circle) */}
              <div style={styles.orbitTrack}></div>

              {/* Ember dot at top */}
              <div style={styles.emberTop}></div>

              {/* Center circle with blunt. wordmark */}
              <div style={styles.centerCircle}>
                <span style={styles.centerWordmark}>blunt.</span>
              </div>

              {/* Orbiting pills container - rotates */}
              <div style={styles.orbitingWrapper}>
                <div style={{...styles.orbitingPill, top: 0}}>
                  <span style={styles.orbitingPillText}>hookup</span>
                </div>
                <div style={{...styles.orbitingPill, right: 0}}>
                  <span style={styles.orbitingPillText}>hangout</span>
                </div>
                <div style={{...styles.orbitingPill, bottom: 0}}>
                  <span style={styles.orbitingPillText}>smokeup</span>
                </div>
                <div style={{...styles.orbitingPill, left: 0}}>
                  <span style={styles.orbitingPillText}>coffee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Got an idea? */}
      <section
        ref={sectionThreeRef}
        data-section="sectionThree"
        style={{
          ...styles.sectionThree,
          opacity: visibleSections.sectionThree ? 1 : 0,
          transform: visibleSections.sectionThree ? 'translateY(0)' : 'translateY(50px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div style={styles.splitContent}>
          {/* Left side - Card with stamp */}
          <div style={styles.leftContentThree}>
            <div style={styles.stampCard}>
              <div style={styles.cardGrain}></div>
              <svg style={styles.stampSvg} viewBox="0 0 200 200">
                {/* Rotating outer ring with text */}
                <g style={styles.rotatingText}>
                  <path
                    id="textPath"
                    d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                    fill="none"
                  />
                  <text style={styles.circularText}>
                    <textPath href="#textPath" startOffset="0%">
                      • blunt community • blunt community •
                    </textPath>
                  </text>
                </g>
                {/* Inner blunt. wordmark - stays still */}
                <text x="100" y="105" style={styles.stampInnerText}>blunt.</text>
              </svg>
            </div>
          </div>

          {/* Right side - Form */}
          <div style={styles.rightContentThree}>
            <h2 style={styles.headlineThree}>Got an idea?</h2>
            <p style={styles.subtextThree}>
              Help shape blunt. Tell us what you'd want to see — features, vibes, anything.
            </p>
            <textarea
              style={styles.inputField}
              placeholder="Drop your idea here..."
              rows={4}
            />
            <button style={styles.submitButton}>Suggest</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        ref={footerRef}
        data-section="footer"
        style={{
          ...styles.footer,
          opacity: visibleSections.footer ? 1 : 0,
          transform: visibleSections.footer ? 'translateY(0)' : 'translateY(50px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Top row */}
        <div style={styles.footerTop}>
          <span style={styles.footerLogo}>blunt.</span>
          <span style={styles.footerTagline}>Be honest. Find your vibe.</span>
        </div>

        {/* Middle row - 3 columns */}
        <div style={styles.footerMiddle}>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColumnTitle}>Company</h4>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>Why blunt</a>
              <a href="#" style={styles.footerLink}>Safety</a>
              <a href="#" style={styles.footerLink}>Support</a>
              <a href="#" style={styles.footerLink}>Contact</a>
            </div>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColumnTitle}>Legal</h4>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Terms & Conditions</a>
              <a href="#" style={styles.footerLink}>Cookie Policy</a>
            </div>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColumnTitle}>Find Us</h4>
            <div style={styles.locationText}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={styles.mapPin}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E8512A"/>
              </svg>
              <span>Mohali, Punjab, India</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={styles.footerBottom}>
          <span style={styles.copyright}>© 2025 blunt. All rights reserved.</span>
          <div style={styles.socialIcons}>
            <a href="#" style={styles.socialIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" style={styles.socialIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" style={styles.socialIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" style={styles.socialIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
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
    cursor: 'none',
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
    fontSize: 'clamp(140px, 22vw, 300px)',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
    userSelect: 'none',
    marginBottom: '32px',
    position: 'relative',
  },
  period: {
    position: 'relative',
  },
  emberTip: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    right: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
    animation: 'emberPulse 2s ease-in-out infinite',
    boxShadow: '0 0 20px 10px rgba(232, 81, 42, 0.6)',
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
    cursor: 'none',
  },
  authLinkPrimary: {
    fontSize: '16px',
    color: '#0A0A0A',
    backgroundColor: '#FFFFFF',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'none',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  scrollLabel: {
    fontSize: '10px',
    color: '#888888',
    letterSpacing: '3px',
    textTransform: 'lowercase',
  },
  scrollLine: {
    width: '1px',
    height: '40px',
    background: 'linear-gradient(to bottom, #E8512A, transparent)',
    animation: 'scrollDrop 2s ease-in-out infinite',
  },
  dockedLogo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    userSelect: 'none',
    position: 'absolute',
    top: '24px',
    right: '48px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  sectionTwo: {
    minHeight: '100vh',
    backgroundColor: '#FAFAFA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 48px',
    position: 'relative',
  },
  splitContent: {
    display: 'flex',
    width: '100%',
    maxWidth: '1200px',
    gap: '80px',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headline: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(64px, 12vw, 120px)',
    fontWeight: 400,
    color: '#0A0A0A',
    letterSpacing: '0.02em',
    lineHeight: 0.95,
    margin: 0,
  },
  headlineWord: {
    display: 'block',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  },
  subtext: {
    fontSize: '18px',
    color: '#888888',
    fontWeight: 300,
    maxWidth: '400px',
    lineHeight: 1.5,
  },
  darkCTA: {
    display: 'inline-block',
    fontSize: '16px',
    color: '#FFFFFF',
    backgroundColor: '#0A0A0A',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontWeight: 500,
    width: 'fit-content',
    cursor: 'none',
  },
  rightContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: '500px',
  },
  orbitContainer: {
    position: 'relative',
    width: '400px',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitTrack: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    border: '1px dashed #222222',
    borderRadius: '50%',
  },
  centerCircle: {
    width: '200px',
    height: '200px',
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  centerWordmark: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '32px',
    color: '#FFFFFF',
    letterSpacing: '0.02em',
  },
  emberTop: {
    position: 'absolute',
    top: '20px',
    width: '8px',
    height: '8px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    zIndex: 20,
    animation: 'emberPulse 2s ease-in-out infinite',
    boxShadow: '0 0 15px 8px rgba(232, 81, 42, 0.5)',
  },
  orbitingWrapper: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    animation: 'orbitRotate 12s linear infinite',
  },
  orbitingPill: {
    position: 'absolute',
    width: '80px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitingPillText: {
    backgroundColor: '#E8512A',
    color: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '14px',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  sectionThree: {
    minHeight: '100vh',
    backgroundColor: '#0A0A0A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 48px',
    position: 'relative',
  },
  leftContentThree: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCard: {
    width: '400px',
    height: '500px',
    backgroundColor: '#141414',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  stampSvg: {
    width: '280px',
    height: '280px',
  },
  rotatingText: {
    animation: 'spin 12s linear infinite',
    transformOrigin: '100px 100px',
  },
  circularText: {
    fontSize: '10px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    letterSpacing: '3px',
    fill: '#E8512A',
    textTransform: 'uppercase',
  },
  stampInnerText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '42px',
    fill: '#FFFFFF',
    textAnchor: 'middle',
  },
  rightContentThree: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingLeft: '40px',
  },
  headlineThree: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(64px, 10vw, 96px)',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    margin: 0,
  },
  subtextThree: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '18px',
    fontWeight: 300,
    color: '#888888',
    maxWidth: '450px',
    lineHeight: 1.5,
  },
  inputField: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '16px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'vertical',
    minHeight: '120px',
    width: '100%',
    maxWidth: '450px',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'none',
    width: 'fit-content',
    maxWidth: '450px',
  },
  footer: {
    backgroundColor: '#0A0A0A',
    borderTop: '1px solid #222222',
    padding: '60px 48px 40px',
  },
  footerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '48px',
  },
  footerLogo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '48px',
    color: '#FFFFFF',
    letterSpacing: '0.02em',
  },
  footerTagline: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    color: '#888888',
  },
  footerMiddle: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '48px',
    paddingBottom: '48px',
    borderBottom: '1px solid #222222',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  footerColumnTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    color: '#888888',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerLink: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#FFFFFF',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  locationText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#FFFFFF',
  },
  mapPin: {
    flexShrink: 0,
  },
  footerBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
  },
  copyright: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    color: '#888888',
  },
  socialIcons: {
    display: 'flex',
    gap: '20px',
  },
  socialIcon: {
    color: '#FFFFFF',
    transition: 'color 0.2s',
  },
};

export default Landing;