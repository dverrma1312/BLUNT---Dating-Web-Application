import axios from 'axios';  // imports axios library

// create an axios instance with our Django backend URL
const api = axios.create({
  baseURL: 'https://blunt-dating-web-application-production.up.railway.app',  // Django runs here locally
});

// before every request — attach the JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');  // get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // attach token to request header
  }
  return config;
});

export default api;  // export so we can use it in all pages