import React from 'react';
import { PitchDeck } from '../../../types/deck';
import { ColorTheme, DesignStyle } from '../../../types/themes';
import SlideViewer from '../SlideViewer';

interface ExportSlideRendererProps {
  deck: PitchDeck;
  colorTheme: ColorTheme;
  containerRef: React.RefObject<HTMLDivElement>;
  isExporting: boolean;
}

/**
 * ExportSlideRenderer Component
 * 
 * Renders slides in a hidden container for export processing.
 */
const ExportSlideRenderer: React.FC<ExportSlideRendererProps> = ({
  deck,
  colorTheme,
  containerRef,
  isExporting
}) => {
  return (
    <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden">
      <div ref={containerRef} className="export-slides-container">
        {/* Always render slides but keep them hidden until export */}
        {(isExporting || true) && deck.slides?.map((slide, index) => (
          <div key={slide.id || index} className="slide-wrapper" style={{ width: '1920px', height: '1080px', position: 'relative', margin: '20px 0' }}>
            <div className="slide-for-export" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <SlideViewer 
                slide={slide} 
                colorTheme={slide.content?.color_theme as ColorTheme | undefined || colorTheme}
                designStyle={slide.content?.design_style as DesignStyle || 'modern'}
                fontStyle={slide.content?.font_style || 'sans-serif'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportSlideRenderer;
