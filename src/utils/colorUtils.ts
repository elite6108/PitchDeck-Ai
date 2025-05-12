/**
 * Color Utilities
 * 
 * Utilities for color manipulation and theme helpers.
 */
import { ColorTheme, ThemeColors } from '../types/themes';

/**
 * Default color palettes for different themes
 */
export const themeColorPalettes: Record<string, ThemeColors> = {
  light: {
    primary: '#4F46E5',
    secondary: '#A5B4FC',
    accent: '#4338CA',
    background: '#FFFFFF'
  },
  dark: {
    primary: '#4B5563',
    secondary: '#9CA3AF',
    accent: '#1E40AF',
    background: '#111827'
  },
  royal_blue: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#2563EB',
    background: '#EFF6FF'
  },
  coral: {
    primary: '#F43F5E',
    secondary: '#FB7185',
    accent: '#BE123C',
    background: '#FFF1F2'
  },
  forest: {
    primary: '#059669',
    secondary: '#34D399',
    accent: '#047857',
    background: '#ECFDF5'
  },
  gradient: {
    primary: '#6366F1',
    secondary: '#A855F7',
    accent: '#EC4899',
    background: '#F5F3FF'
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#93C5FD',
    accent: '#1D4ED8',
    background: '#EFF6FF'
  },
  green: {
    primary: '#10B981',
    secondary: '#6EE7B7',
    accent: '#059669',
    background: '#ECFDF5'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    accent: '#7C3AED',
    background: '#F5F3FF'
  },
  red: {
    primary: '#EF4444',
    secondary: '#FCA5A5',
    accent: '#DC2626',
    background: '#FEF2F2'
  },
  orange: {
    primary: '#F97316',
    secondary: '#FDBA74',
    accent: '#EA580C',
    background: '#FFF7ED'
  },
  teal: {
    primary: '#14B8A6',
    secondary: '#5EEAD4',
    accent: '#0D9488',
    background: '#F0FDFA'
  }
};

/**
 * Generate contrast color for text based on background color
 * @param backgroundColor - The background color in hex format
 * @returns Appropriate text color (black or white)
 */
export function generateContrastTextColor(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Get a complete theme colors object based on theme name
 * @param theme - The color theme name
 * @returns ThemeColors object with color values
 */
export function getThemeColors(theme: ColorTheme): ThemeColors {
  if (!theme || !(theme in themeColorPalettes)) {
    // Default to blue theme if not found
    return themeColorPalettes.blue;
  }
  
  return themeColorPalettes[theme as string];
}

/**
 * Lighten or darken a color by a percentage
 * @param color - The color in hex format
 * @param percent - Percentage to lighten (positive) or darken (negative)
 * @returns Modified color in hex format
 */
export function adjustColorBrightness(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  const adjustValue = (value: number): number => {
    const adjustment = Math.floor(value * (percent / 100));
    return Math.max(0, Math.min(255, value + adjustment));
  };
  
  const rr = adjustValue(r).toString(16).padStart(2, '0');
  const gg = adjustValue(g).toString(16).padStart(2, '0');
  const bb = adjustValue(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
}

/**
 * Generate a CSS gradient string from primary and accent colors
 * @param primary - Primary color in hex format
 * @param accent - Accent color in hex format
 * @param direction - Direction of gradient (default: 'to right')
 * @returns CSS gradient string
 */
export function generateGradient(
  primary: string, 
  accent: string, 
  direction: string = 'to right'
): string {
  return `linear-gradient(${direction}, ${primary}, ${accent})`;
}
