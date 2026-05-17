import { useState } from 'react';

function RemoveMatchModal({
  showRemoveModal,
  removeReason,
  setRemoveReason,
  removeError,
  setRemoveError,
  setShowRemoveModal,
  removing,
  handleRemoveMatch,
}) {
  const [removeFocus, setRemoveFocus] = useState(false);

  if (!showRemoveModal) return null;

  return (
    <div style={styles.removeModalOverlay}>
      <div style={styles.removeModalCard}>
        <span style={styles.removeModalLabel}>why are you removing this match?</span>
        <span style={{
          ...styles.removeModalCharCount,
          color: removeReason.length >= 10 ? '#555' : '#E8512A',
          textAlign: 'right'
        }}>
          {removeReason.length} / 100
        </span>
        <textarea
          value={removeReason}
          onChange={e => {
            if (e.target.value.length <= 100) setRemoveReason(e.target.value);
          }}
          placeholder="be honest, they won't see your name..."
          rows={2}
          style={{
            ...styles.removeModalTextarea,
            borderColor: removeFocus ? '#E8512A' : '#1E1E1E',
            padding: '10px 12px',
            fontSize: '13px',
          }}
          onFocus={() => setRemoveFocus(true)}
          onBlur={() => setRemoveFocus(false)}
        />
        {removeError && (
          <span style={styles.removeModalError}>{removeError}</span>
        )}
        <div style={styles.removeModalButtons}>
          <button
            style={styles.removeModalCancel}
            onClick={() => {
              setShowRemoveModal(false);
              setRemoveReason('');
              setRemoveError('');
            }}
          >
            cancel
          </button>
          <button
            style={{
              ...styles.removeModalConfirm,
              backgroundColor: removing ? '#1A1A1A' : '#F5F5F5',
              color: removing ? '#555' : '#0A0A0A',
              cursor: removing ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
            }}
            onClick={handleRemoveMatch}
            disabled={removing}
          >
            {removing ? 'removing...' : 'remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  removeModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,8,8,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backdropFilter: 'blur(4px)',
  },
  removeModalCard: {
    backgroundColor: '#0D0D0D',
    border: '1px solid #1A1A1A',
    borderRadius: '4px',
    padding: '24px',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  removeModalCharCount: {
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
  },
  removeModalLabel: {
    fontSize: '13px',
    color: '#888',
    fontFamily: "'DM Sans', sans-serif",
  },
  removeModalTextarea: {
    width: '100%',
    backgroundColor: '#111',
    border: '1px solid #1E1E1E',
    borderRadius: '2px',
    padding: '14px',
    color: '#F5F5F5',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
  },
  removeModalError: {
    fontSize: '12px',
    color: '#E8512A',
    fontFamily: "'DM Sans', sans-serif",
  },
  removeModalButtons: {
    display: 'flex',
    gap: '12px',
  },
  removeModalCancel: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #1A1A1A',
    color: '#555',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '2px',
    cursor: 'pointer',
  },
  removeModalConfirm: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#F5F5F5',
    color: '#0A0A0A',
    border: 'none',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderRadius: '2px',
    cursor: 'pointer',
  },
};

export { styles };
export default RemoveMatchModal;