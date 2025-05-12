/**
 * Theme Type Definitions
 * 
 * Core type definitions for themes and styling used throughout the application.
 */

/**
 * ColorTheme - Possible color theme values
 */
export type ColorTheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'light' | 'dark' | 'royal_blue' | 'coral' | 'forest' | 'gradient' | 'custom' | undefined;

/**
 * DesignStyle - Possible design style values
 */
export type DesignStyle = 'bold' | 'modern' | 'classic' | 'minimal' | 'creative' | undefined;

/**
 * ThemeOption - Interface for theme selection options
 */
export interface ThemeOption {
  id: string;
  name: string;
  colors: ThemeColors;
  previewImageUrl: string;
}

/**
 * ThemeColors - Interface for theme color definitions
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

/**
 * ThemeSelectorProps - Props for ThemeSelector component
 */
export interface ThemeSelectorProps {
  currentTheme: string;
  onThemeSelect: (themeId: string) => void;
  onBackgroundSelect: (imageUrl: string) => void;
}
