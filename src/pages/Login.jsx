import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { signIn } from '../lib/auth';
import { validateEmail, validatePassword, rateLimitCheck } from '../lib/validate';
import { useApp } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useApp();

  const returnTo = searchParams.get('returnTo') || '/home';

  // Redirect if already logged in and verified
  useEffect(() => {
    if (!state.authLoading && state.isAuthenticated && state.currentUser?.accountVerified) {
      navigate(returnTo, { replace: true });
    }
  }, [state.authLoading, state.isAuthenticated, state.currentUser]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canLogin = email.trim().length > 4 && password.length >= 6;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!rateLimitCheck('login', 2000)) {
      setError('Too many attempts. Please wait a moment.');
      return;
    }

    const emailV = validateEmail(email);
    if (!emailV.ok) { setError(emailV.error); return; }
    const passV = validatePassword(password);
    if (!passV.ok) { setError(passV.error); return; }

    setLoading(true);
    try {
      const user = await signIn({ email, password });

      // If account not yet verified, send them to verify screen
      const profile = state.currentUser; // updated by onAuthChange in AppContext
      // Short delay to let AppContext update
      await new Promise(r => setTimeout(r, 300));

      // Navigate — AppContext.onAuthChange handles profile fetch
      // If the user hasn't verified, they'll be redirected in PhoneVerification
      navigate(returnTo);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else if (msg.includes('user-disabled')) {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="login-header">
        <button className="login-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="login-logo">iBID</div>
      </header>

      <div className="login-body">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Log in to continue bidding and selling.</p>
        </motion.div>

        <motion.form
          className="login-form"
          onSubmit={handleLogin}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Email */}
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-row">
              <Mail size={18} className="login-input-icon" />
              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-row">
              <Lock size={18} className="login-input-icon" />
              <input
                className="login-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="login-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="login-forgot" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </div>
          </div>

          {error && (
            <motion.div className="login-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={!canLogin || loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </motion.form>

        <div className="login-divider">or</div>

        <p className="login-register-link">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')}>Create one</span>
        </p>
      </div>
    </motion.div>
  );
}
