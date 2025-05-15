import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageIcon, SearchIcon, PlusIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLogoStore } from '../../store/logoStore';
import { Logo } from '../../types/logo';

const SavedLogosPage: React.FC = () => {
  const navigate = useNavigate();
  const { logos, fetchLogos, deleteLogo, loading, error } = useLogoStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);
  
  // Handle logo download
  const handleDownload = (logo: Logo) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = logo.imageUrl;
    link.download = `${logo.companyName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Logo download started');
  };
  
  // Handle logo deletion
  const handleDelete = async (id: string, companyName: string) => {
    const confirm = window.confirm(`Are you sure you want to delete the logo for "${companyName}"?`);
    if (confirm) {
      try {
        await deleteLogo(id);
        toast.success('Logo deleted successfully');
      } catch (error) {
        toast.error('Failed to delete logo');
      }
    }
  };
  
  // Filter logos based on search term
  const filteredLogos = logos.filter(logo => 
    logo.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    logo.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Saved Logos</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage logos you've created with our logo generator
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => navigate('/logo')}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Create New Logo
              </button>
            </div>
          </div>
          
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="Search your logos by company name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="mt-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="mt-8 grid place-items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredLogos.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLogos.map(logo => (
                <div key={logo.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{logo.companyName}</h3>
                    <span className="text-xs text-gray-500">{new Date(logo.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="p-4 flex-grow">
                    <div className="aspect-square bg-white rounded border border-gray-200 mb-3 flex items-center justify-center overflow-hidden">
                      <img 
                        src={logo.imageUrl} 
                        alt={`${logo.companyName} logo`} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-2 line-clamp-2" title={logo.prompt}>
                      {logo.prompt}
                    </div>
                    
                    <div className="mt-2">
                      {logo.settings.industry && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
                          {logo.settings.industry}
                        </span>
                      )}
                      {logo.settings.style && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-2">
                          {logo.settings.style}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(logo)}
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500"
                      title="Download logo"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(logo.id, logo.companyName)}
                      className="inline-flex items-center justify-center p-2 rounded-md text-red-700 bg-white border border-gray-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                      title="Delete logo"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
                <ImageIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No logos found</h3>
              {searchTerm ? (
                <p className="mt-2 text-gray-500">
                  No logos match your search. Try a different term or clear your search.
                </p>
              ) : (
                <p className="mt-2 text-gray-500">
                  Get started by creating your first logo.
                </p>
              )}
              <div className="mt-6">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => navigate('/logo')}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create Logo
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SavedLogosPage;
