/**
 * AI Slide Design Service
 * Intelligently analyzes business content and creates custom slide designs
 */
import { OpenAI } from 'openai';
import { SlideStyle, SlideLayout, professionalThemeStyles } from './slideDesignService';
import { PitchDeck, Slide } from '../types/deck';

// Initialize OpenAI for content analysis
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Industry-specific style recommendations
const industryStyleGuides: Record<string, any> = {
  technology: {
    colorThemes: ['gradient', 'royal_blue'],
    layouts: ['splitContent', 'dataGrid'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: true
    },
    imageStyles: ['modern', 'sleek', 'digital']
  },
  healthcare: {
    colorThemes: ['light', 'forest'],
    layouts: ['centered', 'imageTop'],
    designElements: {
      shapes: true,
      gradients: false,
      icons: true,
      shadows: false
    },
    imageStyles: ['professional', 'clean', 'caring']
  },
  finance: {
    colorThemes: ['dark', 'royal_blue'],
    layouts: ['splitContent', 'dataGrid'],
    designElements: {
      shapes: false,
      gradients: false,
      icons: true,
      shadows: true
    },
    imageStyles: ['corporate', 'professional', 'trustworthy']
  },
  education: {
    colorThemes: ['light', 'coral'],
    layouts: ['imageTop', 'splitContent'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: false
    },
    imageStyles: ['friendly', 'bright', 'engaging']
  },
  ecommerce: {
    colorThemes: ['coral', 'gradient'],
    layouts: ['fullWidthImage', 'splitContent'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: true
    },
    imageStyles: ['vibrant', 'product-focused', 'lifestyle']
  },
  creative: {
    colorThemes: ['gradient', 'coral'],
    layouts: ['fullWidthImage', 'centered'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: true
    },
    imageStyles: ['artistic', 'expressive', 'bold']
  },
  // Default for other industries
  default: {
    colorThemes: ['light', 'royal_blue'],
    layouts: ['splitContent', 'centered'],
    designElements: {
      shapes: true,
      gradients: false,
      icons: true,
      shadows: true
    },
    imageStyles: ['professional', 'clean', 'versatile']
  }
};

