/**
 * Logo Generator Service
 * 
 * Uses AI models (DALL-E or Aurora) to generate professional logos based on user prompts.
 * Provides specialized prompting for better logo results.
 */

import { generateImageWithDALLE } from './openaiService';
// Import directly from the JS file to avoid TypeScript issues
import xaiService from './xaiService.js';
import { LogoGenerationOptions } from '../types/logo';

// Extract the Grok 2 image generation function
const { generateImageWithGrok } = xaiService;

/**
 * Creates a condensed but visually rich prompt for Grok 2 that stays within the 1024 character limit
 * while producing more visually striking logos similar to DALL-E quality
 * @param companyName The name of the company
 * @param industry The industry of the company
 * @param style The style of the logo
 * @param colorScheme The color scheme for the logo
 * @param additionalDetails Additional details for logo generation
 * @param squareFormat Whether the logo should be in square format
 * @returns A condensed prompt text that stays under 1024 characters but produces rich visuals
 */
const createCondensedPrompt = (
  companyName: string,
  industry: string = '',
  style: string = 'modern',
  colorScheme: string = '',
  additionalDetails: string = '',
  squareFormat: boolean = true
): string => {
  // Define style descriptors to make the logo more visually interesting
  const styleDescriptors: Record<string, string> = {
    'modern': 'sleek, innovative, cutting-edge, with bold geometric shapes and clean lines',
    'minimalist': 'elegant, refined, with essential elements, clean negative space, and perfect balance',
    'classic': 'timeless, distinguished, with elegant typography and traditional symbols',
    'playful': 'vibrant, energetic, with dynamic shapes, bright colors, and creative visual metaphors',
    'corporate': 'professional, trustworthy, with structured elements and balanced composition',
    'vintage': 'retro-inspired, nostalgic, with textured details and heritage elements',
    'luxury': 'premium, sophisticated, with gold/silver accents and refined details',
    'tech': 'futuristic, digital, with abstract tech elements and innovative symbols'
  };
  
  // Get enhanced style description or use default if style not in our map
  const styleDesc = styleDescriptors[style] || `${style} with visually striking elements`;
  
  // Create a visually rich prompt that fits within Grok 2's 1024 character limit
  let promptText = `Create an eye-catching, premium ${style} logo for "${companyName}". The logo should be ${styleDesc}. `;
  
  // Add enhanced industry context if provided
  if (industry) {
    promptText += `Incorporate creative visual metaphors for the ${industry} industry. `;
  }
  
  // Add vibrant color direction
  if (colorScheme) {
    promptText += `Use a striking ${colorScheme} color palette with bold contrast and visual depth. `;
  } else {
    promptText += `Use a vibrant color palette with excellent contrast that creates visual impact. `;
  }
  
  // Add technical + visual requirements - balancing technical needs with visual quality
  promptText += `The logo must: 1) have a transparent background, 2) prominently display "${companyName}" in stylish typography, 3) be visually memorable with distinctive shapes/symbols, 4) use ${squareFormat ? 'square format' : 'appropriate proportions'} with professional composition.`;
  
  // Add a snippet of additional details if provided (limited to avoid prompt length issues)
  if (additionalDetails && additionalDetails.trim().length > 0) {
    // Truncate additional details if needed to stay within limits
    const maxAdditionalLength = 80;
    const truncatedDetails = additionalDetails.length > maxAdditionalLength
      ? additionalDetails.substring(0, maxAdditionalLength) + '...'
      : additionalDetails;
    
    promptText += ` Additional elements: ${truncatedDetails}`;
  }
  
  // Ensure we're under the limit
  if (promptText.length > 950) {
    // If still too long, create a more focused version while preserving visual quality direction
    promptText = `Create a premium ${style} logo for "${companyName}". Make it visually striking with bold colors, creative symbols, and professional composition. Transparent background required.`;
  }
  
  return promptText;
};


/**
 * Generate a logo using either DALL-E or Aurora
 * @param options The options for logo generation
 * @returns The URL of the generated logo image or null if there's an error
 */
