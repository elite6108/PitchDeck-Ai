/**
 * Intelligent Stock Image Service
 * 
 * Automatically selects and integrates relevant, high-quality stock images
 * based on slide content and theme
 */

// Import removed as it's not being used
// import openaiService from './openaiService';
import { Slide } from '../types/deck';
import { ContentAnalysis } from '../types/analysis';
import { ColorTheme } from '../types/themes';
import { ThemeSelectionResult } from './themeSelectionService';
import { getUnsplashSearchUrl, getPexelsSearchUrl } from '../config/apiConfig';

// API key for Unsplash (directly from .env file)
// In Vite, non-VITE_ prefixed env vars are not automatically exposed to client code
// But since we're loading from .env directly, we'll use the exact variable name
const UNSPLASH_API_KEY = import.meta.env.UNSPLASH_API_KEY || import.meta.env.VITE_UNSPLASH_API_KEY || '';

// API key for Pexels (should be in environment variables)
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

// Slide type to image keyword mapping
const SLIDE_TYPE_IMAGE_MAP: Record<string, string[]> = {
  cover: ['business', 'professional', 'modern', 'clean'],
  introduction: ['team', 'office', 'business', 'professional'],
  problem: ['challenge', 'problem', 'obstacle', 'difficulty'],
  solution: ['solution', 'innovation', 'idea', 'success'],
  features: ['features', 'product', 'technology', 'design'],
  benefits: ['benefit', 'advantage', 'growth', 'success'],
  testimonials: ['testimonial', 'customer', 'satisfaction', 'review'],
  team: ['team', 'people', 'professional', 'collaboration'],
  pricing: ['price', 'value', 'investment', 'package'],
  timeline: ['timeline', 'planning', 'schedule', 'progress'],
  contact: ['contact', 'communication', 'connection', 'reach'],
  thank_you: ['thank you', 'appreciation', 'gratitude', 'conclusion'],
  general: ['business', 'professional', 'modern', 'abstract']
};

/**
 * Interface for stock image search options
 */
interface ImageSearchOptions {
  query: string;
  themeColor?: ColorTheme;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

/**
 * Interface for stock image data
 */
export interface StockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  description: string;
  creditName: string;
  creditUrl: string;
  downloadUrl: string;
  source: 'unsplash' | 'pexels' | 'internal';
}

/**
 * Get stock images based on slide content and theme
 */
export const getImagesForSlide = async (
  slide: Slide,
  themeResult: ThemeSelectionResult
): Promise<StockImage[]> => {
  try {
    // Generate search query based on slide content
    const query = await generateImageSearchQuery(slide, themeResult);
    
    // Search for matching stock images
    return await searchImages({
      query,
      themeColor: themeResult.colorTheme,
      count: 5,
      orientation: 'landscape'
    });
  } catch (error) {
    console.error('Error getting images for slide:', error);
    return [];
  }
};

/**
 * Get themed background images based on color theme
 */
