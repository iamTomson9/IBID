import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase config
const supabaseUrl = 'https://nzcqfzkehqfmrkmeyaom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Y3FmemtlaHFmbXJrbWV5YW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDc1NDYsImV4cCI6MjA5NTA4MzU0Nn0.FhtBYe4vxIbXgxEaOABZJKZ0OG1aFQp_syD0io13ZZ4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Image paths
const images = {
  'l1': 'C:\\Users\\tlhab\\.gemini\\antigravity\\brain\\c89ebbc9-2ce5-4cdd-b563-3dc8aec12c04\\samsung_s24_ultra_1779545815464.png',
  'l2': 'C:\\Users\\tlhab\\.gemini\\antigravity\\brain\\c89ebbc9-2ce5-4cdd-b563-3dc8aec12c04\\nike_air_max_1779545833622.png',
  'l3': 'C:\\Users\\tlhab\\.gemini\\antigravity\\brain\\c89ebbc9-2ce5-4cdd-b563-3dc8aec12c04\\bmw_320i_1779545853024.png',
  'l4': 'C:\\Users\\tlhab\\.gemini\\antigravity\\brain\\c89ebbc9-2ce5-4cdd-b563-3dc8aec12c04\\macbook_pro_m3_1779545869435.png',
  'l5': 'C:\\Users\\tlhab\\.gemini\\antigravity\\brain\\c89ebbc9-2ce5-4cdd-b563-3dc8aec12c04\\playstation_5_1779545886606.png',
  'l6': 'C:\\Users\\tlhab\\.gemini\\antigravity\\brain\\c89ebbc9-2ce5-4cdd-b563-3dc8aec12c04\\vintage_rolex_1779545908208.png',
};

async function seed() {
  console.log('Starting seed process...');

  // 1. Create a mock user
  const user = {
    id: 'e69c17df-1b15-4fa8-a15e-04f762699e31', // Valid UUID
    name: 'Thabo M.',
    email: 'thabo@example.com',
    phone: '+27 82 123 4567',
    country: 'ZA',
    city: 'Johannesburg',
    is_verified_seller: true,
    bidder_score: 4,
    seller_score: 5,
    badge: 'platinum',
    total_deals: 42,
    products_bought: 12,
    products_sold: 30
  };

  const { error: userError } = await supabase.from('users').upsert(user);
  if (userError) console.error('Error inserting user:', userError);
  else console.log('User inserted');

  // 2. Upload images and create listings
  const mockListings = [
    {
      id: 'l1',
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Brand new, sealed in box. 512GB Titanium Black.',
      category: 'electronics',
      condition_id: 'new',
      currency: 'ZAR',
      current_bid: 14500,
      total_bids: 12,
      watchers: 45,
      delivery_type: 'shipping',
      location_city: 'Sandton',
      location_country: 'ZA',
      ends_at: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: 'l2',
      title: 'Nike Air Max 90',
      description: 'Worn once, perfect condition. Size UK 9.',
      category: 'fashion',
      condition_id: 'used-excellent',
      currency: 'BWP',
      current_bid: 2800,
      total_bids: 5,
      watchers: 12,
      delivery_type: 'both',
      location_city: 'Gaborone',
      location_country: 'BW',
      ends_at: new Date(Date.now() + 4000000).toISOString()
    }
  ];

  for (const listing of mockListings) {
    const imgPath = images[listing.id];
    let publicUrl = '';
    
    if (imgPath && fs.existsSync(imgPath)) {
      const fileBuffer = fs.readFileSync(imgPath);
      const fileName = `${listing.id}.png`;
      
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(fileName, fileBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading image for ${listing.id}:`, error);
      } else {
        const { data: urlData } = supabase.storage.from('listings').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
        console.log(`Uploaded image for ${listing.id}:`, publicUrl);
      }
    }

    // Insert listing
    const listingData = {
      ...listing,
      id: undefined, // Let PG generate UUID
      seller_id: user.id,
      images: publicUrl ? [publicUrl] : []
    };

    const { error: listingError } = await supabase.from('listings').insert(listingData);
    if (listingError) console.error(`Error inserting listing ${listing.title}:`, listingError);
    else console.log(`Listing inserted: ${listing.title}`);
  }

  console.log('Seed complete!');
}

seed();
