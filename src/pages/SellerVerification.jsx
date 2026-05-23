import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Shield, CreditCard, Users, Star, Upload, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SellerVerification.css';

export default function SellerVerification() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleVerify = () => {
    setStep(4);
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      dispatch({ type: 'VERIFY_SELLER' });
      setTimeout(() => navigate('/create-listing'), 2000);
    }, 2500);
  };

  return (
    <motion.div className="sv-page page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="sv-header">
        <button className="sv-back" onClick={() => step > 1 && !processing ? setStep(step - 1) : navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="heading-4">Verify Identity</h1>
        <div style={{ width: 22 }} />
      </header>

      {/* Progress dots */}
      <div className="sv-dots">
        {[1,2,3,4].map(s => (
          <div key={s} className={`sv-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`} />
        ))}
      </div>

      <div className="container sv-content">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" className="sv-step" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <div className="sv-icon-wrap"><Shield size={48} strokeWidth={1.5} /></div>
              <h2 className="heading-2">Verify to Start Selling</h2>
              <p className="body" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Quick verification to keep iBID safe and trustworthy.</p>
              <div className="sv-benefits">
                <div className="sv-benefit"><Star size={18} /><span>Earn a ✅ Verified badge on your profile</span></div>
                <div className="sv-benefit"><CreditCard size={18} /><span>List products and earn from bids</span></div>
                <div className="sv-benefit"><Users size={18} /><span>Build trust with the community</span></div>
              </div>
              <button className="sv-next-btn" onClick={() => setStep(2)}>Let's Go</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" className="sv-step" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <h2 className="heading-3">Upload Your ID</h2>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>Upload a clear photo of the front of your ID document.</p>
              <button className={`sv-upload-box ${idUploaded ? 'uploaded' : ''}`} onClick={() => setIdUploaded(true)}>
                {idUploaded ? (
                  <><Check size={32} /><span>ID Uploaded ✅</span></>
                ) : (
                  <><Upload size={32} /><span>Tap to upload ID (front)</span></>
                )}
              </button>
              <button className={`sv-next-btn ${idUploaded ? '' : 'disabled'}`} disabled={!idUploaded} onClick={() => setStep(3)}>Continue</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" className="sv-step" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <h2 className="heading-3">Take a Selfie</h2>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>We'll match your selfie with your ID to verify your identity.</p>
              <button className={`sv-upload-box sv-selfie-box ${selfieUploaded ? 'uploaded' : ''}`} onClick={() => setSelfieUploaded(true)}>
                {selfieUploaded ? (
                  <><Check size={32} /><span>Selfie Captured ✅</span></>
                ) : (
                  <><Camera size={32} /><span>Tap to take selfie</span></>
                )}
              </button>
              <button className={`sv-next-btn ${selfieUploaded ? '' : 'disabled'}`} disabled={!selfieUploaded} onClick={handleVerify}>Verify My Identity</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" className="sv-step sv-step--center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {processing ? (
                <>
                  <div className="sv-spinner animate-spin" />
                  <h2 className="heading-3">Verifying your identity...</h2>
                  <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>This usually takes a few seconds.</p>
                </>
              ) : (
                <>
                  <motion.div className="sv-success-circle" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  <h2 className="heading-2">You're Verified! ✅</h2>
                  <p className="body" style={{ color: 'var(--text-secondary)' }}>You can now list products on iBID.</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
