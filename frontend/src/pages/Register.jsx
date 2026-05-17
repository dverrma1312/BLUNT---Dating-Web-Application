import { useState } from 'react';
import Select from 'react-select';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone_number: '',
    name: '',
    gender: '',
    city: '',
    category: '',
    instagram_handle: '',
    dob: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCityChange(selectedOption) {
    setForm({ ...form, city: selectedOption ? selectedOption.value : '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.city) {
      setError('Please select a city.');
      return;
    }

    if (!form.instagram_handle) {
      setError('Please enter your Instagram handle.');
      return;
    }

    if (!form.dob) {
      setError('Please enter your date of birth.');
      return;
    }

    // Clean up Instagram handle - remove @ if user added it
    const cleanHandle = form.instagram_handle.startsWith('@')
      ? form.instagram_handle.slice(1)
      : form.instagram_handle;

    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/register/', {
        ...form,
        instagram_handle: cleanHandle,
      });
      localStorage.setItem('phone_number', form.phone_number);
      navigate('/verify-otp');
    } catch (err) {
      console.log('Registration error full:', JSON.stringify(err.response?.data));
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
      <p style={styles.subtext}>Create your account.</p>

      {/* Error message */}
      {error && (
        <p style={styles.error}>{error}</p>
      )}

      {/* Registration form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="phone_number"
          type="tel"
          placeholder="phone number"
          value={form.phone_number}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="name"
          type="text"
          placeholder="your name"
          value={form.name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
         name="dob"
         type="date"
         placeholder="date of birth"
         value={form.dob}
         onChange={handleChange}
         required
         style={{
         ...styles.input,
         colorScheme: 'dark',  // makes the date picker dark themed
         }}
        />

        <input
          name="instagram_handle"
          type="text"
          placeholder="@instagram_handle"
          value={form.instagram_handle}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="" style={styles.selectOption}>select gender</option>
          <option value="M" style={styles.selectOption}>male</option>
          <option value="F" style={styles.selectOption}>female</option>
        </select>

        <Select
          options={[
            { value: 'Chandigarh', label: 'Chandigarh' },
            { value: 'Mohali', label: 'Mohali' },
            { value: 'Gurgaon', label: 'Gurgaon' },
            { value: 'Noida', label: 'Noida' },
            { value: 'Delhi', label: 'Delhi' },
          ]}
          value={form.city ? { value: form.city, label: form.city } : null}
          onChange={handleCityChange}
          placeholder="your city"
          isClearable
          required
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: '#141414',
              border: state.isFocused ? '1px solid #444444' : '1px solid #222222',
              borderRadius: '4px',
              padding: '2px',
              minHeight: '48px',
              boxShadow: 'none',
              cursor: 'none',
              '&:hover': {
                borderColor: '#444444',
              },
            }),
            input: (base) => ({
              ...base,
              color: '#F5F5F5',
            }),
            placeholder: (base) => ({
              ...base,
              color: '#555555',
            }),
            singleValue: (base) => ({
              ...base,
              color: '#F5F5F5',
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#141414',
              border: '1px solid #222222',
              borderRadius: '4px',
              marginTop: '4px',
            }),
            menuList: (base) => ({
              ...base,
              backgroundColor: '#141414',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? '#1a1a1a' : '#141414',
              color: '#F5F5F5',
              cursor: 'none',
            }),
            dropdownIndicator: (base) => ({
              ...base,
              color: '#888888',
            }),
            indicatorSeparator: (base) => ({
              ...base,
              display: 'none',
            }),
          }}
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="" style={styles.selectOption}>what are you here for?</option>
          <option value="hookup" style={styles.selectOption}>hookup</option>
          <option value="hangout" style={styles.selectOption}>hangout</option>
          <option value="smokeup" style={styles.selectOption}>smokeup</option>
          <option value="coffee" style={styles.selectOption}>coffee</option>
        </select>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating account...' : 'Continue'}
        </button>

        <p style={styles.linkText}>
          Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
        </p>

        <p style={styles.termsText}>
            By signing up, you agree to our <a href="#" onClick={(e) => e.preventDefault()} style={styles.termsLink}>Terms</a>. See how we use your data in our <a href="#" onClick={(e) => e.preventDefault()} style={styles.termsLink}>Privacy Policy</a>.
        </p>
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
    padding: '24px',
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
    boxShadow: '0 0 20px 10px rgba(232, 81, 42, 0.6)',
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
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
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
  input: {
    backgroundColor: '#141414',
    border: '1px solid #222222',
    borderRadius: '4px',
    padding: '14px 16px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    cursor: 'none',
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
    marginTop: '8px',
  },
  linkText: {
    fontSize: '14px',
    color: '#888888',
    textAlign: 'center',
    cursor: 'none',
    marginTop: '8px',
    fontFamily: "'DM Sans', sans-serif",
  },
  link: {
    color: '#FFFFFF',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  termsText: {
    fontSize: '11px',
    color: '#555555',
    textAlign: 'center',
    maxWidth: '320px',
    marginTop: '24px',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
    zIndex: 1,
  },
  termsLink: {
    color: '#888888',
    textDecoration: 'underline',
    transition: 'color 0.2s',
  },
};

export default Register;