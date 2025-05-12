/**
 * Font Styles
 * 
 * Font definitions for different business tones and design styles
 */

// Define custom fonts for different business tones
export const businessToneFonts: Record<string, {heading: string, body: string}> = {
  professional: {
    heading: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  creative: {
    heading: "'Playfair Display', serif",
    body: "'Source Sans Pro', sans-serif",
  },
  technical: {
    heading: "'Roboto', sans-serif",
    body: "'Roboto Mono', monospace",
  },
  friendly: {
    heading: "'Nunito', sans-serif",
    body: "'Lato', sans-serif",
  },
  luxurious: {
    heading: "'Cormorant Garamond', serif",
    body: "'Raleway', sans-serif",
  },
  modern: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  traditional: {
    heading: "'Merriweather', serif",
    body: "'Source Serif Pro', serif",
  }
};

// Font pairings for different design styles
export const designStyleFonts: Record<string, {heading: string, body: string}> = {
  bold: {
    heading: "'Archivo Black', sans-serif",
    body: "'Roboto', sans-serif",
  },
  modern: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  classic: {
    heading: "'Playfair Display', serif",
    body: "'Source Serif Pro', serif",
  },
  minimal: {
    heading: "'Work Sans', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  creative: {
    heading: "'Abril Fatface', cursive",
    body: "'Nunito', sans-serif",
  }
};
