import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { X, Home, Search, Gavel, Package, DollarSign, Settings, HelpCircle, FileText, Info, LogOut, Trophy, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from '../../lib/auth';
import './Sidebar.css';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Trophy, label: 'My Bids', path: '/my-bids' },
    { icon: Package, label: 'My Listings', path: '/my-listings' },
    { icon: DollarSign, label: 'Escrow & Payments', path: '/escrow' },
    { divider: true },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    { icon: FileText, label: 'Terms & Conditions', path: '/terms' },
    { icon: Info, label: 'About iBID', path: '/about' },
  ];

  const handleNav = (path) => {
    dispatch({ type: 'SET_SIDEBAR', payload: false });
    navigate(path);
  };

  const handleLogout = async () => {
    dispatch({ type: 'SET_SIDEBAR', payload: false });
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <AnimatePresence>
      {state.sidebarOpen && (
        <>
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
          />
          <motion.aside
            className="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="sidebar__header">
              <div className="sidebar__user-info">
                {state.currentUser ? (
                  <>
                    <div className="sidebar__avatar">
                      {state.currentUser.avatar ? (
                        <img src={state.currentUser.avatar} alt="" />
                      ) : (
                        <span>{state.currentUser.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="sidebar__name">{state.currentUser.name}</h3>
                      <p className="sidebar__status">
                        {state.isVerified ? <span style={{display:'flex',alignItems:'center',gap:'4px',color:'var(--success)'}}><BadgeCheck size={14}/> Verified</span> : 'Registered Bidder'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="sidebar__name">Guest</h3>
                    <p className="sidebar__status">Browse iBID</p>
                  </div>
                )}
              </div>
              <button
                className="sidebar__close"
                onClick={() => dispatch({ type: 'SET_SIDEBAR', payload: false })}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {state.currentUser && (
              <div className="sidebar__stats">
                <div className="sidebar__stat">
                  <span className="sidebar__stat-value">{state.currentUser.totalDeals}</span>
                  <span className="sidebar__stat-label">Deals</span>
                </div>
                <div className="sidebar__stat">
                  <span className="sidebar__stat-value">{state.currentUser.productsBought}</span>
                  <span className="sidebar__stat-label">Bought</span>
                </div>
                <div className="sidebar__stat">
                  <span className="sidebar__stat-value">{state.currentUser.productsSold}</span>
                  <span className="sidebar__stat-label">Sold</span>
                </div>
              </div>
            )}

            <nav className="sidebar__nav">
              {menuItems.map((item, i) =>
                item.divider ? (
                  <div key={i} className="sidebar__divider" />
                ) : (
                  <button
                    key={item.path}
                    className={`sidebar__nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNav(item.path)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                )
              )}
            </nav>

            {state.isAuthenticated && (
              <button className="sidebar__logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
