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
  return (
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
  );
}

export default App;  // export so index.js can use it