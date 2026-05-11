import { useState, useRef } from 'react';  // imports useState for form data
import Select from 'react-select';
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
  const [genderHover, setGenderHover] = useState(false);
  const [genderFocus, setGenderFocus] = useState(false);
  const [categoryHover, setCategoryHover] = useState(false);
  const [categoryFocus, setCategoryFocus] = useState(false);
  const [cityHover, setCityHover] = useState(false);
  const [cityFocus, setCityFocus] = useState(false);
  const [loading, setLoading] = useState(false);  // tracks if request is in progress

  // updates form state when any input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });  // spread existing form data and update changed field
  }

  // handles city selection
  function handleCityChange(selectedOption) {
    setForm({ ...form, city: selectedOption ? selectedOption.value : '' });
  }

  // handles form submission
  async function handleSubmit(e) {
    e.preventDefault();  // prevents page reload on form submit

    if (!form.city) {
      setError('Please select a city.');
      return;
    }

    setError('');  // clear previous errors
    setLoading(true);  // show loading state

    try {
      await api.post('/api/users/register/', form);  // send registration data to backend
      localStorage.setItem('phone_number', form.phone_number);  // save phone number for OTP page
      navigate('/verify-otp');  // redirect to OTP verification page
    } catch (err) {
      console.error('Registration error:', err.response?.status, err.response?.data);
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
        <p style={styles.subtitle}>Create Your Account</p>

        {/* error message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* registration form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          
          <input
            name="phone_number"
            type="tel"
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <div
            onMouseEnter={() => setGenderHover(true)}
            onMouseLeave={() => setGenderHover(false)}
          >
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              onFocus={() => setGenderFocus(true)}
              onBlur={() => setGenderFocus(false)}
              required
              style={{
                ...styles.select,
                border: genderFocus ? '1px solid #FFFFFF' : (genderHover ? '1px solid #888888' : '1px solid #333333'),
                backgroundColor: genderHover ? '#1a1a1a' : '#141414',
              }}
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div
            onMouseEnter={() => setCityHover(true)}
            onMouseLeave={() => setCityHover(false)}
          >
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
              onFocus={() => setCityFocus(true)}
              onBlur={() => setCityFocus(false)}
              onMenuOpen={() => setCityFocus(true)}
              onMenuClose={() => setCityFocus(false)}
              placeholder="Your City"
              isClearable
              required
              styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: cityHover ? '#1a1a1a' : '#141414',
                border: state.isFocused ? '1px solid #FFFFFF' : (cityHover ? '1px solid #888888' : '1px solid #333333'),
                borderRadius: '8px',
                padding: '2px',
                minHeight: '44px',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#888888',
                },
              }),
              input: (base) => ({
                ...base,
                color: '#F5F5F5',
              }),
              placeholder: (base) => ({
                ...base,
                color: '#888888',
              }),
              singleValue: (base) => ({
                ...base,
                color: '#F5F5F5',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#141414',
                border: '1px solid #333333',
                borderRadius: '8px',
                marginTop: '4px',
              }),
              menuList: (base) => ({
                ...base,
                backgroundColor: '#141414',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused || state.isHovered ? '#1a1a1a' : '#141414',
                color: '#F5F5F5',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#1a1a1a',
                },
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
          </div>

          <div
            onMouseEnter={() => setCategoryHover(true)}
            onMouseLeave={() => setCategoryHover(false)}
          >
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              onFocus={() => setCategoryFocus(true)}
              onBlur={() => setCategoryFocus(false)}
              required
              style={{
                ...styles.select,
                border: categoryFocus ? '1px solid #FFFFFF' : (categoryHover ? '1px solid #888888' : '1px solid #333333'),
                backgroundColor: categoryHover ? '#1a1a1a' : '#141414',
              }}
            >
            <option value="">What Are You Here For?</option>
            <option value="hookup">Hookup</option>
            <option value="hangout">Hangout</option>
            <option value="smokeup">Smokeup</option>
            <option value="coffee">Coffee</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Continue'}
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
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: '#141414',
    color: '#F5F5F5',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
};

export default Register;  // export so App.js can use it