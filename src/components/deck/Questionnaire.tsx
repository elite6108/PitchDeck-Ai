import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore } from '../../store/deckStore';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import type { QuestionnaireData } from '../../types/deck';

const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { generateDeckFromQuestionnaire, loading, error } = useDeckStore();
  
  // Fixed type definition to ensure defaults for all required fields
  const [formData, setFormData] = useState<QuestionnaireData>({
    companyName: '',
    problem: '',
    solution: '',
    targetMarket: '',
    businessModel: '',
    competitive: '',
    team: '',
    marketSize: '',
    traction: '',
    fundingGoal: '',
    designPreferences: {
      colorTheme: 'blue',
      designStyle: 'modern',
      includeLogo: false,
      logoUrl: '',
      fontStyle: 'sans-serif'
    }
  });
  
  const [step, setStep] = useState(1);
  const totalSteps = 5; // Increased to add design step
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested design preferences
    if (name.startsWith('designPreferences.')) {
      const field = name.split('.')[1];
      setFormData((prev: QuestionnaireData) => {
        // Ensure we have valid designPreferences with required fields
        const updatedPreferences = { 
          colorTheme: prev.designPreferences?.colorTheme || 'blue',
          designStyle: prev.designPreferences?.designStyle || 'modern',
          includeLogo: prev.designPreferences?.includeLogo || false,
          fontStyle: prev.designPreferences?.fontStyle || 'sans-serif',
          ...prev.designPreferences,
          [field]: value
        };
        
        return {
          ...prev,
          designPreferences: updatedPreferences
        };
      });
    } else {
      setFormData((prev: QuestionnaireData) => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.startsWith('designPreferences.')) {
      const field = name.split('.')[1];
      setFormData((prev: QuestionnaireData) => {
        // Ensure we have valid designPreferences with required fields
        const updatedPreferences = { 
          colorTheme: prev.designPreferences?.colorTheme || 'blue',
          designStyle: prev.designPreferences?.designStyle || 'modern',
          includeLogo: prev.designPreferences?.includeLogo || false,
          fontStyle: prev.designPreferences?.fontStyle || 'sans-serif',
          ...prev.designPreferences,
          [field]: checked
        };
        
        return {
          ...prev,
          designPreferences: updatedPreferences
        };
      });
    }
  };
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deck = await generateDeckFromQuestionnaire(formData);
    
    if (deck && deck.id) {
      navigate(`/deck/${deck.id}/view`);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="Company Name"
              id="companyName"
              name="companyName"
              fullWidth
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Acme Inc."
            />
            <TextArea
              label="What problem are you solving?"
              id="problem"
              name="problem"
              fullWidth
              required
              value={formData.problem}
              onChange={handleChange}
              placeholder="Describe the problem your company addresses..."
            />
            <TextArea
              label="What's your solution?"
              id="solution"
              name="solution"
              fullWidth
              required
              value={formData.solution}
              onChange={handleChange}
              placeholder="Explain how your product/service solves the problem..."
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <TextArea
              label="Who is your target market?"
              id="targetMarket"
              name="targetMarket"
              fullWidth
              required
              value={formData.targetMarket}
              onChange={handleChange}
              placeholder="Describe your ideal customers..."
            />
            <TextArea
              label="What's your business model?"
              id="businessModel"
              name="businessModel"
              fullWidth
              required
              value={formData.businessModel}
              onChange={handleChange}
              placeholder="Explain how you make money..."
            />
            <TextArea
              label="What's your competitive advantage?"
              id="competitive"
              name="competitive"
              fullWidth
              required
              value={formData.competitive}
              onChange={handleChange}
              placeholder="What makes you different from competitors?..."
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <TextArea
              label="Tell us about your team"
              id="team"
              name="team"
              fullWidth
              required
              value={formData.team}
              onChange={handleChange}
              placeholder="Key team members and their backgrounds..."
            />
            <TextArea
              label="What's your market size?"
              id="marketSize"
              name="marketSize"
              fullWidth
              required
              value={formData.marketSize}
              onChange={handleChange}
              placeholder="TAM, SAM, SOM estimates..."
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <TextArea
              label="Do you have any traction or metrics?"
              id="traction"
              name="traction"
              fullWidth
              value={formData.traction}
              onChange={handleChange}
              placeholder="Current users, revenue, growth rates..."
            />
            <Input
              label="What's your funding goal? (optional)"
              id="fundingGoal"
              name="fundingGoal"
              fullWidth
              value={formData.fundingGoal}
              onChange={handleChange}
              placeholder="e.g., $500,000"
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Design Your Pitch Deck</h3>
            <p className="text-sm text-gray-500 mb-6">Customize how your pitch deck looks to match your brand identity.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
              <select
                name="designPreferences.colorTheme"
                value={formData.designPreferences?.colorTheme}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="blue">Blue (Professional)</option>
                <option value="green">Green (Growth)</option>
                <option value="purple">Purple (Innovation)</option>
                <option value="red">Red (Bold)</option>
                <option value="orange">Orange (Creative)</option>
                <option value="teal">Teal (Modern)</option>
                <option value="custom">Custom Color</option>
              </select>
            </div>
            
            {formData.designPreferences?.colorTheme === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="designPreferences.customPrimaryColor"
                    value={formData.designPreferences?.customPrimaryColor || '#3B82F6'}
                    onChange={handleChange}
                    className="h-10 w-10 mr-2 border-0 rounded p-0"
                  />
                  <Input
                    name="designPreferences.customPrimaryColor"
                    value={formData.designPreferences?.customPrimaryColor || '#3B82F6'}
                    onChange={handleChange}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Design Style</label>
              <select
                name="designPreferences.designStyle"
                value={formData.designPreferences?.designStyle}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="modern">Modern (Clean & Minimalist)</option>
                <option value="classic">Classic (Traditional & Elegant)</option>
                <option value="minimal">Minimal (Simple & Focused)</option>
                <option value="bold">Bold (Impactful & Dynamic)</option>
                <option value="creative">Creative (Unique & Artistic)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Style</label>
              <select
                name="designPreferences.fontStyle"
                value={formData.designPreferences?.fontStyle}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="sans-serif">Sans-serif (Modern)</option>
                <option value="serif">Serif (Traditional)</option>
              </select>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                id="includeLogo"
                name="designPreferences.includeLogo"
                type="checkbox"
                checked={formData.designPreferences?.includeLogo}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="includeLogo" className="ml-2 block text-sm text-gray-700">
                Include company logo
              </label>
            </div>
            
            {formData.designPreferences?.includeLogo && (
              <div className="mb-4">
                <Input
                  label="Logo URL"
                  id="logoUrl"
                  name="designPreferences.logoUrl"
                  fullWidth
                  value={formData.designPreferences?.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a URL to your company logo (PNG or SVG recommended)
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Create Your Pitch Deck
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Answer a few questions and we'll generate a professional pitch deck for you.
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step > index + 1
                    ? 'bg-primary-600 text-white'
                    : step === index + 1
                    ? 'bg-primary-50 border-2 border-primary-600 text-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > index + 1 ? (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`h-1 w-20 sm:w-32 ${
                    step > index + 1 ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < totalSteps ? (
            <Button type="button" variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" variant="primary" isLoading={loading}>
              Generate Pitch Deck
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Questionnaire;