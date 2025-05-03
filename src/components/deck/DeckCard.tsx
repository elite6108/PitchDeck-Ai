import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PresentationIcon, 
  EditIcon, 
  Trash2Icon, 
  ExternalLinkIcon
} from 'lucide-react';
import type { PitchDeck } from '../../types/deck';

interface DeckCardProps {
  deck: PitchDeck;
  onDelete: (id: string) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onDelete }) => {
  const formattedDate = new Date(deck.created_at || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-primary-100 rounded-md">
              <PresentationIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {deck.title}
              </h3>
              <p className="text-sm text-gray-500">
                Created {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {deck.slides?.length || 0} slides
          </div>
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={() => onDelete(deck.id || '')}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
            <Link to={`/deck/${deck.id}/edit`}>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <EditIcon className="h-4 w-4" />
              </button>
            </Link>
            <Link to={`/deck/${deck.id}/view`}>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700 focus:outline-none"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-1" />
                View
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckCard;