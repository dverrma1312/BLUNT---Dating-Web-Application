import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ProfileSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [form, setForm] = useState({
    description: '',
    relationship_type: '',
    religion: '',
    sexuality: '',
    drugs: '',
    smoke: '',
    weed: '',
    alcohol: '',
    dob_day: '',
    dob_month: '',
    dob_year: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const monthMap = {
      January: '01', February: '02', March: '03', April: '04',
      May: '05', June: '06', July: '07', August: '08',
      September: '09', October: '10', November: '11', December: '12'
    };

    const monthName = months[parseInt(form.dob_month) - 1];
    const date_of_birth = form.dob_year && form.dob_month && form.dob_day
      ? `${form.dob_year}-${monthMap[monthName]}-${String(form.dob_day).padStart(2, '0')}`
      : '';

    try {
      await api.put('/api/users/profile/', {
        description: form.description,
        relationship_type: form.relationship_type,
        religion: form.religion,
        sexuality: form.sexuality,
        drugs: form.drugs,
        smoke: form.smoke,
        weed: form.weed,
        alcohol: form.alcohol,
        date_of_birth: date_of_birth,
      });
      navigate('/photos');
    } catch (err) {
      console.log('Profile update error full:', JSON.stringify(err.response?.data));
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const toggleStyle = (isSelected) => ({
    flex: 1,
    padding: '14px 16px',
    backgroundColor: isSelected ? '#FFFFFF' : '#141414',
    color: isSelected ? '#0A0A0A' : '#888888',
    border: '1px solid #222222',
    borderRadius: '4px',
    cursor: 'none',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: 'background-color 0.2s, color 0.2s',
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 36 }, (_, i) => 2005 - i);

  return (
    <div style={styles.container}>
      {/* Grain texture overlay */}
      <div style={styles.grain}></div>

      {/* Blunt. wordmark with ember dot */}
      <h1 style={styles.logo}>
        blunt<span style={styles.period}>.</span>
        <span style={styles.emberDot}></span>
      </h1>

      {/* Subtext */}
      <p style={styles.subtext}>Tell us about yourself.</p>

      {/* Error message */}
      {error && (
        <p style={styles.error}>{error}</p>
      )}

      {/* Profile setup form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          name="description"
          placeholder="Describe Yourself in a Few Words"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
          style={styles.textarea}
        />

        {/* Relationship Type */}
        <select
          name="relationship_type"
          value={form.relationship_type}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="" style={styles.selectOption}>Relationship Type</option>
          <option value="monogamy" style={styles.selectOption}>Monogamy</option>
          <option value="non-monogamy" style={styles.selectOption}>Non-Monogamy</option>
        </select>

        {/* Religion */}
        <select
          name="religion"
          value={form.religion}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="" style={styles.selectOption}>Religion</option>
          <option value="Hindu" style={styles.selectOption}>Hindu</option>
          <option value="Muslim" style={styles.selectOption}>Muslim</option>
          <option value="Sikh" style={styles.selectOption}>Sikh</option>
          <option value="Christian" style={styles.selectOption}>Christian</option>
          <option value="Buddhist" style={styles.selectOption}>Buddhist</option>
          <option value="Jain" style={styles.selectOption}>Jain</option>
          <option value="Atheist" style={styles.selectOption}>Atheist</option>
          <option value="Agnostic" style={styles.selectOption}>Agnostic</option>
          <option value="Other" style={styles.selectOption}>Other</option>
        </select>

        {/* Sexuality */}
        <select
          name="sexuality"
          value={form.sexuality}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="" style={styles.selectOption}>Sexuality</option>
          <option value="Straight" style={styles.selectOption}>Straight</option>
          <option value="Gay" style={styles.selectOption}>Gay</option>
          <option value="Lesbian" style={styles.selectOption}>Lesbian</option>
          <option value="Bisexual" style={styles.selectOption}>Bisexual</option>
          <option value="Pansexual" style={styles.selectOption}>Pansexual</option>
          <option value="Asexual" style={styles.selectOption}>Asexual</option>
          <option value="Prefer Not To Say" style={styles.selectOption}>Prefer Not To Say</option>
        </select>

        {/* Date of Birth */}
        <div style={styles.dobContainer}>
          <select
            name="dob_day"
            value={form.dob_day}
            onChange={handleChange}
            required
            style={styles.dobSelect}
          >
            <option value="" style={styles.selectOption}>Day</option>
            {days.map(d => <option key={d} value={d} style={styles.selectOption}>{d}</option>)}
          </select>
          <select
            name="dob_month"
            value={form.dob_month}
            onChange={handleChange}
            required
            style={styles.dobSelect}
          >
            <option value="" style={styles.selectOption}>Month</option>
            {months.map((m, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')} style={styles.selectOption}>{m}</option>)}
          </select>
          <select
            name="dob_year"
            value={form.dob_year}
            onChange={handleChange}
            required
            style={styles.dobSelect}
          >
            <option value="" style={styles.selectOption}>Year</option>
            {years.map(y => <option key={y} value={y} style={styles.selectOption}>{y}</option>)}
          </select>
        </div>

        {/* Drugs */}
        <div style={styles.toggleLabel}>Drugs?</div>
        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setForm({...form, drugs: 'Yes'})}
            style={toggleStyle(form.drugs === 'Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({...form, drugs: 'No'})}
            style={toggleStyle(form.drugs === 'No')}
          >
            No
          </button>
        </div>

        {/* Smoke */}
        <div style={styles.toggleLabel}>Smoke?</div>
        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setForm({...form, smoke: 'Yes'})}
            style={toggleStyle(form.smoke === 'Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({...form, smoke: 'No'})}
            style={toggleStyle(form.smoke === 'No')}
          >
            No
          </button>
        </div>

        {/* Weed */}
        <div style={styles.toggleLabel}>Weed?</div>
        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setForm({...form, weed: 'Yes'})}
            style={toggleStyle(form.weed === 'Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({...form, weed: 'No'})}
            style={toggleStyle(form.weed === 'No')}
          >
            No
          </button>
        </div>

        {/* Alcohol */}
        <div style={styles.toggleLabel}>Alcohol?</div>
        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setForm({...form, alcohol: 'Yes'})}
            style={toggleStyle(form.alcohol === 'Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({...form, alcohol: 'No'})}
            style={toggleStyle(form.alcohol === 'No')}
          >
            No
          </button>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px 24px',
    position: 'relative',
  },
  grain: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    opacity: 0.05,
    pointerEvents: 'none',
    zIndex: 0,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '64px',
    fontWeight: 400,
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    position: 'relative',
    marginBottom: '8px',
    zIndex: 1,
  },
  period: {
    position: 'relative',
  },
  emberDot: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    animation: 'emberPulse 2s ease-in-out infinite',
    boxShadow: '0 0 15px 8px rgba(232, 81, 42, 0.5)',
  },
  subtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#888888',
    marginBottom: '32px',
    zIndex: 1,
  },
  error: {
    fontSize: '13px',
    color: '#ff4444',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#1a0000',
    borderRadius: '8px',
    border: '1px solid #330000',
    zIndex: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '320px',
    zIndex: 1,
  },
  textarea: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 16px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    resize: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: '#141414',
    color: '#F5F5F5',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 16px',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  },
  selectOption: {
    backgroundColor: '#141414',
    color: '#F5F5F5',
  },
  dobContainer: {
    display: 'flex',
    gap: '8px',
  },
  dobSelect: {
    flex: 1,
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: '#141414',
    color: '#F5F5F5',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 8px',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'none',
    textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  toggleLabel: {
    fontSize: '13px',
    color: '#888888',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.1em',
    marginBottom: '4px',
    marginTop: '8px',
  },
  toggleContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '4px',
  },
  button: {
    backgroundColor: '#FFFFFF',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'none',
    width: '100%',
    marginTop: '16px',
  },
};

export default ProfileSetup;