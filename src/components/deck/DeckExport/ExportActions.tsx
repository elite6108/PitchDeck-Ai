import React from 'react';
import { FileIcon, DownloadIcon, PresentationIcon } from 'lucide-react';
import Button from '../../ui/Button';

interface ExportActionsProps {
  onExportPDF: (e?: React.MouseEvent) => void;
  onExportPPTX: (e?: React.MouseEvent) => void;
  isExporting: boolean;
  exportType: 'pdf' | 'pptx';
}

/**
 * ExportActions Component
 * 
 * Contains buttons and actions for performing the export.
 * Designed with clean, professional aesthetics and non-overwhelming UI elements.
 */
const ExportActions: React.FC<ExportActionsProps> = ({
  onExportPDF,
  onExportPPTX,
  isExporting,
  exportType
}) => {
  return (
    <div className="p-6 border-t border-gray-200 space-y-3 sm:space-y-4">
      <div 
        className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" 
        onClick={!isExporting ? onExportPDF : undefined}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-error-100 rounded-lg flex items-center justify-center">
          <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-error-600" />
        </div>
        <div className="ml-3 sm:ml-4 flex-grow">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Export as PDF</h3>
          <p className="text-xs sm:text-sm text-gray-500">Create a PDF document of your pitch deck</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(event?: React.MouseEvent<HTMLButtonElement>) => {
            if (event) event.stopPropagation();
            if (!isExporting) onExportPDF();
          }}
          isLoading={isExporting && exportType === 'pdf'}
          isDisabled={isExporting}
          className="flex-shrink-0 bg-white border-gray-300 py-1 px-2 sm:py-1.5 sm:px-3"
        >
          <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs sm:text-sm">PDF</span>
        </Button>
      </div>
      
      <div 
        className="border rounded-lg p-3 sm:p-4 flex items-center hover:bg-gray-50 cursor-pointer" 
        onClick={!isExporting ? onExportPPTX : undefined}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-primary-100 rounded-lg flex items-center justify-center">
          <PresentationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
        </div>
        <div className="ml-3 sm:ml-4 flex-grow">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Export as PowerPoint</h3>
          <p className="text-xs sm:text-sm text-gray-500">Create a PPTX file for your presentation</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(event?: React.MouseEvent<HTMLButtonElement>) => {
            if (event) event.stopPropagation();
            if (!isExporting) onExportPPTX();
          }}
          isLoading={isExporting && exportType === 'pptx'}
          isDisabled={isExporting}
          className="flex-shrink-0 bg-white border-gray-300 py-1 px-2 sm:py-1.5 sm:px-3"
        >
          <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs sm:text-sm">PPTX</span>
        </Button>
      </div>
    </div>
  );
};

export default ExportActions;
