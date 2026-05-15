import { useState, useEffect } from 'react';
import api from '../../api/axios';

const CATEGORIES = [
  { value: 'hookup', label: 'Hookup', emoji: '🔥' },
  { value: 'hangout', label: 'Hangout', emoji: '🎉' },
  { value: 'smokeup', label: 'Smoke Up', emoji: '🌿' },
  { value: 'coffee', label: 'Coffee & Chill', emoji: '☕' },
];

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    cursor: 'default',
  },
  panel: {
    backgroundColor: '#0F0F0F',
    borderRadius: '16px',
    padding: '32px',
    width: '440px',
    maxWidth: '90vw',
    border: '1px solid #1A1A1A',
    maxHeight: '90vh',
    overflowY: 'auto',
    cursor: 'default',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '24px',
    color: '#F5F5F5',
    letterSpacing: '0.05em',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
  },
  editTimer: {
    backgroundColor: '#161616',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timerIcon: {
    color: '#E8512A',
    fontSize: '18px',
  },
  timerText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#888',
  },
  timerHighlight: {
    color: '#F5F5F5',
    fontWeight: 600,
  },
  categorySection: {
    marginBottom: '24px',
  },
  categoryLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
  },
  currentCategory: {
    backgroundColor: '#161616',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  currentCategoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  categoryEmoji: {
    fontSize: '24px',
  },
  categoryName: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    color: '#F5F5F5',
    fontWeight: 500,
  },
  changeBtn: {
    background: 'none',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#888',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  categoryOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  categoryOption: {
    backgroundColor: '#161616',
    border: '1px solid #1A1A1A',
    borderRadius: '10px',
    padding: '14px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  categoryOptionSelected: {
    borderColor: '#E8512A',
    backgroundColor: 'rgba(232, 81, 42, 0.1)',
  },
  categoryOptionEmoji: {
    fontSize: '20px',
  },
  categoryOptionLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#F5F5F5',
  },
  previewBox: {
    backgroundColor: '#161616',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  previewTitle: {
    color: '#888',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  previewStat: {
    textAlign: 'center',
  },
  previewNumber: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '28px',
    color: '#F5F5F5',
    lineHeight: 1,
  },
  previewLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
  },
  previewIntentLabel: {
    color: '#E8512A',
  },
  secondarySection: {
    marginBottom: '20px',
  },
  sectionLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '10px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    backgroundColor: '#161616',
    border: '1px solid #1A1A1A',
    borderRadius: '8px',
    padding: '12px',
    color: '#F5F5F5',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    outline: 'none',
    cursor: 'default',
  },
  inputFocus: {
    borderColor: '#333',
  },
  toggleGroup: {
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#161616',
    border: '1px solid #1A1A1A',
    borderRadius: '8px',
    color: '#666',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleBtnActive: {
    backgroundColor: '#E8512A',
    borderColor: '#E8512A',
    color: '#FFFFFF',
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#E8512A',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.2s ease',
  },
  saveBtnDisabled: {
    backgroundColor: '#333',
    color: '#666',
    cursor: 'not-allowed',
  },
  lockedOverlay: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  lockedTitle: {
    color: '#E8512A',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  countdown: {
    color: '#888',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
  },
  loading: {
    color: '#666',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    textAlign: 'center',
    padding: '40px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#1A1A1A',
    marginBottom: '20px',
  },
};

function FilterPanel({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [intent, setIntent] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Form state
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(50);
  const [city, setCity] = useState('');
  const [drinks, setDrinks] = useState(null);
  const [smokes, setSmokes] = useState(null);
  const [weed, setWeed] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(async () => {
        await saveAndPreview();
      }, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageMin, ageMax, city, drinks, smokes, weed]);

  async function fetchData() {
    try {
      // Fetch user intent
      try {
        const intentRes = await api.get('/api/intent/');
        setIntent(intentRes.data);
      } catch (e) {
        // Intent might not exist yet
      }

      // Fetch preferences
      const prefRes = await api.get('/api/discovery/preferences/');
      setAgeMin(prefRes.data.age_min);
      setAgeMax(prefRes.data.age_max);
      setCity(prefRes.data.city || '');
      setDrinks(prefRes.data.drinks);
      setSmokes(prefRes.data.smokes);
      setWeed(prefRes.data.weed);

      // Fetch preview
      const previewRes = await api.get('/api/discovery/pool-preview/');
      setPreview(previewRes.data);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveAndPreview() {
    try {
      await api.put('/api/discovery/preferences/', {
        age_min: ageMin,
        age_max: ageMax,
        city,
        drinks,
        smokes,
        weed,
      });
      const res = await api.get('/api/discovery/pool-preview/');
      setPreview(res.data);
    } catch (err) {
      console.error('saveAndPreview error:', err);
    }
  }

  async function handleCategoryChange(category) {
    try {
      await api.put('/api/intent/', {
        looking_for: category,
      });
      setIntent({ ...intent, looking_for: category });
      setShowCategoryPicker(false);
      // Refresh preview after category change
      const previewRes = await api.get('/api/discovery/pool-preview/');
      setPreview(previewRes.data);
    } catch (err) {
      console.error('handleCategoryChange error:', err);
    }
  }

  async function handleSave() {
    if (preview && !preview.is_editable) return;

    setSaving(true);
    try {
      await api.put('/api/discovery/preferences/', {
        age_min: ageMin,
        age_max: ageMax,
        city,
        drinks,
        smokes,
        weed,
      });
      onClose();
    } catch (err) {
      console.error('save error:', err);
    } finally {
      setSaving(false);
    }
  }

  function formatCountdown(isoString) {
    if (!isoString) return '';
    const target = new Date(isoString);
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) return 'Pool generating...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m left to edit`;
  }

  function getCurrentCategory() {
    const currentValue = intent?.looking_for || preview?.looking_for;
    return CATEGORIES.find(c => c.value === currentValue) || CATEGORIES[0];
  }

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.panel}>
          <p style={styles.loading}>loading...</p>
        </div>
      </div>
    );
  }

  const isLocked = preview && !preview.is_editable;
  const currentCategory = getCurrentCategory();

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>DAILY INTENT</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Edit Timer */}
        <div style={styles.editTimer}>
          <span style={styles.timerIcon}>⏱</span>
          <span style={styles.timerText}>
            Edit window: <span style={styles.timerHighlight}>{formatCountdown(preview?.lock_time)}</span>
          </span>
        </div>

        {/* Current Category - Prominent Display */}
        <div style={styles.categorySection}>
          <div style={styles.categoryLabel}>Your Intent</div>
          {!showCategoryPicker ? (
            <div style={styles.currentCategory}>
              <div style={styles.currentCategoryInfo}>
                <span style={styles.categoryEmoji}>{currentCategory.emoji}</span>
                <span style={styles.categoryName}>{currentCategory.label}</span>
              </div>
              {!isLocked && (
                <button
                  style={styles.changeBtn}
                  onClick={() => setShowCategoryPicker(true)}
                >
                  Change
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={styles.categoryOptions}>
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.value}
                    style={{
                      ...styles.categoryOption,
                      ...(currentCategory.value === cat.value ? styles.categoryOptionSelected : {}),
                    }}
                    onClick={() => handleCategoryChange(cat.value)}
                  >
                    <span style={styles.categoryOptionEmoji}>{cat.emoji}</span>
                    <span style={styles.categoryOptionLabel}>{cat.label}</span>
                  </div>
                ))}
              </div>
              <button
                style={{...styles.changeBtn, marginTop: '10px', width: '100%'}}
                onClick={() => setShowCategoryPicker(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div style={styles.divider} />

        {/* Pool Preview */}
        {preview && (
          isLocked ? (
            <div style={styles.lockedOverlay}>
              <div style={styles.lockedTitle}>POOL IS LOCKED</div>
              <div style={styles.countdown}>{formatCountdown(preview.generation_time)}</div>
            </div>
          ) : (
            <div style={styles.previewBox}>
              <div style={styles.previewHeader}>
                <span style={styles.previewTitle}>Tomorrow's Pool</span>
              </div>
              <div style={styles.previewGrid}>
                <div style={styles.previewStat}>
                  <div style={{...styles.previewNumber, ...styles.previewIntentLabel}}>
                    ~{preview.intent_matches}
                  </div>
                  <div style={styles.previewLabel}>Matching</div>
                </div>
                <div style={styles.previewStat}>
                  <div style={styles.previewNumber}>~{preview.random_fills}</div>
                  <div style={styles.previewLabel}>Others</div>
                </div>
                <div style={styles.previewStat}>
                  <div style={styles.previewNumber}>~{preview.total}</div>
                  <div style={styles.previewLabel}>Total</div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Secondary Filters */}
        <div style={styles.secondarySection}>
          <div style={styles.sectionLabel}>Preferences</div>

          {/* Age Range */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{...styles.sectionLabel, marginBottom: '8px'}}>Age Range</label>
            <div style={styles.row}>
              <input
                type="number"
                style={styles.input}
                value={ageMin}
                onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
                min={18}
                max={99}
                disabled={isLocked}
              />
              <input
                type="number"
                style={styles.input}
                value={ageMax}
                onChange={(e) => setAgeMax(parseInt(e.target.value) || 50)}
                min={18}
                max={99}
                disabled={isLocked}
              />
            </div>
          </div>

          {/* City */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{...styles.sectionLabel, marginBottom: '8px'}}>City</label>
            <input
              type="text"
              style={styles.input}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Any city"
              disabled={isLocked}
            />
          </div>

          {/* Lifestyle Toggles */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{...styles.sectionLabel, marginBottom: '8px'}}>Drinks</label>
            <div style={styles.toggleGroup}>
              <button
                style={{ ...styles.toggleBtn, ...(drinks === null ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setDrinks(null)}
                disabled={isLocked}
              >
                Any
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(drinks === true ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setDrinks(true)}
                disabled={isLocked}
              >
                Yes
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(drinks === false ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setDrinks(false)}
                disabled={isLocked}
              >
                No
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{...styles.sectionLabel, marginBottom: '8px'}}>Smokes</label>
            <div style={styles.toggleGroup}>
              <button
                style={{ ...styles.toggleBtn, ...(smokes === null ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setSmokes(null)}
                disabled={isLocked}
              >
                Any
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(smokes === true ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setSmokes(true)}
                disabled={isLocked}
              >
                Yes
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(smokes === false ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setSmokes(false)}
                disabled={isLocked}
              >
                No
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{...styles.sectionLabel, marginBottom: '8px'}}>Weed</label>
            <div style={styles.toggleGroup}>
              <button
                style={{ ...styles.toggleBtn, ...(weed === null ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setWeed(null)}
                disabled={isLocked}
              >
                Any
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(weed === true ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setWeed(true)}
                disabled={isLocked}
              >
                Yes
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(weed === false ? styles.toggleBtnActive : {}) }}
                onClick={() => !isLocked && setWeed(false)}
                disabled={isLocked}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          style={{
            ...styles.saveBtn,
            ...(isLocked ? styles.saveBtnDisabled : {}),
          }}
          onClick={handleSave}
          disabled={isLocked || saving}
        >
          {saving ? 'saving...' : isLocked ? 'Locked' : 'Save Daily Intent'}
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;