import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Home, ChevronRight } from 'lucide-react';

interface AgreementNavBarProps {
  currentStep?: string;
}

const AgreementNavBar: React.FC<AgreementNavBarProps> = ({ currentStep }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-primary-600 hover:text-primary-800"
            >
              <FileText className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">Agreement Generator</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center text-sm text-slate-500">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center hover:text-primary-600"
            >
              <Home className="h-4 w-4 mr-1" />
              <span>Dashboard</span>
            </button>
            
            <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
            
            <span className="text-slate-700 font-medium">
              {currentStep || 'Generate Agreement'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementNavBar;
