import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Mail, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPasswordByEmail, sendPasswordResetOTP, confirmPhoneOTP } from '../lib/auth';
import { validateEmail, rateLimitCheck } from '../lib/validate';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'done'
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doneMessage, setDoneMessage] = useState('');
  const inputRefs = Array.from({ length: 6 }, () => null);

  const handleSubmit = async () => {
    setError('');
    if (!rateLimitCheck('forgot_password', 3000)) {
      setError('Please wait a moment before trying again.');
      return;
    }

    if (method === 'email') {
      const v = validateEmail(email);
      if (!v.ok) { setError(v.error); return; }
      setLoading(true);
      try {
        await resetPasswordByEmail(email);
        setDoneMessage(`A password reset link has been sent to ${email}. Check your inbox.`);
        setStep('done');
      } catch (err) {
        if (err.message.includes('user-not-found') || err.message.includes('USER_NOT_FOUND')) {
          setError('No account found with this email address.');
        } else {
          setError(err.message || 'Failed to send reset email.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Phone: send OTP to their number
      if (!phone.trim()) { setError('Please enter your phone number.'); return; }
      setLoading(true);
      try {
        await sendPasswordResetOTP(phone.trim());
        setStep('otp');
      } catch (err) {
        setError(err.message || 'Failed to send OTP. Try email reset instead.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpChange = (index, value, refs) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) refs[index + 1]?.focus();
    if (newOtp.every(d => d) && digit) handleConfirmOTP(newOtp.join(''));
  };

  const handleOtpKeyDown = (index, e, refs) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs[index - 1]?.focus();
  };

  const handleConfirmOTP = async (code) => {
    setError('');
    setLoading(true);
    try {
      await confirmPhoneOTP(code);
      setDoneMessage('Phone verified! You can now set a new password by logging in.');
      setStep('done');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div id="recaptcha-container" />

      <header className="forgot-header">
        <button className="forgot-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="forgot-logo">iBID</div>
      </header>

      <div className="forgot-body">
        <AnimatePresence mode="wait">

          {/* ── Input step ── */}
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="forgot-icon"><Lock size={32} strokeWidth={1.5} /></div>
              <h1 className="forgot-title">Reset Password</h1>
              <p className="forgot-subtitle">
                Choose how you'd like to reset your password.
              </p>

              {/* Method selector */}
              <div className="forgot-options">
                <button
                  className={`forgot-option ${method === 'email' ? 'active' : ''}`}
                  onClick={() => setMethod('email')}
                >
                  <div className="forgot-option__icon"><Mail size={20} /></div>
                  <div>
                    <div className="forgot-option__label">Reset via Email</div>
                    <div className="forgot-option__desc">We'll send a reset link to your registered email</div>
                  </div>
                </button>

                <button
                  className={`forgot-option ${method === 'phone' ? 'active' : ''}`}
                  onClick={() => setMethod('phone')}
                >
                  <div className="forgot-option__icon"><Smartphone size={20} /></div>
                  <div>
                    <div className="forgot-option__label">Verify via Phone OTP</div>
                    <div className="forgot-option__desc">We'll send a 6-digit code to your registered number</div>
                  </div>
                </button>
              </div>

              {/* Input field */}
              {method === 'email' && (
                <div className="forgot-field">
                  <label className="forgot-label">Your Email</label>
                  <div className="forgot-input-row">
                    <Mail size={18} className="forgot-input-icon" />
                    <input
                      className="forgot-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      inputMode="email"
                    />
                  </div>
                </div>
              )}

              {method === 'phone' && (
                <div className="forgot-field">
                  <label className="forgot-label">Your Phone Number</label>
                  <div className="forgot-input-row">
                    <Smartphone size={18} className="forgot-input-icon" />
                    <input
                      className="forgot-input"
                      type="tel"
                      placeholder="+267 71 234 567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      inputMode="tel"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="forgot-error"><AlertCircle size={16} /> {error}</div>
              )}

              <button className="forgot-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending…' : method === 'email' ? 'Send Reset Link' : 'Send OTP'}
              </button>

              <span className="forgot-back-link" onClick={() => navigate('/login')}>
                Back to Login
              </span>
            </motion.div>
          )}

          {/* ── OTP step (phone) ── */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="forgot-icon"><Smartphone size={32} strokeWidth={1.5} /></div>
              <h1 className="forgot-title">Enter OTP</h1>
              <p className="forgot-subtitle">
                Enter the 6-digit code sent to <strong>{phone}</strong>.
              </p>

              {/* OTP boxes */}
              {(() => {
                const refs = Array.from({ length: 6 }, () => null);
                return (
                  <div className="verify-otp-row" style={{ justifyContent: 'center', display: 'flex', gap: 10, marginBottom: 24 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => refs[i] = el}
                        className={`verify-otp-box ${digit ? 'filled' : ''}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value, refs)}
                        onKeyDown={e => handleOtpKeyDown(i, e, refs)}
                        autoFocus={i === 0}
                        style={{ width: 48, height: 56, border: '2px solid var(--surface-border)', borderRadius: 12, background: 'var(--surface)', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', outline: 'none' }}
                      />
                    ))}
                  </div>
                );
              })()}

              {error && <div className="forgot-error"><AlertCircle size={16} /> {error}</div>}

              <button
                className="forgot-btn"
                onClick={() => handleConfirmOTP(otp.join(''))}
                disabled={loading || otp.join('').length < 6}
              >
                {loading ? 'Verifying…' : 'Verify & Reset'}
              </button>
            </motion.div>
          )}

          {/* ── Done step ── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="forgot-success-card">
                <div className="forgot-success-icon">
                  <CheckCircle size={32} />
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: 8 }}>All done!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 1.6 }}>
                  {doneMessage}
                </p>
              </div>
              <span className="forgot-back-link" style={{ marginTop: 24 }} onClick={() => navigate('/login')}>
                Back to Login
              </span>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
