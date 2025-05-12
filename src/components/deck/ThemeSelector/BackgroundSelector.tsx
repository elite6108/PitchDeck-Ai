import React from 'react';

interface BackgroundSelectorProps {
  backgroundOptions: string[];
  onBackgroundSelect: (imageUrl: string) => void;
  visible: boolean;
}

/**
 * BackgroundSelector Component
 * 
 * Provides options for selecting background images.
 */
const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  backgroundOptions,
  onBackgroundSelect,
  visible
}) => {
  if (!visible) return null;
  
  return (
    <div className="mt-2 sm:mt-3">
      <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">Select Background</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {backgroundOptions.map((bgUrl, index) => (
          <div 
            key={index}
            className="bg-option relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all"
            onClick={() => onBackgroundSelect(bgUrl)}
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
  );
};

export default BackgroundSelector;
