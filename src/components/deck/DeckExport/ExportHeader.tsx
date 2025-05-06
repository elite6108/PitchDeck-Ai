import React from 'react';
import { X } from 'lucide-react';

interface ExportHeaderProps {
  title: string;
  onClose: () => void;
}

/**
 * ExportHeader Component
 * 
 * Displays the header of the export modal with title and close button.
 */
const ExportHeader: React.FC<ExportHeaderProps> = ({
  title,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-500 hover:bg-gray-200 transition-colors"
        aria-label="Close export dialog"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ExportHeader;
