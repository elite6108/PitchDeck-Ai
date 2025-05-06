/**
 * PDF Export Service
 * 
 * Provides functionality to export deck to PDF format with vibrant backgrounds and clear text.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PitchDeck, Slide } from '../../types/deck';


/**
 * Callback function for reporting export progress
 */
export interface ExportProgressCallback {
  (progress: number): void;
}

/**
 * Get a color value for a theme
 * 
 * @param theme - Theme to get color for
 * @returns CSS color value
 */
export const getThemeColorValue = (theme: string): string => {
  const themeColors: Record<string, string> = {
    'blue': '#1e3a8a',     // Dark blue
    'green': '#064e3b',    // Dark green
    'red': '#7f1d1d',      // Dark red
    'purple': '#581c87',   // Dark purple
    'gray': '#1f2937',     // Dark gray
    'yellow': '#854d0e',   // Dark yellow
    'orange': '#7c2d12',   // Dark orange
    'teal': '#134e4a',     // Dark teal
    'custom': '#1e293b'    // Default dark slate
  };
  return themeColors[theme] || '#0f172a';
};

/**
 * Convert a background value to a valid CSS background
 * 
 * @param backgroundValue - Background value to convert
 * @param defaultColor - Default color to use if no valid background is found
 * @returns A valid CSS background
 */
export const convertBackground = (backgroundValue: string | undefined, defaultColor: string = '#0f172a'): string => {
  if (!backgroundValue) return defaultColor;
  if (backgroundValue.startsWith('#') || backgroundValue.startsWith('rgb')) return backgroundValue;
  if (backgroundValue.startsWith('url(') || backgroundValue.includes('http')) {
    // It's an image URL - ensure it's wrapped in url() and properly formatted
    if (!backgroundValue.startsWith('url(')) {
      return `url(${backgroundValue})`;
    }
    // Filter out document images
    if (backgroundValue.includes('document')) {
      return defaultColor;
    }
    return backgroundValue;
  }
  return defaultColor;
};

/**
 * Sanitize gradient backgrounds to prevent non-finite color stop values
 * 
 * @param cssValue - The CSS gradient value to sanitize
 * @param fallbackColor - The fallback color to use if the gradient is invalid
 * @returns A sanitized CSS gradient or the fallback color
 */
export const sanitizeGradient = (cssValue: string, fallbackColor: string = '#0f172a'): string => {
  // Return fallback if no value or not a gradient
  if (!cssValue || (!cssValue.includes('gradient('))) {
    return cssValue || fallbackColor;
  }
  
  try {
    // Handle linear-gradient and radial-gradient
    if (cssValue.includes('linear-gradient') || cssValue.includes('radial-gradient')) {
      // Parse color stops and remove any with non-finite values
      const colorStopRegex = /(rgba?|hsla?)\(.*?\)\s+\d*\.?\d+%?|\d*\.?\d+%/g;
      const colorStops = cssValue.match(colorStopRegex) || [];
      
      // If we have fewer than 2 valid color stops, the gradient is invalid
      if (colorStops.length < 2) {
        return fallbackColor;
      }
      
      // Check for NaN or Infinity in color stop percentages
      const hasInvalidStop = colorStops.some(stop => {
        const percentMatch = stop.match(/([+-]?\d*\.?\d+)%?$/); 
        if (percentMatch && percentMatch[1]) {
          const value = parseFloat(percentMatch[1]);
          return isNaN(value) || !isFinite(value);
        }
        return false;
      });
      
      if (hasInvalidStop) {
        // Replace with a simple gradient using the theme color
        return `linear-gradient(to bottom, ${fallbackColor}, ${fallbackColor})`;
      }
    }
    
    return cssValue;
  } catch (error) {
    console.warn('Error sanitizing gradient:', error);
    return fallbackColor;
  }
};

