import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, PresentationIcon } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import DeckCard from '../../components/deck/DeckCard';
import Button from '../../components/ui/Button';
import { useDeckStore } from '../../store/deckStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { decks, fetchDecks, deleteDeck, loading, error } = useDeckStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);
  
  const handleDeleteDeck = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this deck?');
    if (confirm) {
      await deleteDeck(id);
    }
  };
  
  const filteredDecks = decks.filter(deck => 
    deck.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Pitch Decks</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and edit your pitch decks
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="primary"
                onClick={() => navigate('/create')}
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create New Deck
              </Button>
            </div>
          </div>
          
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="Search your decks..."
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
          ) : filteredDecks.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDecks.map(deck => (
                <DeckCard 
                  key={deck.id} 
                  deck={deck} 
                  onDelete={handleDeleteDeck}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
                <PresentationIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No pitch decks found</h3>
              {searchTerm ? (
                <p className="mt-2 text-gray-500">
                  No decks match your search. Try a different term or clear your search.
                </p>
              ) : (
                <p className="mt-2 text-gray-500">
                  Get started by creating your first pitch deck.
                </p>
              )}
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => navigate('/create')}
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Create New Deck
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;