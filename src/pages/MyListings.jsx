import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Plus, Smartphone, Shirt, Car, Home, Palette, Activity, Gem, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import './MyListings.css';

export default function MyListings() {
  const navigate = useNavigate();
  const { state } = useApp();
  const user = state.currentUser;
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function fetchListings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setMyListings(data.map(l => ({
            id: l.id,
            sellerId: l.seller_id,
            title: l.title,
            category: l.category,
            currency: l.currency,
            currentBid: l.current_bid,
            totalBids: l.total_bids,
            status: l.status,
            images: l.images || [],
          })));
        }
      } catch (err) {
        console.error('MyListings fetch error:', err);
        // Fallback to global state
        setMyListings(state.listings.filter(l => l.sellerId === user.id));
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [user?.id]);

  return (
    <motion.div
      className="page page-with-header my-listings-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="ml-header">
        <button className="ml-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="heading-4">My Listings</h1>
        <button onClick={() => navigate('/create-listing')} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <Plus size={20} />
        </button>
      </header>

      <div className="container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : myListings.length > 0 ? (
          <div className="ml-list stagger-children">
            {myListings.map(listing => (
              <div
                key={listing.id}
                className="ml-card"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <div className="ml-card__image" style={{
                  background: `linear-gradient(135deg, ${getCatColor(listing.category)}33, ${getCatColor(listing.category)}11)`,
                  backgroundImage: listing.images && listing.images[0] ? `url(${listing.images[0]})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {(!listing.images || !listing.images[0]) && (
                    <span className="ml-card__emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      {getCatIcon(listing.category)}
                    </span>
                  )}
                  <span className={`ml-card__status ml-card__status--${listing.status}`}>
                    {listing.status === 'active' ? '● Live' : listing.status}
                  </span>
                </div>
                <div className="ml-card__info">
                  <h3 className="ml-card__title">{listing.title}</h3>
                  <div className="ml-card__meta">
                    <span className="ml-card__bids">{listing.totalBids} bids</span>
                    <span className="ml-card__price mono">
                      {getCurrSym(listing.currency)}{listing.currentBid.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ml-empty">
            <Package size={56} strokeWidth={1} />
            <h3>No listings yet</h3>
            <p className="body-sm">Start selling by creating your first listing!</p>
            <button className="ml-cta" onClick={() => navigate('/create-listing')}>
              List a Product
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getCatColor(cat) {
  const map = { electronics: '#4A00E0', fashion: '#8E2DE2', vehicles: '#FF6B6B', home: '#00D68F', collectibles: '#FFBE0B', sports: '#FF3B3B', luxury: '#E0A0FF', other: '#A0A0B8' };
  return map[cat] || '#4A00E0';
}
function getCatIcon(cat) {
  const size = 32;
  const color = getCatColor(cat);
  switch (cat) {
    case 'electronics': return <Smartphone size={size} color={color} />;
    case 'fashion': return <Shirt size={size} color={color} />;
    case 'vehicles': return <Car size={size} color={color} />;
    case 'home': return <Home size={size} color={color} />;
    case 'collectibles': return <Palette size={size} color={color} />;
    case 'sports': return <Activity size={size} color={color} />;
    case 'luxury': return <Gem size={size} color={color} />;
    default: return <Package size={size} color={color} />;
  }
}
function getCurrSym(code) {
  const map = { ZAR: 'R', BWP: 'P', USD: '$', GBP: '£', EUR: '€', KES: 'KSh', NGN: '₦' };
  return map[code] || code;
}