/**
 * Render a slide element to a canvas
 * 
 * @param slide - HTML element to render
 * @param width - Width of the canvas (unused but kept for API compatibility)
 * @param height - Height of the canvas (unused but kept for API compatibility)
 * @param theme - Color theme of the slide (unused but kept for API compatibility)
 * @param scale - Scale factor for rendering (higher = better quality but slower)
 * @returns Promise that resolves to a canvas element
 */
export const renderSlideToCanvas = async (
  slide: HTMLElement, 
  _width: number,
  _height: number,
  _theme: string,
  scale: number = 3
): Promise<HTMLCanvasElement> => {
  // Create a clean copy of the slide to avoid modifying the original
  const slideClone = slide.cloneNode(true) as HTMLElement;
  
  // Set explicit dimensions for better rendering accuracy
  slideClone.style.width = '1920px';
  slideClone.style.height = '1080px';
  slideClone.style.position = 'absolute';
  slideClone.style.overflow = 'hidden';
  
  // Remove any nested .slide-for-export elements to avoid duplicates
  const nestedSlides = slideClone.querySelectorAll('.slide-for-export');
  nestedSlides.forEach(nestedSlide => {
    if (nestedSlide !== slideClone) {
      (nestedSlide as HTMLElement).style.display = 'none';
    }
  });
  
  // Remove any standalone image elements that might be causing duplicate slides
  const standaloneImages = slideClone.querySelectorAll('.slide-image-only, .image-container');
  standaloneImages.forEach(img => {
    (img as HTMLElement).style.display = 'none';
  });
  
  // Force image loading to complete before rendering
  const images = Array.from(slideClone.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>(resolve => {
        const onLoad = (): void => {
          img.removeEventListener('load', onLoad);
          resolve();
        };
        img.addEventListener('load', onLoad);
        // Force highest quality images for export
        if (img.src.includes('jpeg') || img.src.includes('jpg')) {
          // Replace quality param for JPEG images to maximum
          img.src = img.src.replace(/q=[0-9]+/, 'q=100').replace(/quality=[0-9]+/, 'quality=100');
        }
        // Apply CSS filter to enhance vibrancy
        img.style.filter = 'contrast(1.05) saturate(1.2)';
        // Add timeout to avoid infinite waiting
        setTimeout(() => resolve(), 3000);
      });
    })
  );

  // Apply CSS filters to images for better vibrancy
  Array.from(slideClone.querySelectorAll('img')).forEach(img => {
    img.style.filter = 'contrast(1.05) saturate(1.2)';
    // Force high quality
    if (img.src.includes('jpeg') || img.src.includes('jpg')) {
      img.src = img.src.replace(/q=[0-9]+/, 'q=100').replace(/quality=[0-9]+/, 'quality=100');
    }
  });
  
  // Fix gradient backgrounds to prevent canvas rendering errors
  const elementsWithBackgrounds = slideClone.querySelectorAll('*');
  elementsWithBackgrounds.forEach(el => {
    const element = el as HTMLElement;
    const computedStyle = window.getComputedStyle(element);
    
    // Check for gradient backgrounds
    const bgImage = computedStyle.backgroundImage;
    if (bgImage && bgImage.includes('gradient')) {
      // Sanitize the gradient to prevent non-finite color stop errors
      const sanitizedGradient = sanitizeGradient(bgImage, '#0f172a');
      element.style.backgroundImage = sanitizedGradient;
    }
    
    // Also check for problematic background positions (can cause similar errors)
    const bgPositionX = computedStyle.backgroundPositionX;
    const bgPositionY = computedStyle.backgroundPositionY;
    
    if (bgPositionX.includes('NaN') || bgPositionY.includes('NaN') || 
        bgPositionX.includes('Infinity') || bgPositionY.includes('Infinity')) {
      element.style.backgroundPosition = 'center center';
    }
  });
  
  return html2canvas(slideClone, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#0f172a', // Use dark blue background to match the web preview
    imageTimeout: 7500, // Reduced timeout for faster processing
    onclone: (clonedDocument) => {
      // Apply completely revamped styles for exact web preview matching
      // Sanitize gradients in the cloned document
    const elementsWithGradients = clonedDocument.querySelectorAll('*');
    elementsWithGradients.forEach(el => {
      const element = el as HTMLElement;
      const bgImage = element.style.backgroundImage;
      
      if (bgImage && bgImage.includes('gradient')) {
        element.style.backgroundImage = sanitizeGradient(bgImage, '#0f172a');
      }
    });
      
    const styles = clonedDocument.createElement('style');
      styles.innerHTML = `
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Clean slate - override default rendering */
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #0f172a !important;
        }

        /* Make everything super-explicit and force dark background */
        .slide-wrapper, .slide, .slide-content, .slide-for-export, [class*="slide"],
        .absolute, .inset-0, .export-background, [class*="wrapper"], [class*="container"] {
          background-color: #0f172a !important;
          color: white !important;
          opacity: 1 !important;
          box-shadow: none !important;
          position: relative !important;
          overflow: hidden !important;
        }

        /* Completely hide any document overlays */
        [class*="document"], [style*="document"], [src*="document"],
        .slide-background-document, .document-overlay, .document-preview {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Force text elements to be super visible */
        h1, h2, h3, h4, h5, h6, p, li, span, div {
          color: white !important;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
          font-weight: 600 !important;
          opacity: 1 !important;
        }

        /* Special handling for headline text */
        h1, .slide-headline, [class*="headline"] {
          font-size: 2.5rem !important;
          font-weight: 700 !important;
          text-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
        }

        /* Fix positioning */
        .text-center, [class*="center"] {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        /* Make paragraphs clearer */
        p { 
          margin-bottom: 1rem !important;
          line-height: 1.7 !important;
        }

        /* Ensure all content inside is visible */
        * {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Hide all scrollbars */
        ::-webkit-scrollbar {
          display: none !important;
        }

        /* Ensure background images are visible but don't cause text overlay issues */
        [style*="background-image"]:not([style*="gradient"]) {
          opacity: 1 !important;
          filter: contrast(1.05) saturate(1.3) !important;
        }
        
        /* Fix for gradient backgrounds */
        [style*="gradient"] {
          background: #0f172a !important;
        }

        /* Enhance image vibrancy */
        img {
          filter: contrast(1.05) saturate(1.2) !important;
        }
      `;
      clonedDocument.head.appendChild(styles);
      return clonedDocument;
    }
  });
};

