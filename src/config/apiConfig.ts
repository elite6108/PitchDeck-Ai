/**
 * API Configuration
 * 
 * Centralized configuration for all API endpoints.
 * All API URLs should be defined here and referenced from this file.
 * NEVER hardcode API endpoints in service files.
 */

// Base URLs for various APIs
export const API_URLS = {
  // OpenAI API endpoints
  OPENAI: {
    BASE_URL: import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1',
    CHAT_COMPLETIONS: '/chat/completions',
    IMAGE_GENERATIONS: '/images/generations'
  },
  
  // X AI (Grok) API endpoints
  X_AI: {
    BASE_URL: import.meta.env.VITE_X_AI_API_URL || 'https://api.x.ai/v1',
    CHAT_COMPLETIONS: '/chat/completions',
    IMAGE_GENERATIONS: '/images/generations'
  },
  
  // Unsplash API
  UNSPLASH: {
    BASE_URL: import.meta.env.VITE_UNSPLASH_API_URL || 'https://api.unsplash.com',
    SEARCH_PHOTOS: '/search/photos'
  },
  
  // Pexels API
  PEXELS: {
    BASE_URL: import.meta.env.VITE_PEXELS_API_URL || 'https://api.pexels.com/v1',
    SEARCH: '/search'
  }
};

/**
 * Get the full API URL for a specific endpoint
 * @param baseUrl The base URL of the API
 * @param endpoint The specific endpoint to append
 * @returns The complete API URL
 */
export const getApiUrl = (baseUrl: string, endpoint: string): string => {
  return `${baseUrl}${endpoint}`;
};

/**
 * Get OpenAI API URL for chat completions
 * @returns The complete API URL
 */
export const getOpenAIChatCompletionsUrl = (): string => {
  return getApiUrl(API_URLS.OPENAI.BASE_URL, API_URLS.OPENAI.CHAT_COMPLETIONS);
};

/**
 * Get OpenAI API URL for image generations
 * @returns The complete API URL
 */
export const getOpenAIImageGenerationsUrl = (): string => {
  return getApiUrl(API_URLS.OPENAI.BASE_URL, API_URLS.OPENAI.IMAGE_GENERATIONS);
};

/**
 * Get X AI (Grok 2) API URL for chat completions
 * @returns The complete API URL
 */
export const getXAIChatCompletionsUrl = (): string => {
  return getApiUrl(API_URLS.X_AI.BASE_URL, API_URLS.X_AI.CHAT_COMPLETIONS);
};

/**
 * Get X AI (Grok 2) API URL for image generations
 * @returns The complete API URL
 */
export const getXAIImageGenerationsUrl = (): string => {
  return getApiUrl(API_URLS.X_AI.BASE_URL, API_URLS.X_AI.IMAGE_GENERATIONS);
};

/**
 * Get Unsplash API URL for photo search
 * @returns The complete API URL
 */
export const getUnsplashSearchUrl = (): string => {
  return getApiUrl(API_URLS.UNSPLASH.BASE_URL, API_URLS.UNSPLASH.SEARCH_PHOTOS);
};

/**
 * Get Pexels API URL for search
 * @returns The complete API URL
 */
export const getPexelsSearchUrl = (): string => {
  return getApiUrl(API_URLS.PEXELS.BASE_URL, API_URLS.PEXELS.SEARCH);
};

export default {
  API_URLS,
  getApiUrl,
  getOpenAIChatCompletionsUrl,
  getOpenAIImageGenerationsUrl,
  getXAIChatCompletionsUrl,
  getXAIImageGenerationsUrl,
  getUnsplashSearchUrl,
  getPexelsSearchUrl
};
