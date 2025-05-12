/**
 * Slide Type Utilities
 * 
 * Utilities for determining slide types and layouts.
 */
import { DesignStyle } from '../types/themes';

/**
 * Type for slide layout options
 */
export type SlideLayout = 
  | 'centered'
  | 'splitContent'
  | 'imageTop'
  | 'imageSide'
  | 'fullWidthImage'
  | 'dataGrid'
  | 'bullets'
  | 'quote'
  | 'comparison';

/**
 * Slide type options
 */
export type SlideType = 
  | 'cover'
  | 'intro'
  | 'content'
  | 'bullets'
  | 'data'
  | 'quote'
  | 'comparison'
  | 'closing'
  | 'financials'
  | 'team'
  | 'timeline';

/**
 * Get recommended layout based on slide type
 * @param slideType - Type of slide
 * @returns Recommended layout for the slide type
 */
export function getRecommendedLayoutForSlideType(slideType: SlideType): SlideLayout {
  switch (slideType) {
    case 'cover':
      return 'fullWidthImage';
    case 'intro':
      return 'centered';
    case 'bullets':
      return 'bullets';
    case 'data':
    case 'financials':
      return 'dataGrid';
    case 'quote':
      return 'quote';
    case 'comparison':
      return 'comparison';
    case 'team':
      return 'imageSide';
    case 'timeline':
      return 'splitContent';
    case 'closing':
      return 'centered';
    default:
      return 'splitContent';
  }
}

/**
 * Determine slide type from content
 * @param content - Slide content object
 * @returns Estimated slide type based on content
 */
export function getSlideTypeFromContent(content: any): SlideType {
  if (!content) return 'content';
  
  // Check for cover slide
  if (content.isCover) return 'cover';
  
  // Check for bullet points
  if (content.bullets && content.bullets.length > 3) return 'bullets';
  
  // Check for data/charts
  if (content.chartData || content.tableData) return 'data';
  
  // Check for quotes
  if (content.quote) return 'quote';
  
  // Check for team slide
  if (content.team || content.teamMembers) return 'team';
  
  // Default to general content
  return 'content';
}

/**
 * Get appropriate font size scale based on design style
 * @param designStyle - Design style of the slide
 * @returns Object with font size scales for different elements
 */
export function getFontSizeScale(designStyle: DesignStyle): { 
  heading: string, 
  subheading: string, 
  body: string, 
  caption: string 
} {
  switch (designStyle) {
    case 'bold':
      return {
        heading: 'text-4xl sm:text-5xl lg:text-6xl',
        subheading: 'text-2xl sm:text-3xl lg:text-4xl',
        body: 'text-base sm:text-lg',
        caption: 'text-sm'
      };
    case 'minimal':
      return {
        heading: 'text-3xl sm:text-4xl lg:text-5xl',
        subheading: 'text-xl sm:text-2xl lg:text-3xl',
        body: 'text-sm sm:text-base',
        caption: 'text-xs'
      };
    case 'creative':
      return {
        heading: 'text-4xl sm:text-5xl lg:text-6xl',
        subheading: 'text-2xl sm:text-3xl lg:text-4xl',
        body: 'text-base sm:text-lg',
        caption: 'text-sm'
      };
    case 'modern':
    case 'classic':
    default:
      return {
        heading: 'text-3xl sm:text-4xl lg:text-5xl',
        subheading: 'text-xl sm:text-2xl lg:text-3xl',
        body: 'text-base sm:text-lg',
        caption: 'text-xs sm:text-sm'
      };
  }
}
