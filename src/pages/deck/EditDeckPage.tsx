import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  ExternalLinkIcon,
  DownloadIcon,
  SaveIcon,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import SlideThumbnail from '../../components/deck/SlideThumbnail';
import SlideViewer from '../../components/deck/SlideViewer';
import SlideEditor from '../../components/deck/SlideEditor';
import DeckExport from '../../components/deck/DeckExport';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDeckStore } from '../../store/deckStore';
import type { SlideType } from '../../types/deck';

const EditDeckPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentDeck, 
    getDeck, 
    updateDeck,
    createSlide,
    loading, 
    error 
  } = useDeckStore();
  
  const [editingTitle, setEditingTitle] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  useEffect(() => {
    if (id) {
      getDeck(id);
    }
  }, [id, getDeck]);
  
  useEffect(() => {
    if (currentDeck) {
      setDeckTitle(currentDeck.title);
      
      if (currentDeck.slides && currentDeck.slides.length > 0 && !selectedSlideId) {
        setSelectedSlideId(currentDeck.slides[0].id || null);
      }
    }
  }, [currentDeck, selectedSlideId]);
  
  const handleSaveTitle = async () => {
    if (id && deckTitle.trim() !== '') {
      await updateDeck(id, { title: deckTitle });
      setEditingTitle(false);
    }
  };
  
  const handleAddSlide = async () => {
    if (!id) return;
    
    const slideCount = currentDeck?.slides?.length || 0;
    
    // Default to a generic slide type
    const slideType: SlideType = 'product';
    
    const newSlide = {
      title: `Slide ${slideCount + 1}`,
      content: {
        headline: 'New Slide',
        paragraphs: ['Add your content here...'],
      },
      position: slideCount,
      slide_type: slideType,
    };
    
    const slide = await createSlide(id, newSlide);
    if (slide) {
      setSelectedSlideId(slide.id || null);
      setShowEditor(true);
    }
  };
  
  const selectedSlide = currentDeck?.slides?.find(slide => slide.id === selectedSlideId);
  
  if (loading && !currentDeck) {
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        {currentDeck && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </Button>
                
                {editingTitle ? (
                  <div className="ml-4 flex items-center">
                    <Input
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      className="mr-2"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTitle}
                    >
                      <SaveIcon className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <h1 
                    className="ml-4 text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600"
                    onClick={() => setEditingTitle(true)}
                  >
                    {currentDeck.title}
                  </h1>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                >
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Export
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/deck/${id}/view`)}
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-6">
              {/* Slide thumbnails */}
              <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Slides</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddSlide}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
                  {currentDeck.slides?.map((slide) => (
                    <SlideThumbnail
                      key={slide.id}
                      slide={slide}
                      isActive={slide.id === selectedSlideId}
                      onClick={() => {
                        setSelectedSlideId(slide.id || null);
                        setShowEditor(false);
                      }}
                    />
                  ))}
                  
                  <div 
                    className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                    onClick={handleAddSlide}
                  >
                    <PlusIcon className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">Add Slide</p>
                  </div>
                </div>
              </div>
              
              {/* Slide preview and editor */}
              <div className="flex-grow">
                {selectedSlide ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">{selectedSlide.title}</h3>
                      <Button
                        variant={showEditor ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setShowEditor(!showEditor)}
                      >
                        {showEditor ? "View" : "Edit"}
                      </Button>
                    </div>
                    
                    {showEditor ? (
                      <SlideEditor
                        slide={selectedSlide}
                        onClose={() => setShowEditor(false)}
                      />
                    ) : (
                      <div className="mt-4">
                        <SlideViewer slide={selectedSlide} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                    <p className="text-gray-500">Select a slide to preview or edit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <DeckExport
            deck={currentDeck!}
            onClose={() => setShowExportModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EditDeckPage;