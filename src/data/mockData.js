// Mock data for iBID platform

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics & Gadgets', emoji: '📱', color: '#4A00E0' },
  { id: 'fashion', name: 'Fashion & Clothing', emoji: '👕', color: '#8E2DE2' },
  { id: 'vehicles', name: 'Vehicles', emoji: '🚗', color: '#FF6B6B' },
  { id: 'home', name: 'Home & Furniture', emoji: '🏠', color: '#00D68F' },
  { id: 'collectibles', name: 'Collectibles & Art', emoji: '🎨', color: '#FFBE0B' },
  { id: 'sports', name: 'Sports & Outdoors', emoji: '⚽', color: '#FF3B3B' },
  { id: 'luxury', name: 'Luxury', emoji: '💎', color: '#E0A0FF' },
  { id: 'other', name: 'Everything Else', emoji: '✏️', color: '#A0A0B8' },
];

export const CURRENCIES = [
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
];


export const CONDITIONS = [
  { id: 'new', label: 'New', color: '#00D68F' },
  { id: 'like_new', label: 'Like New', color: '#4A00E0' },
  { id: 'used', label: 'Used', color: '#FFBE0B' },
  { id: 'for_parts', label: 'For Parts', color: '#FF3B3B' },
];

export const DURATIONS = [
  { days: 3, label: '3 Days' },
  { days: 5, label: '5 Days' },
  { days: 7, label: '7 Days' },
  { days: 10, label: '10 Days' },
  { days: 15, label: '15 Days' },
];

export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Thabo Molefe',
    avatar: null,
    country: 'ZA',
    city: 'Johannesburg',
    isVerifiedSeller: true,
    bidderScore: 245,
    sellerScore: 180,
    badge: 'gold',
    totalDeals: 42,
    productsBought: 28,
    productsSold: 14,
    memberSince: '2024-06-15',
    isFlagged: false,
    reviews: [
      { from: 'u2', rating: 5, text: 'Excellent seller, item exactly as described!', date: '2025-12-10' },
      { from: 'u3', rating: 4, text: 'Good transaction, quick delivery.', date: '2025-11-28' },
      { from: 'u4', rating: 5, text: 'Trustworthy. Would buy again!', date: '2025-11-15' },
    ],
  },
  {
    id: 'u2',
    name: 'Naledi Kgosi',
    avatar: null,
    country: 'BW',
    city: 'Gaborone',
    isVerifiedSeller: true,
    bidderScore: 310,
    sellerScore: 95,
    badge: 'gold',
    totalDeals: 35,
    productsBought: 30,
    productsSold: 5,
    memberSince: '2024-08-22',
    isFlagged: false,
    reviews: [
      { from: 'u1', rating: 5, text: 'Fast payment, great buyer!', date: '2025-12-05' },
    ],
  },
  {
    id: 'u3',
    name: 'Sipho Dlamini',
    avatar: null,
    country: 'ZA',
    city: 'Cape Town',
    isVerifiedSeller: false,
    bidderScore: 85,
    sellerScore: 0,
    badge: 'silver',
    totalDeals: 12,
    productsBought: 12,
    productsSold: 0,
    memberSince: '2025-03-10',
    isFlagged: false,
    reviews: [],
  },
  {
    id: 'u4',
    name: 'Aisha Mohammed',
    avatar: null,
    country: 'KE',
    city: 'Nairobi',
    isVerifiedSeller: true,
    bidderScore: 520,
    sellerScore: 415,
    badge: 'elite',
    totalDeals: 98,
    productsBought: 45,
    productsSold: 53,
    memberSince: '2024-01-05',
    isFlagged: false,
    reviews: [
      { from: 'u1', rating: 5, text: 'Elite seller! Premium items every time.', date: '2025-12-15' },
      { from: 'u2', rating: 5, text: 'The best on iBID. No question.', date: '2025-12-01' },
      { from: 'u3', rating: 5, text: 'Amazing quality products.', date: '2025-11-20' },
    ],
  },
  {
    id: 'u5',
    name: 'Tendai Nyathi',
    avatar: null,
    country: 'ZA',
    city: 'Durban',
    isVerifiedSeller: false,
    bidderScore: 15,
    sellerScore: 0,
    badge: 'bronze',
    totalDeals: 2,
    productsBought: 2,
    productsSold: 0,
    memberSince: '2025-11-01',
    isFlagged: true,
    flagReason: 'Non-payment on bid #1234',
    reviews: [],
  },
];

