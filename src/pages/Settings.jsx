import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Shield, Bell, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [payoutMethods, setPayoutMethods] = useState([]);

  useEffect(() => {
    async function loadPayouts() {
      if (!state.currentUser) return;
      try {
        const { data, error } = await supabase
          .from('user_payout_methods')
          .select('*')
          .eq('user_id', state.currentUser.id);
        if (!error && data) {
          setPayoutMethods(data);
        }
      } catch (err) {
        console.error('Failed to load payout methods:', err);
      }
    }
    loadPayouts();
  }, [state.currentUser]);

  if (!state.isAuthenticated) {
    return <div className="page container" style={{ paddingTop: 80, textAlign: 'center' }}>Please log in to view settings.</div>;
  }

  return (
    <motion.div className="page settings-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header container">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
        <h1 className="heading-3">Settings</h1>
        <div style={{ width: 24 }} />
      </header>

      <div className="container" style={{ marginTop: 'var(--space-md)' }}>
        
        {/* Payout Settings */}
        <section className="settings-section">
          <h2 className="heading-5" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Banknote size={20} color="var(--primary)" /> Payout Methods
          </h2>
          <p className="caption" style={{ marginBottom: '12px' }}>Where you receive funds when your listings sell.</p>
          
          {payoutMethods.length === 0 ? (
            <div className="empty-payouts" style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p className="caption" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No payout methods linked.</p>
            </div>
          ) : (
            <div className="payout-list">
              {payoutMethods.map(method => (
                <div key={method.id} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CreditCard size={24} color="var(--primary-light)" />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>{method.method_type.replace('_', ' ')}</p>
                      <p className="caption">{method.details.account_number || 'Linked Account'}</p>
                    </div>
                  </div>
                  {method.is_default && <span style={{ fontSize: '12px', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>Default</span>}
                </div>
              ))}
            </div>
          )}
          <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', width: '100%', padding: '12px', borderRadius: '12px', marginTop: '12px', fontWeight: 600 }}>
            + Add Payout Method
          </button>
        </section>

        {/* Security & Privacy */}
        <section className="settings-section" style={{ marginTop: '32px' }}>
          <h2 className="heading-5" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={20} color="var(--primary)" /> Security & Privacy
          </h2>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="settings-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={18} color="var(--text-secondary)" />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>Change Password</span>
            </div>
            <div className="settings-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={18} color="var(--text-secondary)" />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>Two-Factor Authentication</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section" style={{ marginTop: '32px', paddingBottom: '100px' }}>
          <h2 className="heading-5" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell size={20} color="var(--primary)" /> Notifications
          </h2>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="settings-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Push Notifications</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="settings-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Email Alerts (Bids)</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
