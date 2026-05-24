import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Share2, MapPin, Truck, Eye, Clock, CheckCircle, Smartphone, Shirt, Car, Home, Palette, Activity, Gem, PenTool, Crown, BadgeCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserById, formatCurrency, getTimeRemaining, CONDITIONS, getBadgeInfo } from '../data/mockData';
import './ListingDetail.css';

const CAT_COLORS = { electronics: '#4A00E0', fashion: '#8E2DE2', vehicles: '#FF6B6B', home: '#00D68F', collectibles: '#FFBE0B', sports: '#FF3B3B', luxury: '#E0A0FF', other: '#A0A0B8' };

function getCatIcon(catId, size = 64) {
  switch (catId) {
    case 'electronics': return <Smartphone size={size} />;
    case 'fashion': return <Shirt size={size} />;
    case 'vehicles': return <Car size={size} />;
    case 'home': return <Home size={size} />;
    case 'collectibles': return <Palette size={size} />;
    case 'sports': return <Activity size={size} />;
    case 'luxury': return <Gem size={size} />;
    default: return <PenTool size={size} />;
  }
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const listing = state.listings.find(l => l.id === id);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(listing?.endsAt));
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const images = listing?.images?.length ? listing.images : [];

  useEffect(() => {
    if (!listing) return;
    const interval = setInterval(() => setTimeLeft(getTimeRemaining(listing.endsAt)), 1000);
    return () => clearInterval(interval);
  }, [listing]);

  if (!listing) return <div className="page container" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text-secondary)' }}>Listing not found</div>;

  const isSeller = state.currentUser?.id === listing.sellerId;
  const seller = isSeller 
    ? state.currentUser 
    : (getUserById(listing.sellerId) || state.users?.find(u => u.id === listing.sellerId) || { name: 'Unknown Seller', badge: 'bronze', isVerifiedSeller: false });

  const condition = CONDITIONS.find(c => c.id === listing.condition);
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;
  const highestBidder = listing.bids[0] ? getUserById(listing.bids[0].userId) : null;
  const color = CAT_COLORS[listing.category] || '#4A00E0';
  
  const locCity = listing.location?.city || 'Gaborone';
  const locCountry = listing.location?.country || 'BW';

  const handleBid = () => {
    if (!state.isAuthenticated) { navigate('/register'); return; }
    dispatch({ type: 'OPEN_BID_SHEET', payload: listing });
  };

  const handleAcceptBid = () => {
    dispatch({ type: 'ACCEPT_BID', payload: listing.id });
  };

  return (
    <motion.div className="listing-detail page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <header className="ld-header">
        <button onClick={() => navigate(-1)} className="ld-back"><ArrowLeft size={22} /></button>
        <button className="ld-share"><Share2 size={20} /></button>
      </header>

      {/* Image & Title Overlay */}
      <div className="ld-image" style={{ 
        background: `linear-gradient(135deg, ${color}55, ${color}15)`,
        backgroundImage: images[0] ? `url(${images[0]})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer' 
      }} onClick={() => setShowGallery(true)}>
        {!images[0] && (
          <span className="ld-image__emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {getCatIcon(listing.category, 64)}
          </span>
        )}
        
        <div className="ld-image-overlay">
          {condition && (
            <span className="ld-condition" style={{ background: `${condition.color}22`, color: condition.color, borderColor: condition.color }}>
              {condition.label}
            </span>
          )}
          <h1 className="heading-3 ld-title-overlay">{listing.title}</h1>
        </div>
      </div>

      {/* Thumbnail Previews */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, padding: '16px 24px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {images.map((img, i) => (
            <div key={i} onClick={() => { setCurrentImageIdx(i); setShowGallery(true); }} style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 12, overflow: 'hidden', border: i === currentImageIdx ? `2px solid ${color}` : '2px solid transparent', cursor: 'pointer' }}>
              <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="ld-gallery-modal" onClick={() => setShowGallery(false)}>
          <div className="ld-gallery-header">
            <span className="ld-gallery-counter">{images.length > 0 ? `${currentImageIdx + 1} / ${images.length}` : '1 / 1'}</span>
            <button className="ld-gallery-close" onClick={() => setShowGallery(false)}>✕</button>
          </div>
          
          <div className="ld-gallery-slider" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && <button className="ld-gallery-btn" onClick={() => setCurrentImageIdx(prev => Math.max(0, prev - 1))} disabled={currentImageIdx === 0}>‹</button>}
            <div className="ld-gallery-view" style={{ 
              background: `linear-gradient(135deg, ${color}55, ${color}15)`,
              backgroundImage: images[currentImageIdx] ? `url(${images[currentImageIdx]})` : undefined,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}>
              {!images[currentImageIdx] && (
                <span style={{ opacity: 0.8 }}>{getCatIcon(listing.category, 120)}</span>
              )}
            </div>
            {images.length > 1 && <button className="ld-gallery-btn" onClick={() => setCurrentImageIdx(prev => Math.min(images.length - 1, prev + 1))} disabled={currentImageIdx === images.length - 1}>›</button>}
          </div>
          {images.length > 1 && <div className="ld-gallery-hint">Tap left or right to swipe</div>}
        </div>
      )}

      <div className="ld-body container">

        {/* Seller & Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <div className="ld-seller" onClick={() => navigate(`/profile/${listing.sellerId}`)} style={{ margin: 0 }}>
            <div className="ld-seller__avatar">{seller?.name?.charAt(0) || '?'}</div>
            <div>
              <span className="ld-seller__name">{seller?.name || 'Seller'} {seller?.isVerifiedSeller && <BadgeCheck size={14} color="var(--success)" />}</span>
              <span className="ld-seller__badge">{getBadgeInfo(seller?.badge || 'bronze').label}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={13} color="#FF6B35"/> {listing.totalBids} bids</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={13} /> {listing.watchers} watching</span>
          </div>
        </div>

        {/* Location, Delivery & Timer */}
        <div className="ld-tags">
          <span className="ld-tag"><MapPin size={13} /> {locCity}, {locCountry}</span>
          <span className="ld-tag"><Truck size={13} /> {listing.delivery === 'both' ? 'Pickup & Shipping' : listing.delivery === 'pickup' ? 'Pickup Only' : 'Shipping Only'}</span>
          <span className={`ld-tag ${isUrgent ? 'ld-compact-timer urgent' : 'ld-compact-timer'}`} style={{ marginRight: '15px' }}>
            <Clock size={12} />
            <span>{timeLeft.days}d {String(timeLeft.hours).padStart(2,'0')}h {String(timeLeft.minutes).padStart(2,'0')}m {String(timeLeft.seconds).padStart(2,'0')}s</span>
          </span>
        </div>

        {/* Description */}
        <div className="ld-section" style={{ marginBottom: 'var(--space-xl)' }}>
          <p className="body" style={{ color: 'var(--text-secondary)' }}>
            {showFullDesc || listing.description.length < 120 
              ? listing.description 
              : `${listing.description.substring(0, 120)}...`}
          </p>
          {listing.description.length >= 120 && (
            <button 
              onClick={() => setShowFullDesc(!showFullDesc)}
              style={{ color: 'var(--primary-light)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginTop: 'var(--space-xs)', background: 'none', border: 'none', padding: 0 }}
            >
              {showFullDesc ? 'See Less' : 'See More'}
            </button>
          )}
        </div>

        {/* Current Bid Section */}
        <div className="ld-bid-section">
          <div className="ld-bid-top" style={{ alignItems: 'center', marginBottom: 0 }}>
            <div className="ld-highest-bidder" style={{ fontSize: 'var(--fs-base)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 500 }}>Highest Bidder</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crown size={14} color="var(--primary-light)" />
                <span>{highestBidder ? highestBidder.name : 'No bids yet'}</span>
              </div>
            </div>
            <div className="ld-bid-price-col" style={{ alignItems: 'flex-end' }}>
              <p className="ld-bid-label" style={{ marginBottom: 2 }}>Current Bid</p>
              <p className="ld-bid-amount mono" style={{ fontSize: 'var(--fs-2xl)' }}>{formatCurrency(listing.currentBid, listing.currency)}</p>
            </div>
          </div>
        </div>

        {/* BID / Accept Button */}
        {listing.status === 'ended' ? (
          <button className="ld-bid-btn" disabled style={{ background: 'var(--surface-light)', color: 'var(--text-secondary)' }}>
            Listing Ended
          </button>
        ) : isSeller ? (
          <button className="ld-bid-btn" onClick={handleAcceptBid} style={{ background: 'var(--success)' }}>
            Accept Highest Bid & End Listing
          </button>
        ) : (
          <button className="ld-bid-btn animate-heartbeat" onClick={handleBid} id="bid-button">
          BID <Flame size={18} />
          </button>
        )}
        
        {isSeller && (
          <button onClick={async () => {
            if (window.confirm('Are you sure you want to delete this listing?')) {
              try {
                // In a real app we'd also delete from Supabase here:
                const { supabase } = await import('../lib/supabase');
                const { error } = await supabase.from('listings').delete().eq('id', listing.id);
                if (error) {
                  alert('Error deleting from database: ' + error.message);
                  return;
                }
                dispatch({ type: 'DELETE_LISTING', payload: listing.id });
                navigate('/home', { replace: true });
              } catch (err) {
                console.error(err);
              }
            }
          }} style={{ background: 'var(--surface-border)', color: 'var(--error)', padding: '16px', borderRadius: 12, fontWeight: 600, width: '100%', marginTop: 12, border: 'none' }}>
            Delete Listing
          </button>
        )}

        {/* Condition Checklist */}
        {listing.conditionChecklist && listing.conditionChecklist.length > 0 && (
          <div className="ld-section">
            <h2 className="heading-5" style={{ marginBottom: 'var(--space-md)', display:'flex', alignItems:'center', gap:'6px' }}><CheckCircle size={18} color="var(--success)"/> Condition Checklist</h2>
            <div className="ld-checklist">
              {listing.conditionChecklist.map((item, i) => (
                <div key={i} className="ld-check-row">
                  <CheckCircle size={16} className="ld-check-icon" />
                  <div className="ld-check-info">
                    <div className="ld-check-top">
                      <span className="ld-check-name">{item.item}</span>
                      <span className="ld-check-rating">{item.rating}</span>
                    </div>
                    {item.notes && <p className="ld-check-notes caption">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bid History */}
        <div className="ld-section">
          <h2 className="heading-5" style={{ marginBottom: 'var(--space-md)' }}>Bid History</h2>
          <div className="ld-bid-history">
            {listing.bids.map((bid, i) => {
              const bidder = getUserById(bid.userId);
              const isHighest = i === 0;
              return (
                <div key={i} className={`ld-bid-row ${isHighest ? 'highest' : ''}`}>
                  <div className="ld-bid-row__avatar">{bidder?.name?.charAt(0)}</div>
                  <div className="ld-bid-row__info">
                    <span className="ld-bid-row__name">{isHighest && <Crown size={12} color="var(--primary-light)" style={{marginRight: 4, display: 'inline'}}/>}{bidder?.name}</span>
                    <span className="ld-bid-row__time caption">{new Date(bid.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="ld-bid-row__amount mono">{formatCurrency(bid.amount, listing.currency)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
