import OpenAI from 'openai';
import { DesignPreferences, QuestionnaireData } from '../types/deck';
import { DesignStyle } from '../types/themes';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For client-side usage (in production, better to use server-side API)
});

export interface AIEnhancedContent {
  title: string;
  headline: string;
  content: string[];
  bullets?: string[];
  // Design-related attributes
  layout?: string;
  background_image?: string;
  text_color?: string;
  accent_color?: string;
  font_size?: string;
  animation?: string;
}

export const generateEnhancedPitchDeck = async (questionnaire: QuestionnaireData): Promise<Record<string, AIEnhancedContent>> => {
  try {
    console.log('Starting AI content generation with OpenAI');
    console.log('Using API key:', import.meta.env.VITE_OPENAI_API_KEY ? 'Key is present' : 'No key found');
    
    // If no API key is available, return default content
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error('No OpenAI API key found. Please add VITE_OPENAI_API_KEY to your .env file');
      return createFallbackContent(questionnaire);
    }
    
    const systemPrompt = `You are an expert pitch deck consultant who specializes in creating compelling, persuasive content for startup presentations.
    Your task is to transform rough notes into professional, investor-ready content that tells a compelling story.
    For each slide, create:
    1. A catchy, impactful headline that draws attention
    2. 2-3 concise paragraphs with professional business language that tells a compelling story
    3. 3-5 bullet points that highlight key information in a memorable way
    
    Use sophisticated business language and focus on creating a narrative that flows across all slides.
    Be specific, use data points when provided, and emphasize the unique value proposition.`;
    
    const userPrompt = `Create a professional pitch deck based on the following information about a startup:
      
    Company Name: ${questionnaire.companyName}
    Problem: ${questionnaire.problem}
    Solution: ${questionnaire.solution}
    Target Market: ${questionnaire.targetMarket}
    Business Model: ${questionnaire.businessModel}
    Competitive Advantage: ${questionnaire.competitive}
    Team: ${questionnaire.team}
    Market Size: ${questionnaire.marketSize}
    Traction: ${questionnaire.traction || 'No traction data provided.'}
    Funding Goal: ${questionnaire.fundingGoal || 'No funding goal provided.'}
    
    Required slides (provide complete content for each):
    - Cover: An attention-grabbing opening slide
    - Problem: Clear articulation of the pain point being solved
    - Solution: Compelling explanation of how your product/service solves the problem
    - Market: Analysis of target market size and characteristics
    - Business Model: Clear explanation of how the business generates revenue
    - Competition: Competitive landscape analysis and your advantages
    - Team: Highlight of team strengths and relevant experience
    - Traction: Current metrics, milestones, and achievements
    - Ask: Clear statement of funding needs and use of funds
    
    Format your response as a JSON object with each slide type as a key, containing "headline", "content" (array of paragraph strings), and "bullets" (array of bullet point strings).`;

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2500
    });

    console.log('Response received from OpenAI');
    // Parse the JSON response
    const responseContent = response.choices[0].message.content || '{}';
    console.log('AI Response:', responseContent.substring(0, 100) + '...');
    
    const aiContent = JSON.parse(responseContent);
    
    // Process the content to ensure it matches our expected format and apply design preferences
    const processedContent: Record<string, AIEnhancedContent> = {};
    
    // Apply design preferences based on user selection
    const designPrefs = questionnaire.designPreferences || {
      colorTheme: 'blue',
      designStyle: 'modern',
      includeLogo: false,
      fontStyle: 'sans-serif'
    };
    
    // Determine colors based on theme
    const themeColors = getThemeColors(designPrefs);
    
    // Determine layouts based on design style
    const styleLayouts = getStyleLayouts(designPrefs.designStyle);
    
    // Ensure each slide has the required fields and design attributes
    Object.entries(aiContent).forEach(([key, value]: [string, any], index) => {
      const slideType = key.toLowerCase();
      
      // Choose layout based on slide type and design style
      const layout = styleLayouts[slideType] || styleLayouts.default;
      
      // Choose animation based on position in deck
      const animation = index % 3 === 0 ? 'fade' : (index % 3 === 1 ? 'slide' : 'zoom');
      
      processedContent[key] = {
        title: key,
        headline: value.headline || `${key} Section`,
        content: Array.isArray(value.content) ? value.content : [value.content || ''],
        bullets: Array.isArray(value.bullets) ? value.bullets : [],
        
        // Apply design attributes
        layout,
        text_color: themeColors.text,
        accent_color: themeColors.accent,
        font_size: designPrefs.designStyle === 'minimal' ? 'large' : 'medium',
        animation
      };
      
      // Add logo to cover slide if requested
      if (key === 'Cover' && designPrefs.includeLogo && designPrefs.logoUrl) {
        processedContent[key].background_image = designPrefs.logoUrl;
      }
    });
    
    console.log('AI content processed successfully');
    return processedContent;
  } catch (error) {
    console.error('Error generating AI content:', error);
    // Return fallback content instead of throwing an error
    return createFallbackContent(questionnaire);
  }
};

