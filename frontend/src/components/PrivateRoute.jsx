import { Navigate } from 'react-router-dom';  // imports Navigate for redirecting

// PrivateRoute wraps pages that require login
// if user is not logged in — redirect to register page
function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');  // check if token exists in localStorage

  if (!token) {
    return <Navigate to="/register" />;  // redirect to register if not logged in
  }

  return children;  // if logged in — show the page
}

export default PrivateRoute;  // export so we can use it in App.jsx