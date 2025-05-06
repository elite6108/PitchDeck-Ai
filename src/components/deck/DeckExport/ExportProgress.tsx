import React from 'react';

interface ExportProgressProps {
  isExporting: boolean;
  progress: number;
  exportType: 'pdf' | 'pptx';
}

/**
 * ExportProgress Component
 * 
 * Displays progress indicator during export process.
 */
const ExportProgress: React.FC<ExportProgressProps> = ({
  isExporting,
  progress,
  exportType
}) => {
  if (!isExporting) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {progress > 0 && progress < 100 && (
        <div className="absolute right-4 top-4 bg-white px-3 py-2 rounded-md shadow-md border border-gray-200 text-xs font-medium">
          Exporting {exportType.toUpperCase()}... {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ExportProgress;
