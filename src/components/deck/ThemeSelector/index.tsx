import React, { useState } from 'react';
import stockPhotoService from '../../../services/stockPhotoService';
import { ThemeSelectorProps, ThemeOption } from '../../../types/themes';
import ThemeOptionsList from './ThemeOptionsList';
import BackgroundSelector from './BackgroundSelector';
import ThemeActionButtons from './ThemeActionButtons';

/**
 * ThemeSelector Component
 * 
 * Main container for theme selection functionality.
 * Coordinates theme selection and background selection.
 */
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

  const handleCancel = () => {
    setShowBackgrounds(false);
  };

  const handleApply = () => {
    // Apply the selected theme
    onThemeSelect(selectedTheme);
    setShowBackgrounds(false);
  };

  return (
    <div className="theme-selector p-2 sm:p-3 bg-white rounded-lg">
      <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800">Select Theme</h3>
      
      <ThemeOptionsList 
        themeOptions={themeOptions}
        selectedTheme={selectedTheme}
        onThemeSelect={handleThemeSelect}
      />
      
      <BackgroundSelector 
        backgroundOptions={backgroundOptions}
        onBackgroundSelect={handleBackgroundSelect}
        visible={showBackgrounds}
      />
      
      {showBackgrounds && (
        <ThemeActionButtons 
          onCancel={handleCancel}
          onApply={handleApply}
        />
      )}
    </div>
  );
};

export default ThemeSelector;
