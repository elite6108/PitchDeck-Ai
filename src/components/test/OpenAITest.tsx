import React, { useState, useEffect } from 'react';
import { queryOpenAI } from '../../services/openaiService';

// API key handling simplified

const OpenAITest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keyType, setKeyType] = useState<string>('');
  const [keyDetails, setKeyDetails] = useState<any>(null);
  const [useMock, setUseMock] = useState<boolean>(false);
  // API key state removed since we're using hardcoded key for now

  // Analyze API key on component mount
  useEffect(() => {
    // Using environment variable directly
    const currentKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (currentKey) {
      // Extract the actual API key from the environment variable
      const extractApiKey = (rawKey: string): string => {
        // Clean whitespace
        const trimmed = rawKey.trim();
        
        // Look for patterns that match OpenAI keys
        const keyPattern = /sk-[a-zA-Z0-9]{32,}/;
        const match = trimmed.match(keyPattern);
        
        if (match && match[0]) {
          return match[0];
        }
        
        // If no pattern match, just return the trimmed key
        return trimmed;
      };
      
      const cleanApiKey = extractApiKey(currentKey);
      const hasWhitespace = currentKey !== currentKey.trim();
      
      // Check key format
      const isProjectKey = cleanApiKey.startsWith('sk-proj-');
      const isServiceAcctKey = cleanApiKey.startsWith('sk-svcacct-');
      const isStandardKey = cleanApiKey.startsWith('sk-') && !isProjectKey && !isServiceAcctKey;
      
      const effectiveKeyType = isProjectKey ? 'Project API Key' : 
                              (isServiceAcctKey ? 'Service Account API Key' :
                              (isStandardKey ? 'Standard API Key' : 'Unknown Key Format'));
      
      setKeyType(effectiveKeyType);
      setKeyDetails({
        length: cleanApiKey.length,
        prefix: cleanApiKey.substring(0, 10), // Show more of the prefix for project keys
        extractedKey: cleanApiKey !== currentKey.trim(),
        hasWhitespace,
        isProjectKey,
        isServiceAcctKey,
        isStandardKey,
        organization: isServiceAcctKey ? cleanApiKey.split('-')[2] : null
      });
    } else {
      setKeyType('No API Key Found');
    }
  }, []);  
  
  // API key update functionality removed
  
  const testOpenAI = async () => {
    setLoading(true);
    setError(null);
    setResult('');
    
    try {
      // Call the API with mock option if selected
      const response = await queryOpenAI(
        'Generate a short test message to confirm the API is working.',
        'You are a helpful assistant that generates a short confirmation message.',
        { maxTokens: 50, useMock: useMock }
      );
      setResult(response);
    } catch (err: any) {
      console.error('OpenAI Test Error:', err);
      const errorMessage = err.message || 'An error occurred';
      // Check for specific error types
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError(`Authentication Error (401): The API key appears to be invalid or has insufficient permissions. ${errorMessage}`);
      } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
        setError(`Rate Limit Error (429): You've exceeded your rate limit. ${errorMessage}`);
      } else if (errorMessage.includes('500')) {
        setError(`Server Error (500): OpenAI's servers encountered an error. ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-slate-800">OpenAI API Test</h2>
      
      {keyType && (
        <div className="mb-4 text-sm">
          <div className="font-medium text-slate-700">API Key Status</div>
          <div className="mt-1">
            <span className="font-medium">Detected Type:</span> {keyType}
          </div>
          <div className="mt-1 text-gray-600">
            Key Length: {keyDetails?.length}, Prefix: {keyDetails?.prefix}
            {keyDetails?.isServiceAcctKey && (
              <div>Organization ID: {keyDetails?.organization}</div>
            )}
          </div>
          {keyDetails?.hasWhitespace && (
            <div className="mt-1 text-red-600">
              Warning: API key contains whitespace which may cause authentication issues
            </div>
          )}
          {keyDetails?.extractedKey && (
            <div className="mt-1 text-blue-600">
              Note: Extracted valid API key from environment variable
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center mb-3">
        <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={useMock} 
            onChange={() => setUseMock(!useMock)}
            className="sr-only peer" 
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-700">{useMock ? 'Using Mock Service' : 'Using Real API'}</span>
        </label>
      </div>
      
      {/* API key input removed */}
      
      <div className="mb-4">
        <button
          onClick={testOpenAI}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          {loading ? 'Testing...' : 'Test OpenAI API'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800">API Error</h3>
          <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{error}</p>
          <div className="mt-2 text-sm text-red-700">
            <strong>Troubleshooting:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Check if your API key is valid and has the correct permissions</li>
              <li>Verify that your API key is properly formatted (should start with 'sk-')</li>
              <li>For service account keys, ensure the organization ID is correctly extracted</li>
              <li>Make sure your account has sufficient credits</li>
              <li>Check for any network issues that might prevent API access</li>
              <li>Verify CORS settings if testing from a browser environment</li>
            </ul>
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-800">Response</h3>
          <p className="mt-1 text-sm text-green-700 whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default OpenAITest;
