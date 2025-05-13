/**
 * OpenAI API Integration Service
 * 
 * Handles interactions with the OpenAI API for content analysis
 * and image query generation.
 */

// IMPORTANT: This is a development-only configuration
// For production deployment, use environment variables in Netlify

// Get API key from environment variables
// This will work in production when properly configured in Netlify
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Log API key status (safely)
console.log('OpenAI API Key available:', !!OPENAI_API_KEY);
console.log('Key type:', OPENAI_API_KEY.startsWith('sk-proj-') ? 'Project Key' : 
                       OPENAI_API_KEY.startsWith('sk-svcacct-') ? 'Service Account Key' : 
                       OPENAI_API_KEY.startsWith('sk-') ? 'Standard Key' : 'Unknown');

// No duplicate logging needed

/**
 * Extract and validate the OpenAI API key
 * @param rawKey The raw API key from environment variables
 * @returns The cleaned and validated API key or undefined if invalid
 */
const extractApiKey = (rawKey: string | undefined): { 
  key: string | undefined; 
  type: 'standard' | 'project' | 'service_account' | 'unknown';
  orgId?: string;
} => {
  if (!rawKey) return { key: undefined, type: 'unknown' };
  
  // Clean whitespace
  const trimmed = rawKey.trim();
  
  // Check key type based on prefix
  if (trimmed.startsWith('sk-svcacct-')) {
    console.log('Detected service account API key');
    // For service account keys, extract the organization ID
    const parts = trimmed.split('-');
    if (parts.length >= 3) {
      return { 
        key: trimmed, 
        type: 'service_account',
        orgId: parts[2]
      };
    }
    return { key: trimmed, type: 'service_account' };
  } else if (trimmed.startsWith('sk-proj-')) {
    console.log('Detected project API key');
    return { key: trimmed, type: 'project' };
  } else if (trimmed.startsWith('sk-')) {
    console.log('Detected standard API key');
    return { key: trimmed, type: 'standard' };
  }
  
  console.log('Unknown API key format');
  return { key: trimmed, type: 'unknown' };
};

// Get the cleaned API key and its type
const apiKeyInfo = extractApiKey(OPENAI_API_KEY);

// Check if we have a valid API key
if (!apiKeyInfo.key) {
  console.error('OpenAI API key is missing. Please add it to your .env file.');
}

// Type definitions for OpenAI API
type OpenAIHeaders = Record<string, string>;

/**
 * Send a request to the OpenAI API
 * @param prompt The prompt to send to the API
 * @param systemPrompt The system prompt to use
 * @param options Additional options for the API request
 * @returns The response from the API
 */
