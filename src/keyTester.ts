/**
 * API Key Tester
 * This file outputs detailed information about the API key from environment variables
 */

// Never hardcode actual API keys in code - this is just a format example
const EXAMPLE_FORMAT = "sk-proj-xxxxxxxxxxxx"; // Just a format placeholder, not a real key

// Environment variable key
const ENV_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Only log environment key information
console.group('🔑 API KEY INFORMATION');
console.log('ENV key length:', ENV_KEY.length);
console.log('ENV key available:', !!ENV_KEY);
console.log('');

// Output basic format info for ENV key
if (ENV_KEY) {
  console.log('ENV Key starts with:', ENV_KEY.substring(0, Math.min(8, ENV_KEY.length)));
} else {
  console.log('ENV Key not available');
}
console.log('');

// Check for organization ID in service account keys
if (ENV_KEY && ENV_KEY.startsWith('sk-svcacct-')) {
  console.log('Service account key detected!');
  console.log('Checking for org ID...');

  // Extract org ID if possible
  const parts = ENV_KEY.split('-');
  if (parts.length >= 3) {
    console.log('ENV key org ID:', parts[2]);
  }
}

console.log('');
console.log('Example OpenAI API key format:', EXAMPLE_FORMAT);
console.log('ENV key format matches expected pattern:', ENV_KEY && ENV_KEY.startsWith('sk-'));
console.groupEnd();

export default {};
