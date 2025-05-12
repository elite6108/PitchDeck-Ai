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
  
  try {
    // For multiple gradients, just use the first one
    let sanitizedValue = cssValue;
    if (sanitizedValue.includes('),')) {
      sanitizedValue = sanitizedValue.split('),')[0] + ')';
    }
    
    // If gradient has 'to right bottom' or similar syntax, simplify it
    if (sanitizedValue.includes('to ')) {
      sanitizedValue = sanitizedValue.replace(/to\s+(top|right|bottom|left|center|\w+\s+\w+)/g, '180deg');
    }
    
    // Handle malformed percentages or values
    if (sanitizedValue.includes('NaN') || sanitizedValue.includes('Infinity') || sanitizedValue.includes('undefined')) {
      return fallbackColor;
    }
    
    // Check for color stops - just validate they exist
    const colorStopRegex = /(rgba?|hsla?)\(.*?\)\s+\d*\.?\d+%?|\d*\.?\d+%/g;
    if (!sanitizedValue.match(colorStopRegex)) {
      return fallbackColor; // No valid color stops found
    }
    
    return sanitizedValue;
  } catch (error) {
    console.warn('Error sanitizing gradient, using fallback:', error);
    return fallbackColor;
  }
};

/**
 * Load an image from URL and return as an HTMLImageElement
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    
    // Clean up URL if needed
    let cleanSrc = src;
    if (src.startsWith('url(') && src.endsWith(')')) {
      cleanSrc = src.substring(4, src.length - 1).replace(/['"\/]/g, '');
    }
    
    img.src = cleanSrc;
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!img.complete) {
        reject(new Error('Image load timed out'));
      }
    }, 5000);
  });
};

/**
 * Helper function to split text into multiple lines based on canvas width
 */
export const getTextLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  
  // Handle empty text
  if (words.length === 0 || (words.length === 1 && words[0] === '')) {
    return [];
  }
  
  // For presentation purposes, limit the number of characters per line to improve readability
  // This will force more line breaks and improve readability with wider spacing
  const MAX_CHARS_PER_LINE = 60;
  
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    // Break the line if it exceeds the max width or if it's getting too long character-wise
    if (width < maxWidth && currentLine.length + word.length + 1 < MAX_CHARS_PER_LINE) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

/**
 * Draw a custom background pattern based on the slide type and theme
 */
export const drawCustomBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, themeColor: string, slideType: string): void => {
  // Fill the background with theme color
  ctx.fillStyle = themeColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add a subtle gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add decorative elements based on slide type
  ctx.globalAlpha = 0.1; // Very subtle
  
  if (slideType === 'cover' || slideType === 'closing') {
    // Draw diagonal stripes for cover/closing slides
    const brandAccent = getBrandAccentColor(themeColor);
    ctx.strokeStyle = brandAccent;
    ctx.lineWidth = 30;
    
    for (let i = -width; i < width * 2; i += 220) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + width, height);
      ctx.stroke();
    }
  } else if (slideType === 'problem' || slideType === 'solution') {
    // Draw circles for problem/solution slides
    const radius = width * 0.15;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.85, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Draw a subtle grid pattern for other slides
    const gridSize = 100;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  
  // Add a brand corner accent
  const cornerSize = 200;
  ctx.fillStyle = getBrandAccentColor(themeColor);
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(cornerSize, 0);
  ctx.lineTo(0, cornerSize);
  ctx.closePath();
  ctx.fill();
  
  // Reset alpha
  ctx.globalAlpha = 1.0;
};

/**
 * Get a complementary accent color for a theme
 */