export const MOCK_LISTINGS = [
  {
    id: 'l1',
    sellerId: 'u1',
    title: 'iPhone 15 Pro Max 256GB — Titanium Blue',
    description: 'Barely used iPhone 15 Pro Max in stunning Titanium Blue. Comes with original box, charger, and Apple case. Battery health at 97%. No scratches, no dents. Used for 3 months only.',
    images: ['/placeholder-phone.jpg'],
    category: 'electronics',
    condition: 'like_new',
    genderTag: null,
    currency: 'ZAR',
    startingBid: 12000,
    currentBid: 15500,
    totalBids: 23,
    watchers: 47,
    delivery: 'both',
    location: { country: 'ZA', city: 'Johannesburg' },
    duration: 7,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Battery Life', rating: '97% health', notes: 'Lasts full day with heavy use' },
      { item: 'Screen', rating: 'Excellent', notes: 'No scratches, original screen protector included' },
      { item: 'Performance', rating: 'Excellent', notes: 'Runs everything smoothly' },
      { item: 'Body/Frame', rating: 'Excellent', notes: 'Titanium frame in perfect condition' },
      { item: 'Camera', rating: 'Excellent', notes: 'All lenses working perfectly' },
      { item: 'Accessories', rating: 'Complete', notes: 'Box, charger, cable, Apple case' },
    ],
    bids: [
      { userId: 'u2', amount: 15500, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { userId: 'u3', amount: 15000, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { userId: 'u4', amount: 14500, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { userId: 'u5', amount: 14000, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
      { userId: 'u2', amount: 13500, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { userId: 'u3', amount: 13000, timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
      { userId: 'u4', amount: 12500, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { userId: 'u2', amount: 12000, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l2',
    sellerId: 'u4',
    title: 'Vintage Rolex Submariner 1968 — Collector\'s Dream',
    description: 'Authentic 1968 Rolex Submariner reference 5513. Fully serviced, original dial, matching serial numbers. Comes with authentication papers from Rolex service center. A true collector\'s piece.',
    images: ['/placeholder-watch.jpg'],
    category: 'luxury',
    condition: 'used',
    genderTag: 'him',
    currency: 'USD',
    startingBid: 15000,
    currentBid: 28500,
    totalBids: 45,
    watchers: 112,
    delivery: 'shipping',
    location: { country: 'KE', city: 'Nairobi' },
    duration: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Movement', rating: 'Excellent', notes: 'Recently serviced, keeping accurate time' },
      { item: 'Dial', rating: 'Original', notes: 'Patina consistent with age, beautiful fading' },
      { item: 'Case', rating: 'Good', notes: 'Light desk diving marks, never polished' },
      { item: 'Bezel', rating: 'Good', notes: 'Original insert with slight fading' },
      { item: 'Bracelet', rating: 'Good', notes: 'Original oyster bracelet, some stretch' },
      { item: 'Authentication', rating: 'Verified', notes: 'Papers from Rolex Geneva service center' },
    ],
    bids: [
      { userId: 'u1', amount: 28500, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { userId: 'u2', amount: 27000, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { userId: 'u1', amount: 25000, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { userId: 'u2', amount: 22000, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { userId: 'u1', amount: 20000, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l3',
    sellerId: 'u2',
    title: 'Nike Air Jordan 1 Retro High OG "Chicago" — Size 10',
    description: 'Brand new, never worn Nike Air Jordan 1 Retro High OG in the iconic Chicago colorway. Size US 10. Comes with original box and extra laces. Deadstock condition.',
    images: ['/placeholder-shoes.jpg'],
    category: 'fashion',
    condition: 'new',
    genderTag: 'him',
    currency: 'BWP',
    startingBid: 2500,
    currentBid: 4200,
    totalBids: 31,
    watchers: 65,
    delivery: 'both',
    location: { country: 'BW', city: 'Gaborone' },
    duration: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Overall', rating: 'Deadstock', notes: 'Never worn, original everything' },
      { item: 'Upper', rating: 'Perfect', notes: 'No creases, no marks' },
      { item: 'Sole', rating: 'Perfect', notes: 'Factory fresh' },
      { item: 'Box', rating: 'Included', notes: 'Original box with all tags' },
      { item: 'Extras', rating: 'Complete', notes: 'Extra red and black laces included' },
    ],
    bids: [
      { userId: 'u3', amount: 4200, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { userId: 'u5', amount: 4000, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { userId: 'u3', amount: 3800, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { userId: 'u1', amount: 3500, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l4',
    sellerId: 'u1',
    title: '2019 BMW 320i M Sport — Low Mileage',
    description: 'Stunning 2019 BMW 320i M Sport in Mineral Grey Metallic. Only 35,000 km. Full service history with BMW. Leather interior, sunroof, adaptive LED headlights. One owner.',
    images: ['/placeholder-car.jpg'],
    category: 'vehicles',
    condition: 'used',
    genderTag: null,
    currency: 'ZAR',
    startingBid: 350000,
    currentBid: 425000,
    totalBids: 12,
    watchers: 89,
    delivery: 'pickup',
    location: { country: 'ZA', city: 'Johannesburg' },
    duration: 15,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Engine', rating: 'Excellent', notes: 'Full BMW service history, last service 2 months ago' },
      { item: 'Mileage', rating: '35,000 km', notes: 'Highway driven, one owner' },
      { item: 'Interior', rating: 'Excellent', notes: 'Black leather, no wear, heated seats' },
      { item: 'Exterior', rating: 'Very Good', notes: 'Minor stone chips on bumper, no dents' },
      { item: 'Tires', rating: 'Good', notes: 'Run-flat tires, 60% tread remaining' },
      { item: 'Electronics', rating: 'Excellent', notes: 'iDrive, Apple CarPlay, all features working' },
    ],
    bids: [
      { userId: 'u4', amount: 425000, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { userId: 'u2', amount: 410000, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { userId: 'u4', amount: 395000, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l5',
    sellerId: 'u4',
    title: 'MacBook Pro 16" M3 Max — 36GB RAM, 1TB',
    description: 'Top-spec MacBook Pro 16-inch with M3 Max chip, 36GB RAM, 1TB SSD. Space Black. Battery cycle count: 42. Includes original box and charger. AppleCare+ until March 2027.',
    images: ['/placeholder-laptop.jpg'],
    category: 'electronics',
    condition: 'like_new',
    genderTag: null,
    currency: 'KES',
    startingBid: 280000,
    currentBid: 345000,
    totalBids: 18,
    watchers: 56,
    delivery: 'shipping',
    location: { country: 'KE', city: 'Nairobi' },
    duration: 10,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Screen', rating: 'Perfect', notes: 'No dead pixels, Liquid Retina XDR' },
      { item: 'Battery', rating: '42 cycles', notes: 'Basically new battery' },
      { item: 'Keyboard', rating: 'Excellent', notes: 'All keys working perfectly' },
      { item: 'Ports', rating: 'All Working', notes: '3x Thunderbolt 4, HDMI, SD card, MagSafe' },
      { item: 'Body', rating: 'Mint', notes: 'No dents, scratches, or marks' },
      { item: 'AppleCare+', rating: 'Active', notes: 'Valid until March 2027' },
    ],
    bids: [
      { userId: 'u1', amount: 345000, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { userId: 'u3', amount: 330000, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
      { userId: 'u1', amount: 315000, timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l6',
    sellerId: 'u2',
    title: 'Handmade Persian Silk Rug — 6x9ft',
    description: 'Exquisite handmade Persian silk rug from Isfahan. Hand-knotted with over 500 knots per square inch. Rich burgundy and gold pattern. Certified authentic. Perfect for a living room centerpiece.',
    images: ['/placeholder-rug.jpg'],
    category: 'home',
    condition: 'used',
    genderTag: null,
    currency: 'BWP',
    startingBid: 8000,
    currentBid: 12500,
    totalBids: 9,
    watchers: 22,
    delivery: 'both',
    location: { country: 'BW', city: 'Gaborone' },
    duration: 10,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Weave', rating: 'Excellent', notes: '500+ knots per sq inch, no loose threads' },
      { item: 'Colors', rating: 'Vibrant', notes: 'Natural dyes, no fading' },
      { item: 'Edges', rating: 'Good', notes: 'Minor wear on corners, professionally repaired' },
      { item: 'Backing', rating: 'Excellent', notes: 'Clean, no stains or odors' },
      { item: 'Certification', rating: 'Included', notes: 'Certificate of authenticity from Isfahan' },
    ],
    bids: [
      { userId: 'u1', amount: 12500, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { userId: 'u4', amount: 11000, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l7',
    sellerId: 'u1',
    title: 'Sony PlayStation 5 + 8 Games Bundle',
    description: 'PS5 Disc Edition with 2 DualSense controllers and 8 top games including Spider-Man 2, God of War Ragnarök, Horizon Forbidden West, and more. Console in excellent condition.',
    images: ['/placeholder-ps5.jpg'],
    category: 'electronics',
    condition: 'like_new',
    genderTag: null,
    currency: 'ZAR',
    startingBid: 6000,
    currentBid: 8800,
    totalBids: 27,
    watchers: 73,
    delivery: 'both',
    location: { country: 'ZA', city: 'Johannesburg' },
    duration: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Console', rating: 'Excellent', notes: 'No disc drive issues, runs quietly' },
      { item: 'Controllers', rating: 'Good', notes: '2x DualSense, no stick drift' },
      { item: 'Games', rating: '8 titles', notes: 'All disc-based, no scratches' },
      { item: 'Cables', rating: 'Complete', notes: 'HDMI 2.1, power cable, USB-C charging' },
    ],
    bids: [
      { userId: 'u2', amount: 8800, timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { userId: 'u3', amount: 8500, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { userId: 'u5', amount: 8000, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { userId: 'u2', amount: 7500, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'l8',
    sellerId: 'u4',
    title: 'Designer Ankara Dress — Custom Made, Size M',
    description: 'Stunning custom-made Ankara dress by Nairobi designer. Premium African wax print fabric. Fitted bodice with flared skirt. Perfect for occasions and events. One of a kind!',
    images: ['/placeholder-dress.jpg'],
    category: 'fashion',
    condition: 'new',
    genderTag: 'her',
    currency: 'KES',
    startingBid: 4500,
    currentBid: 7200,
    totalBids: 15,
    watchers: 34,
    delivery: 'shipping',
    location: { country: 'KE', city: 'Nairobi' },
    duration: 7,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    conditionChecklist: [
      { item: 'Fabric', rating: 'Premium', notes: 'Genuine African wax print, Vlisco brand' },
      { item: 'Stitching', rating: 'Professional', notes: 'Reinforced seams, clean finish' },
      { item: 'Fit', rating: 'Size M (UK 12)', notes: 'Custom tailored, measurements available' },
      { item: 'Color', rating: 'Vibrant', notes: 'Bold orange and blue pattern' },
    ],
    bids: [
      { userId: 'u2', amount: 7200, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { userId: 'u3', amount: 6800, timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
    ],
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'outbid', title: "You've been outbid!", message: 'Someone bid R15,500 on iPhone 15 Pro Max', listingId: 'l1', read: false, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'n2', type: 'new_bid', title: 'New bid on your listing', message: 'Naledi bid P4,200 on Nike Air Jordan 1', listingId: 'l3', read: false, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'n3', type: 'ending_soon', title: 'Auction ending soon!', message: 'PS5 Bundle ends in 1 hour', listingId: 'l7', read: true, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: 'n4', type: 'won', title: '🏆 You won!', message: 'Congratulations! You won the bid for Samsung TV. Proceed to payment.', listingId: 'l1', read: true, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n5', type: 'payment_released', title: 'Payment released!', message: 'R8,500 has been released to your account', listingId: null, read: true, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

// Helper functions
export function getUserById(id) {
  return MOCK_USERS.find(u => u.id === id);
}

export function getListingById(id) {
  return MOCK_LISTINGS.find(l => l.id === id);
}

export function getCurrencySymbol(code) {
  const c = CURRENCIES.find(cur => cur.code === code);
  return c ? c.symbol : code;
}

export function formatCurrency(amount, currencyCode) {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
}

export function getTimeRemaining(endsAt) {
  const diff = new Date(endsAt) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

export function formatTimeRemaining(endsAt) {
  const { days, hours, minutes, expired } = getTimeRemaining(endsAt);
  if (expired) return 'Ended';
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getBadgeInfo(badge) {
  const badges = {
    bronze: { label: 'New', emoji: '🥉', color: '#CD7F32' },
    silver: { label: 'Trusted', emoji: '🥈', color: '#C0C0C0' },
    gold: { label: 'Top', emoji: '🥇', color: '#FFD700' },
    elite: { label: 'Elite', emoji: '💎', color: '#E0A0FF' },
  };
  return badges[badge] || badges.bronze;
}

export const MOCK_TRANSACTIONS = [
  {
    id: 't1', type: 'purchase', listingId: 'l1', listingTitle: 'Samsung Galaxy S24 Ultra',
    amount: 14500, currency: 'ZAR', fee: 1015,
    status: 'awaiting_confirmation', seller: 'Thabo M.',
    steps: [
      { label: 'Bid Won', done: true, date: 'May 18' },
      { label: 'Payment Sent', done: true, date: 'May 18' },
      { label: 'Payment Confirmed', done: true, date: 'May 19' },
      { label: 'Item Shipped', done: true, date: 'May 20' },
      { label: 'Confirm Receipt', done: false, date: null },
    ],
  },
  {
    id: 't2', type: 'sale', listingId: 'l2', listingTitle: 'Nike Air Max 90',
    amount: 2800, currency: 'BWP', fee: 196,
    status: 'completed', buyer: 'Sipho D.',
    steps: [
      { label: 'Bid Accepted', done: true, date: 'May 10' },
      { label: 'Payment Received', done: true, date: 'May 10' },
      { label: 'Item Shipped', done: true, date: 'May 11' },
      { label: 'Buyer Confirmed', done: true, date: 'May 13' },
      { label: 'Payment Released', done: true, date: 'May 13' },
    ],
  },
];
