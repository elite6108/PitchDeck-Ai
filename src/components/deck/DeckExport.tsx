import React, { useState, useRef, useEffect } from 'react';
import { FileIcon, DownloadIcon } from 'lucide-react';
import Button from '../ui/Button';
import type { PitchDeck } from '../../types/deck';
import SlideViewer from './SlideViewer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define possible color theme values as a type - remove undefined from union type
type ColorTheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'custom';

// Define possible design style values as a type
type DesignStyle = 'bold' | 'modern' | 'classic' | 'minimal' | 'creative';

interface DeckExportProps {
  deck: PitchDeck;
  onClose: () => void;
}

// Helper function to detect industry based on slide content
const detectIndustryFromContent = (content: string): string => {
  const content_lower = content.toLowerCase();
  
  if (content_lower.includes('revenue') || 
      content_lower.includes('business model') || 
      content_lower.includes('cash flow')) {
    return 'finance';
  } else if (content_lower.includes('software') || 
             content_lower.includes('technology') || 
             content_lower.includes('algorithm')) {
    return 'technology';
  } else if (content_lower.includes('health') || 
             content_lower.includes('medical') || 
             content_lower.includes('patient')) {
    return 'healthcare';
  } else if (content_lower.includes('education') || 
             content_lower.includes('school') || 
             content_lower.includes('learning')) {
    return 'education';
  } else if (content_lower.includes('design') || 
             content_lower.includes('creative') || 
             content_lower.includes('art')) {
    return 'creative';
  } else {
    return 'technology'; // Default
  }
};

// Function to generate premium gradient backgrounds based on industry and color theme
const generateGradientBackground = (industry: string, colorTheme: ColorTheme = 'blue'): string => {
  // Use color mapping based on theme
  const themeColors: Record<string, {primary: string, secondary: string}> = {
    'blue': {primary: '#3B82F6', secondary: '#1E40AF'},
    'green': {primary: '#10B981', secondary: '#065F46'},
    'purple': {primary: '#8B5CF6', secondary: '#5B21B6'},
    'red': {primary: '#EF4444', secondary: '#991B1B'},
    'orange': {primary: '#F97316', secondary: '#9A3412'},
    'teal': {primary: '#14B8A6', secondary: '#115E59'},
    'custom': {primary: '#6B7280', secondary: '#374151'}
  };

  // Get the colors for the selected theme
  const colors = themeColors[colorTheme] || themeColors.blue;
  
  // Generate different backgrounds based on industry
  if (industry === 'technology') {
    return `linear-gradient(135deg, ${colors.primary}CC 0%, ${colors.secondary}EE 100%)`;
  } else if (industry === 'healthcare') {
    return `radial-gradient(circle at top right, ${colors.primary}99, ${colors.secondary}DD)`;
  } else if (industry === 'finance') {
    return `linear-gradient(150deg, ${colors.primary}99 0%, ${colors.secondary}CC 100%)`;
  } else if (industry === 'education') {
    return `linear-gradient(to right, ${colors.primary}AA, ${colors.secondary}CC)`;
  } else {
    // Default gradient for other industries - subtle and professional
    return `linear-gradient(135deg, ${colors.primary}88 0%, ${colors.secondary}AA 100%)`;
  }
};

