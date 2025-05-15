/**
 * X AI Service (Grok 2 Image Gen)
 * 
 * Handles interactions with the X AI API for image generation using Grok 2
 */

/**
 * X AI API key management
 * Using environment variables for security
 */
// Get the X AI API key from environment variables or window object (for development)
// And ensure it's treated as a string
let X_AI_API_KEY = '';

// Try window object first (which we know works based on logs)
if ((window as any).ENV_X_AI_API_KEY) {
  X_AI_API_KEY = String((window as any).ENV_X_AI_API_KEY);
} else if (import.meta.env.VITE_X_AI_API_KEY) { 
  X_AI_API_KEY = String(import.meta.env.VITE_X_AI_API_KEY);
}

// Debug logging for API key status
console.log('X AI API key available:', !!X_AI_API_KEY);
console.log('X AI API key prefix:', X_AI_API_KEY.substring(0, 5));

// Additional check for window object in development mode
if ((window as any).ENV_X_AI_API_KEY) {
  console.log('Using X AI key from window object');
} else if (import.meta.env.VITE_X_AI_API_KEY) {
  console.log('Using X AI key from environment variables');
} else {
  console.log('X AI key not found in any source');
}

// Headers for X AI API
type XAIHeaders = Record<string, string>;

/**
 * Generate images using Grok 2 via X AI API
 * @param prompt The prompt to generate an image for
 * @returns The generated image URL or null if there's an error
 */
export const generateImageWithGrok = async (
  prompt: string
): Promise<string | null> => {
  // Force a direct check against the window object to ensure we have the key
  const activeKey = X_AI_API_KEY || String((window as any).ENV_X_AI_API_KEY || '');
  
  if (!activeKey || activeKey.length < 10) {
    console.log('Using mock Grok 2 service (no valid API key found)');
    console.log('X AI key check - window object key:', !!(window as any).ENV_X_AI_API_KEY);
    console.log('X AI key check - env var key:', !!import.meta.env.VITE_X_AI_API_KEY);
    return getMockImageUrl();
  }
  
  // Add more detailed logging
  console.log('X AI key length:', X_AI_API_KEY.length);
  console.log('X AI key starts with:', X_AI_API_KEY.substring(0, 5));
  
  console.log('Using real Grok 2 service for image generation');
  console.log('Grok 2 image prompt:', prompt);
  
  try {
    // Set up the API endpoint for Aurora image generation
    const apiUrl = 'https://api.x.ai/v1/images/generations';
    
    // Create headers with proper authorization - use activeKey to ensure we have the right value
    const headers: XAIHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${activeKey}`
    };
    
    console.log('Using X AI key with length:', activeKey.length);
    console.log('X AI key starts with:', activeKey.substring(0, 5) + '...');
    
    // Make the API request to X AI's image generation API
    // Note: X AI API has different parameters than DALL-E
    // Using 'grok-2-image' model for image generation
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: "grok-2-image", // Grok 2 image generation model
        prompt,
        n: 1 // Number of images to generate
        // X AI doesn't support 'size' parameter like DALL-E
      })
    });
    
    console.log('Grok 2 API request sent with prompt:', prompt);
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Grok 2 API Error:', errorData);
      // Extract detailed error message for better debugging
      const errorMessage = errorData.error?.message || 
                          (typeof errorData.error === 'string' ? errorData.error : 'Unknown error');
      console.log('Grok 2 detailed error:', errorMessage);
      throw new Error(`Grok 2 API error: ${errorMessage}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Return the image URL
    if (data.data && data.data.length > 0 && data.data[0].url) {
      return data.data[0].url;
    } else {
      console.error('No image URL in Grok 2 response:', data);
      return null;
    }
  } catch (error) {
    console.error('Error generating image with Grok 2:', error);
    return null;
  }
};

/**
 * Generate a mock image URL for testing purposes
 * @returns A mock image URL
 */
const getMockImageUrl = (): string => {
  // Return a placeholder image URL for Grok 2
  return 'https://placehold.co/1024x1024/1B9C85/FFFFFF?text=Grok+2+Mock+Image';
};

// Export function as default to avoid redeclaration errors
const xaiService = {
  generateImageWithGrok
};

export default xaiService;
