import { createContext, useContext, useReducer, useEffect } from 'react';
import { MOCK_LISTINGS, MOCK_NOTIFICATIONS, MOCK_USERS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { fetchUserProfile, onAuthChange, injectFirebaseTokenToSupabase } from '../lib/auth';

const AppContext = createContext(null);

const initialState = {
  // Auth
  currentUser: null,
  isAuthenticated: false,
  isVerified: false,
  authLoading: true,

  // App data
  listings: MOCK_LISTINGS,
  notifications: MOCK_NOTIFICATIONS,
  users: MOCK_USERS,
  transactions: [],

  // UI
  sidebarOpen: false,
  activeTab: 'home',
  bidSheetOpen: false,
  bidSheetListing: null,

  // Auth prompt modal (shown to guests when they try to bid/sell)
  authPromptOpen: false,
  authPromptReason: 'bid', // 'bid' | 'sell' | 'general'
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload };

    case 'ADD_LISTING':
      return { ...state, listings: [action.payload, ...state.listings] };

    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'SET_BIDS': {
      // payload = { listingId, bids: [] }
      const updatedListings = state.listings.map(l => {
        if (l.id === action.payload.listingId) {
          return { ...l, bids: action.payload.bids };
        }
        return l;
      });
      return { ...state, listings: updatedListings };
    }

    case 'AUTH_LOADING':
      return { ...state, authLoading: action.payload };

    case 'SET_AUTH_STEP':
      return { ...state, authStep: action.payload };
    
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
        isVerified: action.payload.isVerifiedSeller,
        accountVerified: action.payload.accountVerified || false,
        authLoading: false,
      };

    case 'REGISTER': {
      const newUser = {
        id: 'u_new',
        name: action.payload.name,
        phone: action.payload.phone,
        email: action.payload.email,
        avatar: null,
        country: action.payload.country || 'ZA',
        city: '',
        isVerifiedSeller: false,
        bidderScore: 0,
        sellerScore: 0,
        badge: 'bronze',
        totalDeals: 0,
        productsBought: 0,
        productsSold: 0,
        memberSince: new Date().toISOString().split('T')[0],
        isFlagged: false,
        reviews: [],
      };
      return {
        ...state,
        currentUser: newUser,
        isAuthenticated: true,
        isVerified: false,
        users: [...state.users, newUser],
      };
    }

    case 'VERIFY_SELLER':
      return {
        ...state,
        isVerified: true,
        currentUser: { ...state.currentUser, isVerifiedSeller: true },
      };

    case 'LOGOUT':
      return { ...initialState, listings: state.listings, users: state.users, authLoading: false };

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'OPEN_BID_SHEET':
      return { ...state, bidSheetOpen: true, bidSheetListing: action.payload };

    case 'CLOSE_BID_SHEET':
      return { ...state, bidSheetOpen: false, bidSheetListing: null };

    case 'OPEN_AUTH_PROMPT':
      return { ...state, authPromptOpen: true, authPromptReason: action.payload || 'general' };

    case 'CLOSE_AUTH_PROMPT':
      return { ...state, authPromptOpen: false };

    // Fired immediately after OTP/email confirmation succeeds
    case 'MARK_VERIFIED':
      return {
        ...state,
        accountVerified: true,
        currentUser: state.currentUser
          ? { ...state.currentUser, accountVerified: true, phoneVerified: true }
          : state.currentUser,
      };

    case 'PLACE_BID': {
      const { listingId, userId, amount } = action.payload;
      const updatedListings = state.listings.map(l => {
        if (l.id === listingId) {
          return {
            ...l,
            currentBid: amount,
            totalBids: l.totalBids + 1,
            bids: [
              { userId, amount, timestamp: new Date().toISOString() },
              ...l.bids,
            ],
          };
        }
        return l;
      });
      return { ...state, listings: updatedListings, bidSheetOpen: false, bidSheetListing: null };
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'PAY_FOR_BID': {
      const newTransaction = {
        id: `t_${Date.now()}`,
        type: 'purchase',
        listingId: action.payload.listing.id,
        listingTitle: action.payload.listing.title,
        amount: action.payload.listing.currentBid,
        currency: action.payload.listing.currency,
        fee: action.payload.listing.currentBid * 0.07,
        status: 'awaiting_confirmation',
        seller: 'Seller Name', // In a real app, get from listing.sellerId
        steps: [
          { label: 'Bid Won', done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          { label: 'Payment Sent', done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          { label: 'Payment Confirmed', done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          { label: 'Item Shipped', done: false, date: null },
          { label: 'Confirm Receipt', done: false, date: null },
        ],
      };
      
      return {
        ...state,
        transactions: [newTransaction, ...state.transactions]
      };
    }

    case 'CONFIRM_RECEIPT': {
      const txId = action.payload;
      return {
        ...state,
        transactions: state.transactions.map(tx => {
          if (tx.id === txId) {
            const updatedSteps = tx.steps.map(step => {
              if (step.label === 'Confirm Receipt' || step.label === 'Item Shipped') {
                return { ...step, done: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
              }
              return step;
            });
            return { ...tx, status: 'completed', steps: updatedSteps };
          }
          return tx;
        })
      };
    }

    case 'UPDATE_AVATAR':
      return {
        ...state,
        currentUser: { ...state.currentUser, avatar: action.payload },
      };

    case 'ACCEPT_BID': {
      const listingId = action.payload;
      return {
        ...state,
        listings: state.listings.map(l => 
          l.id === listingId ? { ...l, status: 'ended' } : l
        )
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        if (usersError) throw usersError;
        if (usersData && usersData.length > 0) {
          // Map snake_case to camelCase
          const mappedUsers = usersData.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            country: u.country,
            city: u.city,
            avatar: u.avatar_url,
            isVerifiedSeller: u.is_verified_seller,
            bidderScore: u.bidder_score,
            sellerScore: u.seller_score,
            badge: u.badge,
            totalDeals: u.total_deals,
            productsBought: u.products_bought,
            productsSold: u.products_sold,
            memberSince: u.member_since,
            isFlagged: u.is_flagged,
            reviews: [] // mock for now
          }));
          dispatch({ type: 'SET_USERS', payload: mappedUsers });
        }

        // Fetch listings
        const { data: listingsData, error: listingsError } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
        if (listingsError) throw listingsError;
        
        if (listingsData && listingsData.length > 0) {
          // Fetch bids for these listings
          const { data: bidsData } = await supabase.from('bids').select('*').order('timestamp', { ascending: false });
          
          const mappedListings = listingsData.map(l => {
            const listingBids = bidsData ? bidsData.filter(b => b.listing_id === l.id).map(b => ({
              id: b.id,
              userId: b.user_id,
              amount: b.amount,
              timestamp: b.timestamp
            })) : [];

            return {
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
              bids: listingBids
            };
          });
          dispatch({ type: 'SET_LISTINGS', payload: mappedListings });
        }

      } catch (err) {
        console.error('Error fetching from Supabase, falling back to mock/Firestore', err);
        // Fallback logic would go here
      }
    }

    fetchInitialData();

    // ── Firebase Auth State Listener (primary security layer) ──
    // Fires on: app start (session restore), sign-in, sign-out, token refresh
    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Step 1: Inject Firebase JWT into Supabase so RLS policies
          // can use auth.uid() = firebaseUser.uid for row-level security
          await injectFirebaseTokenToSupabase(firebaseUser);

          // Step 2: Fetch user's profile from Supabase data layer
          const profile = await fetchUserProfile(firebaseUser.uid);
          dispatch({ type: 'LOGIN', payload: profile });

          // Step 3: Set up periodic token refresh (Firebase tokens expire in 1h)
          // Re-inject every 55 minutes to keep Supabase session valid
          const tokenRefreshInterval = setInterval(async () => {
            const currentUser = firebaseUser;
            if (currentUser) await injectFirebaseTokenToSupabase(currentUser);
          }, 55 * 60 * 1000);

          // Store for cleanup
          window._ibidTokenRefresh = tokenRefreshInterval;
        } catch (err) {
          console.error('Auth profile fetch error:', err);
          // Fallback: minimal profile from Firebase metadata
          dispatch({ type: 'LOGIN', payload: {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'iBID User',
            email: firebaseUser.email,
            phone: '', country: '', city: '',
            avatar: firebaseUser.photoURL || null,
            isVerifiedSeller: false,
            accountVerified: firebaseUser.emailVerified || false,
            phoneVerified: false,
            bidderScore: 0, sellerScore: 0, badge: 'bronze',
            totalDeals: 0, productsBought: 0, productsSold: 0,
            isFlagged: false, reviews: [],
          }});
        }
      } else {
        // Firebase signed out — clear state and Supabase session
        clearInterval(window._ibidTokenRefresh);
        dispatch({ type: 'LOGOUT' });
        dispatch({ type: 'AUTH_LOADING', payload: false });
      }
    });

    // Set up Realtime subscriptions for live bid updates
    const channel = supabase.channel('public:bids')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, () => {
        fetchInitialData();
      })
      .subscribe();

    return () => {
      unsubscribeAuth();
      clearInterval(window._ibidTokenRefresh);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
