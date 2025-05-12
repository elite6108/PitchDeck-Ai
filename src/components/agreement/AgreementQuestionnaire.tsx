import React, { useState } from 'react';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { AgreementType } from '../../types/agreement';
import { MessageCircle, HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';

interface AgreementQuestionnaireProps {
  control: Control<any>;
  errors: FieldErrors;
  onAiSuggestion?: (field: string, suggestion: string) => void;
}

const AgreementQuestionnaire: React.FC<AgreementQuestionnaireProps> = ({ 
  control, 
  errors,
  onAiSuggestion 
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  const [aiSuggesting, setAiSuggesting] = useState<string | null>(null);
  
  // Watch the agreement type to show relevant fields
  const agreementType = useWatch({
    control,
    name: 'agreementType',
    defaultValue: ''
  });
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  // AI suggestion helper
  const requestAiSuggestion = (field: string, context: string) => {
    setAiSuggesting(field);
    
    // Simulate AI suggestion
    setTimeout(() => {
      let suggestion = '';
      
      switch (field) {
        case 'purpose':
          suggestion = `To establish a formal business relationship where both parties collaborate on [specific project/business activity] with clearly defined roles, responsibilities, and profit-sharing arrangements.`;
          break;
        case 'additionalTerms':
          suggestion = `1. Confidentiality: Both parties agree to maintain confidentiality of all business information shared during the term of this agreement.\n\n2. Intellectual Property: Any intellectual property created during the partnership will be jointly owned unless otherwise specified in writing.\n\n3. Dispute Resolution: Any disputes arising from this agreement will be resolved through mediation before pursuing legal action.`;
          break;
        default:
          suggestion = `AI suggestion for ${field} based on your agreement type.`;
      }
      
      if (onAiSuggestion) {
        onAiSuggestion(field, suggestion);
      }
      
      setAiSuggesting(null);
    }, 1500);
  };
  
  const agreementTypes: { value: AgreementType; label: string }[] = [
    { value: 'NDA', label: 'Non-Disclosure Agreement (NDA)' },
    { value: 'SERVICE', label: 'Service Agreement' },
    { value: 'EMPLOYMENT', label: 'Employment Contract' },
    { value: 'PARTNERSHIP', label: 'Partnership Agreement' },
    { value: 'SALES', label: 'Sales Contract' },
    { value: 'CONSULTING', label: 'Consulting Agreement' },
    { value: 'LICENSING', label: 'Licensing Agreement' },
  ];

  // Get additional fields based on agreement type
  const getTypeSpecificFields = () => {
    if (!agreementType) return null;
    
    switch (agreementType) {
      case 'PARTNERSHIP':
        return (
          <div className="space-y-4 mt-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="font-medium text-slate-700">Partnership-Specific Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Profit Sharing Arrangement
              </label>
              <Controller
                name="profitSharing"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Party A: 60%, Party B: 40%"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Decision Making Authority
              </label>
              <Controller
                name="decisionMaking"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Major decisions require unanimous consent, day-to-day operations by Party A"
                  />
                )}
              />
            </div>
          </div>
        );
        
      case 'NDA':
        return (
          <div className="space-y-4 mt-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="font-medium text-slate-700">NDA-Specific Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confidential Information Definition
              </label>
              <Controller
                name="confidentialInfoDefinition"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Define what constitutes confidential information"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Exclusions from Confidentiality
              </label>
              <Controller
                name="confidentialityExclusions"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Information that is publicly available, legally obtained from third parties"
                  />
                )}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Section: Basic Information */}
      <div className="border rounded-md overflow-hidden">
        <button 
          type="button"
          className={`w-full flex justify-between items-center p-3 text-left font-medium ${expandedSection === 'basic' ? 'bg-primary-50 text-primary-700' : 'bg-white text-slate-700'}`}
          onClick={() => toggleSection('basic')}
        >
          <span>Basic Information</span>
          {expandedSection === 'basic' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {expandedSection === 'basic' && (
          <div className="p-4 space-y-4 bg-white">
            {/* Agreement Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Agreement Type
              </label>
              <Controller
                name="agreementType"
                control={control}
                defaultValue=""
                rules={{ required: 'Please select an agreement type' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="" disabled>Select an agreement type</option>
                    {agreementTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.agreementType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.agreementType.message as string}
                </p>
              )}
            </div>
            
            {/* Company/Individual Information */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Company/Individual Name
              </label>
              <Controller
                name="partyA"
                control={control}
                defaultValue=""
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your company or individual name"
                  />
                )}
              />
              {errors.partyA && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.partyA.message as string}
                </p>
              )}
            </div>

            {/* Other Party Information */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Other Party Name
              </label>
              <Controller
                name="partyB"
                control={control}
                defaultValue=""
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Other party's company or individual name"
                  />
                )}
              />
              {errors.partyB && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.partyB.message as string}
                </p>
              )}
            </div>
            
            {/* Type-specific fields */}
            {getTypeSpecificFields()}
          </div>
        )}
      </div>

      {/* Section: Agreement Details */}
      <div className="border rounded-md overflow-hidden">
        <button 
          type="button"
          className={`w-full flex justify-between items-center p-3 text-left font-medium ${expandedSection === 'details' ? 'bg-primary-50 text-primary-700' : 'bg-white text-slate-700'}`}
          onClick={() => toggleSection('details')}
        >
          <span>Agreement Details</span>
          {expandedSection === 'details' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {expandedSection === 'details' && (
          <div className="p-4 space-y-4 bg-white">

            {/* Agreement Purpose */}
            <div>
              <div className="flex justify-between items-start">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purpose of Agreement
                </label>
                <button
                  type="button"
                  onClick={() => requestAiSuggestion('purpose', agreementType)}
                  className="text-xs flex items-center text-primary-600 hover:text-primary-800"
                  disabled={aiSuggesting === 'purpose'}
                >
                  {aiSuggesting === 'purpose' ? (
                    <span className="flex items-center">
                      <span className="animate-pulse">AI thinking...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Get AI suggestion
                    </span>
                  )}
                </button>
              </div>
              <Controller
                name="purpose"
                control={control}
                defaultValue=""
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe the purpose of this agreement"
                  />
                )}
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.purpose.message as string}
                </p>
              )}
            </div>

            {/* Agreement Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Agreement Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="duration"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Duration is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Duration"
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="durationUnit"
                    control={control}
                    defaultValue="months"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    )}
                  />
                </div>
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.duration.message as string}
                </p>
              )}
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Effective Date
              </label>
              <Controller
                name="effectiveDate"
                control={control}
                defaultValue={new Date().toISOString().split('T')[0]}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                )}
              />
            </div>

            {/* Governing Law */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Governing Law (State/Country)
              </label>
              <Controller
                name="governingLaw"
                control={control}
                defaultValue=""
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., California, United States"
                  />
                )}
              />
              {errors.governingLaw && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.governingLaw.message as string}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section: Additional Terms */}
      <div className="border rounded-md overflow-hidden">
        <button 
          type="button"
          className={`w-full flex justify-between items-center p-3 text-left font-medium ${expandedSection === 'additional' ? 'bg-primary-50 text-primary-700' : 'bg-white text-slate-700'}`}
          onClick={() => toggleSection('additional')}
        >
          <span>Additional Terms</span>
          {expandedSection === 'additional' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {expandedSection === 'additional' && (
          <div className="p-4 space-y-4 bg-white">
            {/* Additional Terms */}
            <div>
              <div className="flex justify-between items-start">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Additional Terms (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => requestAiSuggestion('additionalTerms', agreementType)}
                  className="text-xs flex items-center text-primary-600 hover:text-primary-800"
                  disabled={aiSuggesting === 'additionalTerms'}
                >
                  {aiSuggesting === 'additionalTerms' ? (
                    <span className="flex items-center">
                      <span className="animate-pulse">AI thinking...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Get AI suggestion
                    </span>
                  )}
                </button>
              </div>
              <Controller
                name="additionalTerms"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={6}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any specific terms or conditions you want to include"
                  />
                )}
              />
              <div className="mt-2 text-xs text-slate-500 flex items-start">
                <HelpCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  Include any specific clauses such as confidentiality requirements, intellectual property rights, 
                  termination conditions, or other terms relevant to your agreement.
                </span>
              </div>
            </div>
            
            {/* Dispute Resolution */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dispute Resolution Method (Optional)
              </label>
              <Controller
                name="disputeResolution"
                control={control}
                defaultValue="mediation"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="mediation">Mediation</option>
                    <option value="arbitration">Arbitration</option>
                    <option value="litigation">Litigation</option>
                    <option value="custom">Custom (Specify in Additional Terms)</option>
                  </select>
                )}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* AI Assistant Tip */}
      <div className="mt-4 bg-primary-50 border border-primary-100 rounded-md p-3 text-sm text-primary-800">
        <div className="flex items-start">
          <MessageCircle className="h-5 w-5 mr-2 mt-0.5 text-primary-600" />
          <div>
            <p className="font-medium">AI Assistant Tip</p>
            <p className="mt-1">Use the "Get AI suggestion" buttons to receive contextual recommendations for your agreement. The AI will analyze your inputs and suggest appropriate language for your specific agreement type.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementQuestionnaire;
