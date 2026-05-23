import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DollarSign, ArrowLeft, Lock, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import RatingModal from '../components/RatingModal';
import { supabase } from '../lib/supabase';
import './Escrow.css';

export default function Escrow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: appState } = useApp();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);

  useEffect(() => {
    if (location.state?.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    if (location.state?.resolved) {
      setRatingModalOpen(true);
      setSelectedTxId(location.state?.txId);
    }
  }, [location.state]);

  const loadTransactions = async () => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings(title),
          buyer:users!buyer_id(name),
          seller:users!seller_id(name)
        `)
        .or(`buyer_id.eq.${appState.currentUser.id},seller_id.eq.${appState.currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = (data || []).map(tx => ({
        ...tx,
        listingTitle: tx.listing?.title || 'Unknown Listing',
        buyerName: tx.buyer?.name || 'Unknown Buyer',
        sellerName: tx.seller?.name || 'Unknown Seller',
        type: tx.buyer_id === appState.currentUser.id ? 'purchase' : 'sale'
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [appState.currentUser]);

  const handleConfirmReceiptClick = (txId) => {
    setSelectedTxId(txId);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    if (!selectedTxId || !appState.currentUser) return;
    
    try {
      const tx = transactions.find(t => t.id === selectedTxId);
      
      const newSteps = (tx.steps || []).map(step => ({
        ...step,
        done: true,
        date: step.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
      
      // 1. Mark transaction as completed
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'completed', steps: newSteps })
        .eq('id', selectedTxId);
        
      if (txError) throw txError;

      // 2. Insert Review
      const revieweeId = tx.type === 'purchase' ? tx.seller_id : tx.buyer_id;
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert([{
          reviewer_id: appState.currentUser.id,
          reviewee_id: revieweeId,
          transaction_id: selectedTxId,
          rating: ratingData.rating,
          comment: ratingData.comment
        }]);

      if (reviewError) throw reviewError;

      alert('Receipt confirmed and review submitted!');
      loadTransactions(); // Reload transactions to show updated status
    } catch (err) {
      console.error('Error confirming receipt:', err);
      alert('Failed to confirm receipt.');
    } finally {
      setRatingModalOpen(false);
    }
  };

  if (!appState.isAuthenticated) {
    return <div className="container" style={{paddingTop: 100, textAlign: 'center'}}>Please log in.</div>;
  }

  return (
    <motion.div className="page page-with-header escrow-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="escrow-header">
        <button className="escrow-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="heading-4">Escrow & Payments</h1>
        <div style={{ width: 22 }} />
      </header>
      <div className="container">
        <div className="escrow-info-card">
          <Lock size={20} className="escrow-info-icon" />
          <p className="body-sm">Your payments are held securely by iBID until you confirm receipt of your product.</p>
        </div>
        
        <div className="escrow-info-card" style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger)', borderColor: 'rgba(255, 107, 107, 0.2)', marginBottom: 'var(--space-xl)' }}>
          <AlertTriangle size={20} className="escrow-info-icon" style={{ color: 'var(--danger)' }} />
          <p className="body-sm"><strong>Shipping Disclaimer:</strong> iBID is not accountable for items lost or damaged during shipping. We highly advise arranging a secure Pickup.</p>
        </div>
        
        {loading ? (
          <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No transactions found.</p>
        ) : (
          <div className="escrow-list stagger-children">
            {transactions.map(tx => (
              <div key={tx.id} className="escrow-card">
                <div className="escrow-card__header">
                  <div>
                    <h3 className="escrow-card__title">{tx.listingTitle}</h3>
                    <p className="escrow-card__party body-sm">
                      {tx.type === 'purchase' ? `Seller: ${tx.sellerName}` : `Buyer: ${tx.buyerName}`}
                    </p>
                  </div>
                  <span className={`escrow-card__status escrow-card__status--${tx.status}`}>
                    {tx.status === 'awaiting_confirmation'
                      ? <span style={{display:'flex',alignItems:'center',gap:'4px'}}><Clock size={13}/> Awaiting</span>
                      : <span style={{display:'flex',alignItems:'center',gap:'4px'}}><CheckCircle size={13}/> Done</span>
                    }
                  </span>
                </div>
                
                {tx.status === 'awaiting_confirmation' && (
                  <div className="escrow-timer-warning" style={{ background: 'rgba(255, 190, 11, 0.1)', color: 'var(--warning)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-xs)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
                    <Clock size={14} />
                    <span>Auto-releases to seller in <b>4d 18h</b> if not confirmed.</span>
                  </div>
                )}

                <div className="escrow-timeline">
                  {tx.steps && tx.steps.map((step, i) => (
                    <div key={i} className={`escrow-step ${step.done ? 'done' : ''}`}>
                      <div className="escrow-step__dot">
                        {step.done ? <CheckCircle size={16} /> : <Clock size={16} />}
                      </div>
                      {i < tx.steps.length - 1 && <div className="escrow-step__line" />}
                      <div className="escrow-step__info">
                        <span className="escrow-step__label">{step.label}</span>
                        {step.date && <span className="escrow-step__date caption">{step.date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="escrow-card__footer">
                  <div className="escrow-card__amounts">
                    <div className="escrow-card__amount-row">
                      <span className="caption">Amount</span>
                      <span className="mono">{getCurrSym(tx.currency)}{tx.amount.toLocaleString()}</span>
                    </div>
                    <div className="escrow-card__amount-row">
                      <span className="caption">Platform Fee (7%)</span>
                      <span className="mono" style={{ color: 'var(--text-secondary)' }}>{getCurrSym(tx.currency)}{tx.fee.toLocaleString()}</span>
                    </div>
                  </div>
                  {tx.status === 'awaiting_confirmation' && tx.type === 'purchase' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="escrow-confirm-btn" style={{ background: 'var(--surface-light)', color: 'var(--danger)', flex: 0.5, display:'flex', alignItems:'center', gap:'4px', justifyContent:'center' }} onClick={() => navigate(`/dispute/${tx.id}`)}><AlertTriangle size={14}/> Dispute</button>
                      <button className="escrow-confirm-btn" style={{ flex: 1, display:'flex', alignItems:'center', gap:'4px', justifyContent:'center' }} onClick={() => handleConfirmReceiptClick(tx.id)}><CheckCircle size={14}/> Confirm Receipt</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showToast && (
        <div className="toast-notification" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: 'white', padding: '12px 24px', borderRadius: '30px', zIndex: 9999, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> Payment Successful
        </div>
      )}

      <RatingModal 
        isOpen={ratingModalOpen} 
        onClose={() => setRatingModalOpen(false)} 
        onSubmit={handleRatingSubmit}
        partyName={transactions.find(t => t.id === selectedTxId)?.sellerName || transactions.find(t => t.id === selectedTxId)?.buyerName}
      />
    </motion.div>
  );
}

function getCurrSym(code) {
  const map = { ZAR: 'R', BWP: 'P', USD: '$', GBP: '£', EUR: '€', KES: 'KSh', NGN: '₦' };
  return map[code] || code;
}
