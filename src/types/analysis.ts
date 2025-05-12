/**
 * Types for content analysis and styling
 */

// Industry types supported for specialized styling
export type IndustryType = 
  | 'technology' 
  | 'finance' 
  | 'healthcare' 
  | 'education' 
  | 'retail' 
  | 'manufacturing' 
  | 'creative' 
  | 'consulting'
  | 'real_estate' 
  | 'non_profit' 
  | 'food' 
  | 'travel' 
  | 'general';

// Tone types for content
export type ToneType = 
  | 'formal' 
  | 'casual' 
  | 'technical' 
  | 'inspirational' 
  | 'informative' 
  | 'persuasive' 
  | 'urgent' 
  | 'neutral';

// Audience types for targeted styling
export type AudienceType = 
  | 'investors' 
  | 'customers' 
  | 'executives' 
  | 'general_public'
  | 'technical' 
  | 'internal' 
  | 'partners' 
  | 'mixed';

// Content density levels
export type ContentDensityType = 'light' | 'medium' | 'heavy';

/**
 * Content analysis result
 */
export interface ContentAnalysis {
  // Core classification
  industry: IndustryType;
  tone: ToneType;
  audience: AudienceType;
  
  // Content characteristics
  keywords: string[];
  contentDensity: ContentDensityType;
  hasData: boolean;
  
  // Visual style recommendations
  dominant_colors: string[]; // Hex color codes
  style_keywords: string[];
}

/**
 * Styling status for a deck
 */
export type StylingStatus = 'not_started' | 'in_progress' | 'complete';