/**
 * Generate clean HTML for PDF export with vibrant backgrounds and clear text
 * 
 * @param slide - Slide to generate HTML for
 * @param colorTheme - Color theme to apply
 * @returns HTML string for the slide
 */
export const generateCleanExportHTML = (slide: Slide, colorTheme: string): string => {
  // Get content from the slide
  const slideType = slide.slide_type || 'content';
  const headline = slide.content?.headline || slide.title || '';
  const paragraphs = slide.content?.paragraphs || [];
  const bullets = slide.content?.bullets || [];
  
  // Use the slide's theme or fallback to the deck theme
  const bgColor = getThemeColorValue(slide.content?.color_theme || colorTheme || 'blue');
  
  let html = `
    <div class="slide-content-export slide-${slideType}" style="background-color: ${bgColor}; color: white; padding: 60px; height: 100%; position: relative; overflow: hidden;">
      <h1 class="slide-headline" style="color: white; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 2.5rem; margin-bottom: 2rem;">${headline}</h1>
  `;
  
  // Add a dark tinted background for better text contrast
  html += `<div style="position: absolute; inset: 0; background-color: rgba(15, 23, 42, 0.8); z-index: 1;"></div>`;
  
  // Add content wrapper with higher z-index
  html += `<div style="position: relative; z-index: 2;">`;
  
  // Add paragraphs with proper styling
  if (paragraphs.length > 0) {
    html += '<div class="slide-paragraphs">';
    paragraphs.forEach(p => {
      html += `<p style="color: white; font-weight: 500; margin-bottom: 1rem; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${p}</p>`;
    });
    html += '</div>';
  }
  
  // Add bullets with better styling
  if (bullets.length > 0) {
    html += '<ul class="slide-bullets" style="list-style-type: none; padding-left: 0;">';
    bullets.forEach(bullet => {
      html += `<li style="color: white; font-weight: 500; margin-bottom: 0.5rem; padding-left: 1rem; border-left: 3px solid #60a5fa; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${bullet}</li>`;
    });
    html += '</ul>';
  }
  
  html += '</div></div>';
  
  return html;
};