const DeckExport: React.FC<DeckExportProps> = ({ deck, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [updatedDeck, setUpdatedDeck] = useState<PitchDeck>({ ...deck });
  const [useAiStyling, setUseAiStyling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Apply AI styling automatically when component mounts and when deck changes
  useEffect(() => {
    setUpdatedDeck(deck);
  }, [deck]);

  // Add custom CSS styles to ensure consistent rendering in both preview and export
  useEffect(() => {
    // Create a style element for our custom CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'premium-export-styles';
    styleElement.innerHTML = `
      /* Design element styles */
      .export-design-element {
        position: absolute !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: none;
      }
      
      /* Gradient overlay styles */
      .export-overlay {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 1 !important;
        pointer-events: none;
      }
      
      /* Ensure background images render properly */
      .slide img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      
      /* Enhanced text styling for export */
      .slide-content h2 {
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: antialiased !important;
      }
      
      /* Ensure bullet points and paragraphs render properly */
      .slide-content ul li, .slide-content p {
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: antialiased !important;
      }
    `;
    
    // Add the style element to the document head
    document.head.appendChild(styleElement);
    
    // Clean up function
    return () => {
      const existingStyle = document.getElementById('premium-export-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Hidden container for rendering slides during export
  const colorThemes: ColorTheme[] = [
    'blue',
    'green',
    'purple',
    'red',
    'orange',
    'teal',
    'custom'
  ];

  const designStyles: DesignStyle[] = [
    'bold',
    'modern',
    'classic',
    'minimal',
    'creative'
  ];

  // Apply AI styling function
  const applyAiStyling = async (): Promise<void> => {
    // This is just a placeholder function to satisfy TypeScript
    console.log('AI styling would be applied here');
    return Promise.resolve();
  };

  return (
    <div className="z-10 absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Export Presentation</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            type="button"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-6">
          {/* Show error message if there is one */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Show progress indicator when exporting */}
          {exporting && (
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Presentation Style</h3>
            
            <div className="flex space-x-4 mt-2 mb-4">
              <div className="flex items-center">
                <input
                  id="ai-styling"
                  name="styling-type"
                  type="radio"
                  checked={useAiStyling}
                  onChange={() => setUseAiStyling(true)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="ai-styling" className="ml-2 block text-sm text-gray-700">
                  Smart AI styling
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="manual-styling"
                  name="styling-type"
                  type="radio"
                  checked={!useAiStyling}
                  onChange={() => setUseAiStyling(false)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="manual-styling" className="ml-2 block text-sm text-gray-700">
                  Manual theme selection
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 space-y-3 sm:space-y-4">
          <div className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" onClick={() => !exporting && handleExportPDF()}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-red-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4 flex-grow">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Export as PDF</h3>
              <p className="text-xs sm:text-sm text-gray-500">Create a PDF document of your pitch deck</p>
            </div>
            <Button
              variant="outline"
              onClick={() => !exporting && handleExportPDF()}
              isDisabled={exporting}
              className="flex-shrink-0 bg-white border-gray-300 py-1 px-2 sm:py-1.5 sm:px-3"
            >
              <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">PDF</span>
            </Button>
          </div>
        </div>
      </div>
    
      {/* Hidden container for rendering slides during export */}
      <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden w-[1920px]">
        <div ref={slidesContainerRef} className="export-slides-container">
          {/* Always render slides but keep them hidden until export */}
          {(updatedDeck.slides || []).map((slide, index) => {
            // Safely convert the content properties to the required types with proper validation
            let colorTheme: ColorTheme = 'blue';
            if (slide.content?.color_theme) {
              const slideColorTheme = slide.content.color_theme as string;
              if ([
                'blue', 'green', 'purple', 'red', 'orange', 'teal', 'custom'
              ].includes(slideColorTheme)) {
                colorTheme = slideColorTheme as ColorTheme;
              }
            }
            
            let designStyle: DesignStyle = 'modern';
            if (slide.content?.design_style) {
              const slideDesignStyle = slide.content.design_style as string;
              if ([
                'bold', 'modern', 'classic', 'minimal', 'creative'
              ].includes(slideDesignStyle)) {
                designStyle = slideDesignStyle as DesignStyle;
              }
            }
            
            return (
              <div 
                key={slide.id || index} 
                className="slide-wrapper slide" 
                style={{ 
                  width: '1920px', 
                  height: '1080px', 
                  position: 'relative', 
                  margin: '40px 0', 
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                  display: 'block',
                  visibility: 'visible'
                }}
              >
                <div 
                  className="slide-for-export" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    overflow: 'hidden', 
                    position: 'relative',
                    display: 'block',
                    visibility: 'visible'
                  }}
                  id={`slide-export-${index}`}
                >
                  <SlideViewer 
                    slide={slide} 
                    colorTheme={colorTheme}
                    designStyle={designStyle}
                    fontStyle={slide.content?.font_style || 'sans-serif'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const handleExportPDF = async () => {
    if (!updatedDeck.slides || updatedDeck.slides.length === 0) {
      setError('No slides to export');
      return;
    }
    
    try {
      setExporting(true);
      setExportProgress(20);
      
      // Initialize the PDF document at the beginning
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080]
      });
      
      // Make sure the slides container is available
      if (!slidesContainerRef.current) {
        throw new Error('Slides container not available');
      }
      
      // Get all slides from the container
      const slideElements = slidesContainerRef.current.querySelectorAll('.slide');
      
      if (slideElements.length === 0) {
        throw new Error('No slides found in the container');
      }
      
      console.log(`Found ${slideElements.length} slides to export`);
      
      // Prepare all slides for export (apply AI styling, etc.)
      // We'll do this in parallel first
      const slideProcessPromises = [];
      
      for (let i = 0; i < slideElements.length; i++) {
        slideProcessPromises.push(new Promise<void>(resolve => {
          setTimeout(() => {
            // Get and prepare each slide
            const slide = slideElements[i] as HTMLElement;
            
            // Scale and position slides for export
            slide.style.width = '1920px';
            slide.style.height = '1080px';
            slide.style.margin = '0';
            slide.style.boxSizing = 'border-box';
            
            // Fix styling explicitly for PDF export
            const bulletPoints = slide.querySelectorAll('li');
            bulletPoints.forEach(bullet => {
              const li = bullet as HTMLElement;
              li.style.borderLeft = '2px solid #3B82F6';
              li.style.paddingLeft = '8px';
              li.style.marginLeft = '12px';
              li.style.color = '#334155';
              li.style.fontWeight = '500';
              li.style.listStyle = 'none';
            });
            
            // Ensure images are loaded
            const images = slide.querySelectorAll('img');
            images.forEach(img => {
              if (!img.getAttribute('crossorigin')) {
                img.setAttribute('crossorigin', 'anonymous');
              }
              
              // Force image loading if needed
              if (!img.complete) {
                img.onload = () => {
                  console.log(`Image loaded: ${img.src}`);
                };

                img.onerror = () => {
                  console.warn(`Image failed to load: ${img.src}`);
                  resolve();
                };
              }
            });
            resolve();
          }, 100 * i); // Stagger the preparation
        }));
      }
      
      // Wait for all slides to be prepared
      await Promise.all(slideProcessPromises);
    
      // Only process one slide at a time to avoid memory issues
      for (let i = 0; i < slideElements.length; i++) {
        const slideElement = slideElements[i] as HTMLElement;
        
        // Update progress based on slide position
        setExportProgress(30 + (i / slideElements.length) * 60);
        console.log(`Exporting slide ${i+1} of ${slideElements.length}`);
        
        try {
        // Create a temporary container with fixed dimensions
        const exportWrapper = document.createElement('div');
        exportWrapper.style.position = 'fixed';
        exportWrapper.style.top = '0';
        exportWrapper.style.left = '0';
        exportWrapper.style.width = '1920px';
        exportWrapper.style.height = '1080px';
        exportWrapper.style.overflow = 'hidden';
        exportWrapper.style.backgroundColor = '#FFFFFF';
        exportWrapper.style.zIndex = '-9999';
        document.body.appendChild(exportWrapper);
        
        // Process the current slide - create a deep clone to work with
        const slideClone = slideElement.cloneNode(true) as HTMLElement;
        exportWrapper.appendChild(slideClone);
        document.body.appendChild(exportWrapper);
        
        // Find all background elements and ensure they're styled properly
        const backgroundElements = slideClone.querySelectorAll('.bg-gradient-to-br, .export-gradient-background, [class*="absolute inset-0"]');
        backgroundElements.forEach(bg => {
          const bgElement = bg as HTMLElement;
          
          // Only apply background if it doesn't already have an image background
          if (!bgElement.style.background?.includes('url(')) {
            // Get the current slide's theme and style
            const currentSlide = updatedDeck.slides && updatedDeck.slides[i];
            const designStyleString = currentSlide?.content?.design_style as string || 'modern';
            
            // Map the design style to a valid color theme
            let themeColor: ColorTheme = 'blue';
            switch(designStyleString) {
              case 'modern':
              case 'classic':
              case 'minimal':
                themeColor = 'blue';
                break;
              case 'bold':
                themeColor = 'purple';
                break;
              case 'creative':
                themeColor = 'teal';
                break;
              default:
                themeColor = 'blue';
            }
            
            // Detect industry from slide content
            const slideContent = JSON.stringify(currentSlide?.content || {});
            const detectedIndustry = detectIndustryFromContent(slideContent);
            
            // Apply premium background if element has appropriate class
            if (bgElement.classList.contains('export-gradient-background') || 
                (bgElement.classList.contains('absolute') && 
                bgElement.classList.contains('inset-0'))) {
              
              // Generate background based on industry and color theme
              bgElement.style.background = bgElement.style.background || 
                generateGradientBackground(detectedIndustry, themeColor);
                
              // Ensure full coverage
              bgElement.style.width = '100%';
              bgElement.style.height = '100%';
              bgElement.style.opacity = '1';
            }
          }
        });
        
        // Apply styling to headings for better visibility
        const headings = slideClone.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(h => {
          const heading = h as HTMLElement;
          heading.style.color = '#1E293B';
          heading.style.fontWeight = '700';
          heading.style.textShadow = 'none';
        });
        
        // Apply bullet point styling for consistent appearance
        const bullets = slideClone.querySelectorAll('li');
        bullets.forEach(b => {
          const bullet = b as HTMLElement;
          bullet.style.listStyle = 'none';
          bullet.style.borderLeft = '2px solid #3B82F6';
          bullet.style.paddingLeft = '8px';
          bullet.style.marginLeft = '12px';
          bullet.style.color = '#334155';
          bullet.style.fontWeight = '500';
        });
        
        // Style paragraphs for better readability
        const paragraphs = slideClone.querySelectorAll('p');
        paragraphs.forEach(p => {
          const para = p as HTMLElement;
          para.style.color = '#334155';
          para.style.fontWeight = '500';
        });
        
        // Make sure images are loaded before capturing
        const allImages = slideClone.querySelectorAll('img');
        await Promise.all(Array.from(allImages).map(img => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            }
          });
        }));
        
        // Delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate high-quality canvas
        const canvas = await html2canvas(slideClone, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: true,
          imageTimeout: 10000,
          windowWidth: 1920,
          windowHeight: 1080,
          onclone: (doc) => {
            // Final touch-ups on cloned document
            const allBullets = doc.querySelectorAll('li');
            allBullets.forEach(b => {
              const bullet = b as HTMLElement;
              bullet.style.borderLeft = '2px solid #3B82F6';
              bullet.style.paddingLeft = '8px';
              bullet.style.color = '#334155';
            });
            return doc;
          }
        });
        
        // Add to PDF
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add high-quality image to PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
        
        // Clean up
        document.body.removeChild(exportWrapper);
        
      } catch (slideError) {
        console.error(`Error processing slide ${i+1}:`, slideError);
        // Continue with other slides even if one fails
      }
    }
    
    // Remove the temporary stylesheet
    const tempStyles = document.getElementById('pdf-export-enhancement');
    if (tempStyles) {
      document.head.removeChild(tempStyles);
    }
    
      // Save the PDF
      pdf.save(`${updatedDeck.title || 'presentation'}.pdf`);
      setExportProgress(100);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setError(`Failed to export to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000); // Keep progress visible briefly
    }
  }
};

export default DeckExport;
