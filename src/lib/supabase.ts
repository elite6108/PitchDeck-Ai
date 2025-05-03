import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Initialize the Supabase client
// Use environment variables when available, or fallback to explicit import for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);