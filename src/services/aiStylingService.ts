/**
 * AI Styling Service
 * 
 * Main service that coordinates the automatic styling of presentations
 * based on content analysis.
 * 
 * This service ties together the background analysis, theme selection,
 * and stock image services to provide a seamless styling experience.
 */

import { PitchDeck, Slide } from '../types/deck';
import { ContentAnalysis, IndustryType } from '../types/analysis';
// Import commented out since it's not being used
// import * as backgroundAnalysisService from './backgroundAnalysisService';
import themeSelectionService, { ThemeSelectionResult } from './themeSelectionService';
import stockImageService, { StockImage } from './stockImageService';

// Queue for tracking styling operations in progress
const stylingQueue = new Map<string, boolean>();

// Cache for storing analysis results
const analysisCache = new Map<string, ContentAnalysis>();

// Helper function to validate if a string is a valid IndustryType
const isValidIndustryType = (industry: string): industry is IndustryType => {
  const validIndustries: IndustryType[] = [
    'technology', 'finance', 'healthcare', 'education', 'retail',
    'manufacturing', 'creative', 'consulting', 'real_estate',
    'non_profit', 'food', 'travel', 'general'
  ];
  return validIndustries.includes(industry as IndustryType);
};

// Removed unused helper functions for ToneType and AudienceType validation
const themeCache = new Map<string, ThemeSelectionResult>();
const imageCache = new Map<string, StockImage[]>();

/**
 * Interface for styling result
 */
export interface StylingResult {
  deck: PitchDeck;
  analysis: ContentAnalysis;
  theme: ThemeSelectionResult;
  backgroundImages: StockImage[];
}

/**
 * Automatically style a deck based on its content
 */
export const autoStyleDeck = async (deck: PitchDeck): Promise<StylingResult> => {
  try {
    // Make sure we have a valid deck ID
    if (!deck.id) {
      throw new Error('Deck ID is required for styling');
    }

    // Check if styling is already in progress
    if (stylingQueue.get(deck.id)) {
      throw new Error('Styling already in progress for this deck');
    }
    
    // Mark styling as in progress
    stylingQueue.set(deck.id, true);
    
    // 1. Analyze deck content
    const analysis = await analyzeDeckContent(deck);
    
    // 2. Select appropriate themes based on analysis
    const themeResult = selectTheme(analysis);
    
    // 3. Get background images based on theme and content
    const backgroundImages = await getBackgroundImages(analysis, themeResult);
    
    // 4. Apply styling to deck
    const styledDeck = await applyStylesToDeck(deck, analysis, themeResult, backgroundImages);
    
    // 5. Cache results for future use
    cacheResults(deck.id, analysis, themeResult, backgroundImages);
    
    // 6. Complete styling process
    stylingQueue.delete(deck.id);
    
    return {
      deck: styledDeck,
      analysis,
      theme: themeResult,
      backgroundImages
    };
  } catch (error) {
    // Clear queue status in case of error
    if (deck.id) {
      stylingQueue.delete(deck.id);
    }
    console.error('Auto-styling error:', error);
    throw error;
  }
};

/**
 * Analyze deck content using background analysis service
 */
