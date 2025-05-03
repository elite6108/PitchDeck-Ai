import React, { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useDeckStore } from '../../store/deckStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import type { Slide, SlideContent } from '../../types/deck';

interface SlideEditorProps {
  slide: Slide;
  onClose: () => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onClose }) => {
  const { updateSlide, deleteSlide, loading, error } = useDeckStore();
  
  const [title, setTitle] = useState(slide.title);
  const [content, setContent] = useState<SlideContent>({ ...slide.content });
  
  const handleSlideUpdate = async () => {
    if (!slide.id) return;
    
    await updateSlide(slide.id, {
      title,
      content,
      updated_at: new Date().toISOString(),
    });
    
    onClose();
  };
  
  const handleSlideDelete = async () => {
    if (!slide.id) return;
    
    const confirm = window.confirm('Are you sure you want to delete this slide?');
    if (!confirm) return;
    
    await deleteSlide(slide.id);
    onClose();
  };
  
  const updateContent = (key: string, value: string | string[]) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };
  
  const renderContentEditor = () => {
    switch (slide.slide_type) {
      case 'cover':
        return (
          <>
            <Input
              label="Headline"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              fullWidth
            />
            <Input
              label="Subheadline"
              value={content.subheadline || ''}
              onChange={(e) => updateContent('subheadline', e.target.value)}
              fullWidth
            />
          </>
        );
      case 'problem':
      case 'solution':
      case 'business_model':
      case 'go_to_market':
      case 'team':
      case 'financials':
      case 'closing':
        return (
          <>
            <Input
              label="Headline"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              fullWidth
            />
            <TextArea
              label="Content"
              value={content.paragraphs?.[0] || ''}
              onChange={(e) => updateContent('paragraphs', [e.target.value])}
              fullWidth
            />
          </>
        );
      case 'market':
      case 'product':
      case 'competition':
        return (
          <>
            <Input
              label="Headline"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              fullWidth
            />
            <TextArea
              label="Content"
              value={content.paragraphs?.[0] || ''}
              onChange={(e) => updateContent('paragraphs', [e.target.value])}
              fullWidth
            />
            <TextArea
              label="Bullet Points (one per line)"
              value={(content.bullets || []).join('\n')}
              onChange={(e) => updateContent('bullets', e.target.value.split('\n').filter(Boolean))}
              fullWidth
            />
          </>
        );
      default:
        return (
          <div className="p-4 text-gray-500">
            Unknown slide type
          </div>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl w-full">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Slide</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            &times;
          </Button>
        </div>
        
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            label="Slide Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          
          {renderContentEditor()}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="danger"
            onClick={handleSlideDelete}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Slide
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSlideUpdate}
            isLoading={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlideEditor;