import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Edit, Trash2 } from 'lucide-react';

import Button from '../../components/ui/Button';
import { AgreementNavBar, AgreementPreview } from '../../components/agreement';
import { BusinessAgreement } from '../../types';
import { getSavedAgreementById, exportAgreementToPDF, deleteSavedAgreement } from '../../services';

const ViewAgreementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<BusinessAgreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!id) {
        setError('Agreement ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedAgreement = await getSavedAgreementById(id);
        
        if (!fetchedAgreement) {
          setError('Agreement not found');
        } else {
          setAgreement(fetchedAgreement);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load the agreement. Please try again later.');
        console.error('Error fetching agreement:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgreement();
  }, [id]);

  const handleBack = () => {
    navigate('/agreements/my-agreements');
  };

  const handleEdit = () => {
    navigate(`/agreements/edit/${id}`);
  };

  const handleExport = () => {
    if (agreement) {
      const pdf = exportAgreementToPDF(agreement);
      pdf.save(`${agreement.title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this agreement?')) {
      try {
        await deleteSavedAgreement(id);
        navigate('/agreements/my-agreements');
      } catch (err) {
        setError('Failed to delete the agreement. Please try again later.');
        console.error('Error deleting agreement:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AgreementNavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            onClick={handleBack}
            variant="ghost"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Agreements
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLoading ? 'Loading...' : agreement ? agreement.title : 'Agreement Details'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <div className="mt-4">
              <Button 
                onClick={handleBack}
                variant="primary"
              >
                Return to My Agreements
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : agreement ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 mb-6">
              <Button 
                onClick={handleEdit}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 min-w-[120px] justify-center"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                onClick={handleExport}
                variant="primary"
                className="flex items-center gap-2 px-4 py-2 min-w-[120px] justify-center"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                onClick={handleDelete}
                variant="danger"
                className="flex items-center gap-2 px-4 py-2 min-w-[120px] justify-center"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
            
            <div className="border rounded-lg">
              <AgreementPreview agreement={agreement} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ViewAgreementPage;
