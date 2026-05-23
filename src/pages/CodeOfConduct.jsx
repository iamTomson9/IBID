import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Clock, DollarSign, Flag, Award, Star, Package, Truck, CheckCircle, Handshake, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import './CodeOfConduct.css';

const LISTER_RULES = [
  { icon: <Package size={20} />, title: 'Accurate Listings', desc: 'Products must match their condition checklist exactly. Discrepancies will result in penalties.' },
  { icon: <DollarSign size={20} />, title: '7% Platform Fee', desc: 'A 7% service fee is deducted from every successful sale.' },
  { icon: <AlertTriangle size={20} />, title: '15% Discrepancy Fee', desc: 'If a product doesn\'t match the listing: 10% goes to the bidder as compensation, 5% goes to the platform.' },
  { icon: <Handshake size={20} />, title: 'Honor Accepted Bids', desc: 'Once you accept a bid, you are committed. Failure to honor creates a flag on your account.' },
  { icon: <Truck size={20} />, title: 'Timely Shipping', desc: 'Ship or arrange pickup within the agreed timeframe after payment confirmation.' },
  { icon: <Flag size={20} />, title: 'Flag System', desc: 'Flags are added for misconduct. Multiple flags lead to account restrictions. Flags can be removed after 5 successful deals.' },
];

const BIDDER_RULES = [
  { icon: <Clock size={20} />, title: '4-Hour Payment Deadline', desc: 'After winning a bid, you have 4 hours to complete payment. Failure to pay results in a flag.' },
  { icon: <Flag size={20} />, title: '15% Surcharge When Flagged', desc: 'Flagged bidders pay a 15% surcharge on all bids. This is removed after 3 successful transactions.' },
  { icon: <Shield size={20} />, title: 'Bid Responsibly', desc: 'Every bid is binding. Only bid what you can afford to pay.' },
  { icon: <CheckCircle size={20} />, title: 'Confirm Receipt', desc: 'Confirm receipt of products within 5 days. After 5 days, payment auto-releases to the seller.' },
  { icon: <Star size={20} />, title: 'Leave Reviews', desc: 'Help the community by reviewing sellers after transactions. Both parties can review each other.' },
  { icon: <RefreshCw size={20} />, title: '2.5% Refund Fee', desc: 'Refund processing incurs a 2.5% fee to cover payment processing costs.' },
  { icon: <Zap size={20} />, title: 'Auto-Bid Rules', desc: 'Auto-bid increments stay as low as possible (minimum 1 currency unit). System bids just enough to stay on top.' },
];

export default function CodeOfConduct() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('lister');

  const rules = tab === 'lister' ? LISTER_RULES : BIDDER_RULES;

  return (
    <motion.div className="coc-page page page-with-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="coc-header">
        <button className="coc-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="heading-4">Code of Conduct</h1>
        <div style={{ width: 22 }} />
      </header>

      <div className="container">
        {/* Tabs */}
        <div className="coc-tabs">
          <button className={`coc-tab ${tab === 'lister' ? 'active' : ''}`} onClick={() => setTab('lister')}>For Listers</button>
          <button className={`coc-tab ${tab === 'bidder' ? 'active' : ''}`} onClick={() => setTab('bidder')}>For Bidders</button>
        </div>

        <div className="coc-rules stagger-children">
          {rules.map((rule, i) => (
            <div key={i} className="coc-rule">
              <span className="coc-rule__icon" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'var(--primary-light)'}}>{rule.icon}</span>
              <div className="coc-rule__content">
                <h4 className="coc-rule__title">{rule.title}</h4>
                <p className="coc-rule__desc body-sm">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="coc-understand" onClick={() => navigate(-1)}>I Understand</button>
      </div>
    </motion.div>
  );
}
