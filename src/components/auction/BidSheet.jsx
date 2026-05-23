import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, getCurrencySymbol } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import { validateBidAmount, rateLimitCheck } from '../../lib/validate';
import './BidSheet.css';

export default function BidSheet() {
  const { state, dispatch } = useApp();
  const { bidSheetOpen, bidSheetListing: listing, currentUser } = state;
  const [bidAmount, setBidAmount] = useState('');
  const [showAutoBid, setShowAutoBid] = useState(false);
  const [maxBid, setMaxBid] = useState('');
  const [increment, setIncrement] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If no listing, nothing to show
  if (!bidSheetOpen || !listing) return null;

  // If guest tries to bid — close sheet and open the global auth prompt modal
  if (!currentUser) {
    dispatch({ type: 'CLOSE_BID_SHEET' });
    dispatch({ type: 'OPEN_AUTH_PROMPT', payload: 'bid' });
    return null;
  }

  const minBid = listing.currentBid + 1;
  const symbol = getCurrencySymbol(listing.currency);

  const handleSubmit = async () => {
    // Rate limiting — prevent spam bids
    if (!rateLimitCheck('place_bid', 2500)) {
      setError('Please wait a moment before placing another bid.');
      return;
    }

    // Validate amount (OWASP: server-side also validates via RLS + constraints)
    const validation = validateBidAmount(bidAmount, minBid, symbol);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    if (!currentUser) {
      setError('You must be logged in to bid.');
      return;
    }

    const amount = parseInt(bidAmount);
    setError('');
    setLoading(true);

    try {
      const { error: bidError } = await supabase.from('bids').insert([{
        listing_id: listing.id,
        user_id: currentUser.id,
        amount,
      }]);
      if (bidError) throw bidError;

      const { error: listingError } = await supabase
        .from('listings')
        .update({ current_bid: amount, total_bids: (listing.totalBids || 0) + 1 })
        .eq('id', listing.id);
      if (listingError) throw listingError;

      dispatch({
        type: 'PLACE_BID',
        payload: { listingId: listing.id, userId: currentUser.id, amount },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setBidAmount('');
        setShowAutoBid(false);
        setMaxBid('');
        setIncrement('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addIncrement = (val) => {
    const current = parseInt(bidAmount) || minBid;
    setBidAmount(String(current + val));
    setError('');
  };

  const close = () => {
    dispatch({ type: 'CLOSE_BID_SHEET' });
    setBidAmount('');
    setError('');
    setSuccess(false);
    setShowAutoBid(false);
  };

  // Guest auth prompt handling is now in AuthPromptModal (global)
  // BidSheet only renders for authenticated users

  return (
    <AnimatePresence>
      {bidSheetOpen && (
        <>
          <motion.div
            className="bid-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="bid-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="bid-sheet__handle" />

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  className="bid-success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <div className="bid-success__circle">
                    <Check size={36} strokeWidth={3} />
                  </div>
                  <h3 className="heading-3">Bid Placed!</h3>
                  <p className="body" style={{ color: 'var(--text-secondary)' }}>
                    You're now the highest bidder at {formatCurrency(parseInt(bidAmount), listing.currency)}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  <div className="bid-sheet__header">
                    <h3 className="heading-4">Place Your Bid</h3>
                    <button className="bid-sheet__close" onClick={close}><X size={20} /></button>
                  </div>

                  <p className="bid-sheet__listing-title body-sm">{listing.title}</p>

                  <div className="bid-sheet__current">
                    <span className="caption">Current Highest Bid</span>
                    <span className="bid-sheet__current-amount mono">{formatCurrency(listing.currentBid, listing.currency)}</span>
                  </div>

                  <div className="bid-sheet__input-group">
                    <span className="bid-sheet__symbol">{symbol}</span>
                    <input
                      type="number"
                      className="bid-sheet__input mono"
                      placeholder={minBid.toString()}
                      value={bidAmount}
                      onChange={e => { setBidAmount(e.target.value); setError(''); }}
                      id="bid-amount-input"
                      autoFocus
                    />
                  </div>
                  <p className="bid-sheet__min caption">Minimum bid: {symbol}{minBid.toLocaleString()}</p>
                  {error && <p className="bid-sheet__error">{error}</p>}

                  <div className="bid-sheet__increments">
                    {[10, 50, 100, 500].map(val => (
                      <button key={val} className="bid-sheet__inc-btn" onClick={() => addIncrement(val)}>
                        +{val}
                      </button>
                    ))}
                  </div>

                  {/* Auto-bid toggle */}
                  <button className="bid-sheet__autobid-toggle" onClick={() => setShowAutoBid(!showAutoBid)}>
                    <Zap size={16} />
                    <span>Auto-Bid</span>
                    <span className="bid-sheet__autobid-arrow">{showAutoBid ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>
                  </button>

                  {showAutoBid && (
                    <motion.div
                      className="bid-sheet__autobid"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                    >
                      <p className="caption" style={{ marginBottom: 'var(--space-sm)' }}>
                        System will bid on your behalf, incrementally above each competing bid, up to your max.
                      </p>
                      <div className="bid-sheet__autobid-fields">
                        <div className="bid-sheet__autobid-field">
                          <label className="caption">Max Amount</label>
                          <div className="bid-sheet__mini-input-group">
                            <span className="caption">{symbol}</span>
                            <input type="number" className="bid-sheet__mini-input mono" placeholder="5000" value={maxBid} onChange={e => setMaxBid(e.target.value)} />
                          </div>
                        </div>
                        <div className="bid-sheet__autobid-field">
                          <label className="caption">Increment</label>
                          <div className="bid-sheet__mini-input-group">
                            <span className="caption">+{symbol}</span>
                            <input type="number" className="bid-sheet__mini-input mono" placeholder="50" value={increment} onChange={e => setIncrement(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button className="bid-sheet__submit" onClick={handleSubmit} id="submit-bid" disabled={loading}>
                    {loading ? 'Placing Bid...' : 'PLACE BID'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