export const getThemedBackgrounds = async (
  themeColor: ColorTheme = 'blue'
): Promise<StockImage[]> => {
  console.log('Getting themed backgrounds for color:', themeColor);
  
  // Log UNSPLASH_API_KEY availability (without showing the actual key for security)
  console.log('Unsplash API key status:', UNSPLASH_API_KEY ? 'Present' : 'Not found', 
              'Length:', UNSPLASH_API_KEY?.length || 0);
              
  // Check if we have an Unsplash API key
  if (UNSPLASH_API_KEY) {
    try {
      console.log('Unsplash API key found, making a live API call for fresh images');
      
      // Create search options
      const options: ImageSearchOptions = {
        query: `${themeColor} abstract background`,
        themeColor: themeColor,
        count: 5,
        orientation: 'landscape'
      };
      
      // Search for real images from Unsplash
      const images = await searchUnsplashImages(options);
      
      if (images && images.length > 0) {
        console.log(`Retrieved ${images.length} real images from Unsplash API for ${themeColor} theme`);
        return images;
      }
    } catch (error) {
      console.error('Error fetching images from Unsplash:', error);
    }
  } else {
    console.log('No Unsplash API key found, using fallback images');
  }
  
  // Fallback to predefined images if API call fails or no API key
  // Map of multiple stock images per theme color
  const themeBackgrounds: Record<string, StockImage[]> = {
    blue: [
      {
        id: 'blue-gradient-1',
        url: 'https://images.unsplash.com/photo-1579547945413-497e1b99f0c9',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579547945413-497e1b99f0c9?w=200',
        width: 1920,
        height: 1080,
        description: 'Blue gradient background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1579547945413-497e1b99f0c9',
        source: 'unsplash'
      },
      {
        id: 'blue-abstract-1',
        url: 'https://images.unsplash.com/photo-1557682250-28f91128cde1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-28f91128cde1?w=200',
        width: 1920,
        height: 1080,
        description: 'Blue abstract waves',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1557682250-28f91128cde1',
        source: 'unsplash'
      },
      {
        id: 'blue-tech-1',
        url: 'https://images.unsplash.com/photo-1530533718754-001d2668365a',
        thumbnailUrl: 'https://images.unsplash.com/photo-1530533718754-001d2668365a?w=200',
        width: 1920,
        height: 1080,
        description: 'Blue technology background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1530533718754-001d2668365a',
        source: 'unsplash'
      }
    ],
    green: [
      {
        id: 'green-gradient-1',
        url: 'https://images.unsplash.com/photo-1560015534-cee980ba7e13',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=200',
        width: 1920,
        height: 1080,
        description: 'Green gradient background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1560015534-cee980ba7e13',
        source: 'unsplash'
      },
      {
        id: 'green-abstract-1',
        url: 'https://images.unsplash.com/photo-1561059270-33e4b58d5566',
        thumbnailUrl: 'https://images.unsplash.com/photo-1561059270-33e4b58d5566?w=200',
        width: 1920,
        height: 1080,
        description: 'Green abstract shapes',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1561059270-33e4b58d5566',
        source: 'unsplash'
      }
    ],
    purple: [
      {
        id: 'purple-gradient-1',
        url: 'https://images.unsplash.com/photo-1568701349452-31dd8343bd9c',
        thumbnailUrl: 'https://images.unsplash.com/photo-1568701349452-31dd8343bd9c?w=200',
        width: 1920,
        height: 1080,
        description: 'Purple gradient background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1568701349452-31dd8343bd9c',
        source: 'unsplash'
      },
      {
        id: 'purple-abstract-1',
        url: 'https://images.unsplash.com/photo-1566909493465-8960c7370e2c',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566909493465-8960c7370e2c?w=200',
        width: 1920,
        height: 1080,
        description: 'Purple abstract waves',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1566909493465-8960c7370e2c',
        source: 'unsplash'
      }
    ],
    red: [
      {
        id: 'red-gradient-1',
        url: 'https://images.unsplash.com/photo-1484589065579-248aad0d8b13',
        thumbnailUrl: 'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=200',
        width: 1920,
        height: 1080,
        description: 'Red gradient background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1484589065579-248aad0d8b13',
        source: 'unsplash'
      }
    ],
    orange: [
      {
        id: 'orange-gradient-1',
        url: 'https://images.unsplash.com/photo-1495015584635-2598d5212bb0',
        thumbnailUrl: 'https://images.unsplash.com/photo-1495015584635-2598d5212bb0?w=200',
        width: 1920,
        height: 1080,
        description: 'Orange gradient background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1495015584635-2598d5212bb0',
        source: 'unsplash'
      }
    ],
    teal: [
      {
        id: 'teal-gradient-1',
        url: 'https://images.unsplash.com/photo-1560451098-43ac7ee39ec2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560451098-43ac7ee39ec2?w=200',
        width: 1920,
        height: 1080,
        description: 'Teal gradient background',
        creditName: 'Unsplash',
        creditUrl: 'https://unsplash.com',
        downloadUrl: 'https://images.unsplash.com/photo-1560451098-43ac7ee39ec2',
        source: 'unsplash'
      }
    ]
  };
  
  // Get the background images for the requested theme color
  const backgroundImages = themeBackgrounds[themeColor] || themeBackgrounds['blue'];
  console.log(`Providing ${backgroundImages.length} fallback images for theme: ${themeColor}`);
  
  return backgroundImages;
};

/**
 * Generate AI-based themed background suggestions based on analysis
 */
