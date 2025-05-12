import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  EditIcon, 
  DownloadIcon,
  ListIcon,
  XIcon
} from 'lucide-react';
// Header component is not used in this file
import SlideViewer from '../../components/deck/SlideViewer';
import SlideThumbnail from '../../components/deck/SlideThumbnail';
import DeckExport from '../../components/deck/DeckExport/index';
import Button from '../../components/ui/Button';
import { useDeckStore } from '../../store/deckStore';

const ViewDeckPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDeck, getDeck, loading, error } = useDeckStore();
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  useEffect(() => {
    if (id) {
      getDeck(id);
    }
  }, [id, getDeck]);
  
  const handleNext = () => {
    if (currentDeck?.slides && currentSlideIndex < currentDeck.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-error-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  if (!currentDeck || !currentDeck.slides || currentDeck.slides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No slides found</h2>
          <p className="text-gray-700 mb-6">This deck doesn't have any slides yet.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const currentSlide = currentDeck.slides[currentSlideIndex];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <div className="bg-black py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-white hover:text-white hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Exit
          </Button>
          <h1 className="text-white font-medium ml-4">{currentDeck.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`text-white hover:text-white hover:bg-gray-800 ${showThumbnails ? 'bg-gray-800' : ''}`}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/deck/${id}/edit`)}
            className="text-white hover:text-white hover:bg-gray-800"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="text-white hover:text-white hover:bg-gray-800"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
          
          <span className="text-white text-sm">
            {currentSlideIndex + 1} / {currentDeck.slides.length}
          </span>
        </div>
      </div>
      
      <div className="flex flex-grow">
        {/* Slide thumbnails sidebar */}
        {showThumbnails && (
          <div className="w-64 bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Slides</h3>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowThumbnails(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {currentDeck.slides.map((slide, index) => (
                  <SlideThumbnail
                    key={slide.id || index}
                    slide={slide}
                    isActive={index === currentSlideIndex}
                    onClick={() => setCurrentSlideIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main slide display */}
        <div className="flex-grow flex flex-col items-center justify-center p-8 relative">
          <div className="max-w-4xl w-full">
            <SlideViewer slide={currentSlide} />
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              isDisabled={currentSlideIndex === 0}
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 opacity-100 shadow-lg"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              isDisabled={currentSlideIndex === currentDeck.slides.length - 1}
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 opacity-100 shadow-lg bg-[#1f2937]"
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <DeckExport
            deck={currentDeck}
            onClose={() => setShowExportModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ViewDeckPage;