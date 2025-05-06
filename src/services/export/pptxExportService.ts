/**
 * PPTX Export Service
 * 
 * Provides functionality to export deck to PPTX format.
 */
import pptxgen from 'pptxgenjs';
import { PitchDeck, Slide } from '../../types/deck';
import { ColorTheme, DesignStyle } from '../../types/themes';
import { getThemeColors } from '../../utils/colorUtils';

interface ExportProgressCallback {
  (progress: number): void;
}

/**
 * Export deck to PPTX
 * 
 * @param deck - The pitch deck to export
 * @param onProgress - Callback for reporting export progress
 * @returns Promise that resolves when export is complete
 */
export const exportToPPTX = async (
  deck: PitchDeck,
  onProgress: ExportProgressCallback
): Promise<pptxgen> => {
  if (!deck.slides || deck.slides.length === 0) {
    throw new Error('No slides to export');
  }
  
  onProgress(10);
  
  // Create PowerPoint presentation
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = deck.title || 'Pitch Deck';
  pptx.subject = deck.title ? `${deck.title} Presentation` : '';
  pptx.company = '';
  pptx.author = '';
  
  try {
    // Process each slide
    for (let i = 0; i < deck.slides.length; i++) {
      const slide = deck.slides[i];
      
      // Update progress based on slide position
      const progress = 20 + Math.floor((i / deck.slides.length) * 70);
      onProgress(progress);
      
      // Add slide to presentation
      await addSlideToPPTX(pptx, slide);
    }
    
    onProgress(95);
    
    return pptx;
    
  } catch (error) {
    console.error('Error generating PPTX:', error);
    throw error;
  }
};

/**
 * Add a slide to the PowerPoint presentation
 * 
 * @param pptx - PowerPoint presentation object
 * @param slide - Slide to add
 */
const addSlideToPPTX = async (
  pptx: pptxgen,
  slide: Slide
): Promise<void> => {
  const pptxSlide = pptx.addSlide();
  
  // Get slide properties
  const slideType = slide.slide_type || 'content';
  const theme = slide.content?.color_theme as ColorTheme || 'blue';
  const designStyle = slide.content?.design_style as DesignStyle || 'modern';
  
  // Apply theme colors
  const themeColors = getThemeColors(theme);
  pptxSlide.background = { color: themeColors.background };
  
  // Add title
  if (slide.title || slide.content?.headline) {
    pptxSlide.addText(slide.content?.headline || slide.title || '', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 1.0,
      fontSize: slideType === 'cover' ? 44 : 36,
      color: themeColors.primary,
      bold: true,
      fontFace: getFontForDesignStyle(designStyle, 'heading')
    });
  }
  
  // Add paragraphs
  if (slide.content?.paragraphs && slide.content.paragraphs.length > 0) {
    const paragraphs = slide.content.paragraphs.join('\n\n');
    
    pptxSlide.addText(paragraphs, {
      x: 0.5,
      y: slideType === 'cover' ? 2.0 : 1.8,
      w: '90%',
      h: 3.0,
      fontSize: 18,
      color: slideType === 'cover' ? themeColors.primary : themeColors.secondary,
      fontFace: getFontForDesignStyle(designStyle, 'body')
    });
  }
  
  // Add bullet points
  if (slide.content?.bullets && slide.content.bullets.length > 0) {
    const bulletContent = slide.content.bullets.map(bullet => ({ text: bullet }));
    
    pptxSlide.addText(bulletContent, {
      x: 0.5,
      y: slide.content.paragraphs && slide.content.paragraphs.length > 0 ? 3.5 : 1.8,
      w: '90%',
      h: 4.0,
      fontSize: 18,
      color: themeColors.secondary,
      bullet: { type: 'bullet' },
      fontFace: getFontForDesignStyle(designStyle, 'body')
    });
  }
  
  // Add image if available
  if (slide.content?.image_url) {
    try {
      // Note: In production, you would need to handle image download properly
      pptxSlide.addImage({
        path: slide.content.image_url,
        x: slideType === 'cover' ? 0 : 5.5,
        y: slideType === 'cover' ? 0 : 1.8,
        w: slideType === 'cover' ? '100%' : '40%',
        h: slideType === 'cover' ? '100%' : 4
      });
      
      // Add semi-transparent overlay for cover slides for better text visibility
      if (slideType === 'cover') {
        pptxSlide.addShape('rect', {
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
          fill: { color: themeColors.primary, transparency: 0.8 }
        });
      }
    } catch (error) {
      console.warn('Error adding image to slide:', error);
    }
  }
  
  // Add footer
  pptxSlide.addText(slide.title || '', {
    x: 0.5,
    y: 6.8,
    w: 9,
    h: 0.3,
    fontSize: 12,
    color: themeColors.secondary,
    fontFace: getFontForDesignStyle(designStyle, 'body')
  });
};

/**
 * Get appropriate font based on design style
 * 
 * @param designStyle - Design style of the slide
 * @param type - Type of text (heading or body)
 * @returns Font face name
 */
const getFontForDesignStyle = (
  designStyle: DesignStyle,
  type: 'heading' | 'body'
): string => {
  switch (designStyle) {
    case 'bold':
      return type === 'heading' ? 'Impact' : 'Arial';
    case 'minimal':
      return type === 'heading' ? 'Century Gothic' : 'Calibri';
    case 'creative':
      return type === 'heading' ? 'Georgia' : 'Verdana';
    case 'classic':
      return type === 'heading' ? 'Times New Roman' : 'Garamond';
    case 'modern':
    default:
      return type === 'heading' ? 'Segoe UI' : 'Calibri';
  }
};

export default {
  exportToPPTX
};