const analyzeDeckContent = async (deck: PitchDeck): Promise<ContentAnalysis> => {
  // Check cache first if we have a valid deck ID
  if (deck.id) {
    const cachedAnalysis = analysisCache.get(deck.id);
    if (cachedAnalysis) {
      return cachedAnalysis;
    }
  }
  
  // Implement a fallback analysis function since the backgroundAnalysisService.analyzeDeckContent doesn't exist
  // This creates a simple content analysis based on the deck content
  const analysis: ContentAnalysis = {
    industry: 'technology',  // Default to technology
    keywords: [],
    tone: 'formal',
    audience: 'investors',
    contentDensity: 'medium',
    hasData: false,
    dominant_colors: [],
    style_keywords: []
  };
  
  // Extract keywords from slides
  if (deck.slides) {
    // Collect all content from slides
    const allText = deck.slides.map(slide => {
      const content = slide.content || {};
      return [
        slide.title,
        content.headline,
        ...(content.paragraphs || []),
        ...(content.bullets || [])
      ].filter(Boolean).join(' ');
    }).join(' ');
    
    // Extract some basic keywords
    const words = allText.toLowerCase().split(/\W+/).filter(w => 
      w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'your'].includes(w)
    );
    
    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Extract top keywords
    analysis.keywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
      
    // Try to determine industry
    const industryKeywords: Record<string, string[]> = {
      technology: ['software', 'app', 'technology', 'tech', 'digital', 'platform', 'online'],
      healthcare: ['health', 'medical', 'care', 'patient', 'hospital', 'clinic', 'wellness'],
      finance: ['finance', 'financial', 'banking', 'investment', 'money', 'payment', 'loan'],
      education: ['education', 'learning', 'school', 'student', 'teach', 'course', 'training'],
      retail: ['retail', 'shop', 'store', 'product', 'consumer', 'customer', 'sale'],
    };
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => allText.toLowerCase().includes(keyword))) {
        // Only assign if it's a valid IndustryType
        if (isValidIndustryType(industry)) {
          analysis.industry = industry as IndustryType;
        }
        break;
      }
    }
  }
  
  return analysis;
};

/**
 * Select theme based on content analysis
 */
const selectTheme = (analysis: ContentAnalysis): ThemeSelectionResult => {
  return themeSelectionService.selectThemeFromAnalysis(analysis);
};

/**
 * Get background images based on theme and content analysis
 */
const getBackgroundImages = async (
  _analysis: ContentAnalysis, // Prefixed with underscore as it's not currently used
  themeResult: ThemeSelectionResult
): Promise<StockImage[]> => {
  // Get background suggestions based on theme color
  try {
    // Get themed backgrounds directly from the stockImageService (now async)
    const images = await stockImageService.getThemedBackgrounds(themeResult.colorTheme);
    console.log(`Retrieved ${images.length} background images for color theme ${themeResult.colorTheme}`);
    if (images.length > 0) {
      return images;
    }
  } catch (error) {
    console.error('Error getting themed backgrounds:', error);
  }
  
  // Return empty array if no images were found
  return [];
};

/**
 * Apply selected styles to the deck and its slides
 * This function uses the theme result and background images to style the deck
 */
const applyStylesToDeck = async (
  deck: PitchDeck,
  analysis: ContentAnalysis,
  themeResult: ThemeSelectionResult,
  backgroundImages: StockImage[]
): Promise<PitchDeck> => {
  console.log('AI Styling: Applying themes and images to deck', deck.id);
  
  // Clone the deck to avoid mutation issues
  const styledDeck: PitchDeck = { ...deck };
  
  // Apply styling to each slide
  if (styledDeck.slides && styledDeck.slides.length > 0) {
    styledDeck.slides = await Promise.all(
      styledDeck.slides.map(async (slide, index) => {
        // Style each slide based on the theme and content analysis
        return styleSlide(slide, themeResult, analysis, backgroundImages, index);
      })
    );
  }
  
  return styledDeck;
};

/**
 * Apply styling to an individual slide
 */
