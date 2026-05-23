import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, ChevronDown, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signUp } from '../lib/auth';
import { validateEmail, validatePassword, validateName, validatePhone, rateLimitCheck } from '../lib/validate';
import { useApp } from '../context/AppContext';
import './Register.css';

const COUNTRY_CODES = [
  { code: '+267', flag: '🇧🇼', name: 'Botswana', iso: 'BW' },
];

export default function Register() {
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

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [countryIdx, setCountryIdx] = useState(0);
  const [showCountries, setShowCountries] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canRegister = name.trim().length >= 2 && email.trim().length > 4 && password.length >= 6;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!rateLimitCheck('register', 3000)) {
      setError('Please wait a moment before trying again.');
      return;
    }

    const emailV = validateEmail(email);
    if (!emailV.ok) { setError(emailV.error); return; }
    const passV = validatePassword(password);
    if (!passV.ok) { setError(passV.error); return; }
    const nameV = validateName(name);
    if (!nameV.ok) { setError(nameV.error); return; }
    const phoneV = validatePhone(phone);
    if (!phoneV.ok) { setError(phoneV.error); return; }

    setLoading(true);
    try {
      // Strip leading zeros from the local number (e.g. 071234567 -> 71234567)
      const localPhone = phone.replace(/^0+/, '').replace(/\s+/g, '');
      const fullPhone = `${COUNTRY_CODES[countryIdx].code}${localPhone}`;
      
      await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: fullPhone,
        country: COUNTRY_CODES[countryIdx].iso,
      });

      // Go to phone verification, passing phone number and returnTo destination
      navigate('/verify', { state: { phone: fullPhone, returnTo } });
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already') || msg.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (msg.includes('weak-password') || msg.includes('Password')) {
        setError('Password must be at least 6 characters.');
      } else if (msg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(msg || 'Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="register-page"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="register-header">
        <button onClick={() => navigate(-1)} className="register-back"><ArrowLeft size={22} /></button>
        <span className="heading-4">Create Account</span>
        <div style={{ width: 22 }} />
      </header>

      <div className="register-content container">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#FF6B6B', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="register-form">
          <div className="register-disclaimer">
            <Info size={18} className="register-disclaimer-icon" />
            <p className="body-sm">iBID requires your real name. This builds trust and accountability in our community.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} id="register-name" autoComplete="name" />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="phone-input-group">
              <button type="button" className="phone-country-btn" onClick={() => setShowCountries(!showCountries)}>
                <span>{COUNTRY_CODES[countryIdx].flag}</span>
                <span className="phone-code">{COUNTRY_CODES[countryIdx].code}</span>
                <ChevronDown size={14} />
              </button>
              <input type="tel" className="form-input phone-input" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} id="register-phone" autoComplete="tel" />
            </div>
            {showCountries && (
              <div className="country-dropdown animate-fade-in">
                <div className="country-section-label">SADC Region</div>
                {COUNTRY_CODES.slice(0, 16).map((c, i) => (
                  <button key={c.code} type="button" className={`country-option ${i === countryIdx ? 'active' : ''}`} onClick={() => { setCountryIdx(i); setShowCountries(false); }}>
                    <span>{c.flag}</span><span>{c.name}</span><span className="phone-code">{c.code}</span>
                  </button>
                ))}
                <div className="country-section-label">Other</div>
                {COUNTRY_CODES.slice(16).map((c, relIdx) => {
                  const i = relIdx + 16;
                  return (
                    <button key={c.code} type="button" className={`country-option ${i === countryIdx ? 'active' : ''}`} onClick={() => { setCountryIdx(i); setShowCountries(false); }}>
                      <span>{c.flag}</span><span>{c.name}</span><span className="phone-code">{c.code}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} id="register-email" autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} id="register-password" style={{ paddingRight: '48px' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`register-submit ${canRegister && !loading ? '' : 'disabled'}`} disabled={!canRegister || loading} id="register-continue">
            {loading ? 'Creating Account…' : 'Continue →'}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '16px' }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/login')}>
              Log In
            </span>
          </p>
        </form>
      </div>
    </motion.div>
  );
}
