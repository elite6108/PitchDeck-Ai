/**
 * Logo Generator Service
 * 
 * Uses DALL-E to generate professional logos based on user prompts.
 * Provides specialized prompting for better logo results.
 */

import { generateImageWithDALLE } from './openaiService';

// Types for logo generation
export interface LogoGenerationOptions {
  companyName: string;
  industry?: string;
  style?: 'modern' | 'minimalist' | 'classic' | 'playful' | 'corporate';
  colorScheme?: string;
  additionalDetails?: string;
  squareFormat?: boolean;
}

/**
 * Generate a logo using DALL-E
 * @param options The options for logo generation
 * @returns The URL of the generated logo image or null if there's an error
 */
export const generateLogo = async (options: LogoGenerationOptions): Promise<string | null> => {
  const {
    companyName,
    industry = '',
    style = 'modern',
    colorScheme = '',
    additionalDetails = '',
    squareFormat = true
  } = options;
  
  // Build a detailed prompt for DALL-E that will produce a good logo
  // Use exact company name and specify requirements for a clean logo with transparent background
  let prompt = `Design a professional ${style} logo that MUST include the text "${companyName}" as part of the logo. The company name must be prominently displayed and legible in the logo design.`;
  
  // Add industry if provided - make this more explicit
  if (industry) {
    prompt += ` This is for a ${industry} company, so the logo should include visual elements and symbols commonly associated with the ${industry} industry. The design must visually communicate the company's industry (${industry}) through relevant imagery, icons, or stylistic elements.`;
  } else {
    prompt += ` The logo should include appropriate visual elements that represent a professional business.`;
  }
  
  // Add color scheme if provided - be more specific
  if (colorScheme) {
    prompt += ` The logo should use a ${colorScheme} color scheme with good contrast to ensure readability of the company name.`;
  }
  
  // Add additional details if provided
  if (additionalDetails) {
    prompt += ` Additional requirements: ${additionalDetails}`;
  }
  
  // Add specifications for a good logo
  prompt += ` The logo must include the following characteristics:
  1. MUST include the company name "${companyName}" as text in the logo
  2. Clean, simple, and memorable design with strong visual identity
  3. Professional appearance suitable for business use
  4. ${squareFormat ? 'Square format with appropriate padding around the logo' : 'Appropriate proportions for versatile use'}
  5. Good contrast and readability at different sizes`;
  
  // Add specific instructions for DALL-E to improve logo quality
  prompt += ` IMPORTANT TECHNICAL REQUIREMENTS:
  1. 100% TRANSPARENT BACKGROUND (.png format)
  2. Logo centered in the image
  3. The company name "${companyName}" MUST be included as text in the logo - this is mandatory
  4. Text must be exactly "${companyName}" without any spelling changes
  5. Do not add any decorative background elements or additional text apart from the company name
  6. The logo should look professional and be suitable for business use
  7. The logo should clearly reflect the ${industry || 'business'} industry through relevant visual elements`;
  
  console.log('Logo generation prompt:', prompt);
  
  // Call DALL-E with appropriate settings for logo generation
  console.log('Final logo prompt:', prompt);
  
  return generateImageWithDALLE(prompt, {
    size: '1024x1024', // Square format is typically best for logos
    quality: 'hd',     // Higher quality for better logo details
    style: 'vivid',    // Vivid tends to work better for logos
    model: 'dall-e-3'  // Explicitly set model to ensure consistency
  });
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
