/**
 * Slide Design Service
 * Handles advanced styling for presentation slides with professional design principles
 */

// Slide layout types for different content arrangements
export type SlideLayout = 'fullWidthImage' | 'splitContent' | 'imageTop' | 'imageBottom' | 'quoteFocus' | 'dataGrid' | 'centered' | 'titleOnly';

// Design elements for enhanced slide styling
export type DesignElements = {
  shapes: boolean;
  gradients: boolean;
  shadows: boolean;
  icons: boolean;
  animations: string;
  textures: boolean;
};

// Advanced styling options for professional presentations
export type SlideStyle = {
  fontPairings: {
    heading: string;
    body: string;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    highlights: string[];
  };
  spacing: 'compact' | 'balanced' | 'spacious';
  imageStyle: 'fullBleed' | 'framed' | 'rounded' | 'masked' | 'shadowed';
  designElements: DesignElements;
  brandPosition: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'none';
};

// Theme styles with professional design principles
export const professionalThemeStyles: Record<string, SlideStyle> = {
  light: {
    fontPairings: {
      heading: "'Montserrat', sans-serif",
      body: "'Open Sans', sans-serif",
    },
    colorPalette: {
      primary: '#4F46E5',
      secondary: '#A5B4FC',
      accent: '#4338CA',
      background: '#FFFFFF',
      text: '#1F2937',
      highlights: ['#EEF2FF', '#C7D2FE', '#818CF8']
    },
    spacing: 'balanced',
    imageStyle: 'shadowed',
    designElements: {
      shapes: true,
      gradients: false,
      shadows: true,
      icons: true,
      animations: 'subtle',
      textures: false,
    },
    brandPosition: 'bottomRight',
  },
  dark: {
    fontPairings: {
      heading: "'Raleway', sans-serif",
      body: "'Roboto', sans-serif",
    },
    colorPalette: {
      primary: '#4B5563',
      secondary: '#9CA3AF',
      accent: '#1E40AF',
      background: '#111827',
      text: '#F9FAFB',
      highlights: ['#1F2937', '#374151', '#6B7280']
    },
    spacing: 'compact',
    imageStyle: 'masked',
    designElements: {
      shapes: true,
      gradients: true,
      shadows: true,
      icons: true,
      animations: 'moderate',
      textures: true,
    },
    brandPosition: 'bottomRight',
  },
  royal_blue: {
    fontPairings: {
      heading: "'Poppins', sans-serif",
      body: "'Inter', sans-serif",
    },
    colorPalette: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#2563EB',
      background: '#EFF6FF',
      text: '#1E3A8A',
      highlights: ['#DBEAFE', '#93C5FD', '#60A5FA']
    },
    spacing: 'balanced',
    imageStyle: 'framed',
    designElements: {
      shapes: true,
      gradients: true,
      shadows: true,
      icons: true,
      animations: 'subtle',
      textures: false,
    },
    brandPosition: 'topRight',
  },
  coral: {
    fontPairings: {
      heading: "'Playfair Display', serif",
      body: "'Source Sans Pro', sans-serif",
    },
    colorPalette: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      accent: '#BE123C',
      background: '#FFF1F2',
      text: '#881337',
      highlights: ['#FFE4E6', '#FECDD3', '#FDA4AF']
    },
    spacing: 'spacious',
    imageStyle: 'rounded',
    designElements: {
      shapes: true,
      gradients: false,
      shadows: true,
      icons: true,
      animations: 'dynamic',
      textures: false,
    },
    brandPosition: 'bottomLeft',
  },
  forest: {
    fontPairings: {
      heading: "'Merriweather', serif",
      body: "'Lato', sans-serif",
    },
    colorPalette: {
      primary: '#059669',
      secondary: '#34D399',
      accent: '#047857',
      background: '#ECFDF5',
      text: '#064E3B',
      highlights: ['#D1FAE5', '#A7F3D0', '#6EE7B7']
    },
    spacing: 'spacious',
    imageStyle: 'fullBleed',
    designElements: {
      shapes: true,
      gradients: false,
      shadows: true,
      icons: true,
      animations: 'subtle',
      textures: true,
    },
    brandPosition: 'bottomRight',
  },
  gradient: {
    fontPairings: {
      heading: "'Outfit', sans-serif",
      body: "'Work Sans', sans-serif",
    },
    colorPalette: {
      primary: '#6366F1',
      secondary: '#A855F7',
      accent: '#EC4899',
      background: '#F5F3FF',
      text: '#4C1D95',
      highlights: ['#EDE9FE', '#DDD6FE', '#C4B5FD']
    },
    spacing: 'balanced',
    imageStyle: 'shadowed',
    designElements: {
      shapes: true,
      gradients: true,
      shadows: true,
      icons: true,
      animations: 'dynamic',
      textures: false,
    },
    brandPosition: 'topLeft',
  },
};