export const generateBackgroundSuggestions = async (
  analysis: ContentAnalysis,
  themeResult: ThemeSelectionResult
): Promise<StockImage[]> => {
  try {
    // Create search queries based on industry, keywords, and style
    const queries: string[] = [];
    
    // Add industry-based query
    queries.push(`${analysis.industry} ${themeResult.colorTheme} background`);
    
    // Add keyword-based queries
    if (analysis.keywords.length > 0) {
      queries.push(`${analysis.keywords[0]} ${themeResult.colorTheme} background`);
    }
    
    // Add style-based query
    queries.push(`${themeResult.designStyle} ${themeResult.colorTheme} background`);
    
    // Execute all searches in parallel
    const searchPromises = queries.map(query => 
      searchImages({
        query,
        themeColor: themeResult.colorTheme,
        count: 3,
        orientation: 'landscape'
      })
    );
    
    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);
    
    // Flatten results and remove duplicates
    const allImages = results.flat();
    const uniqueImages = removeDuplicateImages(allImages);
    
    return uniqueImages;
  } catch (error) {
    console.error('Error generating background suggestions:', error);
    return [];
  }
};

/**
 * Remove duplicate images from results
 */
const removeDuplicateImages = (images: StockImage[]): StockImage[] => {
  const seen = new Set<string>();
  return images.filter(img => {
    if (seen.has(img.id)) {
      return false;
    }
    seen.add(img.id);
    return true;
  });
};

/**
 * Generate search query for a slide using AI
 */
const generateImageSearchQuery = async (
  slide: Slide,
  themeResult: ThemeSelectionResult
): Promise<string> => {
  // Simple approach if AI generation fails
  const fallbackQuery = () => {
    const slideType = slide.slide_type || 'general';
    const keywords = SLIDE_TYPE_IMAGE_MAP[slideType] || SLIDE_TYPE_IMAGE_MAP.general;
    return `${keywords[0]} ${themeResult.colorTheme}`;
  };
  
  try {
    // Extract slide content for analysis
    const title = slide.title || '';
    const headline = slide.content?.headline || '';
    const subheadline = slide.content?.subheadline || '';
    const paragraphs = slide.content?.paragraphs?.join(' ') || '';
    const bullets = slide.content?.bullets?.join(' ') || '';
    
    // Combine all content
    const content = [title, headline, subheadline, paragraphs, bullets]
      .filter(text => text.length > 0)
      .join(' ');
    
    // If not enough content, use fallback
    if (content.length < 10) {
      return fallbackQuery();
    }
    
    // Construct a relevant query using the content and theme
    // Note: We're no longer using OpenAI API for this function
    const slideType = slide.slide_type || 'general';
    const keywords = SLIDE_TYPE_IMAGE_MAP[slideType] || SLIDE_TYPE_IMAGE_MAP.general;
    const queryTerms = [
      ...keywords,
      themeResult.designStyle,
      themeResult.colorTheme,
      // Extract potential subjects from the content
      ...content.split(' ')
        .filter(word => word.length > 5)
        .slice(0, 3)
    ];
    
    // Create a concise query from the terms
    const query = queryTerms.slice(0, 4).join(' ');
    
    // Return the constructed query instead of using fallback
    console.log('Generated image search query:', query);
    return query;
  } catch (error) {
    console.error('Error generating image search query:', error);
    return fallbackQuery();
  }
};

/**
 * Search for images using available APIs
 */
const searchImages = async (options: ImageSearchOptions): Promise<StockImage[]> => {
  // Try Unsplash first
  try {
    if (UNSPLASH_API_KEY) {
      const unsplashImages = await searchUnsplashImages(options);
      if (unsplashImages.length > 0) {
        return unsplashImages;
      }
    }
  } catch (error) {
    console.error('Unsplash search error:', error);
  }
  
  // Try Pexels as fallback
  try {
    if (PEXELS_API_KEY) {
      const pexelsImages = await searchPexelsImages(options);
      if (pexelsImages.length > 0) {
        return pexelsImages;
      }
    }
  } catch (error) {
    console.error('Pexels search error:', error);
  }
  
  // Final fallback to internal images
  return getInternalImages(options);
};

/**
 * Search for images on Unsplash
 */