/**
 * Prepare slides for export by applying necessary styles and transformations
 * 
 * @param slides - Array of slide elements to prepare
 * @param deck - The pitch deck containing slide data
 */
export const prepareSlidesForExport = (slides: HTMLElement[], deck: PitchDeck): void => {
  console.log(`Preparing ${slides.length} slides for export`);
  
  // Apply export specific styles to each slide
  slides.forEach((slide, index) => {
    if (!deck.slides) return;
    
    // Store the theme in the slide's dataset for reference
    const slideIndex = Math.min(index, deck.slides.length - 1); // Guard against out-of-bounds
    const content = deck.slides[slideIndex]?.content || {};
    const theme = content.color_theme || (deck as any).colorTheme || 'blue';
    slide.dataset.theme = theme;
    
    // Set a unique slide ID to avoid duplicates
    slide.dataset.slideIndex = slideIndex.toString();
    
    // Remove any problematic elements that might cause duplicates
    const duplicateContainers = slide.querySelectorAll('.slide-for-export');
    duplicateContainers.forEach(container => {
      if (container !== slide) {
        (container as HTMLElement).remove();
      }
    });
    
    // Remove any standalone image containers that might create unwanted slides
    const standaloneImages = slide.querySelectorAll('.image-container, .slide-image-only');
    standaloneImages.forEach(img => {
      if (img.parentElement === slide) {
        (img as HTMLElement).remove();
      }
    });
    
    // Replace any problematic gradients with solid colors
    const elementsWithGradients = slide.querySelectorAll('*');
    elementsWithGradients.forEach(el => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);
      
      if (computedStyle.backgroundImage.includes('gradient')) {
        // Sanitize or replace problematic gradients
        const sanitizedGradient = sanitizeGradient(computedStyle.backgroundImage, getThemeColorValue(theme));
        element.style.backgroundImage = sanitizedGradient;
      }
    });
    
    // Apply appropriate background based on content
    if (content.background_image && content.background_image !== 'none') {
      slide.style.backgroundImage = convertBackground(content.background_image);
      
      // Add overlay for better text contrast
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
      slide.appendChild(overlay);
    } else {
      slide.style.backgroundColor = content.background_color || getThemeColorValue(theme);
    }
    
    // Enhance images for better export quality
    const images = slide.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      img.style.filter = 'contrast(1.05) saturate(1.2)';
    });
  });
};

/**
 * Export deck to PDF with vibrant backgrounds and clear text
 * 
 * @param deck - The pitch deck to export
 * @param slidesContainer - HTML element containing the rendered slides
 * @param onProgress - Callback for reporting export progress
 * @returns Promise that resolves to the generated PDF
 */
/**
 * Export slides with fallback mechanism for cases where normal export fails
 * 
 * @param deck - The pitch deck to export
 * @param slideElements - Array of slide elements to export
 * @param onProgress - Callback for reporting export progress
 * @param pdf - Existing PDF instance or undefined to create a new one
 * @returns Promise that resolves to the generated PDF
 */
