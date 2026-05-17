const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export function getPhotoUrl(photo) {
  if (!photo) return null;
  const url = photo.image || photo.cloudinary_image;
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

export function calculateAge(dob) {
  if (!dob) return null;
  return new Date().getFullYear() - new Date(dob).getFullYear();
}

export function getCategoryColor(category) {
  const INTENT_COLORS = {
    'Hookup': '#FF3B3B',
    'Hangout': '#FFB800',
    'Smoke Up': '#00D26A',
    'Coffee & Chill': '#A0785A',
  };
  return INTENT_COLORS[category] || '#888888';
}

export { API_BASE_URL };