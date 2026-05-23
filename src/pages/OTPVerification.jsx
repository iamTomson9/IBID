import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './OTPVerification.css';

export default function OTPVerification() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="otp-page"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="otp-header">
        <button onClick={() => navigate('/register')} className="otp-back"><ArrowLeft size={22} /></button>
        <span className="heading-4">Verify Your Email</span>
        <div style={{ width: 22 }} />
      </header>

      <div className="otp-content container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', paddingTop: '60px' }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}
        >
          <Mail size={44} color="#fff" />
        </motion.div>

        <motion.h2 className="heading-2" style={{ marginBottom: '12px' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          Check Your Email
        </motion.h2>

        <motion.p
          className="body"
          style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.6', marginBottom: '40px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          We sent a confirmation link to your email. Click it to activate your account, then come back and log in.
        </motion.p>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Primary: go log in after confirming */}
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              padding: '16px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ArrowRight size={18} /> Go to Login
          </button>

          {/* Secondary: skip and enter app (works if email confirm disabled) */}
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '14px',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Already confirmed? Enter App
          </button>
        </motion.div>

        <p className="caption" style={{ marginTop: '24px', color: 'var(--text-tertiary)' }}>
          Check your spam folder if you don't see the email.
        </p>
      </div>
    </motion.div>
  );
}
