import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RatingModal.css';

export default function RatingModal({ isOpen, onClose, onSubmit, partyName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="rating-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="rating-modal"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button className="rating-close" onClick={onClose}><X size={20} /></button>
          
          <h2 className="heading-5">Rate your experience</h2>
          <p className="body-sm text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
            How was your transaction with {partyName || 'the other party'}?
          </p>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className="rating-star-btn"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={40} 
                  fill={star <= (hoverRating || rating) ? 'var(--warning)' : 'transparent'} 
                  color={star <= (hoverRating || rating) ? 'var(--warning)' : 'var(--surface-border)'} 
                />
              </button>
            ))}
          </div>

          <textarea 
            className="rating-input" 
            placeholder="Write a short review..." 
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          <button 
            className="btn-primary" 
            style={{ width: '100%', borderRadius: 'var(--radius-full)' }}
            disabled={rating === 0}
            onClick={() => {
              onSubmit({ rating, review });
              onClose();
            }}
          >
            Submit Review
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
