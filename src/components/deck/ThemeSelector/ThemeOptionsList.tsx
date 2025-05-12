import React from 'react';
import { Check } from 'lucide-react';
import { ThemeOption } from '../../../types/themes';

interface ThemeOptionsListProps {
  themeOptions: ThemeOption[];
  selectedTheme: string;
  onThemeSelect: (themeId: string) => void;
}

/**
 * ThemeOptionsList Component
 * 
 * Displays a grid of available themes to select from.
 */
const ThemeOptionsList: React.FC<ThemeOptionsListProps> = ({
  themeOptions,
  selectedTheme,
  onThemeSelect
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {themeOptions.map(theme => (
        <div 
          key={theme.id}
          className={`theme-option relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
            selectedTheme === theme.id ? 'ring-2 ring-primary-600' : 'hover:brightness-95'
          }`}
          onClick={() => onThemeSelect(theme.id)}
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
  );
};

export default ThemeOptionsList;