const exportSlidesWithFallback = async (
  _deck: PitchDeck, // Unused but kept for API consistency
  slideElements: HTMLElement[],
  onProgress: ExportProgressCallback,
  existingPdf?: jsPDF
): Promise<jsPDF> => {
  // Use existing PDF or create a new one
  const pdf = existingPdf || new jsPDF({
    orientation: 'landscape',
    unit: 'pt', 
    format: [1920, 1080],
    compress: true, 
    precision: 8,
    hotfixes: ['px_scaling']
  });
  
  try {
    // Calculate total number of steps for progress reporting
    const totalSteps = slideElements.length * 2; // Render + add to PDF
    let currentStep = 0;
    
    // Process each slide
    for (let i = 0; i < slideElements.length; i++) {
      // Report progress
      currentStep++;
      onProgress(Math.round((currentStep / totalSteps) * 100));
      
      try {
        // Basic slide rendering without fancy preprocessing
        const slide = slideElements[i];
        console.log(`Processing slide ${i} in fallback mode`);
        
        // Add a page for all slides except the first
        if (i > 0) {
          pdf.addPage();
        }
        
        // Try to create a basic canvas rendering
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Fill with theme color
          const theme = slide.dataset.theme || 'blue';
          ctx.fillStyle = getThemeColorValue(theme);
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          try {
            // Attempt simplified rendering of the slide
            const simplifiedCanvas = await html2canvas(slide, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: getThemeColorValue(theme),
              logging: false
            });
            
            // Add to PDF
            pdf.addImage(
              simplifiedCanvas.toDataURL('image/jpeg', 0.92),
              'JPEG',
              0,
              0,
              pdf.internal.pageSize.getWidth(),
              pdf.internal.pageSize.getHeight(),
              `slide-${i}`,
              'FAST'
            );
          } catch (renderError) {
            console.error(`Fallback rendering error for slide ${i}:`, renderError);
            
            // Just use the basic colored canvas with text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Slide ${i+1}`, canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '36px Arial';
            ctx.fillText('Content could not be rendered', canvas.width / 2, canvas.height / 2 + 40);
            
            pdf.addImage(
              canvas.toDataURL('image/jpeg'),
              'JPEG',
              0,
              0,
              pdf.internal.pageSize.getWidth(),
              pdf.internal.pageSize.getHeight(),
              `slide-fallback-${i}`,
              'FAST'
            );
          }
        }
        
      } catch (slideError) {
        console.error(`Error processing slide ${i}:`, slideError);
        // Continue to next slide
      }
      
      // Report progress for PDF addition step
      currentStep++;
      onProgress(Math.round((currentStep / totalSteps) * 100));
    }
    
    // Final progress update
    onProgress(100);
    return pdf;
    
  } catch (error) {
    console.error('Error in fallback export:', error);
    throw error;
  }
};

/**
 * Export deck to PDF with vibrant backgrounds and clear text
 * 
 * @param deck - The pitch deck to export
 * @param slidesContainer - HTML element containing the rendered slides
 * @param onProgress - Callback for reporting export progress
 * @returns Promise that resolves to the generated PDF
 */
