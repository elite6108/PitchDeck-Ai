import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false,
  
  initialize: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ 
          user: session.user,
          session,
          initialized: true
        });
      } else {
        set({ initialized: true });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
        }
      });
      
      if (error) throw error;
      
      // Check if session exists (immediate login) or if email confirmation is required
      if (data.session) {
        set({ 
          user: data.user,
          session: data.session
        });
      } else if (data.user) {
        // User created but confirmation required
        console.log('Email confirmation required');
        // Don't set user/session here as they're not authenticated yet
      }
    } catch (error) {
      let errorMessage = (error as Error).message;
      
      // Handle specific known errors with more user-friendly messages
      if (errorMessage.includes('unique constraint')) {
        errorMessage = 'This email is already registered. Please try signing in instead.';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ 
        user: data.user,
        session: data.session
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ user: null, session: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth state on app load
export const initializeAuth = () => {
  useAuthStore.getState().initialize();
  
  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    const state = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session) {
      useAuthStore.setState({ 
        user: session.user,
        session
      });
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null,
        session: null
      });
    }
  });
};