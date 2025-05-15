import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FolderOpen } from 'lucide-react';
import { generateLogo } from '../../services/logoGeneratorService';
import { LogoGenerationOptions } from '../../types/logo';
import { useLogoStore } from '../../store/logoStore';

// Industry options for the dropdown
const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Food & Beverage',
  'Retail',
  'Manufacturing',
  'Entertainment',
  'Consulting',
  'Real Estate',
  'Fitness',
  'Transportation',
  'Construction',
  'Marketing',
  'Other'
];

// Style options for the dropdown
const STYLE_OPTIONS: Array<LogoGenerationOptions['style']> = [
  'modern',
  'minimalist',
  'classic',
  'playful',
  'corporate'
];

// Color scheme options for the dropdown
const COLOR_SCHEME_OPTIONS = [
  'Blue and white',
  'Black and gold',
  'Green and gray',
  'Red and black',
  'Purple and silver',
  'Teal and orange',
  'Monochrome',
  'Vibrant and colorful',
  'Earth tones',
  'Pastel colors'
];

const LogoGenerator: React.FC = () => {
  // Add ToastContainer to main layout or App component
  // This ensures toast notifications work across the application
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState<LogoGenerationOptions['style']>('modern');
  const [colorScheme, setColorScheme] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [squareFormat, setSquareFormat] = useState(true);
  const [model, setModel] = useState<LogoGenerationOptions['model']>('dalle'); // Default to DALL-E
  
  // Results state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPrompt, setLogoPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Access logo store
  const { saveLogo } = useLogoStore();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    try {
      // Make sure the model is explicitly defined to prevent default fallback
      const selectedModel = model || 'dalle';
      
      console.log('Selected model for logo generation:', selectedModel);
      
      const options: LogoGenerationOptions = {
        companyName,
        industry: industry || undefined,
        style,
        colorScheme: colorScheme || undefined,
        additionalDetails: additionalDetails || undefined,
        squareFormat,
        model: selectedModel // Ensure model is explicitly passed
      };
      
      // Create a prompt string for tracking what was used to generate this logo
      const promptText = `Logo for "${companyName}"${industry ? ` in ${industry} industry` : ''}${colorScheme ? ` using ${colorScheme} colors` : ''}${additionalDetails ? `. ${additionalDetails}` : ''}`;
      setLogoPrompt(promptText);
      
      const generatedLogoUrl = await generateLogo(options);
      setLogoUrl(generatedLogoUrl);
      
      if (!generatedLogoUrl) {
        throw new Error('Failed to generate logo');
      }
    } catch (err: any) {
      console.error('Logo generation error:', err);
      setError(err.message || 'An error occurred while generating your logo');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save the generated logo to the user's account
  const handleSaveLogo = async () => {
    if (!logoUrl || !companyName) return;
    
    setIsSaving(true);
    try {
      const settings = {
        industry: industry || undefined,
        style,
        colorScheme: colorScheme || undefined,
        additionalDetails: additionalDetails || undefined,
        squareFormat
      };
      
      const savedLogo = await saveLogo(companyName, logoUrl, logoPrompt, settings);
      
      if (savedLogo) {
        toast.success('Logo saved successfully!');
      } else {
        throw new Error('Failed to save logo');
      }
    } catch (err: any) {
      console.error('Error saving logo:', err);
      toast.error(err.message || 'An error occurred while saving your logo');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle logo download
  const handleDownload = () => {
    if (!logoUrl) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = logoUrl;
    link.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Logo Generator</h2>
        <Link 
          to="/logo/saved" 
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          View Saved Logos
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-6">
              {/* Model selection toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Selection</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${model === 'dalle' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                    onClick={() => setModel('dalle')}
                  >
                    DALL-E
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${model === 'grok' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                    onClick={() => setModel('grok')}
                  >
                    Grok 2 (X AI)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Select which model to use for logo generation.</p>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your company name"
                  required
                />
              </div>
              
              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select an industry (optional)</option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Style */}
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as LogoGenerationOptions['style'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {STYLE_OPTIONS.map((styleOption) => {
                  // Ensure styleOption is defined
                  const option = styleOption || 'modern';
                  return (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {/* Color Scheme */}
            <div>
              <label htmlFor="color-scheme" className="block text-sm font-medium text-gray-700 mb-1">
                Color Scheme
              </label>
              <select
                id="color-scheme"
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a color scheme (optional)</option>
                {COLOR_SCHEME_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Additional Details */}
            <div>
              <label htmlFor="additional-details" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                id="additional-details"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any other details you'd like to include in your logo"
              />
            </div>
            
            {/* Square Format */}
            <div className="flex items-center">
              <input
                id="square-format"
                type="checkbox"
                checked={squareFormat}
                onChange={(e) => setSquareFormat(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="square-format" className="ml-2 block text-sm text-gray-700">
                Optimize for square format (recommended for social media profiles)
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Logo'
              )}
            </button>
          </form>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
        
        {/* Preview Section */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
          {logoUrl ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm inline-block">
                <img 
                  src={logoUrl} 
                  alt={`${companyName} logo`} 
                  className="w-full max-w-xs mx-auto object-contain" 
                />
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">
                {companyName} Logo
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 justify-center">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                  Download Logo
                </button>
                
                <button
                  onClick={handleSaveLogo}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"></path>
                      </svg>
                      Save to Account
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-lg">Your logo will appear here</p>
              <p className="text-sm mt-2">Fill out the form and click Generate Logo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoGenerator;
