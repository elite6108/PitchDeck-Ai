/**
 * Smart Theme Selection Service
 * 
 * Automatically selects appropriate color schemes, typography, and layout styles
 * based on content analysis from the backgroundAnalysisService
 */

import { ContentAnalysis, IndustryType, ToneType, AudienceType } from '../types/analysis';
import { ColorTheme } from '../types/themes';
import { DesignStyle, FontStyle } from '../types/design';

// Theme mapping based on industry
const INDUSTRY_THEME_MAP: Record<IndustryType, ColorTheme[]> = {
  technology: ['blue', 'purple', 'teal'],
  finance: ['blue', 'green', 'teal'],
  healthcare: ['blue', 'green', 'teal'],
  education: ['blue', 'purple', 'orange'],
  retail: ['orange', 'red', 'green'],
  manufacturing: ['blue', 'orange', 'green'],
  creative: ['purple', 'red', 'orange'],
  consulting: ['blue', 'teal', 'purple'],
  real_estate: ['blue', 'green', 'teal'],
  non_profit: ['purple', 'green', 'orange'],
  food: ['orange', 'red', 'green'],
  travel: ['teal', 'blue', 'orange'],
  general: ['blue', 'purple', 'teal']
};

// Design style mapping based on industry and tone
const STYLE_MAPPING: Record<IndustryType, Record<ToneType, DesignStyle>> = {
  technology: {
    formal: 'modern',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'bold',
    informative: 'modern',
    persuasive: 'bold',
    urgent: 'bold',
    neutral: 'modern'
  },
  finance: {
    formal: 'classic',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'modern',
    informative: 'classic',
    persuasive: 'modern',
    urgent: 'bold',
    neutral: 'classic'
  },
  // Define mappings for remaining industries with defaults
  healthcare: {
    formal: 'classic',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'modern',
    informative: 'modern',
    persuasive: 'modern',
    urgent: 'bold',
    neutral: 'modern'
  },
  education: {
    formal: 'classic',
    casual: 'creative',
    technical: 'minimal',
    inspirational: 'creative',
    informative: 'modern',
    persuasive: 'modern',
    urgent: 'bold',
    neutral: 'modern'
  },
  retail: {
    formal: 'modern',
    casual: 'creative',
    technical: 'minimal',
    inspirational: 'bold',
    informative: 'modern',
    persuasive: 'bold',
    urgent: 'bold',
    neutral: 'modern'
  },
  manufacturing: {
    formal: 'classic',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'modern',
    informative: 'modern',
    persuasive: 'modern',
    urgent: 'bold',
    neutral: 'modern'
  },
  creative: {
    formal: 'modern',
    casual: 'creative',
    technical: 'modern',
    inspirational: 'creative',
    informative: 'creative',
    persuasive: 'creative',
    urgent: 'bold',
    neutral: 'creative'
  },
  consulting: {
    formal: 'classic',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'modern',
    informative: 'modern',
    persuasive: 'modern',
    urgent: 'bold',
    neutral: 'modern'
  },
  real_estate: {
    formal: 'classic',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'bold',
    informative: 'modern',
    persuasive: 'bold',
    urgent: 'bold',
    neutral: 'modern'
  },
  non_profit: {
    formal: 'classic',
    casual: 'creative',
    technical: 'minimal',
    inspirational: 'creative',
    informative: 'modern',
    persuasive: 'creative',
    urgent: 'bold',
    neutral: 'modern'
  },
  food: {
    formal: 'classic',
    casual: 'creative',
    technical: 'minimal',
    inspirational: 'creative',
    informative: 'creative',
    persuasive: 'bold',
    urgent: 'bold',
    neutral: 'creative'
  },
  travel: {
    formal: 'modern',
    casual: 'creative',
    technical: 'minimal',
    inspirational: 'creative',
    informative: 'creative',
    persuasive: 'creative',
    urgent: 'bold',
    neutral: 'creative'
  },
  general: {
    formal: 'classic',
    casual: 'modern',
    technical: 'minimal',
    inspirational: 'modern',
    informative: 'modern',
    persuasive: 'modern',
    urgent: 'bold',
    neutral: 'modern'
  }
};

// Font style mapping based on design style and audience
const FONT_STYLE_MAPPING: Record<DesignStyle, Record<AudienceType, FontStyle>> = {
  modern: {
    investors: 'sans-serif',
    customers: 'sans-serif',
    executives: 'sans-serif',
    general_public: 'sans-serif',
    technical: 'sans-serif',
    internal: 'sans-serif',
    partners: 'sans-serif',
    mixed: 'sans-serif'
  },
  classic: {
    investors: 'serif',
    customers: 'serif',
    executives: 'serif',
    general_public: 'serif',
    technical: 'serif',
    internal: 'serif',
    partners: 'serif',
    mixed: 'serif'
  },
  minimal: {
    investors: 'sans-serif',
    customers: 'sans-serif',
    executives: 'sans-serif',
    general_public: 'sans-serif',
    technical: 'sans-serif',
    internal: 'sans-serif',
    partners: 'sans-serif',
    mixed: 'sans-serif'
  },
  bold: {
    investors: 'sans-serif',
    customers: 'display',
    executives: 'sans-serif',
    general_public: 'display',
    technical: 'sans-serif',
    internal: 'sans-serif',
    partners: 'sans-serif',
    mixed: 'display'
  },
  creative: {
    investors: 'display',
    customers: 'display',
    executives: 'display',
    general_public: 'display',
    technical: 'sans-serif',
    internal: 'display',
    partners: 'display',
    mixed: 'display'
  }
};

