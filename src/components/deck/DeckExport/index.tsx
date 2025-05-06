import React, { useState, useRef, useEffect } from 'react';
import { PitchDeck } from '../../../types/deck';
import { ColorTheme } from '../../../types/themes';
import aiSlideDesignService from '../../../services/aiSlideDesignService';
import { exportToPDF } from '../../../services/export/pdfExportService';
import pptxExportService from '../../../services/export/pptxExportService';

// Import all the sub-components
import ExportHeader from './ExportHeader';
import ErrorMessage from './ErrorMessage';
import ExportProgress from './ExportProgress';
import StyleOptions from './StyleOptions';
import ExportActions from './ExportActions';
import ExportSlideRenderer from './ExportSlideRenderer';

interface DeckExportProps {
  deck: PitchDeck;
  onClose: () => void;
}

/**
 * DeckExport Component
 * 
 * Main container for exporting deck to different formats.
 * Manages the export state and coordinates the export process.
 */
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

  /**
   * Apply a theme to all slides in the deck
   */
  const applyThemeToSlides = (themeId: ColorTheme) => {
    try {
      if (!updatedDeck.slides || updatedDeck.slides.length === 0) return;
      
      // Create a new copy of the deck
      const newDeck = {
        ...updatedDeck,
        slides: updatedDeck.slides.map(slide => ({
          ...slide,
          content: {
            ...slide.content,
            color_theme: themeId as string
          }
        }))
      } as PitchDeck;
      
      setUpdatedDeck(newDeck);
      
    } catch (error) {
      console.error('Error applying theme:', error);
      showTemporaryError('Failed to apply theme');
    }
  };

  /**
   * Apply AI styling to slides
   */
  const applyAiStyling = async () => {
    if (!updatedDeck.slides || updatedDeck.slides.length === 0) {
      showTemporaryError('No slides to style');
      return;
    }
    
    try {
      setAiProcessing(true);
      
      // Apply AI styling to slides
      const styledDeck = await aiSlideDesignService.applyIntelligentStyling(updatedDeck);
      
      // Update the local state with styled slides
      setUpdatedDeck(styledDeck);
      
      // Get the theme from the first slide (assuming all slides have same theme)
      if (styledDeck.slides && styledDeck.slides.length > 0 && styledDeck.slides[0].content?.color_theme) {
        setSelectedTheme(styledDeck.slides[0].content.color_theme as ColorTheme);
      }
      
      // Import the store to save updated slides to the database
      const { useDeckStore } = await import('../../../store/deckStore');
      const deckStore = useDeckStore.getState();
      
      // Save each styled slide to the database
      if (styledDeck.slides) {
        console.log('Saving styled slides to database...');
        for (const slide of styledDeck.slides) {
          if (slide.id) {
            console.log(`Updating slide ${slide.id} with styling`, slide.content);
            await deckStore.updateSlide(slide.id, {
              content: slide.content
            });
          }
        }
        console.log('All slides updated successfully');
      }
      
    } catch (error) {
      console.error('Error applying AI styling:', error);
      showTemporaryError('Failed to apply AI styling');
    } finally {
      setAiProcessing(false);
    }
  };

  /**
   * Handle background image selection
   */
  const handleBackgroundSelect = (imageUrl: string | undefined) => {
    // Return early if imageUrl is undefined
    if (!imageUrl) return;
    try {
      if (!updatedDeck.slides || updatedDeck.slides.length === 0) return;
      
      // For auto-selection, we'd trigger AI to find relevant images
      if (imageUrl === 'auto') {
        applyAiStyling();
        return;
      }
      
      // Apply the background to the first slide (cover slide)
      const newDeck = {
        ...updatedDeck,
        slides: updatedDeck.slides.map((slide, index) => {
          // Only apply to the first/cover slide
          if (index === 0 || slide.slide_type === 'cover') {
            return {
              ...slide,
              content: {
                ...slide.content,
                image_url: imageUrl
              }
            };
          }
          return slide;
        })
      };
      
      setUpdatedDeck(newDeck);
      
    } catch (error) {
      console.error('Error applying background:', error);
      showTemporaryError('Failed to apply background');
    }
  };

  /**
   * Display a temporary error message
   */
  const showTemporaryError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  /**
   * Handle PDF export
   */
  const handleExportPDF = async () => {
    if (!updatedDeck.slides || updatedDeck.slides.length === 0) {
      setError('No slides to export');
      return;
    }
    
    try {
      setExporting(true);
      setExportType('pdf');
      setExportProgress(10);
      
      // Need to wait for the slides to be rendered in the hidden container
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Make sure the slides container is available
      if (!slidesContainerRef.current) {
        throw new Error('Slides container not available');
      }
      
      // Export to PDF
      const pdf = await exportToPDF(
        updatedDeck,
        slidesContainerRef.current,
        (progress: number) => setExportProgress(progress)
      );
      
      // Save the PDF
      pdf.save(`${updatedDeck.title || 'PitchDeck'}.pdf`);
      
      setExportProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF. Please try again.');
      setExporting(false);
      setExportProgress(0);
    }
  };

  /**
   * Handle PPTX export
   */
  const handleExportPPTX = async () => {
    if (!updatedDeck.slides || updatedDeck.slides.length === 0) {
      setError('No slides to export');
      return;
    }
    
    try {
      setExporting(true);
      setExportType('pptx');
      setExportProgress(10);
      
      // Export to PPTX
      const pptx = await pptxExportService.exportToPPTX(
        updatedDeck,
        (progress) => setExportProgress(progress)
      );
      
      // Save the PPTX
      pptx.writeFile({ fileName: `${updatedDeck.title || 'PitchDeck'}.pptx` });
      
      setExportProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error exporting PPTX:', error);
      setError('Failed to export PPTX. Please try again.');
      setExporting(false);
      setExportProgress(0);
    }
  };

  /**
   * Toggle AI styling
   */
  const handleToggleAiStyling = () => {
    if (!useAiStyling) {
      setUseAiStyling(true);
      applyAiStyling();
    } else {
      setUseAiStyling(false);
      // Reset to default theme
      applyThemeToSlides('blue');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <ExportHeader
          title={`Export: ${deck.title || 'Pitch Deck'}`}
          onClose={onClose}
        />
        
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
          <ErrorMessage error={error} />
          
          <StyleOptions
            selectedTheme={selectedTheme}
            onThemeSelect={applyThemeToSlides}
            useAiStyling={useAiStyling}
            onToggleAiStyling={handleToggleAiStyling}
            aiProcessing={aiProcessing}
            onBackgroundSelect={handleBackgroundSelect}
            showThemeSelector={showThemeSelector}
            onToggleThemeSelector={() => setShowThemeSelector(!showThemeSelector)}
          />
          
          <ExportProgress
            isExporting={exporting}
            progress={exportProgress}
            exportType={exportType}
          />
        </div>
        
        <ExportActions
          onExportPDF={handleExportPDF}
          onExportPPTX={handleExportPPTX}
          isExporting={exporting}
          exportType={exportType}
        />
        
        <ExportSlideRenderer
          deck={updatedDeck}
          colorTheme={selectedTheme}
          containerRef={slidesContainerRef}
          isExporting={exporting}
        />
      </div>
    </div>
  );
};

export default DeckExport;
