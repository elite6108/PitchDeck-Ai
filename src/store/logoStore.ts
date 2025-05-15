/**
 * Logo Store
 * 
 * Manages the state and operations for user logos
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Logo, LogoSettings, toAppLogo } from '../types/logo';

interface LogoState {
  logos: Logo[];
  currentLogo: Logo | null;
  loading: boolean;
  error: string | null;
  
  // Logo operations
  fetchLogos: () => Promise<void>;
  saveLogo: (companyName: string, imageUrl: string, prompt: string, settings: LogoSettings) => Promise<Logo | null>;
  getLogo: (id: string) => Promise<void>;
  deleteLogo: (id: string) => Promise<void>;
  
  // UI helpers
  setCurrentLogo: (logo: Logo | null) => void;
}

export const useLogoStore = create<LogoState>((set) => ({
  logos: [],
  currentLogo: null,
  loading: false,
  error: null,
  
  fetchLogos: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('logos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database types to application types
      const appLogos = data.map((logo) => toAppLogo(logo));
      set({ logos: appLogos });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  saveLogo: async (companyName: string, imageUrl: string, prompt: string, settings: LogoSettings) => {
    set({ loading: true, error: null });
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save a logo');
      }
      
      // Using proper type for Supabase insert
      const newLogoData = {
        company_name: companyName,
        image_url: imageUrl,
        prompt: prompt,
        settings: settings as any, // Cast settings to 'any' which is compatible with Json type
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('logos')
        .insert(newLogoData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newLogo = toAppLogo(data);
      
      set(state => ({ 
        logos: [newLogo, ...state.logos],
        currentLogo: newLogo
      }));
      
      return newLogo;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  getLogo: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Fetch logo
      const { data: logo, error: logoError } = await supabase
        .from('logos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (logoError) throw logoError;
      
      // Convert database type to application type
      const appLogo = toAppLogo(logo);
      
      set({ currentLogo: appLogo });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteLogo: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('logos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the logos list by removing the deleted logo
      set(state => ({
        logos: state.logos.filter(logo => logo.id !== id),
        currentLogo: state.currentLogo?.id === id ? null : state.currentLogo
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  setCurrentLogo: (logo: Logo | null) => {
    set({ currentLogo: logo });
  },
}));