export const generateLogo = async (options: LogoGenerationOptions): Promise<string | null> => {
  try {
    const {
      companyName,
      industry = '',
      style = 'modern',
      colorScheme = '',
      additionalDetails = '',
      squareFormat = true,
      model
    } = options;
    
    // Build a detailed prompt that will produce a good logo
    // Use exact company name and specify requirements for a clean logo with transparent background
    let promptText = `Design a professional ${style} logo that MUST include the text "${companyName}" as part of the logo. The company name must be prominently displayed and legible in the logo design.`;
    
    // Add industry if provided - make this more explicit
    if (industry) {
      promptText += ` This is for a ${industry} company, so the logo should include visual elements and symbols commonly associated with the ${industry} industry. The design must visually communicate the company's industry (${industry}) through relevant imagery, icons, or stylistic elements.`;
    } else {
      promptText += ` The logo should include appropriate visual elements that represent a professional business.`;
    }
    
    // Add color scheme if provided - be more specific
    if (colorScheme) {
      promptText += ` The logo should use a ${colorScheme} color scheme with good contrast to ensure readability of the company name.`;
    }
    
    // Add additional details if provided
    if (additionalDetails) {
      promptText += ` Additional requirements: ${additionalDetails}`;
    }
    
    // Add specifications for a good logo
    promptText += ` The logo must include the following characteristics:
    1. MUST include the company name "${companyName}" as text in the logo
    2. Clean, simple, and memorable design with strong visual identity
    3. Professional appearance suitable for business use
    4. ${squareFormat ? 'Square format with appropriate padding around the logo' : 'Appropriate proportions for versatile use'}
    5. Good contrast and readability at different sizes`;
    
    // Add specific instructions to improve logo quality
    promptText += ` IMPORTANT TECHNICAL REQUIREMENTS:
    1. 100% TRANSPARENT BACKGROUND (.png format)
    2. Logo centered in the image
    3. The company name "${companyName}" MUST be included as text in the logo - this is mandatory
    4. Text must be exactly "${companyName}" without any spelling changes
    5. Do not add any decorative background elements or additional text apart from the company name
    6. The logo should look professional and be suitable for business use
    7. The logo should clearly reflect the ${industry || 'business'} industry through relevant visual elements`;
    
    console.log('Logo generation prompt:', promptText);
    
    console.log(`Generating logo with model: ${model}`);
    let result: string | null = null;
    
    // Generate image with selected model - with extra logging for debugging
    if (model === 'grok') {
      console.log('Using Grok 2 for image generation');
      try {
        // Create a condensed prompt for Grok 2 that stays within the 1024 character limit
        const grokPromptText = createCondensedPrompt(companyName, industry, style, colorScheme, additionalDetails, squareFormat);
        
        // Log the prompt length to ensure it's below the limit
        console.log('Grok 2 prompt length:', grokPromptText.length);
        
        result = await generateImageWithGrok(grokPromptText);
        // Show the result status
        console.log('Grok 2 generation result:', result ? 'Success' : 'Failed');
        
        // Only fall back if the result is actually null
        if (!result) {
          console.log('Grok 2 failed, falling back to DALL-E');
          result = await generateImageWithDALLE(promptText, {
            size: '1024x1024', // Square format is typically best for logos
            quality: 'hd',     // Higher quality for better logo details
            style: 'vivid',    // Vivid tends to work better for logos
            model: 'dall-e-3'  // Explicitly set model to ensure consistency
          });
        }
      } catch (grokError) {
        console.error('Grok 2 generation failed:', grokError);
        console.log('Falling back to DALL-E due to Grok 2 error');
        result = await generateImageWithDALLE(promptText, {
          size: '1024x1024', // Square format is typically best for logos
          quality: 'hd',     // Higher quality for better logo details
          style: 'vivid',    // Vivid tends to work better for logos
          model: 'dall-e-3'  // Explicitly set model to ensure consistency
        });
      }
    } else {
      // Default to DALL-E
      result = await generateImageWithDALLE(promptText, {
        size: '1024x1024', // Square format is typically best for logos
        quality: 'hd',     // Higher quality for better logo details
        style: 'vivid',    // Vivid tends to work better for logos
        model: 'dall-e-3'  // Explicitly set model to ensure consistency
      });
    }
    
    return result;
  } catch (error) {
    console.error("Logo generation error:", error);
    return null;
  }
};

/**
 * Generate a set of logo variations
 * @param baseOptions The base options for logo generation
 * @param variations The number of variations to generate
 * @returns An array of logo image URLs
 */
export const generateLogoVariations = async (
  baseOptions: LogoGenerationOptions,
  variations: number = 3
): Promise<(string | null)[]> => {
  const results: (string | null)[] = [];
  const styleVariations = ['modern', 'minimalist', 'classic', 'playful', 'corporate'];
  
  // Generate initial logo
  const firstLogo = await generateLogo(baseOptions);
  if (firstLogo) results.push(firstLogo);
  
  // Generate additional variations with different styles
  for (let i = 1; i < variations && i < styleVariations.length; i++) {
    const style = styleVariations[i] as LogoGenerationOptions['style'];
    const variationResult = await generateLogo({
      ...baseOptions,
      style,
      additionalDetails: `${baseOptions.additionalDetails || ''} Make this variation distinctly different from previous versions.`
    });
    results.push(variationResult);
  }
  
  return results;
};

export default {
  generateLogo,
  generateLogoVariations
};