const searchUnsplashImages = async (options: ImageSearchOptions): Promise<StockImage[]> => {
  const { query, themeColor, count = 5, orientation = 'landscape' } = options;
  
  // Enhance query with color if provided
  const enhancedQuery = themeColor ? `${query} ${themeColor}` : query;
  
  // Get URL from centralized config and build search URL
  const url = new URL(getUnsplashSearchUrl());
  url.searchParams.append('query', enhancedQuery);
  url.searchParams.append('per_page', count.toString());
  url.searchParams.append('orientation', orientation);
  
  // Execute search
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Map to standard format
  return data.results.map((item: any): StockImage => ({
    id: item.id,
    // Ensure we provide all the required fields from the StockImage interface
    url: item.urls.regular,
    thumbnailUrl: item.urls.thumb,
    width: item.width,
    height: item.height,
    description: item.description || item.alt_description || '',
    creditName: item.user?.name || 'Unsplash',
    creditUrl: item.user?.links?.html || 'https://unsplash.com',
    downloadUrl: item.urls.regular, // Use regular instead of full for better performance
    source: 'unsplash' as const
  }));
};

/**
 * Search for images on Pexels
 */
const searchPexelsImages = async (options: ImageSearchOptions): Promise<StockImage[]> => {
  const { query, count = 5, orientation = 'landscape' } = options;
  
  // Get URL from centralized config and build search URL
  const url = new URL(getPexelsSearchUrl());
  url.searchParams.append('query', query);
  url.searchParams.append('per_page', count.toString());
  url.searchParams.append('orientation', orientation);
  
  // Execute search
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': PEXELS_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Map to standard format
  return data.photos.map((item: any): StockImage => ({
    id: item.id.toString(),
    url: item.src.large,
    thumbnailUrl: item.src.small,
    width: item.width,
    height: item.height,
    description: item.alt || '',
    creditName: item.photographer,
    creditUrl: item.photographer_url,
    downloadUrl: item.src.original,
    source: 'pexels'
  }));
};

/**
 * Fallback to internal images when APIs fail
 */
const getInternalImages = (options: ImageSearchOptions): StockImage[] => {
  // This would normally connect to an internal library of images
  // For now, return placeholder images for each theme
  
  const { themeColor = 'blue' } = options;
  
  // Map of theme colors to placeholder images
  const placeholderImages: Partial<Record<ColorTheme, StockImage>> = {
    blue: {
      id: 'internal-blue-1',
      url: '/assets/backgrounds/blue-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/blue-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Blue abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/blue-background.jpg',
      source: 'internal'
    },
    green: {
      id: 'internal-green-1',
      url: '/assets/backgrounds/green-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/green-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Green abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/green-background.jpg',
      source: 'internal'
    },
    purple: {
      id: 'internal-purple-1',
      url: '/assets/backgrounds/purple-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/purple-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Purple abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/purple-background.jpg',
      source: 'internal'
    },
    red: {
      id: 'internal-red-1',
      url: '/assets/backgrounds/red-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/red-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Red abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/red-background.jpg',
      source: 'internal'
    },
    orange: {
      id: 'internal-orange-1',
      url: '/assets/backgrounds/orange-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/orange-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Orange abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/orange-background.jpg',
      source: 'internal'
    },
    teal: {
      id: 'internal-teal-1',
      url: '/assets/backgrounds/teal-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/teal-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Teal abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/teal-background.jpg',
      source: 'internal'
    },
    custom: {
      id: 'internal-custom-1',
      url: '/assets/backgrounds/custom-background.jpg',
      thumbnailUrl: '/assets/backgrounds/thumbs/custom-background.jpg',
      width: 1920,
      height: 1080,
      description: 'Custom abstract background',
      creditName: 'Internal',
      creditUrl: '',
      downloadUrl: '/assets/backgrounds/custom-background.jpg',
      source: 'internal'
    }
  };
  
  // Make sure we handle the case where the theme color doesn't exist in our map
  // Use a definite fallback (blue) to ensure we never return undefined
  const placeholderImage = placeholderImages[themeColor] || placeholderImages['blue'] || {
    id: 'default-fallback',
    url: '/assets/backgrounds/default-background.jpg',
    thumbnailUrl: '/assets/backgrounds/thumbs/default-background.jpg',
    width: 1920,
    height: 1080,
    description: 'Default background',
    creditName: 'Internal',
    creditUrl: '',
    downloadUrl: '/assets/backgrounds/default-background.jpg',
    source: 'internal'
  };
  return [placeholderImage];
};

// Export the public API of the stock image service
export default {
  getImagesForSlide,
  getThemedBackgrounds,
  generateBackgroundSuggestions,
  searchImages // Add searchImages to the public API
};
