import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, TrendingUp, DollarSign, Clock, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './Notifications.css';

const TYPE_ICON_MAP = {
  outbid: <AlertCircle size={20} color="#FF6B6B" />,
  new_bid: <DollarSign size={20} color="var(--success)" />,
  ending_soon: <Clock size={20} color="var(--warning)" />,
  won: <Trophy size={20} color="#FFBE0B" />,
  payment_released: <CheckCircle size={20} color="var(--success)" />,
  default: <Bell size={20} color="var(--primary-light)" />,
};
function getNotifIcon(type) { return TYPE_ICON_MAP[type] || TYPE_ICON_MAP.default; }

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { notifications } = state;
  const unread = notifications.filter(n => !n.read).length;

  const handleTap = (notif) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id });
    if (notif.listingId) navigate(`/listing/${notif.listingId}`);
  };

  return (
    <motion.div className="notif-page page page-with-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="notif-header">
        <h1 className="heading-4">Notifications</h1>
        {unread > 0 && <span className="notif-count">{unread} new</span>}
      </header>
      <div className="container">
        {notifications.length > 0 ? (
          <div className="notif-list stagger-children">
            {notifications.map(n => (
              <div key={n.id} className={`notif-card ${!n.read ? 'unread' : ''}`} onClick={() => handleTap(n)}>
                <span className="notif-icon">{getNotifIcon(n.type)}</span>
                <div className="notif-content">
                  <h4 className="notif-title">{n.title}</h4>
                  <p className="notif-message body-sm">{n.message}</p>
                  <span className="notif-time caption">{timeAgo(n.timestamp)}</span>
                </div>
                {n.type === 'outbid' && <button className="notif-action" onClick={e => { e.stopPropagation(); if (n.listingId) navigate(`/listing/${n.listingId}`); }}>Bid Again</button>}
                {n.type === 'won' && <button className="notif-action notif-action--success" onClick={e => { e.stopPropagation(); navigate(`/checkout/${n.listingId}`); }}>Pay</button>}
              </div>
            ))}
          </div>
        ) : (
          <div className="notif-empty">
            <Bell size={48} strokeWidth={1} />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
