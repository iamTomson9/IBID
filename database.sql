-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    avatar_url TEXT,
    is_verified_seller BOOLEAN DEFAULT false,
    bidder_score INTEGER DEFAULT 0,
    seller_score INTEGER DEFAULT 0,
    badge VARCHAR(50) DEFAULT 'bronze',
    total_deals INTEGER DEFAULT 0,
    products_bought INTEGER DEFAULT 0,
    products_sold INTEGER DEFAULT 0,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_flagged BOOLEAN DEFAULT false
);

-- Listings Table
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    condition_id VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'ZAR',
    current_bid NUMERIC(10, 2) DEFAULT 0,
    total_bids INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    ends_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    delivery_type VARCHAR(50) DEFAULT 'both',
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    images JSONB DEFAULT '[]'::jsonb,
    condition_checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids Table
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (Escrow) Table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id),
    buyer_id UUID REFERENCES public.users(id),
    seller_id UUID REFERENCES public.users(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZAR',
    fee NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'awaiting_confirmation',
    steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    listing_id UUID REFERENCES public.listings(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow all for dev
CREATE POLICY "Enable all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for listings" ON public.listings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for bids" ON public.bids FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
