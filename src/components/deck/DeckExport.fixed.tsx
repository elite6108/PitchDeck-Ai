import React, { useState, useRef } from 'react';
import { FileIcon, DownloadIcon, PresentationIcon, Paintbrush, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import type { PitchDeck } from '../../types/deck';
import SlideViewer from './SlideViewer';
import jsPDF from 'jspdf';
import ThemeSelector from './ThemeSelector';
import aiSlideDesignService from '../../services/aiSlideDesignService';

// Define possible color theme values as a type
type ColorTheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'custom' | undefined;

type DeckExportProps = {
  deck: PitchDeck;
  onClose: () => void;
};

const DeckExport: React.FC<DeckExportProps> = ({ deck, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'pptx'>('pdf');
  // Progress tracking for export operations
  const [, setExportProgress] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>('blue');
  // Track the selected background image
  const [, setSelectedBackground] = useState('');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [useAiStyling, setUseAiStyling] = useState(false);
  // Track AI processing state
  const [, setAiProcessing] = useState(false);
  // Track error state
  const [, setError] = useState<string | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      setExportType('pdf');
      setExportProgress(25);
      
      // Wait for slides to render
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(50);
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      setExportProgress(75);
      
      // Save the PDF
      pdf.save(`${deck.title || 'pitch-deck'}.pdf`);
      setExportProgress(100);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Failed to export to PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPPTX = async () => {
    try {
      setExporting(true);
      setExportType('pptx');
      setExportProgress(25);
      
      // If AI styling is enabled, analyze the content first
      if (useAiStyling) {
        setAiProcessing(true);
        // Use the aiSlideDesignService to analyze content
        // Analyze deck content
        await aiSlideDesignService.analyzeDeckContent(deck);
        // Here you would apply the analysis results to the deck styling
        setAiProcessing(false);
      }
      
      // Export to PPTX implementation would go here
      setExportProgress(100);
    } catch (err) {
      console.error('Error exporting to PPTX:', err);
      setError('Failed to export to PowerPoint');
    } finally {
      setExporting(false);
    }
  };
  
  // Function to safely apply theme to slides
  const applyThemeToSlides = (themeId: ColorTheme) => {
    if (!deck.slides) return;
    
    // Create a copy of the deck to avoid direct state mutation
    const updatedDeck = {...deck};
    
    // Map over slides safely
    updatedDeck.slides = updatedDeck.slides?.map(slide => {
      const updatedSlide = {...slide};
      // Apply theme to each slide
      if (updatedSlide.content) {
        updatedSlide.content = {
          ...updatedSlide.content,
          color_theme: themeId
        };
      } else {
        updatedSlide.content = {
          color_theme: themeId
        };
      }
      return updatedSlide;
    });
  };
  
  // Display an error message temporarily
  const showTemporaryError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
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
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Smart AI styling:</span> The AI will analyze your business content and create a customized presentation design that best represents your industry, tone, and message.
                </p>
              </div>
            )}
          </div>
          
          {/* Theme Selector Panel */}
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
          </div>
          
          {showThemeSelector && (
            <ThemeSelector 
              currentTheme={selectedTheme}
              onThemeSelect={(themeId) => {
                // Cast themeId to ColorTheme type
                const typedThemeId = themeId as ColorTheme;
                setSelectedTheme(typedThemeId);
                applyThemeToSlides(typedThemeId);
              }}
              onBackgroundSelect={(imageUrl) => {
                if (!imageUrl) return; // Guard against undefined
                
                if (imageUrl === 'auto') {
                  showTemporaryError("AI will find relevant images during export");
                } else {
                  setSelectedBackground(imageUrl);
                  
                  // Apply background to cover slide
                  if (deck.slides) {
                    const coverSlide = deck.slides.find(s => s.slide_type === 'cover');
                    if (coverSlide) {
                      coverSlide.content = {
                        ...coverSlide.content,
                        background_image: imageUrl
                      };
                    }
                  }
                }
              }}
            />
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 space-y-3 sm:space-y-4">
          <div className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" onClick={!exporting ? handleExportPDF : undefined}>
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
              onClick={!exporting ? handleExportPDF : undefined}
              isLoading={exporting && exportType === 'pdf'}
              isDisabled={exporting}
              className="flex-shrink-0 bg-white border-gray-300 py-1 px-2 sm:py-1.5 sm:px-3"
            >
              <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">PDF</span>
            </Button>
          </div>
          
          <div className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" onClick={!exporting ? handleExportPPTX : undefined}>
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
              onClick={!exporting ? handleExportPPTX : undefined}
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
      
      <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden">
        <div ref={slidesContainerRef} className="export-slides-container">
          {exporting && deck.slides?.map((slide, index) => (
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
