function ContextualSuggestion({ suggestion, onDismiss }) {
  if (!suggestion) return null;

  return (
    <div style={styles.container}>
      <div style={styles.icon}>💡</div>
      <p style={styles.text}>{suggestion}</p>
      {onDismiss && (
        <button style={styles.dismiss} onClick={onDismiss}>✕</button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: '13px',
    color: '#888',
    fontFamily: "'DM Sans', sans-serif",
    margin: 0,
    lineHeight: 1.4,
  },
  dismiss: {
    background: 'none',
    border: 'none',
    color: '#444',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px',
    flexShrink: 0,
  },
};

export default ContextualSuggestion;