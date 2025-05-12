/**
 * Content Analysis Service
 * 
 * Provides functionality to analyze deck content and extract relevant information.
 */
import { OpenAI } from 'openai';
import { PitchDeck, Slide } from '../../types/deck';
import { industryStyleGuides } from '../../constants/styleGuides';
import { SlideStyle } from '../slideDesignService';

// Initialize OpenAI for content analysis
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Type for AI analysis results
export type ContentAnalysis = {
  industry: string;
  businessTone: string;
  keyThemes: string[];
  colorSuggestions: string[];
  recommendedStyle: string;
  slideSpecificStyles?: Record<string, any>;
};

/**
 * Analyze deck content using AI to determine appropriate styling
 * 
 * @param deck The pitch deck to analyze
 * @returns Analysis results with style recommendations
 */
export const analyzeDeckContent = async (deck: PitchDeck): Promise<ContentAnalysis> => {
  try {
    // Skip analysis if no OpenAI key or if in development without external API calls
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      return getFallbackAnalysis(deck);
    }
    
    // Extract relevant content for analysis
    const content = extractContentForAnalysis(deck);
    
    const prompt = `
      Analyze this pitch deck content and suggest appropriate styling.
      Deck title: ${deck.title || 'Untitled'}
      
      Content: ${JSON.stringify(content, null, 2)}
      
      Provide the following:
      1. Industry category (e.g., technology, healthcare, finance, education)
      2. Business tone (e.g., professional, creative, technical, friendly)
      3. Key themes (2-3 keywords)
      4. Color palette suggestions (2-3 hex codes)
      5. Recommended style (e.g., modern, corporate, innovative, elegant)
      
      Format your response as JSON with the keys: industry, businessTone, keyThemes, colorSuggestions, recommendedStyle
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a design expert that provides styling recommendations for business presentations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });
    
    const result = response.choices[0]?.message.content;
    
    if (!result) {
      throw new Error('No response from AI service');
    }
    
    const analysis = JSON.parse(result) as ContentAnalysis;
    
    // Add slide-specific style recommendations
    return enhanceAnalysisWithSpecifics(analysis, deck);
    
  } catch (error) {
    console.error('Error analyzing deck content:', error);
    return getFallbackAnalysis(deck);
  }
};

/**
 * Extract relevant content from a deck for analysis
 * 
 * @param deck Pitch deck to extract content from
 * @returns Simplified content object for analysis
 */
export const extractContentForAnalysis = (deck: PitchDeck): any => {
  const content: any = {
    title: deck.title || '',
    slides: []
  };
  
  if (deck.slides) {
    deck.slides.forEach(slide => {
      if (slide.content) {
        content.slides.push({
          title: slide.title || '',
          type: slide.slide_type || '',
          headline: slide.content.headline || '',
          paragraphs: slide.content.paragraphs || [],
          bullets: slide.content.bullets || []
        });
      }
    });
  }
  
  return content;
};

/**
 * Add slide-specific style recommendations to analysis
 * 
 * @param analysis Base content analysis
 * @param deck Pitch deck
 * @returns Enhanced analysis with slide-specific styles
 */
export const enhanceAnalysisWithSpecifics = (analysis: ContentAnalysis, deck: PitchDeck): ContentAnalysis => {
  const enhanced = { ...analysis };
  enhanced.slideSpecificStyles = {};
  
  // Add slide-specific recommendations
  if (deck.slides) {
    deck.slides.forEach(slide => {
      const slideType = slide.slide_type || 'content';
      if (slideType === 'cover') {
        enhanced.slideSpecificStyles![slideType] = {
          layout: 'fullWidthImage'
        };
      } else if (slideType === 'data' || slideType === 'financials') {
        enhanced.slideSpecificStyles![slideType] = {
          layout: 'dataGrid'
        };
      }
    });
  }
  
  return enhanced;
};

/**
 * Create fallback analysis when AI analysis is not available
 * 
 * @param deck Pitch deck
 * @returns Fallback content analysis
 */
export const getFallbackAnalysis = (deck: PitchDeck): ContentAnalysis => {
  // Extract some keywords from the deck content to make educated guesses
  const keywords = extractKeywords(deck);
  
  // Determine likely industry based on keywords
  let industry = 'default';
  let businessTone = 'professional';
  
  if (keywords.some(k => ['tech', 'technology', 'software', 'app', 'digital', 'platform', 'ai', 'data'].includes(k))) {
    industry = 'technology';
    businessTone = 'modern';
  } else if (keywords.some(k => ['health', 'healthcare', 'medical', 'patient', 'doctor', 'hospital', 'care'].includes(k))) {
    industry = 'healthcare';
    businessTone = 'professional';
  } else if (keywords.some(k => ['finance', 'banking', 'investment', 'money', 'financial', 'bank', 'budget'].includes(k))) {
    industry = 'finance';
    businessTone = 'traditional';
  } else if (keywords.some(k => ['school', 'education', 'student', 'learning', 'teach', 'course', 'training'].includes(k))) {
    industry = 'education';
    businessTone = 'friendly';
  }
  
  // Return fallback analysis
  return {
    industry,
    businessTone,
    keyThemes: keywords.slice(0, 3),
    colorSuggestions: industryStyleGuides[industry].colorThemes,
    recommendedStyle: industry === 'technology' ? 'innovative' : 
                    industry === 'finance' ? 'corporate' : 'professional'
  };
};

/**
 * Extract keywords from deck content for fallback analysis
 * 
 * @param deck Pitch deck
 * @returns List of extracted keywords
 */
export const extractKeywords = (deck: PitchDeck): string[] => {
  const keywords: string[] = [];
  const text: string[] = [];
  
  // Collect all text content
  if (deck.title) text.push(deck.title);
  
  if (deck.slides) {
    deck.slides.forEach(slide => {
      if (slide.title) text.push(slide.title);
      if (slide.content) {
        if (slide.content.headline) text.push(slide.content.headline);
        if (slide.content.paragraphs) text.push(...slide.content.paragraphs);
        if (slide.content.bullets) text.push(...slide.content.bullets);
      }
    });
  }
  
  // Join all text and extract common words, excluding stop words
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'on', 'at', 'to', 'by', 'in'];
  const allText = text.join(' ').toLowerCase();
  const words = allText.split(/\W+/).filter(word => 
    word.length > 3 && !stopWords.includes(word)
  );
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
};

export default {
  analyzeDeckContent,
  extractContentForAnalysis,
  enhanceAnalysisWithSpecifics,
  getFallbackAnalysis,
  extractKeywords
};
