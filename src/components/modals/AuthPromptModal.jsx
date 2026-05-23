import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, UserPlus, LogIn, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import './AuthPromptModal.css';

const REASON_COPY = {
  bid: {
    title: 'Join to Place a Bid',
    subtitle: 'Create a free account to start bidding on live auctions across Africa.',
  },
  sell: {
    title: 'Sell on iBID',
    subtitle: 'Create an account to list your products and reach thousands of buyers.',
  },
  general: {
    title: 'Join iBID',
    subtitle: 'Create a free account to unlock the full bidding experience.',
  },
};

const PERKS = [
  { icon: <Zap size={14} />, text: 'Place bids on live auctions in real-time' },
  { icon: <ShieldCheck size={14} />, text: 'Escrow protection on every deal' },
  { icon: <TrendingUp size={14} />, text: 'Track your bids and win history' },
];

export default function AuthPromptModal() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { authPromptOpen, authPromptReason } = state;

  const close = () => dispatch({ type: 'CLOSE_AUTH_PROMPT' });

  const copy = REASON_COPY[authPromptReason] || REASON_COPY.general;

  return (
    <AnimatePresence>
      {authPromptOpen && (
        <>
          <motion.div
            className="auth-prompt-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="auth-prompt-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="auth-prompt__handle" />

            <div className="auth-prompt__icon">
              <Gavel size={32} strokeWidth={1.5} />
            </div>

            <h2 className="auth-prompt__title">{copy.title}</h2>
            <p className="auth-prompt__subtitle">{copy.subtitle}</p>

            <div className="auth-prompt__perks">
              {PERKS.map((perk, i) => (
                <div key={i} className="auth-prompt__perk">
                  <div className="auth-prompt__perk-icon">{perk.icon}</div>
                  <span>{perk.text}</span>
                </div>
              ))}
            </div>

            <div className="auth-prompt__cta">
              <button
                className="auth-prompt__signup"
                onClick={() => { close(); navigate('/register'); }}
              >
                <UserPlus size={18} />
                Create Free Account
              </button>
              <button
                className="auth-prompt__login"
                onClick={() => { close(); navigate('/login'); }}
              >
                <LogIn size={16} />
                I already have an account
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