/**
 * Interface for theme selection result
 */
export interface ThemeSelectionResult {
  colorTheme: ColorTheme;
  designStyle: DesignStyle;
  fontStyle: FontStyle;
  recommendedImageTypes: string[];
}

/**
 * Select optimal theme based on content analysis
 */
export const selectThemeFromAnalysis = (analysis: ContentAnalysis): ThemeSelectionResult => {
  try {
    // 1. Select color theme based on industry and dominant colors
    const colorTheme = selectColorTheme(analysis);
    
    // 2. Select design style based on industry and tone
    const designStyle = selectDesignStyle(analysis);
    
    // 3. Select font style based on design style and audience
    const fontStyle = selectFontStyle(designStyle, analysis.audience);
    
    // 4. Determine recommended image types based on industry and content
    const recommendedImageTypes = getRecommendedImageTypes(analysis);
    
    return {
      colorTheme,
      designStyle,
      fontStyle,
      recommendedImageTypes
    };
  } catch (error) {
    console.error('Error selecting theme:', error);
    // Return safe defaults if selection fails
    return {
      colorTheme: 'blue',
      designStyle: 'modern',
      fontStyle: 'sans-serif',
      recommendedImageTypes: ['business', 'office', 'professional']
    };
  }
};

/**
 * Select color theme based on industry and dominant colors
 */
const selectColorTheme = (analysis: ContentAnalysis): ColorTheme => {
  // If there are dominant colors specified in the analysis, use the first one
  if (analysis.dominant_colors && analysis.dominant_colors.length > 0) {
    // Map the dominant color to our nearest theme color
    const dominantColor = analysis.dominant_colors[0];
    // This would ideally use color distance calculation to find the closest match
    // For now, we'll use a simpler approach
    return mapHexToThemeColor(dominantColor);
  }
  
  // Otherwise, select a theme color based on the industry
  const industryThemes = INDUSTRY_THEME_MAP[analysis.industry] || INDUSTRY_THEME_MAP.general;
  
  // Use the first theme for the industry
  return industryThemes[0];
};

/**
 * Map a hex color to the closest theme color
 */
const mapHexToThemeColor = (hexColor: string): ColorTheme => {
  // Simple mapping based on dominant hue
  // In a real implementation, you would calculate color distance
  // between the hex color and theme colors
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Determine dominant color component
  if (r > g && r > b) return 'red';
  if (g > r && g > b) return 'green';
  if (b > r && b > g) return 'blue';
  
  // If dominant hue is not clear, use these secondary conditions
  if (r > 200 && g > 150 && b < 100) return 'orange';
  if (r > 100 && g > 100 && b > 150) return 'purple';
  if (r < 100 && g > 150 && b > 150) return 'teal';
  
  // Default fallback
  return 'blue';
};

/**
 * Select design style based on industry and tone
 */
const selectDesignStyle = (analysis: ContentAnalysis): DesignStyle => {
  return STYLE_MAPPING[analysis.industry]?.[analysis.tone] || 'modern';
};

/**
 * Select font style based on design style and audience
 */
const selectFontStyle = (designStyle: DesignStyle, audience: AudienceType): FontStyle => {
  return FONT_STYLE_MAPPING[designStyle]?.[audience] || 'sans-serif';
};

/**
 * Get recommended image types based on industry and content keywords
 */
const getRecommendedImageTypes = (analysis: ContentAnalysis): string[] => {
  // Base image types on industry
  const baseTypes: Record<IndustryType, string[]> = {
    technology: ['technology', 'digital', 'office', 'innovation'],
    finance: ['finance', 'business', 'professional', 'office'],
    healthcare: ['healthcare', 'medical', 'professional', 'care'],
    education: ['education', 'learning', 'classroom', 'students'],
    retail: ['retail', 'store', 'shopping', 'products'],
    manufacturing: ['factory', 'industrial', 'machinery', 'production'],
    creative: ['creative', 'design', 'art', 'colorful'],
    consulting: ['business', 'meeting', 'professional', 'office'],
    real_estate: ['real estate', 'property', 'architecture', 'homes'],
    non_profit: ['community', 'people', 'volunteer', 'collaboration'],
    food: ['food', 'restaurant', 'cooking', 'ingredients'],
    travel: ['travel', 'destination', 'landscape', 'adventure'],
    general: ['business', 'professional', 'abstract', 'modern']
  };
  
  // Get base image types for the industry
  const industryTypes = baseTypes[analysis.industry] || baseTypes.general;
  
  // Add any relevant keywords from the analysis
  const keywordTypes = analysis.keywords
    .filter(keyword => keyword.length > 3) // Only use substantial keywords
    .slice(0, 2); // Limit to 2 keywords to avoid too much specificity
  
  // Create final recommendations (up to 5 types)
  return [...industryTypes, ...keywordTypes].slice(0, 5);
};

export default {
  selectThemeFromAnalysis
};
