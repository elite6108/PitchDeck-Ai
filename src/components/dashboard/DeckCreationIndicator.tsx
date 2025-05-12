/**
 * Deck Creation Indicator Component
 * 
 * Displays the styling status for a deck and provides visual feedback
 * on the auto-styling process
 */

import React from 'react';
import { StylingStatus } from '../../types/analysis';
import { Sparkles, Clock, CheckCircle } from 'lucide-react';

interface DeckCreationIndicatorProps {
  status: StylingStatus;
  isEnabled: boolean;
  onToggle?: () => void;
  small?: boolean;
}

const DeckCreationIndicator: React.FC<DeckCreationIndicatorProps> = ({
  status,
  isEnabled,
  onToggle,
  small = false
}) => {
  if (!isEnabled) {
    return null;
  }

  // Determine icon and text based on status
  const getStatusContent = () => {
    switch (status) {
      case 'in_progress':
        return {
          icon: <Clock className={small ? "h-3 w-3" : "h-4 w-4"} />,
          text: small ? "Styling..." : "AI styling in progress...",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800"
        };
      case 'complete':
        return {
          icon: <CheckCircle className={small ? "h-3 w-3" : "h-4 w-4"} />,
          text: small ? "Styled" : "AI styling applied",
          bgColor: "bg-green-100",
          textColor: "text-green-800"
        };
      default:
        return {
          icon: <Sparkles className={small ? "h-3 w-3" : "h-4 w-4"} />,
          text: small ? "Styling" : "AI styling ready",
          bgColor: "bg-purple-100",
          textColor: "text-purple-800"
        };
    }
  };

  const { icon, text, bgColor, textColor } = getStatusContent();

  return (
    <div 
      className={`inline-flex items-center ${bgColor} ${textColor} rounded-full px-2 py-1 text-xs font-medium`}
      onClick={onToggle}
      style={{ cursor: onToggle ? 'pointer' : 'default' }}
    >
      {icon}
      <span className={small ? "ml-1" : "ml-1.5"}>
        {text}
      </span>
    </div>
  );
};

export default DeckCreationIndicator;
