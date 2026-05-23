import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, Bell, ChevronRight, X, Flame, Clock, Sparkles, User, Users, Smartphone, Shirt, Car, Home as HomeIcon, Palette, Activity, Gem, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import ListingCard from '../components/listing/ListingCard';
import { CATEGORIES, formatTimeRemaining } from '../data/mockData';
import './Home.css';

function getCatIcon(catId, size = 18) {
  switch (catId) {
    case 'electronics': return <Smartphone size={size} />;
    case 'fashion': return <Shirt size={size} />;
    case 'vehicles': return <Car size={size} />;
    case 'home': return <HomeIcon size={size} />;
    case 'collectibles': return <Palette size={size} />;
    case 'sports': return <Activity size={size} />;
    case 'luxury': return <Gem size={size} />;
    default: return <PenTool size={size} />;
  }
}

export default function Home() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { listings, notifications } = state;
  const unread = notifications.filter(n => !n.read).length;
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');

  let filtered = [...listings];
  if (selectedCat) filtered = filtered.filter(l => l.category === selectedCat);
  if (selectedGender !== 'all') filtered = filtered.filter(l => l.genderTag === selectedGender || !l.genderTag);

  const hotBids = [...filtered].sort((a, b) => b.totalBids - a.totalBids);
  const endingSoon = [...filtered]
    .filter(l => new Date(l.endsAt) > new Date())
    .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
  const justListed = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activeCat = CATEGORIES.find(c => c.id === selectedCat);

  return (
    <motion.div className="home-page page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <header className="home-header">
        <button className="home-hamburger" onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: true })} id="hamburger-menu">
          <Menu size={22} />
        </button>
        <h1 className="home-logo">iBID</h1>
        <button className="home-bell" onClick={() => navigate('/notifications')} id="notifications-btn">
          <Bell size={22} />
          {unread > 0 && <span className="home-bell-badge animate-badge-pop">{unread}</span>}
        </button>
      </header>

      <div className="home-content">
        {/* Categories */}
        <div className="home-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`home-cat-pill ${selectedCat === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            >
              <span>{getCatIcon(cat.id)}</span>
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Gender filter */}
        <div className="home-gender-row">
          {[{ val: 'all', label: 'All', icon: <Users size={14}/> }, { val: 'her', label: 'Her', icon: <User size={14}/> }, { val: 'him', label: 'Him', icon: <User size={14}/> }].map(g => (
            <button
              key={g.val}
              className={`home-gender-pill ${selectedGender === g.val ? 'active' : ''}`}
              onClick={() => setSelectedGender(g.val)}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* Active filter indicator */}
        {selectedCat && (
          <div className="home-filter-tag">
            <span><span style={{display:'flex',alignItems:'center',gap:'4px'}}>{getCatIcon(activeCat?.id)} Showing {activeCat?.name}</span></span>
            <button onClick={() => setSelectedCat(null)}><X size={14} /></button>
          </div>
        )}

        {/* Hot Bids */}
        {hotBids.length > 0 && (
          <section className="home-section">
            <div className="home-section__header">
              <h2 className="heading-4" style={{display:'flex',alignItems:'center',gap:'8px'}}><Flame size={20} color="#FF6B35" /> Hot Bids</h2>
              <button className="home-see-all" onClick={() => navigate('/explore')}>See All <ChevronRight size={16} /></button>
            </div>
            <div className="home-scroll-row">
              {hotBids.map(listing => (
                <ListingCard key={listing.id} listing={listing} variant="horizontal" />
              ))}
            </div>
          </section>
        )}

        {/* Ending Soon */}
        {endingSoon.length > 0 && (
          <section className="home-section">
            <div className="home-section__header">
              <h2 className="heading-4" style={{display:'flex',alignItems:'center',gap:'8px'}}><Clock size={20} color="var(--warning)" /> Ending Soon</h2>
              <button className="home-see-all" onClick={() => navigate('/explore')}>See All <ChevronRight size={16} /></button>
            </div>
            <div className="home-scroll-row">
              {endingSoon.map(listing => (
                <ListingCard key={listing.id} listing={listing} variant="horizontal" />
              ))}
            </div>
          </section>
        )}

        {/* Just Listed */}
        {justListed.length > 0 && (
          <section className="home-section">
            <div className="home-section__header">
              <h2 className="heading-4" style={{display:'flex',alignItems:'center',gap:'8px'}}><Sparkles size={20} color="var(--primary-light)" /> Just Listed</h2>
            </div>
            <div className="home-list stagger-children">
              {justListed.slice(0, 5).map(listing => (
                <ListingCard key={listing.id} listing={listing} variant="vertical" />
              ))}
            </div>
          </section>
        )}

        {/* Empty state when filtering */}
        {selectedCat && filtered.length === 0 && (
          <div className="home-empty">
            <span style={{ display:'flex', justifyContent:'center', marginBottom:'1rem', opacity:0.5 }}>{getCatIcon(activeCat?.id, 48)}</span>
            <p className="heading-4">No {activeCat?.name} listings yet</p>
            <p className="caption">Be the first to list something!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
