import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './BottomNav.css';

export default function BottomNav() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  // Hide on auth pages
  const hideOnPaths = ['/', '/register', '/otp', '/welcome'];
  if (hideOnPaths.includes(location.pathname)) return null;

  const tabs = [
    { path: '/home', icon: Home, label: 'Home', id: 'home' },
    { path: '/explore', icon: Search, label: 'Explore', id: 'explore' },
    { path: '/create-listing', icon: PlusCircle, label: 'List', id: 'list', isCenter: true },
    { path: '/notifications', icon: Bell, label: 'Alerts', id: 'alerts', badge: unreadCount },
    { path: '/profile', icon: User, label: 'Profile', id: 'profile' },
  ];

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map(tab => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) =>
            `bottom-nav__tab ${isActive ? 'active' : ''} ${tab.isCenter ? 'center' : ''}`
          }
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
          id={`nav-tab-${tab.id}`}
        >
          {tab.isCenter ? (
            <div className="bottom-nav__center-btn">
              <tab.icon size={24} strokeWidth={2.5} />
            </div>
          ) : (
            <>
              <div className="bottom-nav__icon-wrap">
                <tab.icon size={22} strokeWidth={1.8} />
                {tab.badge > 0 && (
                  <span className="bottom-nav__badge animate-badge-pop">{tab.badge}</span>
                )}
              </div>
              <span className="bottom-nav__label">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
