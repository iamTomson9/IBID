import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Flame, Trophy, Smartphone, Shirt, Car, Home as HomeIcon, Palette, Activity, Gem, Package, Crown, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../data/mockData';
import { supabase } from '../lib/supabase';
import './MyBids.css';

const CAT_COLORS = { electronics: '#4A00E0', fashion: '#8E2DE2', vehicles: '#FF6B6B', home: '#00D68F', collectibles: '#FFBE0B', sports: '#FF3B3B', luxury: '#E0A0FF', other: '#A0A0B8' };

function getCatIcon(catId, size = 24) {
  switch (catId) {
    case 'electronics': return <Smartphone size={size} />;
    case 'fashion': return <Shirt size={size} />;
    case 'vehicles': return <Car size={size} />;
    case 'home': return <HomeIcon size={size} />;
    case 'collectibles': return <Palette size={size} />;
    case 'sports': return <Activity size={size} />;
    case 'luxury': return <Gem size={size} />;
    default: return <Package size={size} />;
  }
}

export default function MyBids() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [tab, setTab] = useState('active');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = state.currentUser?.id;

  useEffect(() => {
    if (!uid) return;

    async function fetchMyBids() {
      setLoading(true);
      try {
        // Fetch all bids by this user with their listing info
        const { data, error } = await supabase
          .from('bids')
          .select(`
            id, amount, timestamp,
            listing:listing_id (
              id, title, category, currency, current_bid, total_bids,
              status, ends_at, images
            )
          `)
          .eq('user_id', uid)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        if (data) setBids(data);
      } catch (err) {
        console.error('MyBids fetch error:', err);
        // Fallback to local state
        const localBids = [];
        state.listings.forEach(l => {
          l.bids?.filter(b => b.userId === uid).forEach(b => {
            localBids.push({ id: b.id || Math.random(), amount: b.amount, timestamp: b.timestamp, listing: l });
          });
        });
        setBids(localBids);
      } finally {
        setLoading(false);
      }
    }

    fetchMyBids();
  }, [uid]);

  // Group into tabs
  const activeBids = bids.filter(b => b.listing?.status === 'active');
  const wonBids = bids.filter(b => {
    const l = b.listing;
    if (!l || l.status !== 'ended') return false;
    // Check if this bid is the highest
    return b.amount === l.current_bid;
  });
  const lostBids = bids.filter(b => {
    const l = b.listing;
    if (!l || l.status !== 'ended') return false;
    return b.amount < l.current_bid;
  });

  const tabData = { active: activeBids, won: wonBids, lost: lostBids };
  const currentBids = tabData[tab] || [];

  return (
    <motion.div className="mybids-page page page-with-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-header">
        <button className="mb-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="heading-4">My Bids</h1>
        <div style={{ width: 22 }} />
      </header>

      <div className="container">
        {/* Tabs */}
        <div className="mb-tabs">
          {[
            { key: 'active', label: 'Active', count: activeBids.length },
            { key: 'won', label: 'Won', count: wonBids.length, icon: <Trophy size={14} /> },
            { key: 'lost', label: 'Lost', count: lostBids.length },
          ].map(t => (
            <button key={t.key} className={`mb-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t.icon}{t.label}
                {t.count > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}>{t.count}</span>}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div className="mb-list stagger-children">
            {currentBids.length > 0 ? currentBids.map(bid => {
              const listing = bid.listing;
              if (!listing) return null;
              const isHighest = bid.amount >= (listing.current_bid || listing.currentBid || 0);
              const color = CAT_COLORS[listing.category] || '#4A00E0';

              return (
                <div key={bid.id} className="mb-card" onClick={() => navigate(`/listing/${listing.id}`)}>
                  <div className="mb-card__img" style={{ background: `linear-gradient(135deg, ${color}44, ${color}11)` }}>
                    {listing.images?.[0]
                      ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                      : <span>{getCatIcon(listing.category, 28)}</span>
                    }
                  </div>
                  <div className="mb-card__info">
                    <h3 className="mb-card__title">{listing.title}</h3>
                    <div className="mb-card__row">
                      <span className="mb-card__mybid caption">Your bid: <strong className="mono">{formatCurrency(bid.amount, listing.currency)}</strong></span>
                    </div>
                    <div className="mb-card__row">
                      <span className="mb-card__highest caption">Highest: <strong className="mono">{formatCurrency(listing.current_bid || listing.currentBid, listing.currency)}</strong></span>
                      {tab === 'active' && (
                        isHighest
                          ? <span className="mb-badge mb-badge--highest"><Crown size={12} /> Highest</span>
                          : <span className="mb-badge mb-badge--outbid">Outbid</span>
                      )}
                      {tab === 'won' && <span className="mb-badge mb-badge--highest"><Trophy size={12} /> Won</span>}
                    </div>
                    {tab === 'active' && !isHighest && (
                      <button className="mb-bid-again" onClick={e => { e.stopPropagation(); navigate(`/listing/${listing.id}`); }}>
                        <Flame size={12} /> Bid Again
                      </button>
                    )}
                    {tab === 'won' && (
                      <button className="mb-bid-again" style={{ background: 'var(--success)' }} onClick={e => { e.stopPropagation(); navigate(`/escrow`); }}>
                        View in Escrow
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="mb-empty">
                {tab === 'active' && <><Flame size={48} strokeWidth={1} /><p>No active bids</p><p className="caption">Start bidding on items you love!</p></>}
                {tab === 'won' && <><Trophy size={48} strokeWidth={1} color="#FFBE0B" /><p>No won bids yet</p><p className="caption">Keep bidding — your first win is coming!</p></>}
                {tab === 'lost' && <><Frown size={48} strokeWidth={1} color="var(--text-secondary)" /><p>No lost bids</p><p className="caption">You haven't lost any bids yet!</p></>}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
