/**
 * Supabase client — data layer.
 * All config read from environment variables (OWASP: no hardcoded secrets).
 * Firebase Auth provides the JWT — injected via injectFirebaseTokenToSupabase()
 * so Supabase RLS policies can use auth.uid() = Firebase UID.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Disable Supabase's own auth persistence — Firebase handles sessions
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
