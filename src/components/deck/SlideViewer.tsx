import React from 'react';
import type { Slide, ColorTheme, DesignStyle } from '../../types/deck';

interface SlideViewerProps {
  slide: Slide;
  colorTheme?: ColorTheme;
  designStyle?: DesignStyle;
  fontStyle?: 'serif' | 'sans-serif';
}

// Helper function to get accent color based on theme
const getAccentColor = (theme?: string): string => {
  const colorMap: Record<string, string> = {
    'blue': '#3B82F6',
    'green': '#10B981',
    'purple': '#8B5CF6',
    'red': '#EF4444',
    'orange': '#F97316',
    'teal': '#14B8A6',
    'custom': '#6B7280'
  };
  
  return theme && colorMap[theme] ? colorMap[theme] : colorMap.blue;
};

const SlideViewer: React.FC<SlideViewerProps> = ({ 
  slide, 
  colorTheme = 'blue',
  designStyle = 'modern',
  fontStyle = 'sans-serif'
}) => {
  // Generate design elements based on slide type and theme
  const getDesignElements = () => {
    const elements = [];
    
    // Get primary color based on theme
    const primaryColor = getAccentColor(colorTheme);
    // Removed unused secondaryColor variable
    
    // Add design elements based on design style
    if (designStyle === 'modern') {
      elements.push(
        <div key="modern-1" className="absolute top-0 right-0 w-[250px] h-[200px] z-[2] export-design-element"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}00 100%)`,
            clipPath: 'polygon(100% 0, 0% 0, 100% 100%)'
          }}
        />
      );
      elements.push(
        <div key="modern-2" className="absolute bottom-0 left-0 w-[150px] h-[8px] z-[2] export-design-element"
          style={{ background: primaryColor }}
        />
      );
    } else if (designStyle === 'bold') {
      elements.push(
        <div key="bold-1" className="absolute top-0 left-0 w-full h-[15px] z-[2] export-design-element"
          style={{ background: primaryColor }}
        />
      );
      elements.push(
        <div key="bold-2" className="absolute bottom-[30px] right-[30px] w-[100px] h-[100px] z-[2] export-design-element"
          style={{
            borderRadius: '50%',
            border: `8px solid ${primaryColor}40`,
            background: 'transparent'
          }}
        />
      );
    } else if (designStyle === 'creative') {
      elements.push(
        <div key="creative-1" className="absolute bottom-0 right-0 z-[2] export-design-element"
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 150px 150px',
            borderColor: `transparent transparent ${primaryColor}30 transparent`
          }}
        />
      );
      elements.push(
        <div key="creative-2" className="absolute top-[50px] left-[50px] w-[80px] h-[80px] z-[2] export-design-element"
          style={{
            background: 'transparent',
            border: `3px solid ${primaryColor}40`,
            transform: 'rotate(45deg)'
          }}
        />
      );
    } else if (designStyle === 'minimal') {
      elements.push(
        <div key="minimal-1" className="absolute top-[30px] left-[30px] w-[50px] h-[3px] z-[2] export-design-element"
          style={{ background: primaryColor }}
        />
      );
      elements.push(
        <div key="minimal-2" className="absolute top-[30px] left-[30px] w-[3px] h-[50px] z-[2] export-design-element"
          style={{ background: primaryColor }}
        />
      );
    } else { // classic
      elements.push(
        <div key="classic-1" className="absolute bottom-[20px] left-[calc(50%-100px)] w-[200px] h-[3px] z-[2] export-design-element"
          style={{ background: primaryColor }}
        />
      );
    }
    
    return elements;
  };
  
  // Get design attributes from slide content
  const { 
    content, 
    slide_type,
  } = slide;
  
  const {
    layout = 'centered',
    text_color,
    accent_color,
    background_image,
    animation = 'fade'
  } = content;
  
  // Generate CSS classes based on design preferences
  const getFontClass = () => {
    return fontStyle === 'serif' ? 'font-serif' : 'font-sans';
  };
  
  const getColorClass = () => {
    const colorClasses = {
      blue: 'text-blue-900 bg-blue-50',
      green: 'text-green-900 bg-green-50',
      purple: 'text-purple-900 bg-purple-50',
      red: 'text-red-900 bg-red-50',
      orange: 'text-orange-900 bg-orange-50',
      teal: 'text-teal-900 bg-teal-50',
      custom: ''
    };
    
    return colorClasses[colorTheme] || colorClasses.blue;
  };
  
  const getLayoutClass = () => {
    const layoutClasses = {
      'centered': 'flex flex-col items-center justify-center text-center',
      'left-aligned': 'flex flex-col items-start justify-center',
      'right-aligned': 'flex flex-col items-end justify-center text-right',
      'split': 'grid grid-cols-2 gap-8',
      'grid': 'grid grid-cols-2 gap-4'
    };
    
    return layoutClasses[layout as keyof typeof layoutClasses] || layoutClasses.centered;
  };
  
  const getAnimationClass = () => {
    const animationClasses = {
      'fade': 'animate-fade-in',
      'slide': 'animate-slide-in',
      'zoom': 'animate-zoom-in',
      'none': ''
    };
    
    return animationClasses[animation as keyof typeof animationClasses] || '';
  };
  
  // Apply inline styles for custom colors
  const getCustomStyles = () => {
    if (colorTheme !== 'custom') return {};
    
    return {
      backgroundColor: background_image ? 'transparent' : '#ffffff',
      color: text_color || '#333333',
      '--accent-color': accent_color || '#3B82F6'
    } as React.CSSProperties;
  };
  
  // Render slide based on design style
  const renderSlideContent = () => {
    const contentWithDesign = {
      ...content,
      layout,
      colorTheme,
      designStyle,
      fontStyle
    };
    
    switch (designStyle) {
      case 'modern':
        return renderModernSlide(contentWithDesign, slide_type);
      case 'classic':
        return renderClassicSlide(contentWithDesign, slide_type);
      case 'minimal':
        return renderMinimalSlide(contentWithDesign, slide_type);
      case 'bold':
        return renderBoldSlide(contentWithDesign, slide_type);
      case 'creative':
        return renderCreativeSlide(contentWithDesign, slide_type);
      default:
        return renderModernSlide(contentWithDesign, slide_type);
    }
  };
  
  // Modern template - clean, minimalist with a focus on content
  const renderModernSlide = (content: any, slideType: string) => {
    switch (slideType) {
      case 'cover':
        return (
          <div className={`h-full ${getLayoutClass()} ${getAnimationClass()}`} style={{ position: 'relative', padding: '60px 80px' }}>
            {/* Background rendering with multiple strategies for maximum compatibility */}
            {content.background_image && (
              <>
                {/* Direct background with support for both URLs and CSS gradients */}
                <div className="absolute inset-0 export-background" 
                     style={{ 
                       // Fix: Replace shorthand background with specific properties to avoid React warnings
                       backgroundImage: content.background_image.startsWith('data:') || content.background_image.startsWith('http') 
                         ? `url(${content.background_image})` 
                         : 'none',
                       backgroundColor: (!content.background_image.startsWith('data:') && !content.background_image.startsWith('http')) 
                         ? content.background_image 
                         : 'transparent',
                       backgroundSize: 'cover',
                       backgroundPosition: 'center',
                       zIndex: 0,
                       opacity: 1,
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       width: '100%',
                       height: '100%',
                       display: 'block'
                     }}>
                </div>
                
                {/* Strategy 2: Embed image directly */}
                <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                  <img 
                    src={content.background_image}
                    alt="Slide background"
                    className="w-full h-full object-cover" 
                    style={{ 
                      opacity: 1,
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                    crossOrigin="anonymous"
                  />
                </div>
                
                {/* Strategy 3: Use iframe for SVG content if it's base64 */}
                {content.background_image.startsWith('data:image/svg') && (
                  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                    <iframe 
                      src={content.background_image}
                      style={{
                        border: 'none',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      title="Background SVG"
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Gradient overlay for better text readability */}
            {content.background_image && (
              <div className="absolute inset-0" style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)`,
                zIndex: 1
              }}></div>
            )}
            
            {/* Professional design accent elements */}
            <div className="absolute top-0 left-0 w-full h-6" 
                 style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)', zIndex: 0 }}></div>
            
            <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full opacity-10" 
                 style={{ background: 'rgba(255,255,255,0.2)', zIndex: 0 }}></div>
            
            {/* Content with improved styling */}
            <div className="relative z-20 max-w-3xl">
              <h1 className="text-6xl font-bold mb-8" 
                  style={{ 
                    color: content.background_image ? '#FFFFFF' : content.text_color,
                    textShadow: content.background_image ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                    lineHeight: '1.2' 
                  }}>
                {content.headline || 'Untitled Presentation'}
              </h1>
              
              <h2 className="text-2xl mb-4" 
                  style={{ 
                    color: content.background_image ? 'rgba(255,255,255,0.9)' : (content.text_color || 'inherit'),
                    textShadow: content.background_image ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' 
                  }}>
                {content.subheadline || ''}
              </h2>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`h-full p-8 ${getLayoutClass()} ${getAnimationClass()}`} style={{ position: 'relative' }}>
            {/* Background rendering with multiple strategies for default slides */}
            {content.background_image && (
              <>
                {/* Strategy 1: Direct CSS background */}
                <div className="absolute inset-0" 
                     style={{ 
                       backgroundImage: `url(${content.background_image})`,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center',
                       zIndex: 0,
                       opacity: 1
                     }}>
                </div>
                
                {/* Image embed for URL-based backgrounds only */}
                {(content.background_image.startsWith('data:') || content.background_image.startsWith('http')) && (
                  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                    <img 
                      src={content.background_image}
                      alt="Slide background"
                      className="w-full h-full object-cover" 
                      style={{ 
                        opacity: 1,
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        transform: 'scale(1.05)', // Subtle zoom for professional look
                        transformOrigin: 'center center'
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                
                {/* CSS Gradient specific rendering for non-image backgrounds */}
                {(!content.background_image.startsWith('data:') && !content.background_image.startsWith('http')) && (
                  <div className="absolute inset-0 overflow-hidden export-gradient-background" 
                       style={{ 
                         zIndex: 0,
                         background: content.background_image || 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         width: '100%',
                         height: '100%',
                         display: 'block'
                       }}>
                  </div>
                )}
              </>
            )}
            
            {/* Gradient overlay for better text readability */}
            {(content.background_image && (content.use_gradient_overlay || true)) && (
              <div className="absolute inset-0 export-overlay" style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 100%)`,
                zIndex: 1,
                mixBlendMode: 'multiply'
              }}></div>
            )}
            
            {/* Design elements specific to the current design style - these will render in both preview and export */}
            {getDesignElements()}
            
            <h2 className="text-3xl font-bold mb-6 pb-2" style={{ 
              color: content.text_color || (content.background_image ? '#FFFFFF' : '#1E293B'),
              borderColor: content.accent_color || getAccentColor(content.color_theme),
              position: 'relative',
              zIndex: 10,
              textShadow: content.background_image ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
              borderBottom: content.use_bordered_sections ? `2px solid ${getAccentColor(content.color_theme)}` : 'none',
              paddingLeft: content.use_bordered_sections ? '8px' : '0'
            }}>
              {content.headline || 'Untitled Slide'}
            </h2>
            
            {/* Geometric shapes for modern design - conditionally rendered */}
            {content.use_geometric_shapes && (
              <div className="absolute right-[-50px] top-[-50px] z-[2]" 
                style={{
                  width: '250px',
                  height: '250px',
                  borderRadius: '50%',
                  background: getAccentColor(content.color_theme),
                  opacity: 0.1
                }}>
              </div>
            )}
            
            {/* Geometric accent line */}
            {content.use_geometric_shapes && (
              <div className="absolute left-[50px] bottom-[50px] z-[2]" 
                style={{
                  width: '150px',
                  height: '8px',
                  background: getAccentColor(content.color_theme),
                  opacity: 0.4
                }}>
              </div>
            )}

            <div className="slide-content" style={{ 
              color: content.text_color || (content.background_image ? '#FFFFFF' : 'inherit'),
              position: 'relative',
              zIndex: 10
            }}>
              {/* Nicely styled paragraphs with subtle effects */}
              {content.paragraphs && content.paragraphs.map((paragraph: string, i: number) => (
                <p key={i} className="mb-5 text-lg leading-relaxed" style={{
                  textShadow: content.background_image ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  background: content.use_bordered_sections && i === 0 ? `rgba(${content.background_image ? '255,255,255,0.1' : '0,0,0,0.03'})` : 'transparent',
                  padding: content.use_bordered_sections && i === 0 ? '12px 16px' : '0',
                  borderLeft: content.use_bordered_sections && i === 0 ? `3px solid ${getAccentColor(content.color_theme)}` : 'none',
                  borderRadius: content.use_bordered_sections && i === 0 ? '0 4px 4px 0' : '0'
                }}>
                  {paragraph}
                </p>
              ))}
              
              {/* Enhanced bullet points with custom styling */}
              {content.bullets && content.bullets.length > 0 && (
                <ul className="pl-6 mb-4 space-y-3">
                  {content.bullets.map((bullet: string, i: number) => (
                    <li key={i} className="text-lg relative" style={{
                      listStyle: 'none',
                      paddingLeft: '8px',
                      marginLeft: '12px',
                      textShadow: content.background_image ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                      borderLeft: `2px solid ${getAccentColor(content.color_theme)}`,
                      paddingBottom: '3px',
                      paddingTop: '3px'
                    }}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
    }
  };
  
  // Classic template - traditional, formal presentation style
  const renderClassicSlide = (content: any, slideType: string) => {
    switch (slideType) {
      case 'cover':
        return (
          <div className={`h-full p-8 ${getLayoutClass()} ${getAnimationClass()}`}>
            <h1 className="text-4xl font-serif font-bold mb-4" style={{ color: content.text_color }}>
              {content.headline || 'Untitled Presentation'}
            </h1>
            <h2 className="text-2xl font-serif italic" style={{ color: content.text_color }}>
              {content.subheadline || ''}
            </h2>
          </div>
        );
      
      default:
        return (
          <div className={`h-full p-8 ${getLayoutClass()} ${getAnimationClass()}`}>
            <h2 className="text-3xl font-serif font-bold mb-6 text-center pb-2" style={{ 
              color: content.text_color,
              borderColor: content.accent_color 
            }}>
              {content.headline || 'Untitled Slide'}
            </h2>
            
            <div className="slide-content">
              {content.paragraphs && content.paragraphs.map((paragraph: string, i: number) => (
                <p key={i} className="mb-4 text-lg font-serif">
                  {paragraph}
                </p>
              ))}
              
              {content.bullets && content.bullets.length > 0 && (
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  {content.bullets.map((bullet: string, i: number) => (
                    <li key={i} className="text-lg font-serif">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
    }
  };
  
  // Minimal template - extremely simple and clean
  const renderMinimalSlide = (content: any, slideType: string) => {
    switch (slideType) {
      case 'cover':
        return (
          <div className={`h-full p-12 ${getLayoutClass()} ${getAnimationClass()}`}>
            <h1 className="text-6xl font-light mb-6" style={{ color: content.text_color }}>
              {content.headline || 'Untitled Presentation'}
            </h1>
            <h2 className="text-xl font-light opacity-70" style={{ color: content.text_color }}>
              {content.subheadline || ''}
            </h2>
          </div>
        );
      
      default:
        return (
          <div className={`h-full p-12 ${getLayoutClass()} ${getAnimationClass()}`}>
            <h2 className="text-4xl font-light mb-8" style={{ color: content.text_color }}>
              {content.headline || 'Untitled Slide'}
            </h2>
            
            <div className="slide-content max-w-2xl">
              {content.paragraphs && content.paragraphs.map((paragraph: string, i: number) => (
                <p key={i} className="mb-6 text-xl font-light">
                  {paragraph}
                </p>
              ))}
              
              {content.bullets && content.bullets.length > 0 && (
                <ul className="list-none mt-6 space-y-4">
                  {content.bullets.map((bullet: string, i: number) => (
                    <li key={i} className="text-xl">
                      <span className="inline-block w-2 h-2 mr-3 rounded-full" style={{ backgroundColor: content.accent_color }}></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
    }
  };
  
  // Bold template - high contrast, impactful design
  const renderBoldSlide = (content: any, slideType: string) => {
    switch (slideType) {
      case 'cover':
        return (
          <div className={`h-full ${getLayoutClass()} ${getAnimationClass()}`}>
            <div className="bg-black text-white p-12 h-full w-full">
              <h1 className="text-6xl font-extrabold mb-6">
                {content.headline || 'Untitled Presentation'}
              </h1>
              <h2 className="text-2xl">
                {content.subheadline || ''}
              </h2>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`h-full ${getLayoutClass()} ${getAnimationClass()}`}>
            <div className="bg-white p-10 h-full w-full">
              <h2 className="text-4xl font-extrabold mb-8 border-l-8 pl-4" style={{ 
                borderColor: content.accent_color || '#000' 
              }}>
                {content.headline || 'Untitled Slide'}
              </h2>
              
              <div className="slide-content">
                {content.paragraphs && content.paragraphs.map((paragraph: string, i: number) => (
                  <p key={i} className="mb-6 text-xl font-medium">
                    {paragraph}
                  </p>
                ))}
                
                {content.bullets && content.bullets.length > 0 && (
                  <ul className="list-none mt-8 space-y-4">
                    {content.bullets.map((bullet: string, i: number) => (
                      <li key={i} className="text-xl font-medium flex items-start">
                        <span className="inline-block w-4 h-4 mr-4 mt-1.5" style={{ backgroundColor: content.accent_color || '#000' }}></span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
    }
  };
  
  // Creative template - unique and visually interesting
  const renderCreativeSlide = (content: any, slideType: string) => {
    switch (slideType) {
      case 'cover':
        return (
          <div className={`h-full ${getLayoutClass()} ${getAnimationClass()}`} style={{
            background: `linear-gradient(135deg, ${content.accent_color || '#6366F1'} 0%, #ffffff 100%)`
          }}>
            <div className="p-12 h-full w-full flex flex-col justify-center">
              <h1 className="text-6xl font-bold mb-6 text-white drop-shadow-lg">
                {content.headline || 'Untitled Presentation'}
              </h1>
              <h2 className="text-2xl text-white opacity-90">
                {content.subheadline || ''}
              </h2>
              {content.background_image && (
              <div className="absolute right-0 bottom-0 opacity-40 w-1/2 h-1/2 overflow-hidden">
                <img
                  src={content.background_image}
                  alt="Background element"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom right',
                    display: 'block'
                  }}
                  crossOrigin="anonymous"
                />
              </div>
            )}  
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`h-full ${getLayoutClass()} ${getAnimationClass()}`}>
            <div className="p-10 h-full w-full relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ 
                backgroundColor: content.accent_color || '#6366F1' 
              }}></div>
              
              <h2 className="text-4xl font-bold mb-8 relative z-10" style={{ 
                color: content.text_color || '#000'
              }}>
                <span className="inline-block pb-2 border-b-4" style={{ borderColor: content.accent_color || '#6366F1' }}>
                  {content.headline || 'Untitled Slide'}
                </span>
              </h2>
              
              <div className="slide-content relative z-10">
                {content.paragraphs && content.paragraphs.map((paragraph: string, i: number) => (
                  <p key={i} className="mb-5 text-xl">
                    {paragraph}
                  </p>
                ))}
                
                {content.bullets && content.bullets.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {content.bullets.map((bullet: string, i: number) => (
                      <li key={i} className="text-xl flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-white text-sm" style={{ 
                          backgroundColor: content.accent_color || '#6366F1' 
                        }}>{i + 1}</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Another decorative element */}
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10" style={{ 
                backgroundColor: content.accent_color || '#6366F1' 
              }}></div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`slide-for-export w-full h-full rounded-lg shadow overflow-hidden ${getFontClass()} ${getColorClass()}`}
      style={getCustomStyles()}
      data-slide-type={slide.slide_type}
      data-slide-id={slide.id}
    >
      {renderSlideContent()}
    </div>
  );
};

export default SlideViewer;
