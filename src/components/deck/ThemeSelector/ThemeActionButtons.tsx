import React from 'react';

interface ThemeActionButtonsProps {
  onCancel: () => void;
  onApply: () => void;
}

/**
 * ThemeActionButtons Component
 * 
 * Provides Cancel/Apply buttons for theme selection.
 * Follows design preferences for clean, appropriately sized UI elements.
 */
const ThemeActionButtons: React.FC<ThemeActionButtonsProps> = ({
  onCancel,
  onApply
}) => {
  return (
    <div className="mt-3 flex justify-end">
      <button 
        onClick={onCancel}
        className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 
                   text-xs font-medium transition-colors border border-gray-300"
        aria-label="Cancel selection"
      >
        Cancel
      </button>
      <button 
        onClick={onApply}
        className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 
                   text-xs font-medium transition-colors border border-primary-700"
        aria-label="Apply selection"
      >
        Apply
      </button>
    </div>
  );
};

export default ThemeActionButtons;
