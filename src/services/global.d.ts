/**
 * Global type declarations
 */

// X AI Service module declaration
declare module './xaiService' {
  export interface XAIServiceType {
    generateImageWithGrok: (prompt: string) => Promise<string | null>;
  }

  const xaiService: XAIServiceType;
  export default xaiService;
}
