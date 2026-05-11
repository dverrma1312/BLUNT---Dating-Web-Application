import { useState } from 'react';  // imports useState for form data
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function ProfileSetup() {
  const navigate = useNavigate();  // used to redirect after profile setup

  // form state
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

  const [error, setError] = useState('');  // stores error message
  const [loading, setLoading] = useState(false);  // tracks if request is in progress

  // hover states for dropdowns
  const [relationshipHover, setRelationshipHover] = useState(false);
  const [relationshipFocus, setRelationshipFocus] = useState(false);
  const [religionHover, setReligionHover] = useState(false);
  const [religionFocus, setReligionFocus] = useState(false);
  const [sexualityHover, setSexualityHover] = useState(false);
  const [sexualityFocus, setSexualityFocus] = useState(false);
  const [dayHover, setDayHover] = useState(false);
  const [monthHover, setMonthHover] = useState(false);
  const [yearHover, setYearHover] = useState(false);

  // updates form state when any input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // handles form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Combine DOB into single string
    const dob = form.dob_year && form.dob_month && form.dob_day
      ? `${form.dob_year}-${form.dob_month}-${form.dob_day}`
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
        date_of_birth: dob,
      });
      navigate('/photos');  // redirect to photo upload page
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectStyle = (hover, focus) => ({
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: hover ? '#1a1a1a' : '#141414',
    color: '#F5F5F5',
    border: focus ? '1px solid #FFFFFF' : (hover ? '1px solid #888888' : '1px solid #333333'),
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
  });

  const toggleStyle = (isSelected) => ({
    flex: 1,
    padding: '12px',
    backgroundColor: isSelected ? '#FFFFFF' : '#141414',
    color: isSelected ? '#0A0A0A' : '#F5F5F5',
    border: '1px solid #333333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 36 }, (_, i) => 2005 - i);

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* header */}
        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>Tell Us About Yourself</p>

        {/* error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* profile setup form */}
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
          <div onMouseEnter={() => setRelationshipHover(true)} onMouseLeave={() => setRelationshipHover(false)}>
            <select
              name="relationship_type"
              value={form.relationship_type}
              onChange={handleChange}
              onFocus={() => setRelationshipFocus(true)}
              onBlur={() => setRelationshipFocus(false)}
              required
              style={selectStyle(relationshipHover, relationshipFocus)}
            >
              <option value="">Relationship Type</option>
              <option value="Monogamy">Monogamy</option>
              <option value="Non-Monogamy">Non-Monogamy</option>
            </select>
          </div>

          {/* Religion */}
          <div onMouseEnter={() => setReligionHover(true)} onMouseLeave={() => setReligionHover(false)}>
            <select
              name="religion"
              value={form.religion}
              onChange={handleChange}
              onFocus={() => setReligionFocus(true)}
              onBlur={() => setReligionFocus(false)}
              required
              style={selectStyle(religionHover, religionFocus)}
            >
              <option value="">Religion</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Sikh">Sikh</option>
              <option value="Christian">Christian</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Jain">Jain</option>
              <option value="Atheist">Atheist</option>
              <option value="Agnostic">Agnostic</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sexuality */}
          <div onMouseEnter={() => setSexualityHover(true)} onMouseLeave={() => setSexualityHover(false)}>
            <select
              name="sexuality"
              value={form.sexuality}
              onChange={handleChange}
              onFocus={() => setSexualityFocus(true)}
              onBlur={() => setSexualityFocus(false)}
              required
              style={selectStyle(sexualityHover, sexualityFocus)}
            >
              <option value="">Sexuality</option>
              <option value="Straight">Straight</option>
              <option value="Gay">Gay</option>
              <option value="Lesbian">Lesbian</option>
              <option value="Bisexual">Bisexual</option>
              <option value="Pansexual">Pansexual</option>
              <option value="Asexual">Asexual</option>
              <option value="Prefer Not To Say">Prefer Not To Say</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div style={styles.dobContainer}>
            <div onMouseEnter={() => setDayHover(true)} onMouseLeave={() => setDayHover(false)}>
              <select
                name="dob_day"
                value={form.dob_day}
                onChange={handleChange}
                onFocus={() => {}}
                onBlur={() => {}}
                required
                style={{...selectStyle(dayHover, false), width: '100%'}}
              >
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div onMouseEnter={() => setMonthHover(true)} onMouseLeave={() => setMonthHover(false)}>
              <select
                name="dob_month"
                value={form.dob_month}
                onChange={handleChange}
                onFocus={() => {}}
                onBlur={() => {}}
                required
                style={{...selectStyle(monthHover, false), width: '100%'}}
              >
                <option value="">Month</option>
                {months.map((m, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
              </select>
            </div>
            <div onMouseEnter={() => setYearHover(true)} onMouseLeave={() => setYearHover(false)}>
              <select
                name="dob_year"
                value={form.dob_year}
                onChange={handleChange}
                onFocus={() => {}}
                onBlur={() => {}}
                required
                style={{...selectStyle(yearHover, false), width: '100%'}}
              >
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
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

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </button>

        </form>

      </div>
    </div>
  );
}

// styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888888',
    marginBottom: '32px',
  },
  error: {
    fontSize: '13px',
    color: '#ff4444',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#1a0000',
    borderRadius: '8px',
    border: '1px solid #330000',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  textarea: {
    resize: 'none',
  },
  dobContainer: {
    display: 'flex',
    gap: '8px',
  },
  toggleLabel: {
    fontSize: '14px',
    color: '#888888',
    marginBottom: '4px',
  },
  toggleContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
};

export default ProfileSetup;