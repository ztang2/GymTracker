import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Type-safe environment variable access
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in .env file.'
  );
}

// Create Supabase client with optimal settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auth initially for anonymous usage
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
