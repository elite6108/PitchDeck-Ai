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
        result = await generateImageWithGrok(promptText);
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
