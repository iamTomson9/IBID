import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { firebaseStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { validateListingTitle, validatePrice, sanitizeText, rateLimitCheck } from '../lib/validate';
import { ArrowLeft, Camera, Plus, X, ChevronDown, Check, Shield, Rocket, MapPin, Package, CheckCircle, Smartphone, Shirt, Car, Home, Palette, Activity, Gem, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, CURRENCIES, CONDITIONS, DURATIONS } from '../data/mockData';
import './CreateListing.css';

function getCatIcon(catId, size = 20) {
  switch (catId) {
    case 'electronics': return <Smartphone size={size} />;
    case 'fashion': return <Shirt size={size} />;
    case 'vehicles': return <Car size={size} />;
    case 'home': return <Home size={size} />;
    case 'collectibles': return <Palette size={size} />;
    case 'sports': return <Activity size={size} />;
    case 'luxury': return <Gem size={size} />;
    default: return <Package size={size} />;
  }
}

export default function CreateListing() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('unisex');
  const [condition, setCondition] = useState('');
  const [checklist, setChecklist] = useState([
    { item: '', rating: 'Excellent', notes: '' },
    { item: '', rating: 'Excellent', notes: '' },
    { item: '', rating: 'Excellent', notes: '' }
  ]);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('BWP');
  const [duration, setDuration] = useState(7);
  const [delivery, setDelivery] = useState('both');
  const [agreed, setAgreed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  // Users can now list even if unverified. They will just see a prompt.

  // Real photo picker — opens device camera/gallery
  const handleAddPhoto = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Filter to images only and within max limit
    const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    const remaining = 8 - photos.length;
    const toUpload = validFiles.slice(0, remaining);
    if (!toUpload.length) return;
    
    // Immediately show previews so the UI updates instantly
    const newPhotos = toUpload.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      url: null // will be updated once uploaded
    }));
    
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = ''; // Reset input

    // Upload in background
    setUploadingPhotos(true);
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const photoObj = newPhotos[i];
      try {
        const uid = state.currentUser?.id || 'anon';
        const path = `listings/${uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(firebaseStorage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        // Update the photo object with the real URL
        setPhotos(prev => prev.map(p => p.id === photoObj.id ? { ...p, url } : p));
      } catch (err) {
        console.error('Photo upload error for', file.name, err);
      }
    }
    setUploadingPhotos(false);
  };

  const removePhoto = (id) => setPhotos(photos.filter(p => p.id !== id));
  const addChecklistRow = () => setChecklist([...checklist, { item: '', rating: '', notes: '' }]);
  const removeChecklistRow = (i) => setChecklist(checklist.filter((_, idx) => idx !== i));
  const updateChecklist = (i, field, val) => { const c = [...checklist]; c[i][field] = val; setChecklist(c); };

  const canNext = () => {
    if (step === 1) return title && category && photos.length >= 4 && photos.length <= 8;
    if (step === 2) return checklist.filter(c => (c.item || '').trim()).length >= 3;
    if (step === 3) return price && parseFloat(price) >= 0.10 && currency && duration;
    return agreed;
  };

  const handlePublish = async () => {
    if (!state.currentUser) return;

    // Rate limiting
    if (!rateLimitCheck('publish_listing', 5000)) {
      setPublishError('Please wait before publishing again.');
      return;
    }

    // Validate inputs (OWASP)
    const titleV = validateListingTitle(title);
    if (!titleV.ok) { setPublishError(titleV.error); return; }
    const priceV = validatePrice(price);
    if (!priceV.ok) { setPublishError(priceV.error); return; }

    setPublishing(true);
    setPublishError('');
    try {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + duration);

      const { data, error } = await supabase.from('listings').insert([{
        seller_id: state.currentUser.id,
        title: sanitizeText(title),
        description: sanitizeText(description),
        category,
        condition_id: condition,
        gender_tag: gender,
        currency,
        starting_bid: parseFloat(price),
        current_bid: parseFloat(price),
        total_bids: 0,
        watchers: 0,
        delivery_type: delivery,
        location_city: sanitizeText(state.currentUser.city || ''),
        location_country: state.currentUser.country || '',
        ends_at: endsAt.toISOString(),
        status: 'active',
        images: photos.map(p => p.url).filter(Boolean), // real Firebase Storage URLs
        condition_checklist: checklist.filter(c => c.item),
      }]).select().single();

      if (error) throw error;

      // Add to local state immediately
      dispatch({
        type: 'ADD_LISTING',
        payload: {
          id: data.id,
          sellerId: data.seller_id,
          title: data.title,
          description: data.description,
          category: data.category,
          condition: data.condition_id,
          currency: data.currency,
          currentBid: data.current_bid,
          totalBids: 0,
          watchers: 0,
          delivery: data.delivery_type,
          location: { city: data.location_city, country: data.location_country },
          endsAt: data.ends_at,
          status: 'active',
          images: [],
          conditionChecklist: data.condition_checklist || [],
          bids: [],
        },
      });

      navigate(`/listing/${data.id}`);
    } catch (err) {
      setPublishError(err.message || 'Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const currSym = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const getSuggestions = (cat) => {
    const map = {
      electronics: ['Battery Life', 'Screen', 'Performance', 'Body/Frame', 'Camera', 'Accessories'],
      fashion: ['Fabric Quality', 'Stitching', 'Fit/Size', 'Color', 'Tags/Labels', 'Extras'],
      vehicles: ['Engine', 'Mileage', 'Interior', 'Exterior', 'Tires', 'Electronics'],
      home: ['Build Quality', 'Dimensions', 'Material', 'Color', 'Assembly', 'Packaging'],
      collectibles: ['Authenticity', 'Condition', 'Rarity', 'Documentation', 'Packaging'],
      sports: ['Build Quality', 'Size/Fit', 'Material', 'Wear Level', 'Extras'],
      luxury: ['Authenticity', 'Condition', 'Serial Number', 'Original Packaging', 'Documentation'],
      other: ['Overall Condition', 'Functionality', 'Completeness'],
    };
    return map[cat] || [];
  };

  return (
    <motion.div className="cl-page page page-with-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="cl-header">
        <button className="cl-back" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="heading-4">List a Product</h1>
        <span className="cl-step-indicator caption">Step {step}/4</span>
      </header>

      {/* Progress bar */}
      <div className="cl-progress"><div className="cl-progress__fill" style={{ width: `${(step / 4) * 100}%` }} /></div>

      <div className="container cl-content">
        <AnimatePresence mode="wait">
          {/* Step 1: Photos & Details */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <h3 className="heading-4 cl-section-title">Photos & Details</h3>

              {!state.isVerified && (
                <div style={{ background: '#1a1a2e', border: '1px solid var(--primary)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Shield size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600 }}>Verify your account</h4>
                      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Verified listers get more bids than unverified listers.</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/verify-seller')} style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 600, alignSelf: 'flex-start', border: 'none' }}>Verify Now</button>
                </div>
              )}

              {/* Hidden file input — triggers device camera/gallery */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div className="cl-photos">
                {photos.map(p => (
                  <div key={p.id} className="cl-photo" style={{ background: '#1a1a2e', overflow: 'hidden' }}>
                    <img src={p.preview || p.url} alt="listing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button className="cl-photo__remove" onClick={() => removePhoto(p.id)}><X size={14} /></button>
                  </div>
                ))}
                {photos.length < 8 && (
                  <button className="cl-photo-add" onClick={handleAddPhoto} disabled={uploadingPhotos}>
                    {uploadingPhotos
                      ? <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      : <><Camera size={20} /><span>Add</span></>
                    }
                  </button>
                )}
              </div>
              <p className="caption" style={{ marginBottom: 'var(--space-lg)' }}>{photos.length}/8 photos (min 4 required) · tap to add</p>

              <div className="form-group"><label className="form-label">Title</label><input type="text" className="form-input" placeholder="What are you listing?" value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input cl-textarea" placeholder="Describe your product..." value={description} onChange={e => setDescription(e.target.value)} /></div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="cl-pills">{CATEGORIES.map(c => (
                  <button key={c.id} className={`cl-pill ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                    <span style={{display:'flex',alignItems:'center',gap:'4px'}}>{getCatIcon(c.id, 14)} {c.name.split(' ')[0]}</span>
                  </button>
                ))}</div>
              </div>

              <div className="form-group" style={{ marginBottom: '60px' }}>
                <label className="form-label">Condition</label>
                <div className="cl-condition-row">
                  {CONDITIONS.map(c => (
                    <button
                      key={c.id}
                      className={`cl-condition-btn ${condition === c.id ? 'active' : ''}`}
                      style={{
                        borderColor: condition === c.id ? c.color : undefined,
                        background: condition === c.id ? `${c.color}18` : undefined,
                        color: condition === c.id ? c.color : undefined,
                      }}
                      onClick={() => setCondition(condition === c.id ? '' : c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Condition Checklist */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <h3 className="heading-4 cl-section-title">Condition Checklist</h3>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                Define at least 3 condition items buyers will verify on receipt. Be honest — discrepancies incur penalties.
              </p>

              {/* Category-based suggestions */}
              {getSuggestions(category).length > 0 && checklist.filter(c => c.item).length === 0 && (
                <div className="cl-suggest">
                  <p className="caption" style={{ marginBottom: 'var(--space-sm)', display:'flex', alignItems:'center', gap:'4px' }}><Lightbulb size={14} color="var(--warning)" /> Tap to add suggested items:</p>
                  <div className="cl-suggest-pills">
                    {getSuggestions(category).map(s => (
                      <button
                        key={s}
                        className="cl-suggest-pill"
                        onClick={() => {
                          const emptyIdx = checklist.findIndex(c => !c.item);
                          if (emptyIdx >= 0) {
                            updateChecklist(emptyIdx, 'item', s);
                          } else {
                            setChecklist([...checklist, { item: s, rating: 'Excellent', notes: '' }]);
                          }
                        }}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="cl-checklist-cards">
                {checklist.map((row, i) => (
                  <div key={i} className="cl-check-card">
                    <div className="cl-check-card__header">
                      <span className="cl-check-card__num">{i + 1}</span>
                      <span className="cl-check-card__label">Condition Item</span>
                      {checklist.length > 1 && (
                        <button className="cl-check-remove" onClick={() => removeChecklistRow(i)}>
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      className="form-input"
                      placeholder="e.g. Battery Life, Screen Quality, Engine..."
                      value={row.item}
                      onChange={e => updateChecklist(i, 'item', e.target.value)}
                    />

                    <div className="cl-check-card__row">
                      <div className="cl-check-card__field">
                        <label className="caption">Rating</label>
                        <div className="cl-rating-pills">
                          {['Excellent', 'Good', 'Fair', 'Poor'].map(r => (
                            <button
                              key={r}
                              className={`cl-rating-pill ${row.rating === r ? 'active' : ''}`}
                              onClick={() => updateChecklist(i, 'rating', r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="cl-check-card__field">
                      <label className="caption">Notes (optional)</label>
                      <input
                        className="form-input cl-check-notes"
                        placeholder="Additional details about this item..."
                        value={row.notes}
                        onChange={e => updateChecklist(i, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button className="cl-add-card-btn" onClick={addChecklistRow}>
                <Plus size={20} /> Add Condition Item
              </button>
            </motion.div>
          )}

          {/* Step 3: Pricing & Delivery */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <h3 className="heading-4 cl-section-title">Pricing & Delivery</h3>

              <div className="form-group">
                <label className="form-label">Starting Bid Price</label>
                <div className="cl-price-input">
                  <span className="cl-price-sym">{currSym}</span>
                  <input type="number" step="0.01" min="0.10" className="form-input cl-price-field mono" placeholder="0.10" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <div className="cl-pills">{CURRENCIES.slice(0, 5).map(c => (
                  <button key={c.code} className={`cl-pill ${currency === c.code ? 'active' : ''}`} onClick={() => setCurrency(c.code)}>{c.symbol} {c.code}</button>
                ))}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <div className="cl-pills">{DURATIONS.map(d => (
                  <button key={d.days} className={`cl-pill ${duration === d.days ? 'active' : ''}`} onClick={() => setDuration(d.days)}>{d.label}</button>
                ))}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery</label>
                <div className="cl-delivery-options">
                  {[{ val: 'pickup', label: 'Pickup Only', icon: <MapPin size={14}/> }, { val: 'shipping', label: 'Shipping Only', icon: <Package size={14}/> }, { val: 'both', label: 'Both', icon: <CheckCircle size={14}/> }].map(d => (
                    <button key={d.val} className={`cl-delivery-card ${delivery === d.val ? 'active' : ''}`} onClick={() => setDelivery(d.val)}>
                      {d.icon} {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Publish */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
              <h3 className="heading-4 cl-section-title">Review & Publish</h3>

              <div className="cl-preview">
                <div className="cl-preview__img" style={{ background: `linear-gradient(135deg, ${CATEGORIES.find(c=>c.id===category)?.color || '#4A00E0'}44, transparent)` }}>
                  <span style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>{getCatIcon(category, 48)}</span>
                </div>
                <h4 className="heading-4" style={{ margin: 'var(--space-md) 0 var(--space-xs)' }}>{title || 'Your Listing'}</h4>
                <p className="mono" style={{ color: 'var(--success)', fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Starting at {currSym}{parseFloat(price || 0).toLocaleString()}</p>
                <p className="caption" style={{ marginTop: 'var(--space-xs)' }}>{duration} days · {delivery === 'both' ? 'Pickup & Shipping' : delivery} · {CONDITIONS.find(c=>c.id===condition)?.label}</p>
              </div>

              <div className="cl-conduct">
                <h4 className="body" style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Lister's Code of Conduct</h4>
                <ul className="cl-conduct-list">
                  <li>Your listing must accurately describe the product</li>
                  <li>15% discrepancy fee if product doesn't match (10% → bidder, 5% → platform)</li>
                  <li>7% platform service fee on successful sales</li>
                  <li>You are committed once you accept a bid</li>
                </ul>
              </div>

              <label className="cl-agree">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>I agree to the Lister's Code of Conduct</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {publishError && (
          <div style={{ margin: '0 0 12px', padding: '12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '10px', color: '#FF6B6B', fontSize: '13px' }}>
            {publishError}
          </div>
        )}
        <div className="cl-nav">
          {step > 1 && <button className="cl-nav-back" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 4 ? (
            <button className={`cl-nav-next ${canNext() ? '' : 'disabled'}`} disabled={!canNext()} onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className={`cl-nav-publish ${agreed && !publishing ? '' : 'disabled'}`} disabled={!agreed || publishing} onClick={handlePublish}>
              <Rocket size={16} /> {publishing ? 'Publishing...' : 'Publish Listing'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
