/**
 * OpenAI API Integration Service
 * 
 * Handles interactions with the OpenAI API for content analysis
 * and image query generation.
 */

import axios from 'axios';

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Get the API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Interface for OpenAI API request
interface OpenAIRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

// Interface for OpenAI API response
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Send a request to the OpenAI API
 */
export const queryOpenAI = async (
  prompt: string,
  systemPrompt: string = 'You are a helpful assistant.',
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> => {
  try {
    // Default configuration
    const model = options.model || 'gpt-3.5-turbo';
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 500;

    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using mock response.');
      return getMockResponse(prompt);
    }

    // Prepare the request
    const request: OpenAIRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    };

    // Send the request to OpenAI
    const response = await axios.post<OpenAIResponse>(
      OPENAI_API_URL,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Return the response content
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error querying OpenAI:', error);
    
    // Fall back to mock response if API fails
    return getMockResponse(prompt);
  }
};

/**
 * Generate a simple mock response for testing when API key is not available
 */
const getMockResponse = (prompt: string): string => {
  if (prompt.includes('analyze')) {
    return JSON.stringify({
      industry: 'technology',
      audience: 'investors',
      tone: 'professional',
      key_themes: ['innovation', 'growth', 'solution']
    });
  } else if (prompt.includes('image')) {
    return JSON.stringify({
      queries: ['business meeting', 'technology innovation', 'growth chart']
    });
  }
  
  return 'This is a mock response for testing purposes.';
};

export default {
  queryOpenAI
};