export const exportToPDF = async (
  deck: PitchDeck,
  slidesContainer: HTMLElement,
  onProgress: ExportProgressCallback
): Promise<jsPDF> => {
  // Create PDF with properly configured settings for better quality output
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt', 
    format: [1920, 1080],
    compress: true, 
    precision: 8,
    hotfixes: ['px_scaling']
  });

  try {
    // Get all slides from the export container
    // Looking at the structure from ExportSlideRenderer, we need to select .slide-for-export elements
    // that are inside .slide-wrapper elements
    const slideElements = Array.from(slidesContainer.querySelectorAll('.slide-for-export'));
    console.log(`Found ${slideElements.length} total slide elements`);
    
    // Use a less strict filter to keep most slide elements
    const uniqueSlideElements = slideElements.filter((slide) => {
      // Accept slides that are in a wrapper or directly in the container
      // This matches the structure from ExportSlideRenderer.tsx
      const hasValidParent = slide.parentElement && (
        slide.parentElement.classList.contains('slide-wrapper') ||
        slide.parentElement === slidesContainer ||
        slide.parentElement.classList.contains('export-slides-container')
      );
      
      // Avoid truly empty slides
      const isNotEmpty = slide.children.length > 0 || slide.textContent?.trim() !== '';
      
      return hasValidParent && isNotEmpty;
    });
    
    console.log(`After filtering, ${uniqueSlideElements.length} valid slides found`);
    
    // If still no slides found, try a more lenient approach
    if (uniqueSlideElements.length === 0) {
      console.warn('No slides matched strict criteria, using all non-empty slides');
      // Just take all slides as a last resort - we'll handle empty ones in the fallback function
      const fallbackSlides = slideElements;
      
      if (fallbackSlides.length === 0) {
        throw new Error('No valid slides found for export');
      }
      
      return exportSlidesWithFallback(deck, fallbackSlides as HTMLElement[], onProgress, pdf);
    }

    // Calculate total number of steps for progress reporting
    const totalSteps = uniqueSlideElements.length * 2; // Render + add to PDF
    let currentStep = 0;

    // Apply styles to improve export quality
    prepareSlidesForExport(uniqueSlideElements as HTMLElement[], deck);

    // Process each slide
    for (let i = 0; i < uniqueSlideElements.length; i++) {
      // Report progress for rendering step
      currentStep++;
      onProgress(Math.round((currentStep / totalSteps) * 100));

      // Render slide to canvas with enhanced settings
      const slide = uniqueSlideElements[i] as HTMLElement;
      
      console.log(`Rendering slide ${i} of ${uniqueSlideElements.length}`);
        
      try {
        // Make a deep clone of the slide to avoid modifying the original
        const slideClone = slide.cloneNode(true) as HTMLElement;
        slideClone.style.width = '1920px';
        slideClone.style.height = '1080px';
        slideClone.style.overflow = 'hidden';
        slideClone.style.position = 'absolute';
        
        // Sanitize any problematic gradients before rendering
        const elementsWithGradients = slideClone.querySelectorAll('*');
        elementsWithGradients.forEach(el => {
          const element = el as HTMLElement;
          try {
            const computedStyle = window.getComputedStyle(element);
            
            if (computedStyle.backgroundImage && computedStyle.backgroundImage.includes('gradient')) {
              element.style.backgroundImage = sanitizeGradient(
                computedStyle.backgroundImage, 
                getThemeColorValue(slide.dataset.theme || 'blue')
              );
            }
          } catch (styleError) {
            console.warn('Error processing element style:', styleError);
          }
        });
        
        const canvas = await renderSlideToCanvas(slideClone, 1920, 1080, 'blue', 2);

      // Add canvas to PDF, except for the first slide which is added differently
      if (i > 0) {
        pdf.addPage();
      }

      // Add the slide to the PDF with proper positioning
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        `slide-${i}`,
        'FAST'
      );
      } catch (renderError) {
        console.error(`Error rendering slide ${i}:`, renderError);
        
        // Create a fallback canvas with just the theme color
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 1920;
        fallbackCanvas.height = 1080;
        const ctx = fallbackCanvas.getContext('2d');
        if (ctx) {
          const slideTheme = slide.dataset.theme || 'blue';
          ctx.fillStyle = getThemeColorValue(slideTheme);
          ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
          
          // Add error text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 60px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Error rendering slide', fallbackCanvas.width / 2, fallbackCanvas.height / 2 - 40);
          ctx.font = '36px Arial';
          ctx.fillText('This slide contains unsupported content', fallbackCanvas.width / 2, fallbackCanvas.height / 2 + 40);
          
          // Add this fallback to PDF
          pdf.addImage(
            fallbackCanvas.toDataURL('image/jpeg'),
            'JPEG',
            0,
            0,
            pdf.internal.pageSize.getWidth(),
            pdf.internal.pageSize.getHeight(),
            `slide-fallback-${i}`,
            'FAST'
          );
        }
      }

      // Report progress for PDF addition step
      currentStep++;
      onProgress(Math.round((currentStep / totalSteps) * 100));
    }

    // Final progress update
    onProgress(100);
    return pdf;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

// Default export for backward compatibility
const pdfExportService = {
  exportToPDF,
  prepareSlidesForExport
};

export default pdfExportService;
