import { OpenAI } from 'openai';

// Initialize the OpenAI client for image generation
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Service for retrieving relevant stock photos based on slide content
 */
export const stockPhotoService = {
  /**
   * Find a relevant stock photo for a slide based on its content
   * 
   * @param slideType The type of slide (cover, content, data, etc.)
   * @param slideTitle The title of the slide
   * @param slideContent The content of the slide
   * @returns Promise with the URL of a relevant stock photo
   */
  async getRelevantPhoto(slideType: string, slideTitle: string, slideContent: string): Promise<string> {
    try {
      // Create a prompt that describes the image we need
      let prompt = `Professional, high-quality ${slideType} slide image for a business presentation about "${slideTitle}".`;
      
      if (slideContent) {
        // Add content context if available, but keep it brief
        const contentSummary = slideContent.substring(0, 100);
        prompt += ` Related to: ${contentSummary}...`;
      }

      // Optional: Add style preferences
      prompt += ' Modern corporate style with subtle colors, no text, clean and minimal.';
      
      // For cover slides, make it more impactful
      if (slideType === 'cover') {
        prompt += ' Bold, impactful, with clear focal point. Suitable as a presentation cover.';
      }
      
      // Call to an image API service
      // Option 1: Use Unsplash API (requires API key)
      // Option 2: Use OpenAI's DALL-E for custom images
      
      // For this implementation we'll use DALL-E to generate custom images
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      return response.data[0].url;
    } catch (error) {
      console.error('Error generating stock photo:', error);
      
      // Fallback to a default image based on slide type
      const fallbackImages = {
        cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1024',
        content: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1024',
        data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1024',
        default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1024'
      };
      
      return fallbackImages[slideType as keyof typeof fallbackImages] || fallbackImages.default;
    }
  },
  
  /**
   * Get multiple themed background options for the user to choose from
   * 
   * @param slideType The type of slide
   * @param theme The design theme
   * @returns An array of background image URLs
   */
  getThemedBackgrounds(slideType: string, theme: string): string[] {
    // Professionally curated background options by theme
    const themedBackgrounds = {
      light: [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1024',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1024',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1024'
      ],
      dark: [
        'https://images.unsplash.com/photo-1579547945413-497e1b99aac0?q=80&w=1024',
        'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1024',
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1024'
      ],
      royal_blue: [
        'https://images.unsplash.com/photo-1579547945413-497e1b99aac0?q=80&w=1024',
        'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1024',
        'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1024'
      ],
      coral: [
        'https://images.unsplash.com/photo-1558470598-a5dda9640f68?q=80&w=1024',
        'https://images.unsplash.com/photo-1501696461415-6bd6660c6742?q=80&w=1024',
        'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?q=80&w=1024'
      ],
      forest: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1024',
        'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1024',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1024'
      ],
      gradient: [
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1024',
        'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1024',
        'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1024'
      ]
    };
    
    return themedBackgrounds[theme as keyof typeof themedBackgrounds] || themedBackgrounds.light;
  }
};

export default stockPhotoService;