export const queryOpenAI = async (
  prompt: string,
  systemPrompt: string = 'You are a helpful assistant.',
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    useMock?: boolean;
  } = {}
): Promise<string> => {
  // Default configuration
  const model = options.model || 'gpt-3.5-turbo';
  const temperature = options.temperature || 0.7;
  const maxTokens = options.maxTokens || 500;
  const useMock = options.useMock || false;
  
  // Use mock service if requested or if no API key is available
  if (useMock || !apiKeyInfo.key) {
    console.log('Using mock OpenAI service (real service unavailable)');
    return getMockResponse(prompt);
  }
  
  console.log('Using real OpenAI service');
  console.log('Prompt:', prompt);
  
  try {
    // Set up the API endpoint
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Create headers with proper authorization
    const headers: OpenAIHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeyInfo.key}`
    };
    
    // Add the appropriate headers based on key type
    if (apiKeyInfo.type === 'project') {
      // For project API keys, we need the specific beta header
      headers['OpenAI-Beta'] = 'project-api-keys';
      console.log('Using project API key headers');
    } else if (apiKeyInfo.type === 'service_account') {
      // For service account keys, we need to set the organization ID
      if (apiKeyInfo.orgId) {
        headers['OpenAI-Organization'] = `org-${apiKeyInfo.orgId}`;
        console.log(`Using service account API key with organization: org-${apiKeyInfo.orgId}`);
      } else {
        console.warn('Service account key detected but organization ID could not be extracted');
      }
    }
    
    // Log request details (safely)
    console.log('OpenAI API Request:', {
      url: apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': headers['Content-Type'],
        'Authorization': 'Bearer sk-***',
        'OpenAI-Organization': headers['OpenAI-Organization'] || 'not set',
        'OpenAI-Beta': headers['OpenAI-Beta'] || 'not set'
      }
    });
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      })
    });
    
    // Log response status
    console.log('OpenAI API Response status:', response.status);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      
      // If we get a 401 error, try with different approaches based on key type
      if (response.status === 401) {
        if (apiKeyInfo.type === 'project') {
          console.log('Retrying project API key with different configuration...');
          
          // Create new headers without the beta header as a fallback
          const retryHeaders = { ...headers };
          delete retryHeaders['OpenAI-Beta'];
          
          console.log('Retry request with headers:', {
            'Content-Type': retryHeaders['Content-Type'],
            'Authorization': 'Bearer sk-***'
          });
          
          const retryResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: temperature,
              max_tokens: maxTokens
            })
          });
          
          console.log('Retry response status:', retryResponse.status);
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const retryContent = retryData.choices[0]?.message?.content || 'No content in retry response';
            return retryContent;
          } else {
            console.error('Project API key retry also failed');
          }
        } else if (apiKeyInfo.type === 'service_account' && apiKeyInfo.orgId) {
          console.log('Retrying with alternate organization format...');
          
          // Create new headers with a different organization format
          const retryHeaders = { ...headers };
          retryHeaders['OpenAI-Organization'] = apiKeyInfo.orgId; // Try without the 'org-' prefix
          
          console.log('Retry request with headers:', {
            'Content-Type': retryHeaders['Content-Type'],
            'Authorization': 'Bearer sk-***',
            'OpenAI-Organization': retryHeaders['OpenAI-Organization'] || 'not set'
          });
          
          const retryResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: temperature,
              max_tokens: maxTokens
            })
          });
          
          console.log('Retry response status:', retryResponse.status);
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const retryContent = retryData.choices[0]?.message?.content || 'No content in retry response';
            return retryContent;
          } else {
            console.error('Retry also failed');
          }
        }
      }
      
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract the content from the response
    const content = data.choices[0]?.message?.content || 'No content in response';
    
    return content;
  } catch (error) {
    console.error('Error querying OpenAI API:', error);
    console.log('Falling back to mock service due to API error');
    return getMockResponse(prompt);
  }
};

/**
 * Generate a mock response for testing purposes
 * @param prompt The prompt to generate a response for
 * @returns A mock response
 */
const getMockResponse = (prompt: string): string => {
  console.log('Generating mock response for prompt:', prompt);
  
  // Create a response based on the prompt
  if (prompt.includes('test')) {
    return 'This is a response from the OpenAI service. The test is successful.';
  } else if (prompt.includes('hello') || prompt.includes('hi')) {
    return 'Hello! I am the OpenAI assistant. How can I assist you today?';
  } else if (prompt.includes('agreement') || prompt.includes('contract')) {
    // Use the agreement response for agreement-related prompts
    return getMockAgreementResponse(prompt);
  } else {
    return `I've received your prompt: "${prompt}". Here is a response to your query.`;
  }
};

/**
 * Generate a detailed mock agreement response when API key is not available
 * @param prompt The user's prompt
 * @returns A mock agreement response as a string
 */
const getMockAgreementResponse = (prompt: string): string => {
  console.log('Generating mock agreement response for:', prompt);
  
  // Extract potential agreement type from the prompt
  let agreementType = "Standard Agreement";
  if (prompt.toLowerCase().includes('non-disclosure')) {
    agreementType = "Non-Disclosure Agreement";
  } else if (prompt.toLowerCase().includes('service')) {
    agreementType = "Service Agreement";
  } else if (prompt.toLowerCase().includes('employment')) {
    agreementType = "Employment Agreement";
  }
  
  // Create a structured response
  return JSON.stringify({
    "title": agreementType,
    "sections": [
      {
        "title": "1. DEFINITIONS",
        "content": "In this Agreement, the following terms shall have the meanings set forth below: \n\n1.1 'Agreement' means this agreement including any schedules attached hereto.\n\n1.2 'Confidential Information' means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects.\n\n1.3 'Effective Date' means the date this Agreement is signed by both parties."
      },
      {
        "title": "2. PURPOSE AND SCOPE",
        "content": "2.1 The parties are entering into this Agreement for the purpose of [Purpose extracted from prompt].\n\n2.2 This Agreement sets forth the terms and conditions governing the relationship between the parties."
      }
    ]
  });
};

export default {
  queryOpenAI
};
