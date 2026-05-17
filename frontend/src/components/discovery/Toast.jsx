function Toast({ toast }) {
  if (!toast) return null;

  const getStyles = () => {
    const base = {
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      borderRadius: '24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      zIndex: 100,
      animation: 'toastFade 0.3s ease',
    };

    if (toast.type === 'match') {
      return {
        ...base,
        backgroundColor: '#E8512A',
        color: '#FFFFFF',
        boxShadow: '0 0 30px rgba(232,81,42,0.5)',
      };
    }
    if (toast.type === 'select') {
      return {
        ...base,
        backgroundColor: '#FFFFFF',
        color: '#080808',
      };
    }
    return {
      ...base,
      backgroundColor: '#1A1A1A',
      color: '#888888',
    };
  };

  return <div style={getStyles()}>{toast.message}</div>;
}

export default Toast;
