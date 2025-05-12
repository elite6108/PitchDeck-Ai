/**
 * Export Utilities
 * 
 * Common utilities for different export formats.
 */
import { Slide } from '../types/deck';

/**
 * Prepare an image for export
 * Handles loading, sizing, and format conversion
 * 
 * @param imageUrl - URL of the image to prepare
 * @param maxWidth - Maximum width for the image
 * @param maxHeight - Maximum height for the image
 * @returns Promise that resolves to a prepared image data URL
 */
export const prepareImage = async (
  imageUrl: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Calculate dimensions to maintain aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas to process image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
        
        // Clean up
        canvas.remove();
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Convert HTML element to canvas
 * 
 * @param element - HTML element to convert
 * @param options - Options for html2canvas
 * @returns Promise that resolves to a canvas element
 */
export const convertHtmlToCanvas = async (
  element: HTMLElement
): Promise<HTMLCanvasElement> => {
  // This is a placeholder that would use html2canvas in actual implementation
  // For now, we'll just create a simple canvas
  const canvas = document.createElement('canvas');
  canvas.width = element.offsetWidth || 1920;
  canvas.height = element.offsetHeight || 1080;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
};

/**
 * Clean up DOM elements for export
 * Adjusts styles and attributes to ensure proper export
 * 
 * @param element - Element to clean up
 */
export const cleanupForExport = (element: HTMLElement): void => {
  // Find all images and ensure they have proper attributes
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    img.setAttribute('crossorigin', 'anonymous');
    
    // Add placeholder for broken images
    img.onerror = function() {
      (this as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
    };
  });
  
  // Ensure all fonts are properly loaded
  const styles = element.querySelectorAll('style');
  styles.forEach(style => {
    style.innerHTML += `
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `;
  });
};

/**
 * Format slide data for export
 * 
 * @param slide - Slide to format
 * @returns Formatted slide data
 */
export const formatSlideForExport = (slide: Slide): any => {
  return {
    title: slide.title || '',
    headline: slide.content?.headline || '',
    paragraphs: slide.content?.paragraphs || [],
    bullets: slide.content?.bullets || [],
    imageUrl: slide.content?.image_url || '',
    type: slide.slide_type || 'content',
    theme: slide.content?.color_theme || 'blue',
    designStyle: slide.content?.design_style || 'modern'
  };
};
