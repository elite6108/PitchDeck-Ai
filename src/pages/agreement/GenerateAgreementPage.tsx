import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Download, Save, FileText, AlertCircle } from 'lucide-react';

import Button from '../../components/ui/Button';
import { generateBusinessAgreement, exportAgreementToPDF, saveAgreement } from '../../services';
import { AgreementQuestionnaire, AgreementPreview, AgreementNavBar } from '../../components/agreement';
import { BusinessAgreement } from '../../types';

const GenerateAgreementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedAgreement, setGeneratedAgreement] = useState<BusinessAgreement | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{field: string, text: string} | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { handleSubmit, control, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setIsGenerating(true);
      const agreement = await generateBusinessAgreement(data);
      setGeneratedAgreement(agreement);
    } catch (error) {
      console.error('Error generating agreement:', error);
      alert('There was an error generating your agreement. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAiSuggestion = (field: string, suggestion: string) => {
    setAiSuggestion({ field, text: suggestion });
    
    // Auto-apply the suggestion after a short delay
    setTimeout(() => {
      setValue(field, suggestion);
      setAiSuggestion(null);
    }, 3000);
  };

  const handleExportPDF = () => {
    if (generatedAgreement) {
      const pdf = exportAgreementToPDF(generatedAgreement);
      pdf.save(`${generatedAgreement.title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleSaveAgreement = async () => {
    if (generatedAgreement) {
      try {
        setIsSubmitting(true);
        const savedAgreement = await saveAgreement(generatedAgreement);
        setGeneratedAgreement(savedAgreement); // Update with the ID
        setSuccessMessage('Agreement saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Failed to save the agreement. Please try again.');
        console.error('Error saving agreement:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleViewMyAgreements = () => {
    navigate('/agreements/my-agreements');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AgreementNavBar currentStep="Generate Agreement" />
      
      {aiSuggestion && (
        <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-lg border border-primary-100 p-4 z-20 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">AI Suggestion for {aiSuggestion.field}</h3>
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                {aiSuggestion.text}
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Auto-applying suggestion...
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Business Agreement Generator</h1>
          <p className="text-slate-600 mt-2">
            Create professional business agreements tailored to your specific needs
          </p>
          
          {successMessage && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">
              <div className="flex">
                <div className="ml-3">
                  <p className="font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
              <div className="flex">
                <div className="ml-3">
                  <p className="font-medium">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="font-medium">AI-Powered Document Generation</p>
                <p className="mt-1">Our AI will help you create a comprehensive, legally-sound document based on your inputs. Use the AI suggestion buttons throughout the form for guidance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questionnaire Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Agreement Details</h2>
            
            {!generatedAgreement ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <AgreementQuestionnaire 
                  control={control} 
                  errors={errors} 
                  onAiSuggestion={handleAiSuggestion}
                />
                
                <div className="mt-6">
                  <Button 
                    type="submit"
                    className="w-full"
                    isDisabled={isGenerating}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Generating...
                      </span>
                    ) : 'Generate Agreement'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => setGeneratedAgreement(null)}
                  variant="secondary"
                >
                  Create New Agreement
                </Button>
                
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">
              {generatedAgreement ? 'Agreement Preview' : 'Preview'}
            </h2>
            
            {isGenerating ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Generating your agreement...</p>
                </div>
              </div>
            ) : generatedAgreement ? (
              <div className="flex-1 flex flex-col">
                <AgreementPreview agreement={generatedAgreement} />
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline"
                    onClick={handleSaveAgreement}
                    className="flex items-center gap-2"
                    isDisabled={isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    Save Agreement
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    variant="primary"
                    className="flex items-center gap-2"
                    isDisabled={!generatedAgreement}
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={handleViewMyAgreements}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    My Agreements
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-lg p-8">
                <div>
                  <p className="mb-2">Complete the form to generate your business agreement</p>
                  <p className="text-sm">The AI will create a customized agreement based on your inputs</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateAgreementPage;
