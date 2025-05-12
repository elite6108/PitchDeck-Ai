# PitchDeck-AI: Code Modularization Documentation

## Overview

This document provides comprehensive documentation for refactoring the PitchDeck-AI application. The goal is to break down large components and services into smaller, more maintainable modules while preserving current functionality and adhering to UI preferences.

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Component Documentation](#2-component-documentation)
3. [Service Documentation](#3-service-documentation)
4. [Utility Functions](#4-utility-functions)
5. [Type Definitions](#5-type-definitions)
6. [State Management](#6-state-management)
7. [Migration Strategy](#7-migration-strategy)
8. [Testing Strategy](#8-testing-strategy)
9. [UI Design Guidelines](#9-ui-design-guidelines)

## 1. Project Architecture

### Current Architecture

```
src/
├── components/
│   ├── auth/
│   ├── deck/
│   │   ├── DeckCard.tsx
│   │   ├── DeckExport.tsx (659 lines)
│   │   ├── Questionnaire.tsx
│   │   ├── SlideEditor.tsx
│   │   ├── SlideThumbnail.tsx
│   │   ├── SlideViewer.tsx
│   │   └── ThemeSelector.tsx (224 lines)
│   ├── layout/
│   └── ui/
├── services/
│   ├── aiService.ts
│   ├── aiSlideDesignService.ts (719 lines)
│   ├── slideDesignService.ts
│   └── stockPhotoService.ts
├── store/
├── types/
└── ...
```

### Proposed Architecture

```
src/
├── components/
│   ├── auth/
│   ├── deck/
│   │   ├── DeckCard.tsx
│   │   ├── DeckExport/
│   │   │   ├── index.tsx (main component)
│   │   │   ├── ExportHeader.tsx
│   │   │   ├── ExportFormatOptions.tsx
│   │   │   ├── ExportActions.tsx
│   │   │   ├── ExportProgress.tsx
│   │   │   ├── ExportSlideRenderer.tsx
│   │   │   └── StyleOptions.tsx
│   │   ├── Questionnaire.tsx
│   │   ├── SlideEditor.tsx
│   │   ├── SlideThumbnail.tsx
│   │   ├── SlideViewer.tsx
│   │   └── ThemeSelector/
│   │       ├── index.tsx (main component)
│   │       ├── ThemeOptionsList.tsx
│   │       ├── BackgroundSelector.tsx
│   │       └── ThemeActionButtons.tsx
│   ├── layout/
│   └── ui/
├── services/
│   ├── aiService.ts
│   ├── slideDesign/
│   │   ├── contentAnalysisService.ts
│   │   ├── styleRecommendationService.ts
│   │   ├── cssGenerationService.ts
│   │   └── decorativeElementsService.ts
│   ├── export/
│   │   ├── pdfExportService.ts
│   │   └── pptxExportService.ts
│   ├── slideDesignService.ts
│   └── stockPhotoService.ts
├── store/
├── types/
│   ├── deck.ts
│   ├── styles.ts
│   ├── themes.ts
│   └── export.ts
├── utils/
│   ├── slideTypeUtils.ts
│   ├── colorUtils.ts
│   ├── exportUtils.ts
│   └── keywordExtraction.ts
└── constants/
    ├── styleGuides.ts
    └── fontStyles.ts
```

## 2. Component Documentation

### DeckExport Module

#### `index.tsx`
```typescript
/**
 * DeckExport Component
 * 
 * Main container for exporting deck to different formats.
 * Manages the export state and coordinates the export process.
 * 
 * @prop {PitchDeck} deck - The deck to be exported
 * @prop {Function} onClose - Function to close the export modal
 */
```

#### `ExportHeader.tsx`
```typescript
/**
 * ExportHeader Component
 * 
 * Displays the header of the export modal with title and close button.
 * 
 * @prop {string} title - The title for the export dialog
 * @prop {Function} onClose - Function to close the export modal
 */
```

#### `ExportFormatOptions.tsx`
```typescript
/**
 * ExportFormatOptions Component
 * 
 * Provides options for selecting export format and styling options.
 * 
 * @prop {string} selectedTheme - Currently selected theme
 * @prop {Function} onThemeSelect - Handler for theme selection
 * @prop {boolean} useAiStyling - Whether to use AI styling
 * @prop {Function} onToggleAiStyling - Handler for toggling AI styling
 */
```

#### `ExportActions.tsx`
```typescript
/**
 * ExportActions Component
 * 
 * Contains buttons and actions for performing the export.
 * 
 * @prop {Function} onExportPDF - Handler for PDF export
 * @prop {Function} onExportPPTX - Handler for PPTX export
 * @prop {boolean} isExporting - Whether an export is in progress
 * @prop {string} exportType - Current export type ('pdf' or 'pptx')
 */
```

#### `ExportProgress.tsx`
```typescript
/**
 * ExportProgress Component
 * 
 * Displays progress indicator during export process.
 * 
 * @prop {boolean} isExporting - Whether an export is in progress
 * @prop {number} progress - Current progress percentage (0-100)
 * @prop {string} exportType - Current export type ('pdf' or 'pptx')
 */
```

#### `ExportSlideRenderer.tsx`
```typescript
/**
 * ExportSlideRenderer Component
 * 
 * Renders slides in a hidden container for export processing.
 * 
 * @prop {PitchDeck} deck - The deck containing slides to render
 * @prop {string} colorTheme - Selected color theme
 * @prop {React.RefObject} containerRef - Ref to access the rendered slides
 */
```

#### `StyleOptions.tsx`
```typescript
/**
 * StyleOptions Component
 * 
 * Provides theme selection and AI styling options.
 * 
 * @prop {string} selectedTheme - Current theme
 * @prop {Function} onThemeSelect - Handler for theme selection
 * @prop {boolean} useAiStyling - Whether AI styling is enabled
 * @prop {Function} onToggleAiStyling - Handler for toggling AI styling
 * @prop {boolean} aiProcessing - Whether AI is processing
 */
```

### ThemeSelector Module

#### `index.tsx`
```typescript
/**
 * ThemeSelector Component
 * 
 * Main container for theme selection functionality.
 * Coordinates theme selection and background selection.
 * 
 * @prop {string} currentTheme - Current selected theme
 * @prop {Function} onThemeSelect - Handler for theme selection
 * @prop {Function} onBackgroundSelect - Handler for background selection
 */
```

#### `ThemeOptionsList.tsx`
```typescript
/**
 * ThemeOptionsList Component
 * 
 * Displays a grid of available themes to select from.
 * 
 * @prop {string} selectedTheme - Current selected theme
 * @prop {Function} onThemeSelect - Handler for theme selection
 * @prop {ThemeOption[]} themeOptions - Available themes
 */
```

#### `BackgroundSelector.tsx`
```typescript
/**
 * BackgroundSelector Component
 * 
 * Provides options for selecting background images.
 * 
 * @prop {string[]} backgroundOptions - Available background options
 * @prop {Function} onBackgroundSelect - Handler for background selection
 * @prop {boolean} visible - Whether the selector is visible
 */
```

#### `ThemeActionButtons.tsx`
```typescript
/**
 * ThemeActionButtons Component
 * 
 * Provides Cancel/Apply buttons for theme selection.
 * 
 * @prop {Function} onCancel - Handler for cancel action
 * @prop {Function} onApply - Handler for apply action
 */
```

## 3. Service Documentation

### Slide Design Services

#### `contentAnalysisService.ts`
```typescript
/**
 * Content Analysis Service
 * 
 * Provides functionality to analyze deck content and extract relevant information.
 * 
 * @function analyzeDeckContent - Analyzes deck content using AI
 * @function extractContentForAnalysis - Extracts relevant content from deck
 * @function extractKeywords - Extracts keywords from deck content
 */
```

#### `styleRecommendationService.ts`
```typescript
/**
 * Style Recommendation Service
 * 
 * Provides style recommendations based on content analysis.
 * 
 * @function getStyleRecommendations - Gets style recommendations based on content analysis
 * @function enhanceAnalysisWithSpecifics - Adds slide-specific style recommendations
 * @function getFallbackAnalysis - Creates fallback analysis when AI is unavailable
 */
```

#### `cssGenerationService.ts`
```typescript
/**
 * CSS Generation Service
 * 
 * Generates CSS styles for slides based on themes and layouts.
 * 
 * @function generateSlideCSS - Generates CSS for specific slide based on theme and layout
 * @function getFontImports - Gets font import statements for custom styles
 */
```

#### `decorativeElementsService.ts`
```typescript
/**
 * Decorative Elements Service
 * 
 * Generates decorative elements for slides based on themes.
 * 
 * @function generateDecorativeElements - Generates decorative elements based on theme
 */
```

### Export Services

#### `pdfExportService.ts`
```typescript
/**
 * PDF Export Service
 * 
 * Provides functionality to export deck to PDF format.
 * 
 * @function exportToPDF - Exports deck to PDF
 * @function prepareSlidesForExport - Prepares slides for PDF export
 * @function generatePDF - Generates PDF from prepared slides
 */
```

#### `pptxExportService.ts`
```typescript
/**
 * PPTX Export Service
 * 
 * Provides functionality to export deck to PPTX format.
 * 
 * @function exportToPPTX - Exports deck to PPTX
 * @function prepareSlidesForExport - Prepares slides for PPTX export
 * @function generatePPTX - Generates PPTX from prepared slides
 */
```

## 4. Utility Functions

#### `slideTypeUtils.ts`
```typescript
/**
 * Slide Type Utilities
 * 
 * Utilities for determining slide types and layouts.
 * 
 * @function getRecommendedLayoutForSlideType - Gets recommended layout for slide type
 * @function getSlideTypeFromContent - Determines slide type from content
 */
```

#### `colorUtils.ts`
```typescript
/**
 * Color Utilities
 * 
 * Utilities for color manipulation and theme helpers.
 * 
 * @function generateContrastColors - Generates contrast colors for a given background
 * @function applyColorTheme - Applies a color theme to slide elements
 */
```

#### `exportUtils.ts`
```typescript
/**
 * Export Utilities
 * 
 * Common utilities for different export formats.
 * 
 * @function prepareImage - Prepares image for export
 * @function convertHtmlToCanvas - Converts HTML element to canvas
 * @function cleanupForExport - Cleans up DOM elements for export
 */
```

#### `keywordExtraction.ts`
```typescript
/**
 * Keyword Extraction Utilities
 * 
 * Utilities for extracting and analyzing keywords.
 * 
 * @function extractKeywords - Extracts keywords from text content
 * @function calculateKeywordImportance - Calculates importance of keywords
 */
```

## 5. Type Definitions

#### `styles.ts`
```typescript
/**
 * Style Type Definitions
 * 
 * Type definitions for slide styles and themes.
 * 
 * @interface SlideStyle - Interface for slide style properties
 * @interface StyleOptions - Interface for style customization options
 * @type ColorTheme - Type for color theme values
 * @type DesignStyle - Type for design style values
 */
```

#### `themes.ts`
```typescript
/**
 * Theme Type Definitions
 * 
 * Type definitions for theme-related structures.
 * 
 * @interface ThemeOption - Interface for theme selection options
 * @interface ThemeColors - Interface for theme color definitions
 */
```

#### `export.ts`
```typescript
/**
 * Export Type Definitions
 * 
 * Type definitions for export-related structures.
 * 
 * @interface ExportOptions - Interface for export customization options
 * @type ExportFormat - Type for export format values ('pdf' or 'pptx')
 */
```

## 6. State Management

### Component-Local State
- Each component will maintain its own local state for UI concerns
- React's useState and useReducer hooks will be used for simple state management

### Parent-Child Communication
- Props will be used for passing data down
- Callback functions will be used for passing data up
- Props drilling will be minimized by grouping related components

### Complex State Management
- We'll use React Context for sharing state between deeply nested components
- Contexts will be organized by domain (e.g., ThemeContext, ExportContext)
- Each context will provide both state values and updater functions

## 7. Migration Strategy

### Phase 1: Preparation
1. **Create Utility Functions**:
   - Extract utility functions first as they don't affect component behavior
   - Create new files for utilities and import them back into existing components

2. **Define Type Interfaces**:
   - Extract and enhance type definitions
   - Update existing components to use new type definitions

### Phase 2: Component Extraction
1. **Extract Child Components**:
   - Create new component files
   - Initially render both old and new components to ensure matching behavior
   - Replace old component implementation once behavior matches

2. **Implement Service Layer**:
   - Extract service functions into separate files
   - Update imports in components
   - Validate behavior matches original implementation

### Phase 3: Integration and Cleanup
1. **Update Main Components**:
   - Refactor main components to use new child components
   - Update service and utility imports

2. **Clean Up Legacy Code**:
   - Remove duplicate implementations
   - Remove any temporary code used during migration

## 8. Testing Strategy

### Component Testing
- Create unit tests for each new component
- Focus on component behavior, not implementation details
- Use React Testing Library for component testing

### Service Testing
- Create unit tests for service functions
- Mock external dependencies for isolated testing
- Test edge cases and error handling

### Integration Testing
- Create integration tests for component interactions
- Test complete flows like exporting a deck

### Manual Testing
- Perform manual testing of UI components
- Verify UI matches design specifications
- Verify all features work as expected

## 9. UI Design Guidelines

Based on your preferences stored in our memory:

### Visual Style
- Maintain a clean, professional aesthetic throughout
- Ensure proper spacing between UI elements
- Use consistent rounded corners for visual elements
- Apply subtle shadows for depth where appropriate

### Button Design
- Use non-transparent navigation buttons in slide presentation mode
- Create smaller, more proportional action buttons in card components
- Apply solid backgrounds to buttons (not transparent)
- Use rounded buttons with clear borders for better visual definition

### Contrast and Visibility
- Ensure sufficient contrast between text and backgrounds
- Use appropriately sized icons (h-4 w-4 class in Tailwind)
- Avoid transparent elements that might be difficult to see
- Maintain proper spacing between UI elements

### Interactions
- Provide clear visual feedback for interactive elements
- Use subtle hover/focus states for interactive elements
- Ensure adequate clickable areas for buttons and controls
