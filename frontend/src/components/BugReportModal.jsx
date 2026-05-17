import { useState } from 'react';
import api from '../api/axios';

function BugReportModal({ isOpen, onClose, page }) {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/api/bug-reports/', {
        page: page || 'unknown',
        description: description.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setDescription('');
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.log('Bug report error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        {submitted ? (
          <div style={styles.success}>
            <span style={styles.checkmark}>✓</span>
            <p style={styles.successText}>Report sent. Thanks!</p>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Report a bug</h2>
            <p style={styles.subtitle}>Tell us what went wrong</p>

            <form onSubmit={handleSubmit}>
              <textarea
                style={styles.textarea}
                placeholder="What happened? (e.g., app crashed, button not working, wrong behavior)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                autoFocus
              />

              <button
                type="submit"
                disabled={submitting || !description.trim()}
                style={{
                  ...styles.button,
                  opacity: submitting || !description.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? 'Sending...' : 'Send Report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#141414',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '24px',
    width: '90%',
    maxWidth: '360px',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '18px',
    cursor: 'pointer',
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '20px',
    color: '#FFFFFF',
    marginBottom: '4px',
    marginTop: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '16px',
  },
  textarea: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    border: '1px solid #222',
    borderRadius: '4px',
    padding: '12px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    color: '#080808',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  },
  success: {
    textAlign: 'center',
    padding: '20px 0',
  },
  checkmark: {
    display: 'block',
    fontSize: '32px',
    color: '#00D26A',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
  },
};

export default BugReportModal;