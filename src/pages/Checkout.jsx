import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ShieldCheck, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../data/mockData';
import { supabase } from '../lib/supabase';
import './Checkout.css';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const listing = state.listings.find(l => l.id === id);
  if (!listing) return <div className="container" style={{paddingTop: 100}}>Listing not found</div>;

  const bidAmount = listing.currentBid;
  const platformFee = bidAmount * 0.07;
  const totalDue = bidAmount + platformFee;

  const handlePay = async () => {
    if (!state.currentUser) return;
    setProcessing(true);
    
    try {
      // 1. Insert Transaction
      const newTx = {
        listing_id: listing.id,
        buyer_id: state.currentUser.id,
        seller_id: listing.sellerId,
        amount: bidAmount,
        currency: listing.currency,
        fee: platformFee,
        status: 'awaiting_confirmation',
        payment_type: method === 'card' ? 'escrow' : 'manual',
        steps: [
          { label: 'Bid Won', done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          { label: 'Payment Sent', done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          { label: 'Payment Confirmed', done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          { label: 'Item Shipped', done: false, date: null },
          { label: 'Confirm Receipt', done: false, date: null },
        ]
      };

      const { error: txError } = await supabase.from('transactions').insert([newTx]);
      if (txError) throw txError;

      // 2. Update Listing Status to 'sold'
      const { error: listingError } = await supabase.from('listings').update({ status: 'sold' }).eq('id', listing.id);
      if (listingError) throw listingError;

      navigate('/escrow', { state: { success: true } });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div className="page checkout-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="checkout-header">
        <button className="checkout-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="heading-4">Secure Checkout</h1>
        <div style={{ width: 22 }} />
      </header>

      <div className="container">
        {/* Order Summary */}
        <div className="checkout-section">
          <h2 className="heading-5">Order Summary</h2>
          <div className="checkout-card">
            <h3 className="checkout-title">{listing.title}</h3>
            
            <div className="checkout-row">
              <span className="body-sm text-secondary">Winning Bid</span>
              <span className="mono">{formatCurrency(bidAmount, listing.currency)}</span>
            </div>
            <div className="checkout-row">
              <span className="body-sm text-secondary">Platform Fee (7%)</span>
              <span className="mono">{formatCurrency(platformFee, listing.currency)}</span>
            </div>
            
            <div className="checkout-divider" />
            
            <div className="checkout-row checkout-total">
              <span>Total Due</span>
              <span className="mono">{formatCurrency(totalDue, listing.currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-section">
          <h2 className="heading-5">Payment Method</h2>
          <div className="checkout-methods">
            
            <div 
              className={`checkout-method ${method === 'card' ? 'active' : ''}`}
              onClick={() => setMethod('card')}
            >
              <div className="checkout-method-icon"><CreditCard size={20} /></div>
              <div className="checkout-method-info">
                <span className="body-sm fw-600">Credit / Debit Card</span>
                <span className="caption text-tertiary">Visa, Mastercard</span>
              </div>
              <div className="checkout-method-radio">
                {method === 'card' && <CheckCircle2 size={18} color="var(--primary)" />}
              </div>
            </div>

            <div 
              className={`checkout-method ${method === 'mobile' ? 'active' : ''}`}
              onClick={() => setMethod('mobile')}
            >
              <div className="checkout-method-icon"><Smartphone size={20} /></div>
              <div className="checkout-method-info">
                <span className="body-sm fw-600">Mobile Money</span>
                <span className="caption text-tertiary">M-Pesa, Orange Money</span>
              </div>
              <div className="checkout-method-radio">
                {method === 'mobile' && <CheckCircle2 size={18} color="var(--primary)" />}
              </div>
            </div>

          </div>
        </div>

        {/* Security & Shipping Notice */}
        <div className="checkout-security">
          <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0 }} />
          <p className="caption">Payments are held securely in iBID Escrow. The seller only gets paid after you confirm receipt of the item.</p>
        </div>
        
        <div className="checkout-security" style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger)', marginBottom: 'var(--space-xl)' }}>
          <ShieldCheck size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
          <p className="caption"><strong>Shipping Disclaimer:</strong> iBID cannot be held accountable for items lost or damaged during shipping. We highly advise selecting 'Pickup' for high-value or secure items.</p>
        </div>

        {/* Pay Button */}
        <button 
          className="checkout-pay-btn" 
          onClick={handlePay}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(totalDue, listing.currency)}`}
        </button>

      </div>
    </motion.div>
  );
}
