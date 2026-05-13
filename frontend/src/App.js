import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  // imports routing components
import PrivateRoute from './components/PrivateRoute';  // imports our private route wrapper

// import all pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ProfileSetup from './pages/ProfileSetup';
import PhotoUpload from './pages/PhotoUpload';
import IntentSetup from './pages/IntentSetup';
import Discovery from './pages/Discovery';
import Matches from './pages/Matches';
import Questions from './pages/Questions';
import Answers from './pages/Answers';
import Chat from './pages/Chat';
import Rejections from './pages/Rejections';
import Pending from './pages/Pending';
import Login from './pages/Login';
import AdminTest from './pages/AdminTest';

function App() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const updateDot = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDot) {
        cursorDot.style.left = `${mouseX - 5}px`;
        cursorDot.style.top = `${mouseY - 5}px`;
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (cursorRing) {
        cursorRing.style.left = `${ringX - 18}px`;
        cursorRing.style.top = `${ringY - 18}px`;
      }
      requestAnimationFrame(animateRing);
    };

    const handleMouseMove = (e) => {
      updateDot(e);

      const target = e.target;
      const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') || target.classList.contains('interactive');

      if (cursorDot) {
        cursorDot.style.transform = isInteractive ? 'scale(1.5)' : 'scale(1)';
      }
      if (cursorRing) {
        cursorRing.style.transform = isInteractive ? 'scale(1.8)' : 'scale(1)';
        cursorRing.style.borderColor = isInteractive ? 'rgba(232,81,42,0.7)' : 'rgba(232,81,42,0.4)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const cursorDotStyle = {
    position: 'fixed',
    width: '10px',
    height: '10px',
    backgroundColor: '#E8512A',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'transform 0.1s ease',
  };

  const cursorRingStyle = {
    position: 'fixed',
    width: '36px',
    height: '36px',
    border: '1px solid rgba(232, 81, 42, 0.4)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9998,
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  };

  return (
    <>
      {/* Global Custom Cursor */}
      <div ref={cursorDotRef} style={cursorDotStyle}></div>
      <div ref={cursorRingRef} style={cursorRingStyle}></div>

      <BrowserRouter>
        <Routes>
          {/* public routes — no login needed */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-test" element={<AdminTest />} />

          {/* private routes — login required */}
          <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
          <Route path="/photos" element={<PrivateRoute><PhotoUpload /></PrivateRoute>} />
          <Route path="/intent" element={<PrivateRoute><IntentSetup /></PrivateRoute>} />
          <Route path="/discovery" element={<PrivateRoute><Discovery /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
          <Route path="/questions" element={<PrivateRoute><Questions /></PrivateRoute>} />
          <Route path="/match/:id/answers" element={<PrivateRoute><Answers /></PrivateRoute>} />
          <Route path="/match/:id/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/rejections" element={<PrivateRoute><Rejections /></PrivateRoute>} />

          <Route path="/pending" element={<PrivateRoute><Pending /></PrivateRoute>} />
            {/* default route — redirect to register */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;  // export so index.js can use it