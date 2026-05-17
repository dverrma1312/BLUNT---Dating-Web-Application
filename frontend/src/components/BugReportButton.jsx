import { useState } from 'react';
import BugReportModal from './BugReportModal';

function BugReportButton({ page }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={styles.button}
        title="Report a bug"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </button>
      <BugReportModal isOpen={isOpen} onClose={() => setIsOpen(false)} page={page} />
    </>
  );
}

const styles = {
  button: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1A1A1A',
    border: '1px solid #333',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'color 0.2s, border-color 0.2s',
  },
};

export default BugReportButton;