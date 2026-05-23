import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * ProtectedRoute — two-stage guard:
 *  1. Must be authenticated (logged in via Firebase)
 *  2. Must have verified their account (phone OTP or email link)
 *
 * If not authenticated → /register?returnTo=...
 * If authenticated but not verified → /verify (VerificationGate also catches this globally)
 * Shows a spinner while auth is loading to prevent flash.
 */
export default function ProtectedRoute({ children }) {
  const { state } = useApp();
  const location = useLocation();

  // Wait for Firebase auth check
  if (state.authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  // Not logged in → send to register with return destination
  if (!state.isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/register?returnTo=${returnTo}`} replace />;
  }

  // Logged in but not yet verified → send to verification
  const isVerified = state.currentUser?.accountVerified || state.accountVerified;
  if (!isVerified) {
    return <Navigate to="/verify" replace />;
  }

  return children;
}
