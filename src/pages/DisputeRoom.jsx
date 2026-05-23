import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Send, ShieldAlert, Paperclip, Camera, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import './DisputeRoom.css';

export default function DisputeRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: appState, dispatch } = useApp();
  
  const tx = appState.transactions?.find(t => t.id === id) || { listingTitle: 'Samsung Galaxy S24 Ultra', amount: 14500, currency: 'BWP' };
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'admin', text: `Welcome to the Dispute Resolution Center for "${tx.listingTitle}". An iBID Admin will mediate this discussion.`, time: '10:00 AM' },
    { id: 2, sender: 'buyer', text: `The screen has a deep scratch that wasn't mentioned in the condition checklist!`, time: '10:05 AM' },
    { id: 3, sender: 'admin', text: `Buyer, please upload photos of the damage. Seller, please prepare your original photos for comparison.`, time: '10:06 AM' }
  ]);
  
  const [input, setInput] = useState('');
  const [resolved, setResolved] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'buyer', text: input, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInput('');
    
    // Mock admin response
    if (messages.length === 3) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'admin', text: `Thank you for the evidence. After reviewing, we confirm a discrepancy. We are applying the 15% discrepancy fee (10% refund to Buyer, 5% fee to iBID).`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        setResolved(true);
      }, 1500);
    }
  };

  const handleResolve = () => {
    navigate('/escrow', { state: { resolved: true, txId: id } });
  };

  return (
    <motion.div className="page dispute-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="dispute-header">
        <button className="dispute-back" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <div className="dispute-title-box">
          <h1 className="heading-5">Dispute Room</h1>
          <span className="caption text-secondary">{tx.listingTitle}</span>
        </div>
        <div style={{ width: 22 }} />
      </header>

      <div className="dispute-warning">
        <ShieldAlert size={16} color="var(--danger)" />
        <span>iBID Admins review all chats. Be respectful and honest.</span>
      </div>

      <div className="dispute-chat-area container">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
            {msg.sender === 'admin' && <div className="chat-avatar admin-avatar"><Scale size={14} /></div>}
            <div className={`chat-bubble ${msg.sender}`}>
              {msg.sender === 'admin' && <div className="chat-sender-name">iBID Admin</div>}
              {msg.sender === 'seller' && <div className="chat-sender-name">Seller</div>}
              <p>{msg.text}</p>
              <span className="chat-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {resolved ? (
        <div className="dispute-resolution-bar container">
          <p className="body-sm fw-600" style={{ color: 'var(--success)', marginBottom: '8px' }}>Dispute Resolved</p>
          <button className="btn-primary" style={{ width: '100%', background: 'var(--success)', borderRadius: 'var(--radius-full)' }} onClick={handleResolve}>
            Accept Resolution & Complete
          </button>
        </div>
      ) : (
        <div className="dispute-input-area container">
          <button className="dispute-attach-btn"><Camera size={20} /></button>
          <button className="dispute-attach-btn"><Paperclip size={20} /></button>
          <input 
            type="text" 
            className="dispute-input" 
            placeholder="Type your message..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button className="dispute-send-btn" onClick={handleSend}><Send size={18} /></button>
        </div>
      )}
    </motion.div>
  );
}
