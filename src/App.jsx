import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import BidSheet from './components/auction/BidSheet';
import AuthPromptModal from './components/modals/AuthPromptModal';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import PhoneVerification from './pages/PhoneVerification';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import SellerVerification from './pages/SellerVerification';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import MyBids from './pages/MyBids';
import MyListings from './pages/MyListings';
import CodeOfConduct from './pages/CodeOfConduct';
import Escrow from './pages/Escrow';
import Checkout from './pages/Checkout';
import DisputeRoom from './pages/DisputeRoom';
import Settings from './pages/Settings';
import StaticPage from './pages/StaticPage';

import './styles/index.css';
import './styles/animations.css';

// ── Verification Gate ─────────────────────────────────────────────────────────
// Watches auth state globally. If a user is logged in but has NOT verified their
// account (phone OTP or email), they are hard-redirected to /verify.
// Auth screens and public browsing are whitelisted.
// ─────────────────────────────────────────────────────────────────────────────
const AUTH_SCREENS = ['/', '/login', '/register', '/verify', '/forgot-password'];

function VerificationGate() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait until auth check completes
    if (state.authLoading) return;

    // Only intercept signed-in users who haven't verified yet
    if (
      state.isAuthenticated &&
      state.currentUser &&
      !state.currentUser.accountVerified &&
      !state.accountVerified
    ) {
      // Don't redirect if already on an auth screen
      const onAuthScreen = AUTH_SCREENS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
      if (!onAuthScreen) {
        navigate('/verify', { replace: true });
      }
    }
  }, [
    state.authLoading,
    state.isAuthenticated,
    state.currentUser?.accountVerified,
    state.accountVerified,
    location.pathname,
  ]);

  return null; // renders nothing — side-effect only
}

// ── Main App ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      {/* Invisible recaptcha container for Firebase Phone Auth OTP */}
      <div id="recaptcha-container" style={{ display: 'none' }} />

      <VerificationGate />
      <Sidebar />

      <Routes>
        {/* ── Landing ── */}
        <Route path="/" element={<Welcome />} />

        {/* ── Auth screens (always accessible) ── */}
        <Route path="/register"        element={<Register />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/verify"          element={<PhoneVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Guest-browsable (no account needed) ── */}
        <Route path="/home"            element={<Home />} />
        <Route path="/explore"         element={<Explore />} />
        <Route path="/listing/:id"     element={<ListingDetail />} />
        <Route path="/profile/:userId" element={<Profile />} />

        {/* ── Static pages ── */}
        <Route path="/help"            element={<StaticPage slug="help" />} />
        <Route path="/terms"           element={<StaticPage slug="terms" />} />
        <Route path="/about"           element={<StaticPage slug="about" />} />
        <Route path="/code-of-conduct" element={<CodeOfConduct />} />

        {/* ── Protected: requires login + verified ── */}
        <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/create-listing"  element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/verify-seller"   element={<ProtectedRoute><SellerVerification /></ProtectedRoute>} />
        <Route path="/verify-identity" element={<ProtectedRoute><SellerVerification /></ProtectedRoute>} />
        <Route path="/verify-id"       element={<ProtectedRoute><SellerVerification /></ProtectedRoute>} />
        <Route path="/notifications"   element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/my-bids"         element={<ProtectedRoute><MyBids /></ProtectedRoute>} />
        <Route path="/my-listings"     element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
        <Route path="/escrow"          element={<ProtectedRoute><Escrow /></ProtectedRoute>} />
        <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/checkout/:id"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/dispute/:id"     element={<ProtectedRoute><DisputeRoom /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {/* Global overlays — always mounted */}
      <AuthPromptModal />
      <BidSheet />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
