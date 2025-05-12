import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Download, Edit, Trash2 } from 'lucide-react';

import Button from '../../components/ui/Button';
import { AgreementNavBar } from '../../components/agreement';
import { BusinessAgreement } from '../../types';
import { getSavedAgreements, deleteSavedAgreement, exportAgreementToPDF } from '../../services';

const MyAgreementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<BusinessAgreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        setIsLoading(true);
        const savedAgreements = await getSavedAgreements();
        setAgreements(savedAgreements);
        setError(null);
      } catch (err) {
        setError('Failed to load your agreements. Please try again later.');
        console.error('Error fetching agreements:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgreements();
  }, []);

  const handleCreateNew = () => {
    navigate('/agreements/create');
  };

  const handleEdit = (agreementId: string) => {
    navigate(`/agreements/edit/${agreementId}`);
  };

  const handleView = (agreementId: string) => {
    navigate(`/agreements/view/${agreementId}`);
  };

  const handleExport = async (agreement: BusinessAgreement) => {
    try {
      const pdf = exportAgreementToPDF(agreement);
      pdf.save(`${agreement.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      setError('Failed to export the agreement. Please try again later.');
      console.error('Error exporting agreement:', err);
    }
  };

  const handleDelete = async (agreementId: string) => {
    if (window.confirm('Are you sure you want to delete this agreement?')) {
      try {
        await deleteSavedAgreement(agreementId);
        setAgreements(agreements.filter(agreement => agreement.id !== agreementId));
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Agreements</h1>
          <Button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Agreement
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : agreements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Agreements Yet</h2>
            <p className="text-gray-500 mb-6">You haven't created any agreements yet. Click the button below to create your first one.</p>
            <Button 
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Create New Agreement
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agreements.map((agreement) => (
              <div key={agreement.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-600 p-4 text-white">
                  <h3 className="font-bold truncate">{agreement.title}</h3>
                  <p className="text-sm opacity-80">
                    {new Date(agreement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Parties</p>
                    <p className="font-medium">{agreement.partyA} and {agreement.partyB}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Purpose</p>
                    <p className="font-medium truncate">{agreement.purpose}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{agreement.duration}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Governing Law</p>
                    <p className="font-medium">{agreement.governingLaw}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
                  <Button 
                    onClick={() => handleView(agreement.id!)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={() => handleExport(agreement)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={() => handleEdit(agreement.id!)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={() => handleDelete(agreement.id!)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgreementsPage;
