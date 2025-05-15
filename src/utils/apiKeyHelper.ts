/**
 * Temporary helper for setting API keys during development
 * 
 * WARNING: This is NOT a production solution. In production, API calls
 * should be handled through a backend service to keep keys secure.
 */

// Set API keys from .env.local manually to avoid environment variable loading issues
export const setDevelopmentApiKeys = () => {
  // These variables will be used by the openaiService.ts through window object fallback
  // For development, set these in your .env.local file and initialize them here manually
  // This is just an example of how to initialize the API keys in development
  
  // NOTE: REPLACE THE PLACEHOLDER STRINGS WITH ACTUAL KEYS IN YOUR LOCAL DEVELOPMENT ONLY
  // DO NOT COMMIT REAL API KEYS TO GIT REPOSITORY
  (window as any).ENV_OPENAI_API_KEY = 
    "YOUR_OPENAI_API_KEY"; // Replace with your actual key in development
  
  (window as any).ENV_DALLE_API_KEY = 
    "YOUR_DALLE_API_KEY"; // Replace with your actual key in development

  console.log("Development API keys helper initialized");
};

export default {
  setDevelopmentApiKeys
};
