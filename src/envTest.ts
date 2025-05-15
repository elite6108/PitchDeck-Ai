/**
 * Environment Variables Test File
 * This is a simple utility to validate that Vite is correctly loading environment variables
 */

// Export environment info for debugging
export const dumpEnvironmentInfo = () => {
  const envInfo = {
    allKeys: Object.keys(import.meta.env),
    viteKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
    // OpenAI API Key
    openAiKeyExists: 'VITE_OPENAI_API_KEY' in import.meta.env,
    openAiKeyType: typeof import.meta.env.VITE_OPENAI_API_KEY,
    openAiKeyEmpty: import.meta.env.VITE_OPENAI_API_KEY === '',
    // DALL-E API Key
    dalleKeyExists: 'VITE_OPENAI_DALLE_API_KEY' in import.meta.env,
    dalleKeyType: typeof import.meta.env.VITE_OPENAI_DALLE_API_KEY,
    dalleKeyEmpty: import.meta.env.VITE_OPENAI_DALLE_API_KEY === '',
    // X AI API Key
    xAiKeyExists: 'VITE_X_AI_API_KEY' in import.meta.env,
    xAiKeyType: typeof import.meta.env.VITE_X_AI_API_KEY,
    xAiKeyEmpty: import.meta.env.VITE_X_AI_API_KEY === '',
    // Environment info
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  };

  console.table(envInfo);
  return envInfo;
};

// Auto-run at import time
dumpEnvironmentInfo();
