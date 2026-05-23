import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import './Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();
  const { state } = useApp();

  // If already logged in, skip welcome and go straight to home
  useEffect(() => {
    if (!state.authLoading && state.isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [state.authLoading, state.isAuthenticated, navigate]);

  if (state.authLoading) {
    return (
      <div className="welcome-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-2px', color: 'var(--primary-light)', marginBottom: '16px' }}>iBID</div>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-page">
      <div className="welcome-bg">
        <div className="welcome-orb welcome-orb--1" />
        <div className="welcome-orb welcome-orb--2" />
        <div className="welcome-orb welcome-orb--3" />
      </div>

      <motion.div
        className="welcome-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="welcome-logo-section">
          <motion.div
            className="welcome-logo-ring animate-glow-ring"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          >
            <h1 className="welcome-logo">iBID</h1>
          </motion.div>
          <motion.p className="welcome-tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
            Every bid is a beat.
          </motion.p>
          <motion.p className="welcome-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
            The competitive bidding platform where you set the price.
          </motion.p>
        </div>

        <motion.div className="welcome-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.5 }}>
          {/* Guest mode — browse without signing up */}
          <button
            className="welcome-btn welcome-btn--primary"
            onClick={() => navigate('/home')}
            id="get-started-btn"
          >
            Get Started
          </button>

          {/* Already have an account — dedicated login screen */}
          <button
            className="welcome-btn welcome-btn--text"
            onClick={() => navigate('/login')}
            id="login-btn"
          >
            I already have an account
          </button>
        </motion.div>
      </motion.div>

      <div className="welcome-dots">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="welcome-dot animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.1 + Math.random() * 0.2,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