export const getBrandAccentColor = (theme: string): string => {
  switch (theme) {
    case 'blue': return '#4FC3F7';
    case 'green': return '#81C784';
    case 'purple': return '#B39DDB';
    case 'red': return '#FF8A65';
    case 'orange': return '#FFB74D';
    case 'teal': return '#4DB6AC';
    default: return '#64B5F6';
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
  _scale: number = 3
): Promise<HTMLCanvasElement> => {
  // Create a simple canvas with only the basic content from the slide
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Get theme color from the slide's dataset
  const themeColor = slide.dataset.theme ? getThemeColorValue(slide.dataset.theme) : '#0f172a';
  
  // Fill background with theme color
  ctx.fillStyle = themeColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create a clean simplified representation of the slide
  const simpleSlide = document.createElement('div');
  simpleSlide.id = `simple-slide-${Date.now()}`;
  simpleSlide.style.width = '1920px';
  simpleSlide.style.height = '1080px';
  simpleSlide.style.position = 'absolute';
  simpleSlide.style.padding = '80px';
  simpleSlide.style.boxSizing = 'border-box';
  simpleSlide.style.color = 'white';
  simpleSlide.style.fontFamily = 'Arial, sans-serif';
  simpleSlide.style.backgroundColor = themeColor;
  
  // Extract heading text from the slide - search more aggressively for any title content
  let headingText = '';
  const headingElements = slide.querySelectorAll('h1, h2, h3, .slide-headline, .title, [class*="title"], [class*="heading"]');
  if (headingElements.length > 0) {
    // Use the first non-empty heading element
    for (const el of headingElements) {
      if (el.textContent && el.textContent.trim()) {
        headingText = el.textContent.trim();
        break;
      }
    }
  }
  
  // If no heading was found, try to use the first significant text in the slide
  if (!headingText) {
    const allTextElements = slide.querySelectorAll('p, div, span');
    for (const el of allTextElements) {
      if (el.textContent && el.textContent.trim() && el.textContent.trim().length > 10) {
        headingText = el.textContent.trim();
        break;
      }
    }
  }
  
  // Create heading element if we found text
  if (headingText) {
    const heading = document.createElement('h1');
    heading.textContent = headingText;
    heading.style.fontSize = '60px';
    heading.style.fontWeight = '700';
    heading.style.marginBottom = '40px';
    heading.style.color = 'white';
    heading.style.textShadow = '0 2px 6px rgba(0,0,0,0.5)';
    simpleSlide.appendChild(heading);
  }
  
  // Extract paragraph text from the slide - be more aggressive with finding content
  const paragraphElements = Array.from(slide.querySelectorAll('p:not(.slide-headline), .paragraph, .content, [class*="paragraph"], [class*="content"], div:not(.slide-content):not(.slide-container):not([class*="container"])'))
    .filter(el => {
      const text = el.textContent?.trim() || '';
      // Only include elements with reasonable text content that aren't just containers
      return text.length > 0 && 
             text.split(' ').length >= 3 && 
             !el.querySelector('p, div') && // Avoid containers with other content elements
             !el.classList.contains('slide-for-export') &&
             el !== slide; // Don't include the slide itself
    });
  
  if (paragraphElements.length > 0) {
    const contentDiv = document.createElement('div');
    contentDiv.style.fontSize = '30px';
    contentDiv.style.lineHeight = '1.5';
    contentDiv.style.color = 'white';
    
    paragraphElements.forEach(p => {
      const paragraph = document.createElement('p');
      paragraph.textContent = p.textContent?.trim() || '';
      paragraph.style.marginBottom = '20px';
      contentDiv.appendChild(paragraph);
    });
    
    simpleSlide.appendChild(contentDiv);
  }
  
  // Extract bullet points from the slide - search for both list items and elements that might be formatted as bullets
  let bulletElements = Array.from(slide.querySelectorAll('li, .bullet-item, .bullet, [class*="bullet"], ul > *'));
  
  // If no bullets found, look for other elements that might be bullet-like (short text elements)
  if (bulletElements.length === 0) {
    const potentialBullets = Array.from(slide.querySelectorAll('p, div, span'))
      .filter(el => {
        const text = el.textContent?.trim() || '';
        // Short, non-header text that might be bullet-like
        return text.length > 0 && text.length < 200 && text.split(' ').length <= 20 &&
               !el.classList.contains('slide-headline') && 
               !el.classList.contains('title') &&
               !headingText.includes(text);
      });
    
    bulletElements = potentialBullets;
  }
  
  if (bulletElements.length > 0) {
    const bulletList = document.createElement('ul');
    bulletList.style.listStyleType = 'none';
    bulletList.style.padding = '0';
    bulletList.style.marginTop = '30px';
    
    bulletElements.forEach(li => {
      const bulletText = li.textContent?.trim() || '';
      if (bulletText) {
        const bulletItem = document.createElement('li');
        bulletItem.textContent = bulletText;
        bulletItem.style.fontSize = '30px';
        bulletItem.style.marginBottom = '15px';
        bulletItem.style.paddingLeft = '30px';
        bulletItem.style.position = 'relative';
        bulletItem.style.color = 'white';
        
        // Add bullet point symbol
        const bullet = document.createElement('span');
        bullet.textContent = '•';
        bullet.style.position = 'absolute';
        bullet.style.left = '0';
        bullet.style.color = 'white';
        bulletItem.insertBefore(bullet, bulletItem.firstChild);
        
        bulletList.appendChild(bulletItem);
      }
    });
    
    // Only add the bullet list if we actually added items
    if (bulletList.children.length > 0) {
      simpleSlide.appendChild(bulletList);
    }
  }
  
  // Try to get background image if it exists
  let backgroundImage = null;
  const bgElement = slide.style.backgroundImage ? slide : slide.querySelector('[style*="background-image"]');
  if (bgElement) {
    const style = window.getComputedStyle(bgElement);
    const bgImageUrl = style.backgroundImage;
    
    if (bgImageUrl && bgImageUrl !== 'none' && !bgImageUrl.includes('gradient')) {
      // Extract URL from the CSS background-image property
      const urlMatch = bgImageUrl.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        backgroundImage = urlMatch[1];
      }
    }
  }
  
  // Temporarily attach the slide to the document body
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.appendChild(simpleSlide);
  document.body.appendChild(tempContainer);
  
  // If we have a background image, load it and draw it to the canvas
  if (backgroundImage) {
    try {
      // Draw the background image with a dark overlay for better text contrast
      const img = await loadImage(backgroundImage);
      
      // Draw with proper sizing
      ctx.globalAlpha = 0.9; // More opaque for better background visibility
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Add a semi-transparent overlay for better text contrast
      ctx.globalAlpha = 0.3; // Lighter overlay to let more background show through
      ctx.fillStyle = themeColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    } catch (error) {
      console.warn('Failed to load background image:', error);
    }
  }
  
  // Render our simple slide with html2canvas
  try {
    // Log what we're trying to render for debugging
    console.log(`Rendering slide with content: ${simpleSlide.textContent?.substring(0, 50)}...`);
    
    const renderedCanvas = await html2canvas(simpleSlide, {
      backgroundColor: themeColor,
      scale: 2,
      logging: true, // Enable logging for debugging
      removeContainer: false, // Don't remove the container to help with debugging
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      windowWidth: 1920,
      windowHeight: 1080,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            font-family: Arial, sans-serif !important;
            color: white !important;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
          }
          h1, h2, h3 {
            font-size: 60px !important;
            font-weight: 700 !important;
            margin-bottom: 40px !important;
          }
          p {
            font-size: 30px !important;
            line-height: 1.5 !important;
            margin-bottom: 20px !important;
          }
          li {
            font-size: 30px !important;
            margin-bottom: 15px !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    // Draw the rendered content on top of our background
    ctx.drawImage(renderedCanvas, 0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('Error rendering slide content:', error);
    
    // If rendering fails, at least draw the title text directly on the canvas
    if (headingText) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillText(headingText, canvas.width / 2, 150);
    }
  }
  
  // Clean up the temporary elements
  if (tempContainer && tempContainer.parentNode) {
    tempContainer.parentNode.removeChild(tempContainer);
  }
  
  // Add slide number for reference
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Slide ${slide.dataset.slideIndex || ''}`, canvas.width - 50, canvas.height - 30);
  
  // If we didn't get any content, add a fallback message
  if (!headingText && paragraphElements.length === 0 && bulletElements.length === 0) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Slide Content', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '30px Arial';
    ctx.fillText('Content not available in export view', canvas.width / 2, canvas.height / 2 + 30);
  }
  
  return canvas;

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
    if (!deck.slides || deck.slides.length === 0) return;
    
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
 * Filter out unwanted slides to avoid duplicate content in PDF
 * 
 * @param slides - Array of slide elements to filter
 * @param deck - The pitch deck containing slide data
 * @returns Array of filtered slide elements
 */
export const filterSlidesForExport = (slides: HTMLElement[], _deck: PitchDeck): HTMLElement[] => {
  // Filter out unwanted slides to avoid duplicate content in PDF
  const uniqueSlides: HTMLElement[] = [];
  const slideMap = new Map<string, HTMLElement>();
  const processedIds = new Set<string>();
  
  // First pass: Group slides by their content ID to avoid duplicates
  slides.forEach(slide => {
    if (!slide) return;
    
    // Skip any slide that's hidden
    if (window.getComputedStyle(slide).display === 'none') return;
    
    // Get the slide index from the dataset or generate one
    const slideIndex = slide.dataset.slideIndex || slide.id || `slide-${Math.random().toString(36).substring(2, 9)}`;
    if (processedIds.has(slideIndex)) return; // Skip if we've already processed this ID
    processedIds.add(slideIndex);
    
    // Filter out slides that are just image containers with no text content
    const hasTextContent = !!slide.querySelector('h1, h2, h3, p, li, span, .slide-headline, .slide-text');
    const isStandaloneImageContainer = slide.classList.contains('image-container') && !hasTextContent;
    if (isStandaloneImageContainer) return;
    
    // Store the slide, replacing any existing entry for this index
    slideMap.set(slideIndex, slide);
    
    // Remove any duplicate content within this slide
    const nestedDuplicates = slide.querySelectorAll('.slide-for-export:not(:first-child), .slide-content:not(:first-child)');
    nestedDuplicates.forEach(dupe => dupe.parentNode?.removeChild(dupe));
  });
  
  // Convert map values to array  
  slideMap.forEach(slide => {
    uniqueSlides.push(slide);
  });
  
  console.log(`After filtering, ${uniqueSlides.length} valid slides found`);
  
  return uniqueSlides;
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
  _slidesContainer: HTMLElement, // Unused parameter but kept for API compatibility
  onProgress: ExportProgressCallback
): Promise<jsPDF> => {
  try {
    // Initialize PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt', 
      format: [1920, 1080],
      compress: true,
      precision: 6
    });
    
    // Make sure we have slides in the deck
    if (!deck.slides || deck.slides.length === 0) {
      throw new Error('No slides found in deck for export');
    }
    
    console.log(`Found ${deck.slides.length} slides in deck for export`);
    
    // Calculate total number of steps for progress reporting
    const totalSteps = deck.slides.length * 2; // Render + add to PDF
    let currentStep = 0;

    // Process each slide directly from the deck data
    for (let i = 0; i < deck.slides.length; i++) {
      // Report progress for rendering step
      currentStep++;
      onProgress(Math.round((currentStep / totalSteps) * 100));

      // Get the current slide data
      const slide = deck.slides[i];
      
      console.log(`Rendering slide ${i} of ${deck.slides.length}: ${slide.title || 'Untitled'}`);
        
      try {
        // Create a canvas for this slide
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Get the theme color
        const themeColor = getThemeColorValue(slide.content?.color_theme || 'blue');
        
        // Fill background with theme color
        ctx.fillStyle = themeColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a dark overlay gradient for better text contrast
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create custom background patterns/graphics based on theme
        drawCustomBackground(ctx, canvas.width, canvas.height, themeColor, slide.slide_type || 'content');
        
        // Try to draw background image if available - with better visibility
        if (slide.content?.background_image && slide.content.background_image !== 'none') {
          try {
            const bgImage = await loadImage(slide.content.background_image);
            
            // Position image more prominently - right side of slide
            const imageWidth = canvas.width * 0.45; // 45% of slide width
            const imageHeight = canvas.height * 0.7; // 70% of slide height
            const imageX = canvas.width - imageWidth - 100; // Right side with margin
            const imageY = (canvas.height - imageHeight) / 2; // Vertically centered
            
            // Draw with higher opacity
            ctx.globalAlpha = 0.9;
            ctx.drawImage(bgImage, imageX, imageY, imageWidth, imageHeight);
            ctx.globalAlpha = 1.0;
            
            // Add a subtle border to the image
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 4;
            ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
          } catch (imgError) {
            console.warn('Error loading background image:', imgError);
          }
        }
        
        // Set up text rendering
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // Add branded header bar
        const brandAccent = getBrandAccentColor(slide.content?.color_theme || 'blue');
        ctx.fillStyle = brandAccent;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(0, 0, canvas.width, 100);
        ctx.globalAlpha = 1.0;
        
        // Add slide title/headline with enhanced styling
        const headlineText = slide.content?.headline || slide.title || 'Slide ' + (i + 1);
        
        // Add more space below the header for all content
        
        // Add text shadow for better contrast
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(headlineText, 150, 200, canvas.width - 300);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add slide subheadline if available
        if (slide.content?.subheadline) {
          ctx.font = 'bold 48px Arial';
          ctx.fillText(slide.content.subheadline, canvas.width / 2, 280, canvas.width - 300);
        }
        
        // Calculate content width based on whether we have an image
        const hasImage = slide.content?.background_image && slide.content.background_image !== 'none';
        const contentWidth = hasImage ? canvas.width * 0.5 - 150 : canvas.width - 300;
        
        // Add paragraphs with improved line spacing
        if (slide.content?.paragraphs && slide.content.paragraphs.length > 0) {
          ctx.font = '36px Arial';
          ctx.textAlign = 'left';
          
          let yPos = 350;
          slide.content.paragraphs.forEach(paragraph => {
            const lines = getTextLines(ctx, paragraph, contentWidth);
            lines.forEach(line => {
              // Add drop shadow for better text visibility
              ctx.shadowColor = 'rgba(0,0,0,0.5)';
              ctx.shadowBlur = 4;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
              
              ctx.fillText(line, 150, yPos, contentWidth);
              yPos += 150; // Dramatically increased line spacing for better readability
            });
            yPos += 120; // Much more space between paragraphs
          });
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        // Add bullets with improved styling
        if (slide.content?.bullets && slide.content.bullets.length > 0) {
          ctx.font = '36px Arial';
          ctx.textAlign = 'left';
          
          // Calculate starting position based on paragraphs with extreme spacing
          // If there are paragraphs, start bullets much lower on the slide
          let yPos = slide.content.paragraphs?.length ? 
                    (350 + (slide.content.paragraphs.length * 300)) : 450;
          
          // Calculate content width based on whether we have an image
          const hasImage = slide.content?.background_image && slide.content.background_image !== 'none';
          const contentWidth = hasImage ? canvas.width * 0.5 - 200 : canvas.width - 350;
          
          slide.content.bullets.forEach(bullet => {
            // Draw larger, more visible custom bullet point with brand styling
            ctx.fillStyle = getBrandAccentColor(slide.content?.color_theme || 'blue');
            ctx.beginPath();
            ctx.arc(150, yPos - 15, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bullet text with white color and shadow
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.font = '36px Arial';
            
            // Draw bullet text with more spacing
            const lines = getTextLines(ctx, bullet, contentWidth);
            lines.forEach((line, index) => {
              // Use larger font for bullets
              ctx.font = 'bold 40px Arial';
              ctx.fillText(line, 200, yPos + (index * 130), contentWidth);
              if (index > 0) yPos += 130;
            });
            yPos += 180; // Extreme spacing between bullets
          });
          
          // Reset shadow and color
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = 'white';
        }
        
        // Add slide type at the bottom (optional debugging info)
        ctx.font = 'italic 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(slide.slide_type || 'content', 100, canvas.height - 50);
        
        // Add slide number
        ctx.textAlign = 'right';
        ctx.fillText(`${i + 1}/${deck.slides.length}`, canvas.width - 100, canvas.height - 50);
        
        // Add the slide to the PDF with proper positioning
        if (i > 0) {
          pdf.addPage();
        }

        // Add the canvas to the PDF
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
        
        // Create a fallback canvas with just the theme color and error message
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 1920;
        fallbackCanvas.height = 1080;
        const ctx = fallbackCanvas.getContext('2d');
        if (ctx) {
          const themeColor = getThemeColorValue(slide.content?.color_theme || 'blue');
          ctx.fillStyle = themeColor;
          ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
          
          // Add error text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 60px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(slide.title || `Slide ${i+1}`, fallbackCanvas.width / 2, fallbackCanvas.height / 2 - 40);
          ctx.font = '40px Arial';
          ctx.fillText('Error rendering slide content', fallbackCanvas.width / 2, fallbackCanvas.height / 2 + 40);
          
          // Add to PDF
          if (i > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            fallbackCanvas.toDataURL('image/jpeg'),
            'JPEG',
            0,
            0,
            pdf.internal.pageSize.getWidth(),
            pdf.internal.pageSize.getHeight(),
            `slide-error-${i}`,
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

// ... (rest of the code remains the same)
// Default export for backward compatibility
const pdfExportService = {
  exportToPDF,
  prepareSlidesForExport
};

export default pdfExportService;
