import React, { useState } from 'react';
import stockPhotoService from '../../services/stockPhotoService';
import { Check } from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  previewImageUrl: string;
}

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeSelect: (themeId: string) => void;
  onBackgroundSelect: (imageUrl: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentTheme, 
  onThemeSelect,
  onBackgroundSelect
}) => {
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [backgroundOptions, setBackgroundOptions] = useState<string[]>([]);
  
  // Theme options with preview images
  const themeOptions: ThemeOption[] = [
    {
      id: 'light',
      name: 'Light',
      colors: {
        primary: '#4F46E5',
        secondary: '#A5B4FC',
        accent: '#4338CA',
        background: '#FFFFFF'
      },
      previewImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=512'
    },
    {
      id: 'dark',
      name: 'Dark',
      colors: {
        primary: '#4B5563',
        secondary: '#9CA3AF',
        accent: '#1E40AF',
        background: '#111827'
      },
      previewImageUrl: 'https://images.unsplash.com/photo-1579547945413-497e1b99aac0?q=80&w=512'
    },
    {
      id: 'royal_blue',
      name: 'Royal Blue',
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#2563EB',
        background: '#EFF6FF'
      },
      previewImageUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=512'
    },
    {
      id: 'coral',
      name: 'Coral',
      colors: {
        primary: '#F43F5E',
        secondary: '#FB7185',
        accent: '#BE123C',
        background: '#FFF1F2'
      },
      previewImageUrl: 'https://images.unsplash.com/photo-1558470598-a5dda9640f68?q=80&w=512'
    },
    {
      id: 'forest',
      name: 'Forest',
      colors: {
        primary: '#059669',
        secondary: '#34D399',
        accent: '#047857',
        background: '#ECFDF5'
      },
      previewImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=512'
    },
    {
      id: 'gradient',
      name: 'Gradient',
      colors: {
        primary: '#6366F1',
        secondary: '#A855F7',
        accent: '#EC4899',
        background: '#F5F3FF'
      },
      previewImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=512'
    }
  ];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeSelect(themeId);
    
    // Load background options for this theme
    const backgrounds = stockPhotoService.getThemedBackgrounds('cover', themeId);
    setBackgroundOptions(backgrounds);
    setShowBackgrounds(true);
  };

  const handleBackgroundSelect = (imageUrl: string) => {
    onBackgroundSelect(imageUrl);
    setShowBackgrounds(false);
  };

  return (
    <div className="theme-selector p-2 sm:p-3 bg-white rounded-lg">
      <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800">Select Theme</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {themeOptions.map(theme => (
          <div 
            key={theme.id}
            className={`theme-option relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedTheme === theme.id ? 'ring-2 ring-primary-600' : 'hover:brightness-95'
            }`}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="aspect-video w-full">
              <img 
                src={theme.previewImageUrl} 
                alt={`${theme.name} theme preview`}
                className="w-full h-full object-cover"
              />
              
              {/* Theme color indicators */}
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{theme.name}</span>
                  <div className="flex space-x-1">
                    <div style={{backgroundColor: theme.colors.primary}} className="w-3 h-3 rounded-full"></div>
                    <div style={{backgroundColor: theme.colors.secondary}} className="w-3 h-3 rounded-full"></div>
                    <div style={{backgroundColor: theme.colors.accent}} className="w-3 h-3 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1 shadow-md">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Background image selection */}
      {showBackgrounds && (
        <div className="mt-2 sm:mt-3">
          <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">Select Background</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {backgroundOptions.map((bgUrl, index) => (
              <div 
                key={index}
                className="bg-option relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all"
                onClick={() => handleBackgroundSelect(bgUrl)}
              >
                <div className="aspect-video w-full">
                  <img 
                    src={bgUrl} 
                    alt={`Background option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
            <div 
              className="bg-option relative rounded-md overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center aspect-video"
              onClick={() => {
                // This will trigger the AI to find relevant images based on content
                onBackgroundSelect('auto');
              }}
            >
              <div className="text-center p-2">
                <div className="mb-1 text-primary-600">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600">Auto-find relevant images</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="mt-3 flex justify-end">
        <button 
          onClick={() => setShowBackgrounds(false)}
          className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 text-xs font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            // Apply the selected theme and background
            onThemeSelect(selectedTheme);
            setShowBackgrounds(false);
          }}
          className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-xs font-medium transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