const styleSlide = (
  slide: Slide,
  themeResult: ThemeSelectionResult,
  _analysis: ContentAnalysis, // Prefixed with underscore as it's not currently used
  backgroundImages: StockImage[],
  index: number
): Slide => {
  // Create a copy to avoid mutation
  const styledSlide = { ...slide };
  const content = { ...styledSlide.content };
  
  // Apply design style from theme
  // Make sure we're using valid types for the slide content properties
  if (themeResult.designStyle === 'modern' || 
      themeResult.designStyle === 'classic' || 
      themeResult.designStyle === 'minimal' || 
      themeResult.designStyle === 'bold' || 
      themeResult.designStyle === 'creative') {
    content.design_style = themeResult.designStyle;
  }
  
  // Convert color theme types to ensure compatibility
  if (themeResult.colorTheme === 'blue' || 
      themeResult.colorTheme === 'green' || 
      themeResult.colorTheme === 'purple' || 
      themeResult.colorTheme === 'red' || 
      themeResult.colorTheme === 'orange' || 
      themeResult.colorTheme === 'teal') {
    content.color_theme = themeResult.colorTheme;
  }
  
  // Apply background image if available
  content.background_image = selectBackgroundForSlide(slide, backgroundImages, index);
  
  // Apply font style safely
  if (themeResult.fontStyle === 'serif' || themeResult.fontStyle === 'sans-serif') {
    content.font_style = themeResult.fontStyle;
  }
  
  // Apply color attributes
  if (themeResult.colorTheme === 'blue') {
    content.accent_color = '#3B82F6';
    content.highlight_color = '#2563EB';
    content.secondary_color = '#1E40AF';
  } else if (themeResult.colorTheme === 'green') {
    content.accent_color = '#10B981';
    content.highlight_color = '#059669';
    content.secondary_color = '#047857';
  } else if (themeResult.colorTheme === 'purple') {
    content.accent_color = '#8B5CF6';
    content.highlight_color = '#7C3AED';
    content.secondary_color = '#6D28D9';
  }
  
  // Update content
  styledSlide.content = content;
  
  return styledSlide;
};

/**
 * Select an appropriate background for a slide
 */
const selectBackgroundForSlide = (
  _slide: Slide, // Prefixed with underscore as it's not currently used
  backgroundImages: StockImage[],
  index: number
): string | undefined => {
  if (!backgroundImages || backgroundImages.length === 0) {
    return undefined;
  }
  
  // Rotate through the available images
  const selectedImage = backgroundImages[index % backgroundImages.length];
  
  // Use the url property which is what the SlideViewer component expects
  // This was the key issue - we were using downloadUrl but the viewer looks for url
  console.log('Selected background image:', selectedImage);
  return selectedImage.url;
};

/**
 * Cache analysis and styling results for future use
 */
const cacheResults = (
  deckId: string,
  analysis: ContentAnalysis,
  themeResult: ThemeSelectionResult,
  backgroundImages: StockImage[]
): void => {
  // Only cache if we have a valid deck ID
  if (deckId) {
    analysisCache.set(deckId, analysis);
    themeCache.set(deckId, themeResult);
    imageCache.set(deckId, backgroundImages);
  }
};

/**
 * Start background analysis to prepare for styling
 * This is designed to be called as soon as deck creation begins
 */
