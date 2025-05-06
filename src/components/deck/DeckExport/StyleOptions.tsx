import React from 'react';
import { Paintbrush, Sparkles } from 'lucide-react';
import { ColorTheme } from '../../../types/themes';
import ThemeSelector from '../ThemeSelector';

interface StyleOptionsProps {
  selectedTheme: ColorTheme;
  onThemeSelect: (themeId: ColorTheme) => void;
  useAiStyling: boolean;
  onToggleAiStyling: () => void;
  aiProcessing: boolean;
  onBackgroundSelect: (imageUrl: string | undefined) => void;
  showThemeSelector: boolean;
  onToggleThemeSelector: () => void;
}

/**
 * StyleOptions Component
 * 
 * Provides theme selection and AI styling options for slide exports.
 */
const StyleOptions: React.FC<StyleOptionsProps> = ({
  selectedTheme,
  onThemeSelect,
  useAiStyling,
  onToggleAiStyling,
  aiProcessing,
  onBackgroundSelect,
  showThemeSelector,
  onToggleThemeSelector
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Customize Style</h3>
      <div className="flex space-x-2 mb-3">
        <button
          onClick={onToggleThemeSelector}
          className={`flex items-center px-3 py-1.5 rounded-md border text-sm 
            ${selectedTheme ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-gray-50 text-gray-700 border-gray-200'} 
            hover:bg-gray-100 transition-colors`}
          aria-pressed={showThemeSelector}
        >
          <Paintbrush className="w-4 h-4 mr-1.5" />
          <span>Theme</span>
        </button>
        
        <button
          onClick={onToggleAiStyling}
          disabled={aiProcessing}
          className={`flex items-center px-3 py-1.5 rounded-md border text-sm
            ${useAiStyling ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-gray-50 text-gray-700 border-gray-200'} 
            hover:bg-gray-100 transition-colors
            ${aiProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-pressed={useAiStyling}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          <span>{aiProcessing ? 'Processing...' : 'AI Styling'}</span>
        </button>
      </div>
      
      {showThemeSelector && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <ThemeSelector
            currentTheme={selectedTheme || ''}
            onThemeSelect={(themeId) => {
              if (themeId) {
                onThemeSelect(themeId as ColorTheme);
              }
            }}
            onBackgroundSelect={onBackgroundSelect}
          />
        </div>
      )}
    </div>
  );
};

export default StyleOptions;
