import React from 'react';

interface ErrorMessageProps {
  error: string | null;
}

/**
 * ErrorMessage Component
 * 
 * Displays error message at the top of the modal when errors occur.
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
      <p className="text-sm">{error}</p>
    </div>
  );
};

export default ErrorMessage;