export const beginBackgroundAnalysis = (
  deck: PitchDeck,
  onComplete?: (analysis: ContentAnalysis) => void
): void => {
  console.log('AI Styling: Beginning background analysis for deck', deck.id);
  
  // Skip if no valid deck ID or already in progress
  if (!deck.id || stylingQueue.get(deck.id)) {
    console.log('AI Styling: Skipping - invalid deck ID or styling already in progress');
    return;
  }
  
  // Mark styling as in progress
  stylingQueue.set(deck.id, true);
  
  // Implement a fallback for the missing analyzeContentInRealTime function
  // This simulates a background analysis with a setTimeout
  setTimeout(async () => {
    console.log('AI Styling: Analyzing deck content');
    
    try {
      // Create a simple analysis based on deck content
      const analysis: ContentAnalysis = {
        industry: 'technology',  // Default to technology
        keywords: [],
        tone: 'formal',
        audience: 'investors',
        contentDensity: 'medium',
        hasData: false,
        dominant_colors: ['#3B82F6', '#2563EB', '#1E40AF'], // Blue color palette
        style_keywords: ['professional', 'clean', 'modern']
      };
      
      // Extract keywords from slides if available
      if (deck.slides && deck.slides.length > 0) {
        console.log('AI Styling: Processing slides for keywords');
        
        // Collect all content from slides
        const allText = deck.slides.map(slide => {
          const content = slide.content || {};
          return [
            slide.title,
            content.headline,
            ...(content.paragraphs || []),
            ...(content.bullets || [])
          ].filter(Boolean).join(' ');
        }).join(' ');
        
        // Extract some basic keywords
        const words = allText.toLowerCase().split(/\W+/).filter(w => 
          w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'your'].includes(w)
        );
        
        // Count word frequency
        const wordCount = words.reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Extract top keywords
        analysis.keywords = Object.entries(wordCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word]) => word);
        
        console.log('AI Styling: Extracted keywords', analysis.keywords);
      }
      
      // Now that we have the analysis, let's select a theme
      console.log('AI Styling: Selecting theme based on analysis');
      const themeResult = selectTheme(analysis);
      
      // Get background images based on theme and content
      console.log('AI Styling: Fetching background images');
      const backgroundImages = await getBackgroundImages(analysis, themeResult);
      
      // Apply styling to deck
      console.log('AI Styling: Applying styles to deck');
      const styledDeck = await applyStylesToDeck(deck, analysis, themeResult, backgroundImages);
      
      // The slides need to be updated individually, not as part of the deck
      // Import the deckStore to save each updated slide
      try {
        const { useDeckStore } = await import('../store/deckStore');
        
        if (styledDeck && styledDeck.id && styledDeck.slides && styledDeck.slides.length > 0) {
          console.log('AI Styling: Saving styled slides back to store');
          
          // Update each slide individually
          for (const slide of styledDeck.slides) {
            if (slide.id) {
              console.log(`AI Styling: Updating slide ${slide.id} with styling`, slide.content);
              await useDeckStore.getState().updateSlide(slide.id, {
                content: slide.content
              });
            }
          }
          
          // Only update the deck metadata (not the slides)
          useDeckStore.getState().updateDeck(styledDeck.id, {
            // Include only the properties that belong directly to the deck table
            title: styledDeck.title,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to save styled slides to store:', err);
      }
      
      // Cache results
      if (deck.id) {
        console.log('AI Styling: Caching styling results');
        cacheResults(deck.id, analysis, themeResult, backgroundImages);
        stylingQueue.delete(deck.id); // Mark styling as complete
      }
      
      // Notify caller if callback provided
      if (onComplete) {
        console.log('AI Styling: Notifying callback with analysis');
        onComplete(analysis);
      }
      
      console.log('AI Styling: Background styling completed successfully');
    } catch (error) {
      console.error('AI Styling Error:', error);
      if (deck.id) {
        stylingQueue.delete(deck.id); // Clear in-progress status
      }
    }
  }, 1000); // Small delay to simulate background processing
};

/**
 * Check if styling is complete for a deck
 */
export const isStylingComplete = (deckId: string): boolean => {
  if (!deckId) return false;
  return !stylingQueue.get(deckId) && analysisCache.has(deckId);
};

/**
 * Get cached analysis for a deck
 */
export const getCachedAnalysis = (deckId: string): ContentAnalysis | undefined => {
  if (!deckId) return undefined;
  return analysisCache.get(deckId);
};

/**
 * Get current styling status for a deck
 */
export const getStylingStatus = (deckId: string): 'not_started' | 'in_progress' | 'complete' => {
  if (!deckId) return 'not_started';
  
  if (stylingQueue.get(deckId)) {
    return 'in_progress';
  }
  
  if (analysisCache.has(deckId)) {
    return 'complete';
  }
  
  return 'not_started';
};

/**
 * Clear styling cache for a deck
 */
export const clearStylingCache = (deckId: string): void => {
  if (!deckId) return;
  
  analysisCache.delete(deckId);
  themeCache.delete(deckId);
  imageCache.delete(deckId);
  stylingQueue.delete(deckId);
};



export default {
  autoStyleDeck,
  beginBackgroundAnalysis,
  isStylingComplete,
  getCachedAnalysis,
  getStylingStatus,
  clearStylingCache
};
