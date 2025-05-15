/**
 * Type declarations for X AI Service
 */

export interface XAIServiceType {
  generateImageWithGrok: (prompt: string) => Promise<string | null>;
}

declare const xaiService: XAIServiceType;

export default xaiService;
