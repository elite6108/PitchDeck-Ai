import React from 'react';
import type { Slide } from '../../types/deck';

interface SlideThumbnailProps {
  slide: Slide;
  isActive?: boolean;
  onClick?: () => void;
}

const SlideThumbnail: React.FC<SlideThumbnailProps> = ({ 
  slide, 
  isActive = false,
  onClick
}) => {
  return (
    <div 
      className={`cursor-pointer p-2 border rounded-md transition-all ${
        isActive 
          ? 'border-primary-500 bg-primary-50 shadow-sm' 
          : 'border-gray-200 hover:border-gray-400'
      }`}
      onClick={onClick}
    >
      <div className="aspect-[16/9] bg-white overflow-hidden rounded-sm border border-gray-100 shadow-sm">
        {/* Miniature version of slide content */}
        <div className="p-2 h-full text-xs">
          <div className="font-medium mb-1 truncate">
            {slide.title}
          </div>
          <div className="text-[8px] line-clamp-3 text-gray-600">
            {slide.content.headline && (
              <div className="font-medium">{slide.content.headline}</div>
            )}
            {slide.content.paragraphs && slide.content.paragraphs.length > 0 && (
              <div className="opacity-75">{slide.content.paragraphs[0].substring(0, 50)}...</div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-1 text-xs text-center text-gray-600">
        {slide.position + 1}
      </div>
    </div>
  );
};

export default SlideThumbnail;