// Define custom fonts for different business tones
const businessToneFonts: Record<string, {heading: string, body: string}> = {
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

// Type for AI analysis results
type ContentAnalysis = {
  industry: string;
  businessTone: string;
  keyThemes: string[];
  colorSuggestions: string[];
  recommendedStyle: string;
  slideSpecificStyles?: Record<string, any>;
};

const aiSlideDesignService = {
  /**
   * Analyze a pitch deck to determine appropriate styling
   * 
   * @param deck The pitch deck to analyze
   * @returns Analysis results with style recommendations
   */
  async analyzeDeckContent(deck: PitchDeck): Promise<ContentAnalysis> {
    try {
      // Skip analysis if no OpenAI key or if in development without external API calls
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        return this.getFallbackAnalysis(deck);
      }
      
      // Extract relevant content for analysis
      const contentForAnalysis = this.extractContentForAnalysis(deck);
      
      // Use OpenAI to analyze deck content
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional presentation designer who will analyze pitch deck content and recommend optimal styling. Respond ONLY with valid JSON.`
          },
          {
            role: "user",
            content: `Analyze this pitch deck content and provide style recommendations in JSON format with these fields:
            - industry: The business industry this seems to be for
            - businessTone: The appropriate tone (professional, creative, technical, friendly, luxurious, modern, traditional)
            - keyThemes: Key themes or concepts that should influence design
            - colorSuggestions: 2-3 main colors that would work well (hex codes)
            - recommendedStyle: A single word description of the style (e.g., "corporate", "playful", "innovative")

            Here's the content:
            ${JSON.stringify(contentForAnalysis)}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      
      // Parse results
      const analysisJson = response.choices[0]?.message?.content || '';
      const analysis = JSON.parse(analysisJson) as ContentAnalysis;
      
      // Enhance analysis with slide-specific recommendations
      return this.enhanceAnalysisWithSpecifics(analysis, deck);
      
    } catch (error) {
      console.error("Error analyzing deck content:", error);
      // Fallback to default analysis
      return this.getFallbackAnalysis(deck);
    }
  },
  
  /**
   * Generate custom slide design based on content analysis
   * 
   * @param analysis Content analysis results
   * @param slideType Type of slide
   * @param slideContent Content of the slide
   * @returns Custom slide design properties
   */
  generateCustomSlideDesign(analysis: ContentAnalysis, slideType: string, slideContent: any) {
    // Select industry style guide
    const industryGuide = industryStyleGuides[analysis.industry] || industryStyleGuides.default;
    
    // Create a custom theme style based on analysis
    const customStyle: SlideStyle = {
      fontPairings: businessToneFonts[analysis.businessTone] || businessToneFonts.professional,
      colorPalette: {
        primary: analysis.colorSuggestions[0] || '#4F46E5',
        secondary: analysis.colorSuggestions[1] || '#A5B4FC',
        accent: analysis.colorSuggestions[2] || '#4338CA',
        background: '#FFFFFF',
        text: '#1F2937',
        highlights: ['#EEF2FF', '#C7D2FE', '#818CF8']
      },
      spacing: 'balanced',
      imageStyle: 'shadowed',
      designElements: {
        shapes: industryGuide.designElements.shapes,
        gradients: industryGuide.designElements.gradients,
        shadows: industryGuide.designElements.shadows,
        icons: industryGuide.designElements.icons,
        animations: 'subtle',
        textures: false,
      },
      brandPosition: 'bottomRight',
    };
    
    // Determine suitable layout based on content and industry
    const layouts = industryGuide.layouts;
    let selectedLayout: SlideLayout = 'centered';
    
    // Cover slides get special treatment
    if (slideType === 'cover') {
      selectedLayout = 'fullWidthImage';
    } 
    // Data heavy slides
    else if (slideType === 'data' || slideType === 'financials') {
      selectedLayout = 'dataGrid';
    }
    // Team slides
    else if (slideType === 'team') {
      selectedLayout = 'imageTop';
    }
    // Content slides - select based on industry preference
    else {
      selectedLayout = layouts[0] as SlideLayout;
    }
    
    // Apply slide-specific styles if available
    if (analysis.slideSpecificStyles && analysis.slideSpecificStyles[slideType]) {
      const specificStyle = analysis.slideSpecificStyles[slideType];
      if (specificStyle.layout) {
        selectedLayout = specificStyle.layout;
      }
    }
    
    // Build enhanced design properties
    return {
      style: customStyle,
      layout: selectedLayout,
      // Font imports for the presentation
      fontImports: this.getFontImports(customStyle),
      // Generate CSS for this specific slide
      css: this.generateSlideCSS(customStyle, selectedLayout, slideType, analysis),
      // Add decorative elements based on theme
      decorativeElements: this.generateDecorativeElements(customStyle, analysis.recommendedStyle),
    };
  },
  
  /**
   * Apply AI-generated style to all slides in a deck
   * 
   * @param deck Pitch deck to style
   * @returns Updated deck with AI styling
   */
  async applyIntelligentStyling(deck: PitchDeck): Promise<PitchDeck> {
    // Clone the deck to avoid modifying the original
    const styledDeck = { ...deck };
    
    // Analyze the deck content
    const analysis = await this.analyzeDeckContent(deck);
    
    // Apply custom styling to each slide
    if (styledDeck.slides) {
      styledDeck.slides = styledDeck.slides.map(slide => {
        const slideType = slide.slide_type || 'content';
        
        // Update slide content with AI-generated styling
        if (slide.content) {
          slide.content = {
            ...slide.content,
            color_theme: analysis.industry === 'technology' ? 'gradient' : 
                         analysis.industry === 'finance' ? 'dark' : 
                         analysis.industry === 'healthcare' ? 'forest' : 'light',
            design_style: analysis.recommendedStyle || 'modern',
            ai_styling: true,
            custom_design: this.generateCustomSlideDesign(analysis, slideType, slide.content)
          };
        }
        
        return slide;
      });
    }
    
    return styledDeck;
  },
  
  /**
   * Get font import statements for custom styles
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
  generateSlideCSS(style: SlideStyle, layout: SlideLayout, slideType: string, analysis: ContentAnalysis): string {
    const { colorPalette, fontPairings } = style;
    
    // Base spacing values
    const spacing = {
      compact: { padding: '30px', gap: '15px', margin: '15px' },
      balanced: { padding: '50px', gap: '25px', margin: '25px' },
      spacious: { padding: '70px', gap: '35px', margin: '35px' },
    };
    
    const currentSpacing = spacing[style.spacing];
    
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
    
    // Add style variation based on the recommended style
    switch (analysis.recommendedStyle) {
      case 'corporate':
        css += `
          .slide-container {
            background-color: #FFFFFF;
          }
          h1 { color: #1A365D; }
          h2 { color: #2C5282; }
        `;
        break;
      case 'playful':
        css += `
          h1 { 
            color: ${colorPalette.accent};
            font-weight: 800;
          }
          .slide-container {
            background: linear-gradient(120deg, ${colorPalette.background} 0%, ${colorPalette.highlights[0]} 100%);
          }
        `;
        break;
      case 'innovative':
      case 'tech':
        css += `
          .slide-container {
            background-color: #050A24;
            color: #E2E8F0;
          }
          h1 { color: #9F7AEA; }
          h2 { color: #6B8AF2; }
          p, li { color: #CBD5E0; }
        `;
        break;
    }
    
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
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7));
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
   * Generate decorative elements based on theme style and recommended style
   */
  generateDecorativeElements(style: SlideStyle, recommendedStyle: string): any[] {
    const elements = [];
    const { designElements, colorPalette } = style;
    
    // Add different decorative elements based on recommended style
    if (recommendedStyle === 'innovative' || recommendedStyle === 'tech') {
      // More tech-oriented decorative elements
      elements.push({
        type: 'shape',
        shape: 'rectangle',
        color: colorPalette.primary,
        position: { top: '15%', right: '5%' },
        size: { width: '80px', height: '5px' },
        opacity: 0.8,
        zIndex: 1
      });
      
      elements.push({
        type: 'shape',
        shape: 'rectangle',
        color: colorPalette.secondary,
        position: { top: '18%', right: '5%' },
        size: { width: '40px', height: '5px' },
        opacity: 0.8,
        zIndex: 1
      });
    } else if (recommendedStyle === 'playful') {
      // Playful decorative elements
      elements.push({
        type: 'shape',
        shape: 'circle',
        color: colorPalette.accent,
        position: { top: '10%', right: '10%' },
        size: '80px',
        opacity: 0.6,
        zIndex: 1
      });
      
      elements.push({
        type: 'shape',
        shape: 'circle',
        color: colorPalette.secondary,
        position: { bottom: '15%', left: '8%' },
        size: '120px',
        opacity: 0.3,
        zIndex: 1
      });
    } else {
      // Default/corporate decorative elements
      if (designElements.shapes) {
        elements.push({
          type: 'shape',
          shape: 'rectangle',
          color: colorPalette.primary,
          position: { top: '0', left: '0' },
          size: { width: '100%', height: '8px' },
          opacity: 1,
          zIndex: 1
        });
      }
    }
    
    // Add gradient if specified
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
   * Extract relevant content from a deck for analysis
   */
  extractContentForAnalysis(deck: PitchDeck): any {
    const content = {
      title: deck.title || '',
      slides: [] as any[]
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
  },
  
  /**
   * Add slide-specific style recommendations to analysis
   */
  enhanceAnalysisWithSpecifics(analysis: ContentAnalysis, deck: PitchDeck): ContentAnalysis {
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
  },
  
  /**
   * Create fallback analysis when AI analysis is not available
   */
  getFallbackAnalysis(deck: PitchDeck): ContentAnalysis {
    // Extract some keywords from the deck content to make educated guesses
    const keywords = this.extractKeywords(deck);
    
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
      colorSuggestions: industryStyleGuides[industry].colorThemes.map((theme: string) => 
        professionalThemeStyles[theme].colorPalette.primary
      ),
      recommendedStyle: industry === 'technology' ? 'innovative' : 
                      industry === 'finance' ? 'corporate' : 'professional'
    };
  },
  
  /**
   * Extract keywords from deck content for fallback analysis
   */
  extractKeywords(deck: PitchDeck): string[] {
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
  }
};

export default aiSlideDesignService;
