// vls-expo/src/lib/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// You should use a .env file for this in a real app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
  console.warn("Supabase URL is not set. Please create a .env file with EXPO_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    console.warn("Supabase Anon Key is not set. Please create a .env file with EXPO_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // This is mainly for web
  },
});

// Helper to check if Supabase is configured
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY');
}

console.log('🔧 Supabase Client Initialized for Expo:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    configured: isSupabaseConfigured()
});
