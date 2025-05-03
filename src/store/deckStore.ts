import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PitchDeck, Slide, QuestionnaireData, DbPitchDeck, DbSlide } from '../types/deck';
import { generateEnhancedPitchDeck, AIEnhancedContent } from '../services/aiService';
import { toAppDeck, toAppSlide } from '../types/deck';

interface DeckState {
  decks: PitchDeck[];
  currentDeck: PitchDeck | null;
  currentSlide: Slide | null;
  loading: boolean;
  error: string | null;
  
  fetchDecks: () => Promise<void>;
  createDeck: (title: string) => Promise<PitchDeck | null>;
  getDeck: (id: string) => Promise<void>;
  updateDeck: (id: string, updates: Partial<PitchDeck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  
  createSlide: (deckId: string, slide: Omit<Slide, 'id' | 'pitch_deck_id'>) => Promise<Slide | null>;
  updateSlide: (slideId: string, updates: Partial<Slide>) => Promise<void>;
  deleteSlide: (slideId: string) => Promise<void>;
  reorderSlides: (deckId: string, slideIds: string[]) => Promise<void>;
  
  setCurrentDeck: (deck: PitchDeck | null) => void;
  setCurrentSlide: (slide: Slide | null) => void;
  
  // For demo purposes - in a real app, this would call an AI service
  generateDeckFromQuestionnaire: (data: QuestionnaireData) => Promise<PitchDeck | null>;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  currentDeck: null,
  currentSlide: null,
  loading: false,
  error: null,
  
  fetchDecks: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database types to application types
      const appDecks = data.map((deck) => toAppDeck(deck as DbPitchDeck));
      set({ decks: appDecks });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  createDeck: async (title: string) => {
    set({ loading: true, error: null });
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a pitch deck');
      }
      
      // Using proper type for Supabase insert
      const newDeckData = {
        title,
        user_id: user.id, // Set the user_id to the authenticated user's ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('pitch_decks')
        .insert(newDeckData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ 
        decks: [data, ...state.decks],
        currentDeck: data
      }));
      
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  getDeck: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Fetch deck
      const { data: deck, error: deckError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (deckError) throw deckError;
      
      // Fetch slides
      const { data: slides, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .eq('pitch_deck_id', id)
        .order('position', { ascending: true });
      
      if (slidesError) throw slidesError;
      
      // Convert database types to application types
      const appSlides = (slides || []).map(slide => toAppSlide(slide as DbSlide));
      
      // Create proper application-side PitchDeck object
      const appDeck: PitchDeck = {
        id: deck.id,
        user_id: deck.user_id,
        title: deck.title,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        slides: appSlides
      };
      
      set({ currentDeck: appDeck });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  updateDeck: async (id: string, updates: Partial<PitchDeck>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('pitch_decks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in local state
      set(state => ({
        decks: state.decks.map(deck => 
          deck.id === id ? { ...deck, ...updates, updated_at: new Date().toISOString() } : deck
        ),
        currentDeck: state.currentDeck?.id === id 
          ? { ...state.currentDeck, ...updates, updated_at: new Date().toISOString() }
          : state.currentDeck
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteDeck: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Delete all slides first
      const { error: slidesError } = await supabase
        .from('slides')
        .delete()
        .eq('pitch_deck_id', id);
      
      if (slidesError) throw slidesError;
      
      // Then delete the deck
      const { error } = await supabase
        .from('pitch_decks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        decks: state.decks.filter(deck => deck.id !== id),
        currentDeck: state.currentDeck?.id === id ? null : state.currentDeck
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  createSlide: async (deckId: string, slide: Omit<Slide, 'id' | 'pitch_deck_id'>) => {
    set({ loading: true, error: null });
    try {
      // Prepare slide data for database insertion
      const newSlideData = {
        ...slide,
        pitch_deck_id: deckId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('slides')
        .insert(newSlideData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert database slide to application slide
      const appSlide = toAppSlide(data as DbSlide);
      
      // Update current deck slides in local state
      set(state => {
        if (state.currentDeck && state.currentDeck.id === deckId) {
          const updatedSlides = [...(state.currentDeck.slides || []), appSlide];
          return {
            currentDeck: {
              ...state.currentDeck,
              slides: updatedSlides
            }
          };
        }
        return state;
      });
      
      return appSlide;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  updateSlide: async (slideId: string, updates: Partial<Slide>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('slides')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', slideId);
      
      if (error) throw error;
      
      // Update in local state
      set(state => {
        if (state.currentDeck && state.currentDeck.slides) {
          const updatedSlides = state.currentDeck.slides.map(slide => 
            slide.id === slideId 
              ? { ...slide, ...updates, updated_at: new Date().toISOString() } 
              : slide
          );
          
          return {
            currentDeck: {
              ...state.currentDeck,
              slides: updatedSlides
            },
            currentSlide: state.currentSlide?.id === slideId
              ? { ...state.currentSlide, ...updates, updated_at: new Date().toISOString() }
              : state.currentSlide
          };
        }
        return state;
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteSlide: async (slideId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);
      
      if (error) throw error;
      
      // Update local state
      set(state => {
        if (state.currentDeck && state.currentDeck.slides) {
          const updatedSlides = state.currentDeck.slides.filter(slide => slide.id !== slideId);
          
          return {
            currentDeck: {
              ...state.currentDeck,
              slides: updatedSlides
            },
            currentSlide: state.currentSlide?.id === slideId ? null : state.currentSlide
          };
        }
        return state;
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  reorderSlides: async (deckId: string, slideIds: string[]) => {
    set({ loading: true, error: null });
    try {
      // For each slide ID, update its position
      const updates = slideIds.map((id, index) => ({
        id,
        position: index
      }));
      
      // Update each slide's position
      for (const update of updates) {
        const { error } = await supabase
          .from('slides')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Update local state
      set(state => {
        if (state.currentDeck && state.currentDeck.id === deckId && state.currentDeck.slides) {
          // Create a map from id to slide
          const slideMap = new Map(
            state.currentDeck.slides.map(slide => [slide.id, slide])
          );
          
          // Create new slides array with updated positions
          const updatedSlides = slideIds.map((id, index) => {
            const slide = slideMap.get(id);
            if (!slide) return null;
            return { ...slide, position: index };
          }).filter(Boolean) as Slide[];
          
          return {
            currentDeck: {
              ...state.currentDeck,
              slides: updatedSlides
            }
          };
        }
        return state;
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  setCurrentDeck: (deck: PitchDeck | null) => {
    set({ currentDeck: deck });
  },
  
  setCurrentSlide: (slide: Slide | null) => {
    set({ currentSlide: slide });
  },
  
  // AI-powered implementation for generating enhanced pitch decks
  generateDeckFromQuestionnaire: async (data: QuestionnaireData) => {
    set({ loading: true, error: null });
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a pitch deck');
      }
      
      // Create a new deck with the user_id explicitly set
      const { data: deckData, error: deckError } = await supabase
        .from('pitch_decks')
        .insert({
          title: data.companyName + ' Pitch Deck',
          user_id: user.id, // Set the user_id to the authenticated user's ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (deckError) throw deckError;
      
      // Generate AI-enhanced content for the pitch deck
      let aiContent: Record<string, AIEnhancedContent>;
      try {
        set({ error: null });
        aiContent = await generateEnhancedPitchDeck(data);
      } catch (aiError) {
        console.error('AI content generation failed:', aiError);
        // Fallback to basic content if AI fails
        aiContent = {};
      }
      
      // Create slides with either AI-enhanced content or fallback to user input
      const slides: Omit<Slide, 'id' | 'pitch_deck_id'>[] = [
        {
          title: 'Cover',
          content: aiContent.Cover ? {
            headline: aiContent.Cover.headline || data.companyName,
            subheadline: 'Pitch Deck',
            paragraphs: aiContent.Cover.content || [],
          } : {
            headline: data.companyName,
            subheadline: 'Pitch Deck',
          },
          position: 0,
          slide_type: 'cover',
        },
        {
          title: 'Problem',
          content: aiContent.Problem ? {
            headline: aiContent.Problem.headline || 'The Problem',
            paragraphs: aiContent.Problem.content || [data.problem],
            bullets: aiContent.Problem.bullets || [],
          } : {
            headline: 'The Problem',
            paragraphs: [data.problem],
          },
          position: 1,
          slide_type: 'problem',
        },
        {
          title: 'Solution',
          content: aiContent.Solution ? {
            headline: aiContent.Solution.headline || 'Our Solution',
            paragraphs: aiContent.Solution.content || [data.solution],
            bullets: aiContent.Solution.bullets || [],
          } : {
            headline: 'Our Solution',
            paragraphs: [data.solution],
          },
          position: 2,
          slide_type: 'solution',
        },
        {
          title: 'Market',
          content: aiContent.Market ? {
            headline: aiContent.Market.headline || 'Target Market',
            paragraphs: aiContent.Market.content || [data.targetMarket],
            bullets: aiContent.Market.bullets || ['Market Size: ' + data.marketSize],
          } : {
            headline: 'Target Market',
            paragraphs: [data.targetMarket],
            bullets: ['Market Size: ' + data.marketSize],
          },
          position: 3,
          slide_type: 'market',
        },
        {
          title: 'Business Model',
          content: aiContent["Business Model"] ? {
            headline: aiContent["Business Model"].headline || 'Business Model',
            paragraphs: aiContent["Business Model"].content || [data.businessModel],
            bullets: aiContent["Business Model"].bullets || [],
          } : {
            headline: 'Business Model',
            paragraphs: [data.businessModel],
          },
          position: 4,
          slide_type: 'business_model',
        },
        {
          title: 'Competition',
          content: aiContent.Competition ? {
            headline: aiContent.Competition.headline || 'Competitive Advantage',
            paragraphs: aiContent.Competition.content || [data.competitive],
            bullets: aiContent.Competition.bullets || [],
          } : {
            headline: 'Competitive Advantage',
            paragraphs: [data.competitive],
          },
          position: 5,
          slide_type: 'competition',
        },
        {
          title: 'Team',
          content: aiContent.Team ? {
            headline: aiContent.Team.headline || 'Our Team',
            paragraphs: aiContent.Team.content || [data.team],
            bullets: aiContent.Team.bullets || [],
          } : {
            headline: 'Our Team',
            paragraphs: [data.team],
          },
          position: 6,
          slide_type: 'team',
        },
        {
          title: 'Traction',
          content: aiContent.Traction ? {
            headline: aiContent.Traction.headline || 'Traction & Metrics',
            paragraphs: aiContent.Traction.content || [data.traction || 'No traction data provided.'],
            bullets: aiContent.Traction.bullets || [],
          } : {
            headline: 'Traction & Metrics',
            paragraphs: [data.traction || 'No traction data provided.'],
          },
          position: 7,
          slide_type: 'financials',
        },
        {
          title: 'Ask',
          content: aiContent.Ask ? {
            headline: aiContent.Ask.headline || 'The Ask',
            paragraphs: aiContent.Ask.content || [data.fundingGoal ? `Funding Goal: ${data.fundingGoal}` : 'No funding goal provided.'],
            bullets: aiContent.Ask.bullets || [],
          } : {
            headline: 'The Ask',
            paragraphs: [data.fundingGoal ? `Funding Goal: ${data.fundingGoal}` : 'No funding goal provided.'],
          },
          position: 8,
          slide_type: 'closing',
        },
      ];
      
      // Insert all slides
      for (const slide of slides) {
        const { error } = await supabase
          .from('slides')
          .insert({
            ...slide,
            pitch_deck_id: deckData.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) throw error;
      }
      
      // Fetch the complete deck with slides
      await get().getDeck(deckData.id);
      
      return get().currentDeck;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));