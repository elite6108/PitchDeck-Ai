export type SlideType = 
  | 'cover'
  | 'problem'
  | 'solution'
  | 'market'
  | 'product'
  | 'business_model'
  | 'go_to_market'
  | 'competition'
  | 'team'
  | 'financials'
  | 'closing';

export interface Slide {
  id?: string;
  pitch_deck_id?: string;
  title: string;
  content: SlideContent;
  position: number;
  slide_type: SlideType | string; // Allow string for Supabase compatibility
  created_at?: string;
  updated_at?: string;
}

export interface SlideContent {
  headline?: string;
  subheadline?: string;
  bullets?: string[];
  paragraphs?: string[];
  image_url?: string;
  chart_data?: any;
  
  // Design attributes
  layout?: 'centered' | 'left-aligned' | 'right-aligned' | 'split' | 'grid';
  background_image?: string;
  text_color?: string;
  accent_color?: string;
  color_theme?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'custom';
  design_style?: 'modern' | 'classic' | 'minimal' | 'bold' | 'creative';
  font_style?: 'serif' | 'sans-serif';
  font_size?: 'small' | 'medium' | 'large';
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
  
  // Visual elements
  use_geometric_shapes?: boolean;
  use_gradient_backgrounds?: boolean;
  use_image_mask?: boolean;
  use_shadow_effects?: boolean;
  use_bordered_sections?: boolean;
  highlight_color?: string;
  secondary_color?: string;
  
  [key: string]: any;
}

// Type for database operations with Supabase
export interface DbSlide {
  id: string;
  pitch_deck_id: string;
  title: string;
  content: any; // Json type from Supabase
  position: number;
  slide_type: string;
  created_at: string;
  updated_at: string;
}

export interface PitchDeck {
  id?: string;
  user_id?: string;
  title: string;
  slides?: Slide[];
  created_at?: string;
  updated_at?: string;
}

// Type for database operations with Supabase
export interface DbPitchDeck {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  slides?: DbSlide[];
}

// Helper functions for type conversion
export const toAppSlide = (dbSlide: DbSlide): Slide => ({
  id: dbSlide.id,
  pitch_deck_id: dbSlide.pitch_deck_id,
  title: dbSlide.title,
  content: dbSlide.content as SlideContent, // Cast to SlideContent
  position: dbSlide.position,
  slide_type: dbSlide.slide_type,
  created_at: dbSlide.created_at,
  updated_at: dbSlide.updated_at
});

export const toAppDeck = (dbDeck: DbPitchDeck): PitchDeck => ({
  id: dbDeck.id,
  user_id: dbDeck.user_id,
  title: dbDeck.title,
  created_at: dbDeck.created_at,
  updated_at: dbDeck.updated_at,
  slides: dbDeck.slides ? dbDeck.slides.map(toAppSlide) : undefined
});

// Design theme options
export type ColorTheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'custom';
export type DesignStyle = 'modern' | 'classic' | 'minimal' | 'bold' | 'creative';

export interface DesignPreferences {
  colorTheme: ColorTheme;
  customPrimaryColor?: string; // For custom color theme
  designStyle: DesignStyle;
  includeLogo: boolean;
  logoUrl?: string;
  fontStyle: 'serif' | 'sans-serif';
}

export interface QuestionnaireData {
  // Business content
  companyName: string;
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  competitive: string;
  team: string;
  marketSize: string;
  traction: string;
  fundingGoal: string;
  
  // Design preferences
  designPreferences?: DesignPreferences;
}