// Fallback content generator in case AI generation fails
// Helper function to get color palette based on chosen theme
function getThemeColors(designPrefs: DesignPreferences): { primary: string; accent: string; text: string; background: string } {
  const customColor = designPrefs.colorTheme === 'custom' && designPrefs.customPrimaryColor 
    ? designPrefs.customPrimaryColor 
    : '';
    
  // Default color palettes for each theme
  const themes = {
    blue: {
      primary: '#3B82F6',
      accent: '#60A5FA',
      text: '#1E3A8A',
      background: '#EFF6FF'
    },
    green: {
      primary: '#10B981',
      accent: '#34D399',
      text: '#065F46',
      background: '#ECFDF5'
    },
    purple: {
      primary: '#8B5CF6',
      accent: '#A78BFA',
      text: '#5B21B6',
      background: '#F5F3FF'
    },
    red: {
      primary: '#EF4444',
      accent: '#F87171',
      text: '#991B1B',
      background: '#FEF2F2'
    },
    orange: {
      primary: '#F97316',
      accent: '#FB923C',
      text: '#9A3412',
      background: '#FFF7ED'
    },
    teal: {
      primary: '#14B8A6',
      accent: '#2DD4BF',
      text: '#115E59',
      background: '#F0FDFA'
    },
    custom: {
      primary: customColor || '#3B82F6',
      accent: customColor ? adjustColorBrightness(customColor, 20) : '#60A5FA',
      text: customColor ? adjustColorBrightness(customColor, -40) : '#1E3A8A',
      background: customColor ? adjustColorBrightness(customColor, 95) : '#EFF6FF'
    }
  };
  
  return themes[designPrefs.colorTheme] || themes.blue;
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  if (percent > 0) {
    r = Math.min(255, r + Math.floor(percent / 100 * (255 - r)));
    g = Math.min(255, g + Math.floor(percent / 100 * (255 - g)));
    b = Math.min(255, b + Math.floor(percent / 100 * (255 - b)));
  } else {
    r = Math.max(0, r + Math.floor(percent / 100 * r));
    g = Math.max(0, g + Math.floor(percent / 100 * g));
    b = Math.max(0, b + Math.floor(percent / 100 * b));
  }

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper function to get layouts based on design style
function getStyleLayouts(designStyle: DesignStyle | undefined): Record<string, string> {
  const styleLayouts: Record<string, Record<string, string>> = {
    modern: {
      default: 'centered',
      cover: 'centered',
      problem: 'left-aligned',
      solution: 'right-aligned',
      market: 'split',
      business_model: 'centered',
      competition: 'grid',
      team: 'grid',
      traction: 'split',
      ask: 'centered'
    },
    classic: {
      default: 'centered',
      cover: 'centered',
      problem: 'centered',
      solution: 'centered',
      market: 'left-aligned',
      business_model: 'centered',
      competition: 'left-aligned',
      team: 'centered',
      traction: 'centered',
      ask: 'centered'
    },
    minimal: {
      default: 'centered',
      cover: 'centered',
      problem: 'centered',
      solution: 'centered',
      market: 'centered',
      business_model: 'centered',
      competition: 'centered',
      team: 'centered',
      traction: 'centered',
      ask: 'centered'
    },
    bold: {
      default: 'left-aligned',
      cover: 'split',
      problem: 'left-aligned',
      solution: 'split',
      market: 'left-aligned',
      business_model: 'split',
      competition: 'grid',
      team: 'split',
      traction: 'left-aligned',
      ask: 'split'
    },
    creative: {
      default: 'centered',
      cover: 'split',
      problem: 'right-aligned',
      solution: 'left-aligned',
      market: 'grid',
      business_model: 'split',
      competition: 'grid',
      team: 'grid',
      traction: 'split',
      ask: 'centered'
    }
  };
  
  return designStyle && styleLayouts[designStyle] ? styleLayouts[designStyle] : styleLayouts.modern;
}

function createFallbackContent(questionnaire: QuestionnaireData): Record<string, AIEnhancedContent> {
  console.log('Using fallback content generator');
  
  // Apply design preferences based on user selection
  const designPrefs = questionnaire.designPreferences || {
    colorTheme: 'blue',
    designStyle: 'modern',
    includeLogo: false,
    fontStyle: 'sans-serif'
  };
  
  // Get theme colors and style layouts
  getThemeColors(designPrefs); // Not using the result, but keeping for future use
  getStyleLayouts(designPrefs.designStyle); // Not using the result, but keeping for future use
  
  return {
    "Cover": {
      title: "Cover",
      headline: `${questionnaire.companyName}`,
      content: [`A revolutionary approach to solving real problems.`],
      bullets: []
    },
    "Problem": {
      title: "Problem",
      headline: "The Problem We're Solving",
      content: [
        `${questionnaire.problem}`,
        "This represents a significant challenge in the market today."
      ],
      bullets: [
        "Pain point 1: Customer frustration",
        "Pain point 2: Inefficiency in current solutions",
        "Pain point 3: High costs of alternatives"
      ]
    },
    "Solution": {
      title: "Solution",
      headline: "Our Innovative Solution",
      content: [
        `${questionnaire.solution}`,
        "We've developed a unique approach that addresses all aspects of the problem."
      ],
      bullets: [
        "Key feature 1: Innovative technology",
        "Key feature 2: User-friendly design",
        "Key feature 3: Scalable architecture"
      ]
    },
    "Market": {
      title: "Market",
      headline: "Target Market Opportunity",
      content: [
        `${questionnaire.targetMarket}`,
        `Market size: ${questionnaire.marketSize}`
      ],
      bullets: [
        "Growing market with compound annual growth rate of 15%",
        "Underserved customer segments",
        "Expanding international opportunities"
      ]
    },
    "Business Model": {
      title: "Business Model",
      headline: "How We Make Money",
      content: [
        `${questionnaire.businessModel}`,
        "Our model ensures sustainable revenue growth and high customer retention."
      ],
      bullets: [
        "Revenue stream 1: Subscription services",
        "Revenue stream 2: Premium features",
        "High margins and recurring revenue"
      ]
    },
    "Competition": {
      title: "Competition",
      headline: "Competitive Landscape",
      content: [
        `${questionnaire.competitive}`,
        "Our approach differentiates us from competitors in significant ways."
      ],
      bullets: [
        "Competitor A lacks our technology advantage",
        "Competitor B targets different market segments",
        "Our solution offers 40% better performance"
      ]
    },
    "Team": {
      title: "Team",
      headline: "Our Expert Team",
      content: [
        `${questionnaire.team}`,
        "Combined, we have decades of relevant industry experience."
      ],
      bullets: [
        "Leadership with prior successful exits",
        "Technical expertise in key areas",
        "Strong advisory board"
      ]
    },
    "Traction": {
      title: "Traction",
      headline: "Our Progress So Far",
      content: [
        `${questionnaire.traction || 'We are currently in early stages of development.'}`,
        "We've hit several important milestones on our growth journey."
      ],
      bullets: [
        "User growth: 20% month-over-month",
        "Key partnerships established",
        "Positive customer feedback"
      ]
    },
    "Ask": {
      title: "Ask",
      headline: "Investment Opportunity",
      content: [
        `We're seeking ${questionnaire.fundingGoal || 'investment'} to accelerate our growth.`,
        "The funds will be used for product development, market expansion, and team growth."
      ],
      bullets: [
        "Use of funds: 40% product, 30% marketing, 30% operations",
        "18-month runway to achieve key milestones",
        "Path to Series A clearly defined"
      ]
    }
  };
}
