/**
 * Theme-related type definitions
 */

// Color themes available in the application
export type ColorTheme = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'red' 
  | 'orange' 
  | 'teal' 
  | 'custom'
  | 'coral'
  | 'light'
  | 'dark'
  | 'royal_blue';

// Theme interface for consistent styling
export interface Theme {
  id: string;
  name: string;
  colorTheme: ColorTheme;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}
