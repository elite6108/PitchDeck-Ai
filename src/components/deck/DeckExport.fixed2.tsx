import React, { useState, useRef, useEffect } from 'react';
import { FileIcon, DownloadIcon, PresentationIcon, Paintbrush, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import type { PitchDeck } from '../../types/deck';
import SlideViewer from './SlideViewer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import ThemeSelector from './ThemeSelector';
import aiSlideDesignService from '../../services/aiSlideDesignService';

// Define possible color theme values as a type
type ColorTheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'custom';

type DeckExportProps = {
  deck: PitchDeck;
  onClose: () => void;
};

const DeckExport: React.FC<DeckExportProps> = ({ deck, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'pptx'>('pdf');
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>('blue');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [useAiStyling, setUseAiStyling] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedDeck, setUpdatedDeck] = useState<PitchDeck>(deck);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  // Update deck reference when props change
  useEffect(() => {
    setUpdatedDeck(deck);
  }, [deck]);

  // Display error message at the top of the modal
  const ErrorMessage = () => {
    if (!error) return null;
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
        <p className="text-sm">{error}</p>
      </div>
    );
  };
  
  // Display progress indicator
  const ProgressIndicator = () => {
    if (!exporting) return null;
    return (
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
          style={{ width: `${exportProgress}%` }}
        />
      </div>
    );
  };

  const handleExportPDF = async () => {
    if (!updatedDeck.slides || updatedDeck.slides.length === 0) {
      setError('No slides to export');
      return;
    }
    
    try {
      setExporting(true);
      setExportType('pdf');
      setExportProgress(10);
      
      // Make sure the slides container is available
      if (!slidesContainerRef.current) {
        throw new Error('Slides container not available');
      }
      
      // Get all slide elements
      const slideElements = slidesContainerRef.current.querySelectorAll('.slide-wrapper');
      if (slideElements.length === 0) {
        throw new Error('No slide elements found');
      }
      
      setExportProgress(25);
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'pt', [1920, 1080]);
      
      // Convert each slide to canvas and add to PDF
      for (let i = 0; i < slideElements.length; i++) {
        const slideElement = slideElements[i] as HTMLElement;
        
        // Update progress based on slide position
        setExportProgress(25 + (i / slideElements.length) * 50);
        
        try {
          // Create canvas from the slide
          const canvas = await html2canvas(slideElement, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF'
          });
          
          // Add to PDF (first page doesn't need addPage)
          if (i > 0) {
            pdf.addPage();
          }
          
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
        } catch (err) {
          console.error(`Error rendering slide ${i}:`, err);
          // Continue with other slides even if one fails
        }
      }
      
      setExportProgress(90);
      
      // Save the PDF
      pdf.save(`${updatedDeck.title || 'pitch-deck'}.pdf`);
      setExportProgress(100);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError(`Failed to export to PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000); // Keep progress visible briefly
    }
  };

  const handleExportPPTX = async () => {
    if (!updatedDeck.slides || updatedDeck.slides.length === 0) {
      setError('No slides to export');
      return;
    }
    
    try {
      setExporting(true);
      setExportType('pptx');
      setExportProgress(10);
      
      // Create a new PowerPoint presentation
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = updatedDeck.title || 'Pitch Deck';
      
      // Make sure the slides container is available
      if (!slidesContainerRef.current) {
        throw new Error('Slides container not available');
      }
      
      // Get all slide elements
      const slideElements = slidesContainerRef.current.querySelectorAll('.slide-wrapper');
      if (slideElements.length === 0) {
        throw new Error('No slide elements found');
      }
      
      setExportProgress(25);
      
      // Convert each slide to canvas and add to PowerPoint
      for (let i = 0; i < slideElements.length; i++) {
        const slideElement = slideElements[i] as HTMLElement;
        
        // Update progress based on slide position
        setExportProgress(25 + (i / slideElements.length) * 50);
        
        try {
          // Create canvas from the slide
          const canvas = await html2canvas(slideElement, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF'
          });
          
          // Add a new slide to the PowerPoint
          const slide = pptx.addSlide();
          
          // Convert canvas to image data
          const imgData = canvas.toDataURL('image/png');
          
          // Add the image to the slide (covering the entire slide)
          slide.addImage({
            data: imgData,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
          });
        } catch (err) {
          console.error(`Error rendering slide ${i}:`, err);
          // Continue with other slides even if one fails
        }
      }
      
      setExportProgress(90);
      
      // Save the PowerPoint
      pptx.writeFile({ fileName: `${updatedDeck.title || 'pitch-deck'}.pptx` });
      setExportProgress(100);
    } catch (err) {
      console.error('Error exporting to PPTX:', err);
      setError(`Failed to export to PowerPoint: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000); // Keep progress visible briefly
    }
  };
  
  // Function to apply the AI styling to the deck
  const applyAiStyling = async () => {
    try {
      setAiProcessing(true);
      setError(null);
      
      // Create a copy of the deck
      const aiStyledDeck = { ...updatedDeck };
      
      if (!aiStyledDeck.slides || aiStyledDeck.slides.length === 0) {
        throw new Error('No slides available to style');
      }
      
      // Use the aiSlideDesignService to analyze content
      const analysis = await aiSlideDesignService.analyzeDeckContent(aiStyledDeck);
      
      // Map analysis properties to theme properties
      const themeMap: Record<string, ColorTheme> = {
        'technology': 'blue',
        'finance': 'green',
        'healthcare': 'teal',
        'creative': 'purple',
        'ecommerce': 'red',
        'education': 'orange',
        'default': 'blue'
      };
      
      // Get theme based on industry or use default
      const recommendedTheme: ColorTheme = themeMap[analysis.industry] || 'blue';
      
      // Apply the recommended styling to each slide
      if (aiStyledDeck.slides) {
        aiStyledDeck.slides = aiStyledDeck.slides.map(slide => {
          // Create a copy of the slide
          const styledSlide = { ...slide };
          
          // Initialize content object if it doesn't exist
          if (!styledSlide.content) {
            styledSlide.content = {};
          }
          
          // Apply AI recommended styling
          styledSlide.content = {
            ...styledSlide.content,
            color_theme: recommendedTheme,
            design_style: analysis.recommendedStyle === 'corporate' ? 'modern' : 'creative',
            font_style: analysis.businessTone === 'professional' ? 'sans-serif' : 'serif'
          };
          
          return styledSlide;
        });
      }
      
      // Update the deck state with AI-styled version
      setUpdatedDeck(aiStyledDeck);
      
      // Also set the selected theme to match
      setSelectedTheme(recommendedTheme);
      
    } catch (err) {
      console.error('Error applying AI styling:', err);
      setError(`Failed to apply AI styling: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiProcessing(false);
    }
  };
  
  // Apply AI styling when the user toggles it on
  useEffect(() => {
    if (useAiStyling) {
      applyAiStyling();
    }
  }, [useAiStyling]);
  
  // Function to safely apply theme to slides
  const applyThemeToSlides = (themeId: ColorTheme) => {
    if (!updatedDeck.slides) return;
    
    // Create a copy of the deck
    const themeDeck = { ...updatedDeck };
    
    // Safely map over slides and apply the theme
    if (themeDeck.slides) {
      themeDeck.slides = themeDeck.slides.map(slide => {
        const updatedSlide = { ...slide };
        
        // Initialize content object if it doesn't exist
        if (!updatedSlide.content) {
          updatedSlide.content = {};
        }
        
        // Apply the theme
        updatedSlide.content = {
          ...updatedSlide.content,
          color_theme: themeId
        };
        
        return updatedSlide;
      });
    }
    
    // Update the deck state
    setUpdatedDeck(themeDeck);
  };
  
  // Display an error message temporarily
  const showTemporaryError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };
  
  // Handle background image selection
  const handleBackgroundSelect = (imageUrl: string | undefined) => {
    // Return early if imageUrl is undefined
    if (!imageUrl) return;
    if (imageUrl === 'auto') {
      showTemporaryError("AI will find relevant images during export");
      return;
    }
    
    // Create a copy of the deck
    const themeDeck = { ...updatedDeck };
    
    // Apply background to cover slide if it exists
    if (themeDeck.slides) {
      const coverSlide = themeDeck.slides.find(s => s.slide_type === 'cover');
      if (coverSlide) {
        // Initialize content object if it doesn't exist
        if (!coverSlide.content) {
          coverSlide.content = {};
        }
        
        coverSlide.content = {
          ...coverSlide.content,
          background_image: imageUrl
        };
        
        setUpdatedDeck(themeDeck);
      }
    }
  };
  
  return (
    <div className="z-10 absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Export Presentation</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-6">
          {/* Show error message if there is one */}
          <ErrorMessage />
          
          {/* Show progress indicator when exporting */}
          <ProgressIndicator />
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Presentation Style</h3>
            
            <div className="flex space-x-4 mt-2 mb-4">
              <div className="flex items-center">
                <input
                  id="manual-styling"
                  name="styling-type"
                  type="radio"
                  checked={!useAiStyling}
                  onChange={() => setUseAiStyling(false)}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="manual-styling" className="ml-2 block text-sm text-gray-700">
                  Manual theme selection
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="ai-styling"
                  name="styling-type"
                  type="radio"
                  checked={useAiStyling}
                  onChange={() => setUseAiStyling(true)}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="ai-styling" className="ml-2 flex items-center text-sm text-gray-700">
                  <Sparkles className="h-4 w-4 text-amber-400 mr-1" />
                  Smart AI styling
                </label>
              </div>
            </div>
            
            {!useAiStyling && (
              <div className="mt-1">
                <button 
                  type="button"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Paintbrush className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                  Customize Theme
                </button>
              </div>
            )}
            
            {useAiStyling && (
              <div className="mt-3 p-4 bg-amber-50 border border-amber-100 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Smart AI styling:</span> The AI will analyze your business content and create a customized presentation design that best represents your industry, tone, and message.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={applyAiStyling}
                    isLoading={aiProcessing}
                    className="ml-4 flex-shrink-0"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span>Apply</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Theme Selector Panel */}
          {!useAiStyling && (
            <div className="mb-3 sm:mb-4 md:mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-2 sm:p-3 md:p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <Paintbrush className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Presentation Theme</h3>
                    <p className="text-sm text-gray-500">Choose a professional design for your slides</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="flex-shrink-0 bg-white"
                >
                  <span className="mr-1">{showThemeSelector ? 'Close' : 'Customize'}</span>
                </Button>
              </div>
              
              {showThemeSelector && (
                <ThemeSelector 
                  currentTheme={selectedTheme}
                  onThemeSelect={(themeId) => {
                    // Return early if themeId is undefined
                    if (!themeId) return;
                    
                    // Check if themeId is a valid ColorTheme value
                    if (['blue', 'green', 'purple', 'red', 'orange', 'teal', 'custom'].includes(themeId)) {
                      const typedThemeId = themeId as ColorTheme;
                      setSelectedTheme(typedThemeId);
                      applyThemeToSlides(typedThemeId);
                    }
                  }}
                  onBackgroundSelect={handleBackgroundSelect}
                />
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 space-y-3 sm:space-y-4">
          <div className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" onClick={!exporting ? () => handleExportPDF() : undefined}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-error-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-error-600" />
            </div>
            <div className="ml-3 sm:ml-4 flex-grow">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Export as PDF</h3>
              <p className="text-xs sm:text-sm text-gray-500">Create a PDF document of your pitch deck</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!exporting) handleExportPDF();
              }}
              isLoading={exporting && exportType === 'pdf'}
              isDisabled={exporting}
              className="flex-shrink-0 bg-white border-gray-300 py-1 px-2 sm:py-1.5 sm:px-3"
            >
              <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">PDF</span>
            </Button>
          </div>
          
          <div className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" onClick={!exporting ? () => handleExportPPTX() : undefined}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-primary-100 rounded-lg flex items-center justify-center">
              <PresentationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <div className="ml-3 sm:ml-4 flex-grow">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Export as PowerPoint</h3>
              <p className="text-xs sm:text-sm text-gray-500">Create a PPTX file for your presentation</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!exporting) handleExportPPTX();
              }}
              isLoading={exporting && exportType === 'pptx'}
              isDisabled={exporting}
              className="flex-shrink-0 bg-white border-gray-300 py-1 px-2 sm:py-1.5 sm:px-3"
            >
              <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">PPTX</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Hidden container for rendering slides during export */}
      <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden">
        <div ref={slidesContainerRef} className="export-slides-container">
          {exporting && updatedDeck.slides?.map((slide, index) => (
            <div key={slide.id || index} className="slide-wrapper" style={{ width: '1920px', height: '1080px', position: 'relative', margin: '20px 0' }}>
              <div className="slide-for-export" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <SlideViewer 
                  slide={slide} 
                  colorTheme={slide.content?.color_theme as ColorTheme || 'blue'}
                  designStyle={slide.content?.design_style || 'modern'}
                  fontStyle={slide.content?.font_style || 'sans-serif'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeckExport;