// Advanced layout templates for different slide types
export const slideLayouts: Record<string, SlideLayout[]> = {
  cover: ['fullWidthImage', 'centered', 'splitContent'],
  content: ['splitContent', 'imageTop', 'imageBottom'],
  data: ['dataGrid', 'splitContent'],
  quote: ['quoteFocus', 'centered'],
  team: ['imageTop', 'splitContent'],
  financials: ['dataGrid', 'splitContent'],
  conclusion: ['centered', 'fullWidthImage'],
};

const slideDesignService = {
  /**
   * Generate a professional slide design based on content and theme
   * 
   * @param slideType Type of slide (cover, content, data, etc.)
   * @param themeId Selected theme ID
   * @param content Content of the slide
   * @returns Enhanced slide design properties
   */
  generateSlideDesign(slideType: string, themeId: string, content: any) {
    // Get theme styling
    const themeStyle = professionalThemeStyles[themeId] || professionalThemeStyles.light;
    
    // Select an appropriate layout for this slide type
    const layouts = slideLayouts[slideType] || slideLayouts.content;
    const selectedLayout = layouts[Math.floor(Math.random() * layouts.length)];
    
    // Build enhanced design properties
    return {
      style: themeStyle,
      layout: selectedLayout,
      // Font imports for the presentation
      fontImports: this.getFontImports(themeStyle),
      // Generate CSS for this specific slide
      css: this.generateSlideCSS(themeStyle, selectedLayout, slideType),
      // Add decorative elements based on theme
      decorativeElements: this.generateDecorativeElements(themeStyle),
    };
  },
  
  /**
   * Get font import statements for the selected theme
   */
  getFontImports(style: SlideStyle): string {
    // Extract font names without weights or fallbacks
    const headingFont = style.fontPairings.heading.split(',')[0].replace(/'/g, '').trim();
    const bodyFont = style.fontPairings.body.split(',')[0].replace(/'/g, '').trim();
    
    return `@import url('https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;600;700&family=${bodyFont}:wght@400;500&display=swap');`;
  },
  
  /**
   * Generate CSS for a specific slide based on theme and layout
   */
  generateSlideCSS(style: SlideStyle, layout: SlideLayout, slideType: string): string {
    const { colorPalette, fontPairings, spacing } = style;
    
    // Base spacing values depending on selection
    const spacingValues = {
      compact: { padding: '30px', gap: '15px', margin: '15px' },
      balanced: { padding: '50px', gap: '25px', margin: '25px' },
      spacious: { padding: '70px', gap: '35px', margin: '35px' },
    };
    
    const currentSpacing = spacingValues[spacing];
    
    // Base CSS with variables
    let css = `
      :root {
        --primary-color: ${colorPalette.primary};
        --secondary-color: ${colorPalette.secondary};
        --accent-color: ${colorPalette.accent};
        --background-color: ${colorPalette.background};
        --text-color: ${colorPalette.text};
        --highlight-1: ${colorPalette.highlights[0]};
        --highlight-2: ${colorPalette.highlights[1]};
        --highlight-3: ${colorPalette.highlights[2]};
        --heading-font: ${fontPairings.heading};
        --body-font: ${fontPairings.body};
        --container-padding: ${currentSpacing.padding};
        --content-gap: ${currentSpacing.gap};
        --section-margin: ${currentSpacing.margin};
      }
      
      .slide-container {
        font-family: var(--body-font);
        color: var(--text-color);
        padding: var(--container-padding);
        background-color: var(--background-color);
      }
      
      h1, h2, h3 {
        font-family: var(--heading-font);
        margin-bottom: var(--content-gap);
        line-height: 1.2;
      }
      
      h1 {
        font-size: 48px;
        font-weight: 700;
        color: var(--primary-color);
      }
      
      h2 {
        font-size: 36px;
        font-weight: 600;
        color: var(--secondary-color);
      }
      
      p {
        font-size: 22px;
        line-height: 1.5;
        margin-bottom: var(--content-gap);
      }
      
      ul, ol {
        margin-left: 30px;
        margin-bottom: var(--section-margin);
      }
      
      li {
        font-size: 22px;
        margin-bottom: 15px;
        line-height: 1.4;
      }
    `;
    
    // Add layout-specific CSS
    switch (layout) {
      case 'splitContent':
        css += `
          .content-area {
            display: flex;
            gap: var(--content-gap);
          }
          
          .text-content, .media-content {
            flex: 1;
            min-width: 0;
          }
        `;
        break;
        
      case 'fullWidthImage':
        css += `
          .image-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          
          .content-overlay {
            position: relative;
            z-index: 2;
            background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6));
            color: white;
            padding: var(--container-padding);
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          .content-overlay h1, .content-overlay h2 {
            color: white;
          }
        `;
        break;
        
      case 'dataGrid':
        css += `
          .data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--content-gap);
          }
          
          .data-card {
            background-color: var(--highlight-1);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          }
          
          .data-card h3 {
            color: var(--primary-color);
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .metric {
            font-size: 36px;
            font-weight: 700;
            color: var(--secondary-color);
          }
        `;
        break;
    }
    
    // Add slide-type specific styling
    if (slideType === 'cover') {
      css += `
        .title-container {
          max-width: 70%;
        }
        
        .slide-container.cover h1 {
          font-size: 64px;
          margin-bottom: 30px;
          position: relative;
        }
        
        .title-accent {
          position: absolute;
          height: 8px;
          width: 120px;
          background-color: var(--accent-color);
          bottom: -20px;
          left: 0;
        }
      `;
    }
    
    return css;
  },
  
  /**
   * Generate decorative elements based on theme style
   */
  generateDecorativeElements(style: SlideStyle): any[] {
    const elements = [];
    const { designElements, colorPalette } = style;
    
    if (designElements.shapes) {
      elements.push({
        type: 'shape',
        shape: 'circle',
        color: colorPalette.highlights[0],
        position: { top: '10%', right: '5%' },
        size: '150px',
        opacity: 0.3,
        zIndex: 1
      });
      
      elements.push({
        type: 'shape',
        shape: 'rectangle',
        color: colorPalette.highlights[2],
        position: { bottom: '15%', left: '5%' },
        size: { width: '200px', height: '80px' },
        rotation: 45,
        opacity: 0.2,
        zIndex: 1
      });
    }
    
    if (designElements.gradients) {
      elements.push({
        type: 'gradient',
        colors: [colorPalette.primary, colorPalette.accent],
        position: 'corner',
        opacity: 0.1,
        zIndex: 0
      });
    }
    
    return elements;
  },
  
  /**
   * Add professional animations based on theme style
   */
  generateAnimations(style: SlideStyle): any {
    const animationLevel = style.designElements.animations;
    
    let animations = {
      entrance: '',
      emphasis: '',
      exit: '',
      transitions: ''
    };
    
    switch (animationLevel) {
      case 'subtle':
        animations.entrance = 'fade';
        animations.emphasis = 'highlight';
        animations.transitions = 'smooth';
        break;
        
      case 'moderate':
        animations.entrance = 'slide';
        animations.emphasis = 'pulse';
        animations.transitions = 'reveal';
        break;
        
      case 'dynamic':
        animations.entrance = 'zoom';
        animations.emphasis = 'bounce';
        animations.transitions = 'dramatic';
        break;
        
      default:
        animations.entrance = 'none';
    }
    
    return animations;
  },
  
  /**
   * Get PPTX formatting options for specific elements
   */
  getPPTXFormatting(style: SlideStyle, elementType: string): any {
    const base = {
      fontFace: style.fontPairings.body.split(',')[0].replace(/'/g, '').trim(),
      color: style.colorPalette.text,
      align: 'left',
    };
    
    switch (elementType) {
      case 'heading':
        return {
          ...base,
          fontFace: style.fontPairings.heading.split(',')[0].replace(/'/g, '').trim(),
          fontSize: 44,
          bold: true,
          color: style.colorPalette.primary,
        };
        
      case 'subheading':
        return {
          ...base,
          fontFace: style.fontPairings.heading.split(',')[0].replace(/'/g, '').trim(),
          fontSize: 32,
          bold: false,
          color: style.colorPalette.secondary,
        };
        
      case 'body':
        return {
          ...base,
          fontSize: 20,
          bullet: false,
        };
        
      case 'bullet':
        return {
          ...base,
          fontSize: 20,
          bullet: { type: 'bullet', color: style.colorPalette.accent },
        };
        
      default:
        return base;
    }
  }
};

export default slideDesignService;
