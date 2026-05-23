import { useNavigate } from 'react-router-dom';
import { Clock, Flame, Smartphone, Shirt, Car, Home, Palette, Activity, Gem, PenTool, Package } from 'lucide-react';
import { formatCurrency, formatTimeRemaining, CONDITIONS } from '../../data/mockData';
import './ListingCard.css';

const CAT_COLORS = { electronics: '#4A00E0', fashion: '#8E2DE2', vehicles: '#FF6B6B', home: '#00D68F', collectibles: '#FFBE0B', sports: '#FF3B3B', luxury: '#E0A0FF', other: '#A0A0B8' };

function getCatIcon(catId, color) {
  const size = 32;
  switch (catId) {
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

export default function ListingCard({ listing, variant = 'vertical' }) {
  const navigate = useNavigate();
  const color = CAT_COLORS[listing.category] || '#4A00E0';
  const condition = CONDITIONS.find(c => c.id === listing.condition);
  const timeLeft = formatTimeRemaining(listing.endsAt);

  return (
    <div
      className={`listing-card listing-card--${variant}`}
      onClick={() => navigate(`/listing/${listing.id}`)}
      id={`listing-${listing.id}`}
    >
      <div className="listing-card__image" style={{ 
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        backgroundImage: listing.images && listing.images[0] ? `url(${listing.images[0]})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {(!listing.images || !listing.images[0]) && (
          <span className="listing-card__emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {getCatIcon(listing.category, color)}
          </span>
        )}
        {condition && (
          <span className="listing-card__condition" style={{ background: `${condition.color}22`, color: condition.color }}>
            {condition.label}
          </span>
        )}
      </div>
      <div className="listing-card__body">
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__bid mono">{formatCurrency(listing.currentBid, listing.currency)}</p>
        <div className="listing-card__meta">
          <span className="listing-card__bids"><Flame size={12} /> {listing.totalBids} bids</span>
          <span className="listing-card__time"><Clock size={12} /> {timeLeft}</span>
        </div>
      </div>
    </div>
  );
}
