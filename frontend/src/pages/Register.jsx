import { useState } from 'react';  // imports useState for form data
import { useNavigate } from 'react-router-dom';  // imports useNavigate for redirecting
import api from '../api/axios';  // imports our axios instance

function Register() {
  const navigate = useNavigate();  // used to redirect after registration

  // form state — stores all input values
  const [form, setForm] = useState({
    phone_number: '',
    name: '',
    gender: '',
    city: '',
    category: '',
  });

  const [error, setError] = useState('');  // stores error message
  const [loading, setLoading] = useState(false);  // tracks if request is in progress

  // updates form state when any input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });  // spread existing form data and update changed field
  }

  // handles form submission
  async function handleSubmit(e) {
    e.preventDefault();  // prevents page reload on form submit
    setError('');  // clear previous errors
    setLoading(true);  // show loading state

    try {
      await api.post('/api/users/register/', form);  // send registration data to backend
      localStorage.setItem('phone_number', form.phone_number);  // save phone number for OTP page
      navigate('/verify-otp');  // redirect to OTP verification page
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');  // show error message
    } finally {
      setLoading(false);  // hide loading state
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* header */}
        <h1 style={styles.title}>blunt.</h1>
        <p style={styles.subtitle}>create your account</p>

        {/* error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* registration form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          
          <input
            name="phone_number"
            type="tel"
            placeholder="phone number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            type="text"
            placeholder="your name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">select gender</option>
            <option value="M">male</option>
            <option value="F">female</option>
          </select>

          <input
            name="city"
            type="text"
            placeholder="your city"
            value={form.city}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">what are you here for</option>
            <option value="hookup">hookup</option>
            <option value="hangout">hangout</option>
            <option value="smokeup">smoke up</option>
            <option value="coffee">coffee & chill</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'creating account...' : 'continue'}
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
    gap: '12px',  // space between inputs
  },
};

export default Register;  // export so App.js can use it