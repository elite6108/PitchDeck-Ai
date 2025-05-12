import React, { useEffect, useRef } from 'react';
import { Slide } from '../../../types/deck';
import { ColorTheme } from '../../../types/themes';
import { 
  drawCustomBackground, 
  getBrandAccentColor, 
  getTextLines 
} from '../../../services/export/pdfExportService';

interface ExportPreviewRendererProps {
  slide: Slide;
  colorTheme: ColorTheme;
}

/**
 * ExportPreviewRenderer Component
 * 
 * Renders a slide preview using the same styling as the PDF export
 * This ensures the preview matches what will be exported
 */
const ExportPreviewRenderer: React.FC<ExportPreviewRendererProps> = ({
  slide,
  colorTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Convert theme string to actual color
  const getThemeColor = (theme: string): string => {
    const themeColors: Record<string, string> = {
      'blue': '#3498db',
      'green': '#2ecc71',
      'purple': '#9b59b6',
      'red': '#e74c3c',
      'orange': '#f39c12',
      'teal': '#1abc9c',
      'custom': '#6B7280'
    };
    
    return themeColors[theme] || themeColors.blue;
  };
  
  // Load an image from URL
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };
  
  // Render slide to canvas
  const renderSlide = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set theme color
    const themeColor = getThemeColor(slide.content?.color_theme as string || colorTheme);
    
    // Create background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, themeColor);
    gradient.addColorStop(1, `${themeColor}CC`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create custom background patterns/graphics based on theme
    drawCustomBackground(ctx, canvas.width, canvas.height, themeColor, slide.slide_type || 'content');
    
    // Try to draw background image if available - with better visibility
    if (slide.content?.background_image && slide.content.background_image !== 'none') {
      try {
        const bgImage = await loadImage(slide.content.background_image);
        
        // Position image more prominently - right side of slide
        const imageWidth = canvas.width * 0.45;
        const imageHeight = canvas.height * 0.7;
        const imageX = canvas.width - imageWidth - 50;
        const imageY = (canvas.height - imageHeight) / 2;
        
        // Draw with higher opacity
        ctx.globalAlpha = 0.9;
        ctx.drawImage(bgImage, imageX, imageY, imageWidth, imageHeight);
        ctx.globalAlpha = 1.0;
        
        // Add a subtle border to the image
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
      } catch (imgError) {
        console.warn('Error loading background image:', imgError);
      }
    }
    
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    
    // Add branded header bar
    const brandAccent = getBrandAccentColor(slide.content?.color_theme || 'blue');
    ctx.fillStyle = brandAccent;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.globalAlpha = 1.0;
    
    // Add slide title/headline with enhanced styling
    const headlineText = slide.content?.headline || slide.title || 'Slide';
    
    // Add text shadow for better contrast
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(headlineText, 20, 80, canvas.width - 100);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add slide subheadline if available
    if (slide.content?.subheadline) {
      ctx.font = '16px Arial';
      ctx.fillText(slide.content.subheadline, 20, 110, canvas.width - 100);
    }
    
    // Calculate content width based on whether we have an image
    const hasImage = slide.content?.background_image && slide.content.background_image !== 'none';
    const contentWidth = hasImage ? canvas.width * 0.5 - 40 : canvas.width - 40;
    
    // Add paragraphs with improved line spacing
    if (slide.content?.paragraphs && slide.content.paragraphs.length > 0) {
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      
      let yPos = 140;
      slide.content.paragraphs.forEach(paragraph => {
        const lines = getTextLines(ctx, paragraph, contentWidth);
        lines.forEach(line => {
          // Add drop shadow for better text visibility
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(line, 20, yPos, contentWidth);
          yPos += 50; // Dramatically increased line spacing for better readability
        });
        yPos += 40; // Much more space between paragraphs
      });
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Add bullets with improved styling
    if (slide.content?.bullets && slide.content.bullets.length > 0) {
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      
      // Calculate starting position based on paragraphs with extreme spacing
      // If there are paragraphs, start bullets much lower on the slide
      let yPos = slide.content.paragraphs?.length ? 
                (140 + (slide.content.paragraphs.length * 100)) : 180;
      
      // Calculate content width based on whether we have an image
      const bulletContentWidth = hasImage ? canvas.width * 0.5 - 50 : canvas.width - 50;
      
      slide.content.bullets.forEach(bullet => {
        // Draw larger, more visible custom bullet point with brand styling
        ctx.fillStyle = getBrandAccentColor(slide.content?.color_theme || 'blue');
        ctx.beginPath();
        ctx.arc(25, yPos - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bullet text with white color and shadow
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.font = '14px Arial';
        
        // Draw bullet text with more spacing
        const lines = getTextLines(ctx, bullet, bulletContentWidth);
        // Use larger font for bullets
        ctx.font = 'bold 16px Arial';
        lines.forEach((line, index) => {
          ctx.fillText(line, 40, yPos + (index * 40), bulletContentWidth);
          if (index > 0) yPos += 40;
        });
        yPos += 60; // Extreme spacing between bullets
      });
      
      // Reset shadow and color
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = 'white';
    }
    
    // Add slide number at the bottom
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Slide ${slide.position || 1}`, canvas.width - 20, canvas.height - 20);
  };
  
  // Render slide when props change
  useEffect(() => {
    renderSlide();
  }, [slide, colorTheme]);
  
  return (
    <div className="export-preview-renderer">
      <canvas 
        ref={canvasRef} 
        width={700} 
        height={400} 
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
};

export default ExportPreviewRenderer;
