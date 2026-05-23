import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Shield, Flag, Award, ShoppingBag, Package, Calendar, BadgeCheck, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBadgeInfo } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { fetchUserProfile } from '../lib/auth';
import './Profile.css';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetId = userId || state.currentUser?.id;
  const isOwnProfile = !userId || userId === state.currentUser?.id;

  useEffect(() => {
    if (!targetId) return;

    async function load() {
      setLoading(true);
      try {
        // Fetch profile
        const profile = await fetchUserProfile(targetId);
        setProfileUser(profile);

        // Fetch reviews for this user (as seller)
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, reviewer:reviewer_id(name)')
          .eq('seller_id', targetId)
          .order('created_at', { ascending: false });

        if (reviewData) setReviews(reviewData);
      } catch (err) {
        console.error('Profile load error:', err);
        // Fallback to currentUser if own profile
        if (isOwnProfile && state.currentUser) setProfileUser(state.currentUser);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [targetId]);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const user = profileUser || state.currentUser;
  if (!user) return <div className="page container" style={{ paddingTop: 80, color: 'var(--text-secondary)' }}>User not found</div>;

  const badge = getBadgeInfo(user?.badge);
  const successRate = user.totalDeals > 0 ? Math.round((user.totalDeals / (user.totalDeals + 2)) * 100) : 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <motion.div className="profile-page page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="prof-header">
        <button className="prof-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <span className="heading-4">{isOwnProfile ? 'My Profile' : 'Profile'}</span>
        {isOwnProfile
          ? <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Settings size={20} /></button>
          : <div style={{ width: 22 }} />
        }
      </header>

      <div className="prof-content">
        {/* Hero */}
        <div className="prof-hero">
          <div className="prof-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span>{user.name?.charAt(0)?.toUpperCase()}</span>
            }
          </div>
          <h2 className="heading-3">{user.name}</h2>
          <div className="prof-badges">
            {user.isVerifiedSeller && (
              <span className="prof-verified" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BadgeCheck size={14} /> Verified Seller
              </span>
            )}
            <span className="prof-badge-pill" style={{ background: `${badge.color}22`, color: badge.color }}>
              {badge.label}
            </span>
            {avgRating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#FFBE0B', fontWeight: 600 }}>
                <Star size={13} fill="#FFBE0B" color="#FFBE0B" /> {avgRating}
              </span>
            )}
          </div>
          <p className="prof-member caption"><Calendar size={12} /> Member since {user.memberSince?.split('T')[0] || 'Recently'}</p>

          {user.isFlagged && (
            <div className="prof-flag">
              <Flag size={14} /> Flagged Account
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="prof-stats">
          <div className="prof-stat">
            <Award size={18} className="prof-stat-icon" />
            <span className="prof-stat-val">{user.totalDeals || 0}</span>
            <span className="prof-stat-label caption">Deals</span>
          </div>
          <div className="prof-stat">
            <ShoppingBag size={18} className="prof-stat-icon" />
            <span className="prof-stat-val">{user.productsBought || 0}</span>
            <span className="prof-stat-label caption">Bought</span>
          </div>
          <div className="prof-stat">
            <Package size={18} className="prof-stat-icon" />
            <span className="prof-stat-val">{user.productsSold || 0}</span>
            <span className="prof-stat-label caption">Sold</span>
          </div>
          <div className="prof-stat">
            <Shield size={18} className="prof-stat-icon" />
            <span className="prof-stat-val">{successRate}%</span>
            <span className="prof-stat-label caption">Success</span>
          </div>
        </div>

        {/* Scores */}
        <div className="prof-scores container">
          <h3 className="heading-4" style={{ marginBottom: 'var(--space-base)' }}>Points</h3>
          <div className="prof-score-row">
            <span className="body-sm">Bidder Score</span>
            <div className="prof-score-bar"><div className="prof-score-fill" style={{ width: `${Math.min((user.bidderScore || 0) / 5, 100)}%` }} /></div>
            <span className="mono prof-score-num">{user.bidderScore || 0}</span>
          </div>
          {user.isVerifiedSeller && (
            <div className="prof-score-row">
              <span className="body-sm">Seller Score</span>
              <div className="prof-score-bar"><div className="prof-score-fill prof-score-fill--seller" style={{ width: `${Math.min((user.sellerScore || 0) / 5, 100)}%` }} /></div>
              <span className="mono prof-score-num">{user.sellerScore || 0}</span>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="prof-reviews container">
          <h3 className="heading-4">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <div className="prof-review-list stagger-children">
              {reviews.map((rev) => (
                <div key={rev.id} className="prof-review-card">
                  <div className="prof-review-top">
                    <div className="prof-review-stars">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={14} fill={s < rev.rating ? '#FFBE0B' : 'none'} color={s < rev.rating ? '#FFBE0B' : 'var(--text-tertiary)'} />
                      ))}
                    </div>
                    <span className="caption">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="body-sm" style={{ color: 'var(--text-secondary)', margin: 'var(--space-sm) 0' }}>{rev.comment}</p>
                  <p className="caption">— {rev.reviewer?.name || 'User'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-base)' }}>No reviews yet</p>
          )}
        </div>

        {/* Actions */}
        {isOwnProfile && (
          <div className="prof-actions container">
            {!state.isVerified && (
              <button className="prof-action-btn prof-action-btn--primary" onClick={() => navigate('/verify')}>
                <Shield size={18} /> Become a Verified Seller
              </button>
            )}
            <button className="prof-action-btn" onClick={() => navigate('/my-bids')}>View My Bids</button>
            <button className="prof-action-btn" onClick={() => navigate('/my-listings')}>My Listings</button>
            <button className="prof-action-btn" onClick={() => navigate('/escrow')}>Escrow & Payments</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
