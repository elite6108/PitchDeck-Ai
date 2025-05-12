/**
 * Industry Style Guides
 * 
 * Style recommendations for different industries
 */

// Industry-specific style recommendations
export const industryStyleGuides: Record<string, any> = {
  technology: {
    colorThemes: ['gradient', 'royal_blue'],
    layouts: ['splitContent', 'dataGrid'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: true
    },
    imageStyles: ['modern', 'sleek', 'digital']
  },
  healthcare: {
    colorThemes: ['light', 'forest'],
    layouts: ['centered', 'imageTop'],
    designElements: {
      shapes: true,
      gradients: false,
      icons: true,
      shadows: false
    },
    imageStyles: ['professional', 'clean', 'caring']
  },
  finance: {
    colorThemes: ['dark', 'royal_blue'],
    layouts: ['splitContent', 'dataGrid'],
    designElements: {
      shapes: false,
      gradients: false,
      icons: true,
      shadows: true
    },
    imageStyles: ['corporate', 'professional', 'trustworthy']
  },
  education: {
    colorThemes: ['light', 'coral'],
    layouts: ['imageTop', 'splitContent'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: false
    },
    imageStyles: ['friendly', 'bright', 'engaging']
  },
  ecommerce: {
    colorThemes: ['coral', 'gradient'],
    layouts: ['fullWidthImage', 'splitContent'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: true
    },
    imageStyles: ['vibrant', 'product-focused', 'lifestyle']
  },
  creative: {
    colorThemes: ['gradient', 'coral'],
    layouts: ['fullWidthImage', 'centered'],
    designElements: {
      shapes: true,
      gradients: true,
      icons: true,
      shadows: true
    },
    imageStyles: ['artistic', 'expressive', 'bold']
  },
  // Default for other industries
  default: {
    colorThemes: ['light', 'royal_blue'],
    layouts: ['splitContent', 'centered'],
    designElements: {
      shapes: true,
      gradients: false,
      icons: true,
      shadows: true
    },
    imageStyles: ['professional', 'clean', 'versatile']
  }
};
