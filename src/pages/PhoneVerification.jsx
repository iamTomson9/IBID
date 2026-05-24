/**
 * PhoneVerification — HARD GATE.
 *
 * The user CANNOT bypass this screen after registering.
 * They must verify via:
 *   A) Phone OTP  (Firebase Phone Auth — SMS sent to registered number)
 *   B) Email link (Firebase sendEmailVerification — user clicks link then returns)
 *
 * On success:
 *   - Supabase: account_verified = true, phone_verified = true
 *   - AppContext: MARK_VERIFIED dispatched
 *   - Navigate to /home (or original returnTo)
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Mail, CheckCircle, AlertCircle,
  RefreshCw, ArrowLeft, ShieldCheck,
} from 'lucide-react';
import {
  sendPhoneOTP, confirmPhoneOTP, resendPhoneOTP,
  sendEmailVerificationLink, checkEmailVerified,
} from '../lib/auth';
import { useApp } from '../context/AppContext';
import './PhoneVerification.css';

const OTP_LEN = 6;
const RESEND_WAIT = 60;

export default function PhoneVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();

  // Phone comes from Register's navigate state OR user's profile (login→verify case)
  const phone = location.state?.phone || state.currentUser?.phone || '';
  const returnTo = location.state?.returnTo || '/home';

  // ── OTP state ──────────────────────────────────────────────
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(''));
  const [sending, setSending] = useState(false);       // sending the OTP
  const [verifying, setVerifying] = useState(false);   // confirming the OTP
  const [otpSent, setOtpSent] = useState(false);
  const [mode, setMode] = useState('phone');            // 'phone' | 'email'
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(RESEND_WAIT);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // ── If already verified (e.g. page revisit), skip to home ─
  useEffect(() => {
    if (!state.authLoading && (state.currentUser?.accountVerified || state.accountVerified)) {
      navigate(returnTo, { replace: true });
    }
  }, [state.authLoading, state.currentUser?.accountVerified, state.accountVerified]);

  // ── Countdown for resend button ────────────────────────────
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Auto-send OTP on mount (if phone available) ────────────
  useEffect(() => {
    if (phone && mode === 'phone') {
      doSendOTP(phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Send OTP ───────────────────────────────────────────────
  async function doSendOTP(phoneNumber) {
    if (!phoneNumber) {
      setError('No phone number found. Please go back and re-enter your number.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await sendPhoneOTP(phoneNumber);
      setOtpSent(true);
      setCountdown(RESEND_WAIT);
      setCanResend(false);
      setSuccessMsg(`Code sent to ${maskPhone(phoneNumber)}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      // auth.js now returns friendly, specific error messages
      setError(err.message || 'Failed to send OTP. Try email verification instead.');
    } finally {
      setSending(false);
    }
  }

  async function handleResend() {
    setOtp(Array(OTP_LEN).fill(''));
    setError('');
    setSending(true);
    try {
      await resendPhoneOTP(phone);
      setCountdown(RESEND_WAIT);
      setCanResend(false);
      setSuccessMsg('New code sent!');
      setTimeout(() => setSuccessMsg(''), 4000);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setSending(false);
    }
  }

  // ── OTP input handlers ─────────────────────────────────────
  function handleOtpChange(idx, val) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < OTP_LEN - 1) inputRefs.current[idx + 1]?.focus();
    if (next.every(Boolean) && digit) doConfirmOTP(next.join(''));
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
    if (pasted.length === OTP_LEN) {
      setOtp(pasted.split(''));
      inputRefs.current[OTP_LEN - 1]?.focus();
      doConfirmOTP(pasted);
    }
    e.preventDefault();
  }

  // ── Confirm OTP ────────────────────────────────────────────
  async function doConfirmOTP(code) {
    if (verifying) return;
    setVerifying(true);
    setError('');
    try {
      await confirmPhoneOTP(code);
      // Update app state immediately — don't wait for onAuthChange
      dispatch({ type: 'MARK_VERIFIED' });
      setSuccessMsg('Verified! Welcome to iBID 🎉');
      setTimeout(() => navigate(returnTo, { replace: true }), 1200);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('invalid') || msg.includes('expired') || msg.includes('INVALID')) {
        setError('Incorrect or expired code. Please try again.');
      } else if (msg.includes('session-expired') || msg.includes('SESSION_EXPIRED')) {
        setError('Session expired. Please resend the OTP.');
      } else {
        setError(msg || 'Verification failed. Please try again.');
      }
      setOtp(Array(OTP_LEN).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }

  function handleVerifyClick() {
    const code = otp.join('');
    if (code.length < OTP_LEN) { setError('Please enter all 6 digits.'); return; }
    doConfirmOTP(code);
  }

  // ── Email verification ─────────────────────────────────────
  async function handleSendEmail() {
    setSending(true);
    setError('');
    try {
      await sendEmailVerificationLink();
      setEmailSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send verification email.');
    } finally {
      setSending(false);
    }
  }

  async function handleCheckEmail() {
    setVerifying(true);
    setError('');
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        dispatch({ type: 'MARK_VERIFIED' });
        setSuccessMsg('Email verified! Welcome to iBID 🎉');
        setTimeout(() => navigate(returnTo, { replace: true }), 1200);
      } else {
        setError("Email not verified yet. Click the link in your inbox first, then tap this button.");
      }
    } catch (err) {
      setError(err.message || 'Could not check verification status.');
    } finally {
      setVerifying(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────
  const codeComplete = otp.every(Boolean);

  return (
    <div className="verify-page">
      {/* reCAPTCHA widget — shown automatically by Firebase when OTP is triggered */}
      <div
        id="recaptcha-container"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      />

      {/* Header — minimal, no back button to guest mode (this is a hard gate) */}
      <header className="verify-header">
        <div className="verify-logo">iBID</div>
      </header>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px 20px' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>1</div>
        <div style={{ flex: 1, height: 2, background: 'var(--primary)', borderRadius: 2 }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>2</div>
        <div style={{ flex: 1, height: 2, background: 'var(--surface-border)', borderRadius: 2 }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 700 }}>3</div>
      </div>

      <div className="verify-body">
        <AnimatePresence mode="wait">

          {/* ── PHONE OTP MODE ── */}
          {mode === 'phone' && (
            <motion.div key="phone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="verify-icon">
                <Smartphone size={36} strokeWidth={1.5} />
              </div>
              <h1 className="verify-title">Verify your number</h1>
              <p className="verify-subtitle">
                {phone
                  ? <>We sent a 6-digit code to <span className="verify-phone-highlight">{maskPhone(phone)}</span>. Enter it below.</>
                  : 'Enter the 6-digit code sent to your phone number.'}
              </p>

              {/* Banners */}
              <AnimatePresence>
                {error && (
                  <motion.div className="verify-error" key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div className="verify-success" key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <CheckCircle size={16} /> {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP boxes */}
              <div className="verify-otp-row" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    className={`verify-otp-box${digit ? ' filled' : ''}${verifying ? ' verifying' : ''}`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={verifying}
                    autoFocus={i === 0 && otpSent}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="verify-resend">
                {sending ? (
                  <span>Sending code…</span>
                ) : canResend ? (
                  <>Didn't receive it?{' '}
                    <button className="verify-resend-btn" onClick={handleResend}>
                      <RefreshCw size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Resend code
                    </button>
                  </>
                ) : (
                  <>Resend code in <strong>{countdown}s</strong></>
                )}
              </div>

              <button
                className="verify-btn"
                onClick={handleVerifyClick}
                disabled={!codeComplete || verifying || sending}
              >
                {verifying ? 'Verifying…' : 'Verify & Enter App'}
              </button>

              <div className="verify-divider">or verify a different way</div>

              <button
                className="verify-email-btn"
                onClick={() => { setMode('email'); setError(''); }}
                disabled={sending || verifying}
              >
                <Mail size={16} />
                Verify via Email instead
              </button>
            </motion.div>
          )}

          {/* ── EMAIL VERIFICATION MODE ── */}
          {mode === 'email' && (
            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="verify-icon">
                <Mail size={36} strokeWidth={1.5} />
              </div>
              <h1 className="verify-title">Verify via Email</h1>
              <p className="verify-subtitle">
                We'll send a verification link to{' '}
                <span className="verify-phone-highlight">{state.currentUser?.email || 'your email'}</span>.
                Click the link then come back here.
              </p>

              {/* Banners */}
              <AnimatePresence>
                {error && (
                  <motion.div className="verify-error" key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div className="verify-success" key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <CheckCircle size={16} /> {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {!emailSent ? (
                <button className="verify-btn" onClick={handleSendEmail} disabled={sending}>
                  {sending ? 'Sending…' : 'Send Verification Email'}
                </button>
              ) : (
                <div className="verify-email-sent">
                  <div className="verify-email-sent__icon">
                    <Mail size={28} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 1.6, marginBottom: 16 }}>
                    Email sent! Open it and click <strong>"Verify email address"</strong>, then tap the button below.
                  </p>
                  <button className="verify-check-btn" onClick={handleCheckEmail} disabled={verifying}>
                    {verifying ? 'Checking…' : "I've clicked the link ✓"}
                  </button>
                </div>
              )}

              <div className="verify-divider">or</div>

              <button
                className="verify-email-btn"
                onClick={() => { setMode('phone'); setError(''); setOtp(Array(OTP_LEN).fill('')); }}
                disabled={sending || verifying}
              >
                <Smartphone size={16} />
                Go back to Phone OTP
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32, padding: '12px 14px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
          Verification protects your account and builds trust with other iBID users.
        </div>
      </div>
    </div>
  );
}

function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone || 'your phone';
  return phone.slice(0, 3) + phone.slice(3, -4).replace(/\d/g, '•') + phone.slice(-4);
}
