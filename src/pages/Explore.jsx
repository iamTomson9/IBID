import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Smartphone, Shirt, Car, Home, Palette, Activity, Gem, PenTool, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import ListingCard from '../components/listing/ListingCard';
import { CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import useDebounce from '../hooks/useDebounce';
import './Explore.css';

const SORT_OPTIONS = ['Ending Soonest', 'Most Bids', 'Price: Low→High', 'Newest'];

function getCatIcon(catId, size = 18) {
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

export default function Explore() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // When no search or category is active, we just use the global state.listings
  // When they are active, we use the searchResults
  const isFilterActive = debouncedSearch.length > 0 || selectedCat !== null;

  useEffect(() => {
    async function performSearch() {
      if (!isFilterActive) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        let query = supabase.from('listings').select('*');
        
        if (debouncedSearch) {
          query = query.ilike('title', `%${debouncedSearch}%`);
        }
        if (selectedCat) {
          query = query.eq('category', selectedCat);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (data) {
          // Map snake_case to camelCase
          const mapped = data.map(l => ({
            id: l.id,
            sellerId: l.seller_id,
            title: l.title,
            description: l.description,
            category: l.category,
            condition: l.condition_id,
            currency: l.currency,
            currentBid: l.current_bid,
            totalBids: l.total_bids,
            watchers: l.watchers,
            delivery: l.delivery_type,
            location: { city: l.location_city, country: l.location_country },
            endsAt: l.ends_at,
            status: l.status,
            images: l.images || [],
            conditionChecklist: l.condition_checklist || [],
            bids: state.listings.find(sl => sl.id === l.id)?.bids || []
          }));
          setSearchResults(mapped);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearch, selectedCat, state.listings]);

  let filtered = isFilterActive ? searchResults : [...state.listings];
  
  // Local filter for gender since it's just a UI tag in mock (if we wanted true DB filter, we'd add a gender_tag column)
  if (selectedGender !== 'all') filtered = filtered.filter(l => l.genderTag === selectedGender || !l.genderTag);

  const activeCat = CATEGORIES.find(c => c.id === selectedCat);

  return (
    <motion.div className="explore-page page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Search */}
      <div className="explore-search-bar">
        <Search size={18} className="explore-search-icon" />
        <input
          type="text"
          className="explore-search-input"
          placeholder="Search iBID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="explore-search"
        />
        {search && (
          <button className="explore-clear-search" onClick={() => setSearch('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category pills - horizontal scroll */}
      <div className="explore-cat-pills">
        <button
          className={`explore-cat-pill ${!selectedCat ? 'active' : ''}`}
          onClick={() => setSelectedCat(null)}
        >
          <SlidersHorizontal size={14} /> All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`explore-cat-pill ${selectedCat === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
          >
            {getCatIcon(cat.id, 14)} {cat.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Gender filter */}
      <div className="explore-gender-row">
        {[{ val: 'all', label: 'All', icon: <Users size={14}/> }, { val: 'her', label: 'Her', icon: <User size={14}/> }, { val: 'him', label: 'Him', icon: <User size={14}/> }].map(g => (
          <button
            key={g.val}
            className={`explore-gender-pill ${selectedGender === g.val ? 'active' : ''}`}
            onClick={() => setSelectedGender(g.val)}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      {/* Active filter indicator */}
      {selectedCat && (
        <div className="explore-filter-tag">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getCatIcon(activeCat?.id, 14)} Showing {activeCat?.name}</span>
          <button onClick={() => setSelectedCat(null)}><X size={14} /></button>
        </div>
      )}

      {/* Results count */}
      <div className="explore-results-count" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="caption">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}{selectedCat ? ` in ${activeCat?.name}` : ''}</span>
        {isSearching && <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>Searching...</span>}
      </div>

      {/* Listings grid */}
      <div className="explore-grid">
        {filtered.map(listing => (
          <ListingCard key={listing.id} listing={listing} variant="compact" />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="explore-empty">
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', opacity: 0.5 }}>{selectedCat ? getCatIcon(activeCat?.id, 48) : <Search size={48} />}</span>
          <p className="heading-4">{selectedCat ? `No ${activeCat?.name} listings` : 'No listings found'}</p>
          <p className="caption">Try a different search or category</p>
        </div>
      )}
    </motion.div>
  );
}
