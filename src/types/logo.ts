/**
 * Logo Types
 * 
 * Type definitions for the logo generator feature
 */

import { Json } from './supabase';

/**
 * Logo type as stored in the database
 */
export interface DbLogo {
  id: string;
  user_id: string;
  company_name: string;
  image_url: string;
  prompt: string;
  settings: Json;
  created_at: string;
  updated_at: string;
}

/**
 * Logo type as used in the application
 */
export interface Logo {
  id: string;
  userId: string;
  companyName: string;
  imageUrl: string;
  prompt: string;
  settings: LogoSettings;
  createdAt: string;
  updatedAt: string;
}

/**
 * Settings used to generate the logo
 */
export interface LogoSettings {
  industry?: string;
  style?: 'modern' | 'minimalist' | 'classic' | 'playful' | 'corporate';
  colorScheme?: string;
  additionalDetails?: string;
  squareFormat?: boolean;
}

/**
 * Convert database logo type to application logo type
 */
export const toAppLogo = (dbLogo: DbLogo): Logo => {
  return {
    id: dbLogo.id,
    userId: dbLogo.user_id,
    companyName: dbLogo.company_name,
    imageUrl: dbLogo.image_url,
    prompt: dbLogo.prompt,
    settings: dbLogo.settings as LogoSettings,
    createdAt: dbLogo.created_at,
    updatedAt: dbLogo.updated_at
  };
};

/**
 * Convert application logo type to database logo type
 */
export const toDbLogo = (logo: Logo): DbLogo => {
  return {
    id: logo.id,
    user_id: logo.userId,
    company_name: logo.companyName,
    image_url: logo.imageUrl,
    prompt: logo.prompt,
    settings: logo.settings as Json,
    created_at: logo.createdAt,
    updated_at: logo.updatedAt
  };
};
