/**
 * Hook for integrating automatic styling into the deck creation flow
 */

import { useState, useEffect } from 'react';
import { PitchDeck } from '../types/deck';
import { ContentAnalysis, StylingStatus } from '../types/analysis';
import aiStylingService from '../services/aiStylingService';
import { useDeckStore } from '../store/deckStore';

interface AutoStylingOptions {
  // Whether auto-styling is enabled (can be toggled by user preferences)
  enabled?: boolean;
  
  // Callback when styling is complete
  onStylingComplete?: (styledDeck: PitchDeck) => void;
  
  // Callback for styling progress updates
  onStylingStatusChange?: (status: StylingStatus) => void;
}

interface AutoStylingResult {
  // Trigger styling manually
  applyAutoStyling: (deck: PitchDeck) => Promise<PitchDeck>;
  
  // Current styling status
  stylingStatus: StylingStatus;
  
  // Latest content analysis if available
  contentAnalysis: ContentAnalysis | undefined;
  
  // Whether automatic styling is enabled
  isEnabled: boolean;
  
  // Toggle automatic styling on/off
  toggleAutoStyling: () => void;
}

/**
 * Hook that provides auto-styling capabilities for deck creation
 */
export const useAutoStyling = (
  deckId: string,
  options: AutoStylingOptions = {}
): AutoStylingResult => {
  // Default to enabled unless explicitly disabled
  const [isEnabled, setIsEnabled] = useState(options.enabled !== false);
  
  // Track styling status
  const [stylingStatus, setStylingStatus] = useState<StylingStatus>('not_started');
  
  // Store content analysis
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | undefined>();
  
  // Access the deck store to update decks
  const { updateDeck } = useDeckStore();
  
  // When the component mounts or deckId changes, check styling status
  useEffect(() => {
    if (!deckId || !isEnabled) return;
    
    // Check current styling status
    const status = aiStylingService.getStylingStatus(deckId);
    setStylingStatus(status);
    
    // If analysis is already complete, load it
    if (status === 'complete') {
      const analysis = aiStylingService.getCachedAnalysis(deckId);
      if (analysis) {
        setContentAnalysis(analysis);
      }
    }
  }, [deckId, isEnabled]);
  
  // Function to manually trigger styling
  const applyAutoStyling = async (deck: PitchDeck): Promise<PitchDeck> => {
    if (!isEnabled || !deck.id) {
      return deck;
    }
    
    try {
      setStylingStatus('in_progress');
      
      if (options.onStylingStatusChange) {
        options.onStylingStatusChange('in_progress');
      }
      
      // Apply styling
      const result = await aiStylingService.autoStyleDeck(deck);
      
      // Store content analysis
      setContentAnalysis(result.analysis);
      
      // Update status
      setStylingStatus('complete');
      
      if (options.onStylingStatusChange) {
        options.onStylingStatusChange('complete');
      }
      
      // Update deck in store
      if (result.deck && result.deck.id) {
        updateDeck(result.deck.id, result.deck);
      }
      
      // Call completion callback if provided
      if (options.onStylingComplete) {
        options.onStylingComplete(result.deck);
      }
      
      return result.deck;
    } catch (error) {
      console.error('Error applying auto-styling:', error);
      setStylingStatus('not_started');
      
      if (options.onStylingStatusChange) {
        options.onStylingStatusChange('not_started');
      }
      
      return deck;
    }
  };
  
  // Function to begin background analysis without applying styles
  const beginBackgroundAnalysis = (deck: PitchDeck) => {
    if (!isEnabled || !deck.id) return;
    
    // Start analysis in background
    aiStylingService.beginBackgroundAnalysis(deck, (analysis) => {
      setContentAnalysis(analysis);
      setStylingStatus('complete');
      
      if (options.onStylingStatusChange) {
        options.onStylingStatusChange('complete');
      }
    });
    
    setStylingStatus('in_progress');
    
    if (options.onStylingStatusChange) {
      options.onStylingStatusChange('in_progress');
    }
  };
  
  // Start background analysis on new or updated decks
  useEffect(() => {
    // This effect is for monitoring deck updates in the store
    // and triggering analysis when significant changes are detected
    const unsubscribe = useDeckStore.subscribe((state) => {
      const currentDeck = state.decks.find(d => d.id === deckId);
      
      if (currentDeck && isEnabled && stylingStatus === 'not_started') {
        // Only start analysis if we have at least one slide with content
        if (currentDeck.slides && currentDeck.slides.some(s => 
          s.title || 
          (s.content && (s.content.headline || s.content.bullets?.length || s.content.paragraphs?.length))
        )) {
          beginBackgroundAnalysis(currentDeck);
        }
      }
    });
    
    return unsubscribe;
  }, [deckId, isEnabled, stylingStatus]);
  
  // Toggle auto-styling on/off
  const toggleAutoStyling = () => {
    setIsEnabled(!isEnabled);
  };
  
  return {
    applyAutoStyling,
    stylingStatus,
    contentAnalysis,
    isEnabled,
    toggleAutoStyling
  };
};

export default useAutoStyling;
