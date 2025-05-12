/**
 * Business Agreement Service
 * 
 * Provides functionality to generate different types of business agreements
 * using AI and export them to PDF format.
 */
import { jsPDF } from 'jspdf';
import { AgreementType, BusinessAgreement, AgreementSection } from '../types';
import { queryOpenAI } from './openaiService';

/**
 * Generate a business agreement based on user inputs
 */
export const generateBusinessAgreement = async (formData: any): Promise<BusinessAgreement> => {
  const { 
    agreementType, 
    partyA, 
    partyB, 
    purpose, 
    duration, 
    durationUnit, 
    governingLaw, 
    additionalTerms 
  } = formData;

  // Create a detailed prompt for the AI to generate a comprehensive agreement
  const prompt = `
    Generate a detailed and legally sound ${getAgreementTypeName(agreementType as AgreementType)} between ${partyA} and ${partyB}.
    
    Purpose: ${purpose}
    Duration: ${duration} ${durationUnit}
    Governing Law: ${governingLaw}
    Additional Terms: ${additionalTerms || 'None specified'}
    
    The agreement should include:
    1. Comprehensive definitions of all key terms
    2. Detailed scope of work or partnership
    3. Specific rights and obligations of each party
    4. Payment terms and conditions (if applicable)
    5. Intellectual property provisions
    6. Confidentiality requirements
    7. Term and termination conditions
    8. Dispute resolution procedures
    9. Indemnification clauses
    10. Limitation of liability
    11. Force majeure provisions
    12. Assignment and succession details
    13. Notice requirements
    14. Amendment procedures
    15. Severability clauses
    16. Entire agreement statement
    17. Governing law and jurisdiction
    18. Detailed signature block
    
    Format the response as a JSON object with the following structure:
    {
      "title": "The full title of the agreement",
      "sections": [
        {
          "title": "Section title (e.g., 'DEFINITIONS', 'TERM AND TERMINATION', etc.)",
          "content": "The full text content of this section with detailed clauses and subclauses"
        },
        ...more sections
      ]
    }
    
    Make the agreement comprehensive, professional, and legally robust with at least 15-20 detailed sections. Include specific clauses that address the unique aspects of this type of agreement.`;
  
  // Get the response from OpenAI
  const response = await queryOpenAI(prompt);
  
  // Parse the response to extract sections
  let sections: AgreementSection[] = [];
  
  try {
    // Try to parse as JSON first
    const parsedResponse = JSON.parse(response);
    if (parsedResponse.sections && Array.isArray(parsedResponse.sections)) {
      sections = parsedResponse.sections;
    } else {
      // If JSON doesn't have expected structure, parse as text
      sections = parseAgreementSections(response);
    }
  } catch (error) {
    // If not valid JSON, parse as text
    sections = parseAgreementSections(response);
  }
  
  // Create the agreement object
  const agreement: BusinessAgreement = {
    type: agreementType as AgreementType,
    title: getAgreementTypeName(agreementType as AgreementType),
    partyA,
    partyB,
    purpose,
    duration,
    governingLaw,
    createdAt: new Date().toISOString(),
    sections
  };
  
  return agreement;
};

/**
 * Export a business agreement to PDF format
 * @param agreement The business agreement to export
 * @returns The PDF document as a blob
 */
export const exportAgreementToPDF = (agreement: BusinessAgreement): jsPDF => {
  // Initialize jsPDF with white background
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Define colors
  const primaryColor = [0.12, 0.35, 0.6]; // RGB for #1e5799 (dark blue)
  const secondaryColor = [0.4, 0.6, 0.8]; // RGB for #6699cc (medium blue)
  // Accent color defined but not used yet - will be used for highlights in future versions
  // const accentColor = [0.8, 0.3, 0.3]; // RGB for #cc4c4c (red accent)
  const textColor = [0.2, 0.2, 0.2]; // RGB for #333333 (dark gray)
  
  // Set white background for the entire page
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 210, 297, 'F'); // A4 size in mm
  
  // Add decorative header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, 210, 15, 'F');
  
  // Add decorative sidebar
  pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.rect(0, 15, 10, 282, 'F');
  
  // Ensure text is black for contrast on white background
  pdf.setTextColor(0, 0, 0);
  
  // This line is redundant since we already set text color to black above
  
  // Add title with enhanced styling
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
  pdf.text(agreement.title.toUpperCase(), 105, 30, { align: 'center' });
  
  // Add parties with styling
  pdf.setFontSize(12);
  pdf.setTextColor(textColor[0] * 255, textColor[1] * 255, textColor[2] * 255);
  pdf.text(`Between ${agreement.partyA} and ${agreement.partyB}`, 105, 38, { align: 'center' });
  
  // Add decorative line
  pdf.setDrawColor(secondaryColor[0] * 255, secondaryColor[1] * 255, secondaryColor[2] * 255);
  pdf.setLineWidth(0.5);
  pdf.line(40, 42, 170, 42);
  
  // Add content with better spacing and formatting
  let yPosition = 50;
  const margin = 20;
  const contentWidth = 170;
  
  // Calculate optimal font size based on content length to ensure it fits on one page
  const totalContentLength = agreement.sections.reduce((total: number, section: AgreementSection) => {
    return total + section.content.length;
  }, 0);
  
  // Adjust font size based on content length
  const baseFontSize = totalContentLength > 3000 ? 9 : totalContentLength > 2000 ? 10 : 11;
  
  // Calculate optimal line spacing to prevent overlapping
  const lineSpacing = baseFontSize * 0.5; // Adjust line spacing based on font size
  
  agreement.sections.forEach((section: AgreementSection, index: number) => {
    // Add section number and title with accent color
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(baseFontSize + 2);
    pdf.setTextColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
    pdf.text(`${index + 1}. ${section.title}`, margin, yPosition);
    yPosition += 6;
    
    // Add section content with proper formatting
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(baseFontSize);
    pdf.setTextColor(textColor[0] * 255, textColor[1] * 255, textColor[2] * 255);
    
    // Split content into lines to fit page width with proper spacing
    const contentLines = pdf.splitTextToSize(section.content, contentWidth);
    
    // Check if we need to add a new page
    if (yPosition + contentLines.length * lineSpacing > 270) {
      pdf.addPage();
      
      // Add header and sidebar to new page
      // First set white background for the entire page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, 'F'); // A4 size in mm
      
      // Then add decorative elements
      pdf.setFillColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
      pdf.rect(0, 0, 210, 15, 'F');
      pdf.setFillColor(secondaryColor[0] * 255, secondaryColor[1] * 255, secondaryColor[2] * 255);
      pdf.rect(0, 15, 10, 282, 'F');
      
      // Ensure text is black for contrast on white background
      pdf.setTextColor(0, 0, 0);
      
      yPosition = 30;
    }
    
    pdf.text(contentLines, margin, yPosition);
    yPosition += contentLines.length * lineSpacing + 8;
  });
  
  // Add signature block with enhanced styling
  yPosition += 5;
  
  // Add signature title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
  pdf.text('SIGNATURES', 105, yPosition, { align: 'center' });
  yPosition += 10;
  
  // Add decorative line above signatures
  pdf.setDrawColor(secondaryColor[0] * 255, secondaryColor[1] * 255, secondaryColor[2] * 255);
  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  // Party names
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(textColor[0] * 255, textColor[1] * 255, textColor[2] * 255);
  pdf.text(agreement.partyA, 50, yPosition, { align: 'center' });
  pdf.text(agreement.partyB, 150, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Signature lines
  pdf.setDrawColor(0.7, 0.7, 0.7); // Light gray for signature lines
  pdf.setLineWidth(0.3);
  pdf.line(20, yPosition, 80, yPosition); // Signature line for party A
  pdf.line(110, yPosition, 170, yPosition); // Signature line for party B
  
  // Signature labels
  yPosition += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0.5, 0.5, 0.5); // Medium gray for labels
  pdf.text('Authorized Signature', 50, yPosition, { align: 'center' });
  pdf.text('Authorized Signature', 150, yPosition, { align: 'center' });
  
  // Date lines
  yPosition += 15;
  pdf.setDrawColor(0.7, 0.7, 0.7);
  pdf.line(20, yPosition, 80, yPosition); // Date line for party A
  pdf.line(110, yPosition, 170, yPosition); // Date line for party B
  
  // Date labels
  yPosition += 5;
  pdf.text('Date', 50, yPosition, { align: 'center' });
  pdf.text('Date', 150, yPosition, { align: 'center' });
  
  // Add footer with generation info
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(0.5, 0.5, 0.5);
  pdf.text(`Generated on ${new Date().toLocaleDateString()} | AI Pitch Deck Generator`, 105, 285, { align: 'center' });
  
  return pdf;
};

/**
 * Get the full name of an agreement type
 */
export const getAgreementTypeName = (type: AgreementType): string => {
  const typeNames: Record<AgreementType, string> = {
    'NDA': 'Non-Disclosure Agreement',
    'SERVICE': 'Service Agreement',
    'EMPLOYMENT': 'Employment Contract',
    'PARTNERSHIP': 'Partnership Agreement',
    'SALES': 'Sales Contract',
    'CONSULTING': 'Consulting Agreement',
    'LICENSING': 'Licensing Agreement'
  };
  
  return typeNames[type] || 'Business Agreement';
};

/**
 * Create a fallback agreement in case of API failure
 */
// Fallback agreement creation is now handled inline in the generateBusinessAgreement function

/**
 * Parse the OpenAI response to extract agreement sections
 * @param response The response from OpenAI
 * @returns Array of agreement sections
 */
const parseAgreementSections = (response: string): AgreementSection[] => {
  // First try to parse as JSON
  try {
    const jsonResponse = JSON.parse(response);
    if (jsonResponse.sections && Array.isArray(jsonResponse.sections)) {
      // Clean up each section to remove any code artifacts
      return jsonResponse.sections.map((section: any, index: number) => ({
        title: cleanText(section.title || `Section ${index + 1}`),
        content: cleanText(section.content || '')
      }));
    }
  } catch (e) {
    // Not valid JSON, continue with text parsing
  }
  
  // More robust regex to capture various section header formats
  // This handles numbered sections, all caps headers, and mixed case headers with colons
  const sectionRegex = /\n\s*(?:(\d+\.?)\s*|([A-Z][A-Z\s]+):?\s*|([A-Z][a-z]+(\s+[A-Z][a-z]+)*):?\s*)([A-Za-z\s]+)\n/g;
  const sections: AgreementSection[] = [];
  
  let match;
  let sectionNumber = 1;
  
  // First pass to identify all section boundaries
  const sectionBoundaries: {index: number, title: string}[] = [];
  
  while ((match = sectionRegex.exec(response)) !== null) {
    // Determine which capture group has the title
    let title = '';
    let prefix = '';
    
    if (match[1]) { // Numbered section
      prefix = match[1] + ' ';
      title = match[5].trim();
    } else if (match[2]) { // ALL CAPS section
      title = match[2].trim() + ' ' + match[5].trim();
    } else { // Mixed case section
      title = match[3].trim() + ' ' + match[5].trim();
    }
    
    sectionBoundaries.push({
      index: match.index,
      title: cleanText(prefix + title)
    });
  }
  
  // Process sections based on identified boundaries
  for (let i = 0; i < sectionBoundaries.length; i++) {
    const currentSection = sectionBoundaries[i];
    const nextSection = sectionBoundaries[i + 1];
    
    const startIndex = currentSection.index;
    const endIndex = nextSection ? nextSection.index : response.length;
    
    // Extract section content, skipping the header line
    const fullSectionText = response.substring(startIndex, endIndex);
    const headerEndIndex = fullSectionText.indexOf('\n') + 1;
    const content = cleanText(fullSectionText.substring(headerEndIndex).trim());
    
    sections.push({
      title: currentSection.title,
      content: content
    });
  }
  
  // If no sections were found using regex, try a simpler approach with common section headers
  if (sections.length === 0) {
    const commonHeaders = [
      'DEFINITIONS', 'TERM', 'PAYMENT', 'CONFIDENTIALITY', 'TERMINATION',
      'REPRESENTATIONS', 'WARRANTIES', 'INDEMNIFICATION', 'LIMITATION OF LIABILITY',
      'GOVERNING LAW', 'DISPUTE RESOLUTION', 'NOTICES', 'ASSIGNMENT', 'FORCE MAJEURE',
      'SEVERABILITY', 'ENTIRE AGREEMENT', 'AMENDMENTS', 'WAIVER'
    ];
    
    for (const header of commonHeaders) {
      const headerIndex = response.indexOf(header);
      if (headerIndex !== -1) {
        const startIndex = headerIndex + header.length;
        const nextHeaderIndex = commonHeaders.reduce((closest, nextHeader) => {
          const index = response.indexOf(nextHeader, startIndex);
          if (index !== -1 && (index < closest || closest === -1)) {
            return index;
          }
          return closest;
        }, -1);
        
        const endIndex = nextHeaderIndex !== -1 ? nextHeaderIndex : response.length;
        const content = cleanText(response.substring(startIndex, endIndex).trim());
        
        sections.push({
          title: sectionNumber + '. ' + header,
          content: content
        });
        
        sectionNumber++;
      }
    }
  }
  
  // If still no sections were found, create a default one with the entire response
  if (sections.length === 0) {
    // Split by double newlines to try to create some structure
    const paragraphs = response.split('\n\n');
    
    if (paragraphs.length > 1) {
      // Create sections from paragraphs
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          // Try to extract a title from the first line
          const lines = paragraph.split('\n');
          const title = cleanText(lines[0].trim());
          const content = cleanText(lines.slice(1).join('\n').trim());
          
          sections.push({
            title: `${index + 1}. ${title}`,
            content: content || cleanText(paragraph) // If no content, use the whole paragraph
          });
        }
      });
    } else {
      // Last resort: just use the whole text
      sections.push({
        title: '1. Agreement Terms',
        content: cleanText(response.trim())
      });
    }
  }
  
  return sections;
};

// Remove the unused createFallbackAgreement function since we're handling errors inline

/**
 * Clean text to remove code artifacts, JSON formatting, and other unwanted characters
 * @param text The text to clean
 * @returns Cleaned text
 */
const cleanText = (text: string): string => {
  if (!text) return '';
  
  // First pass: Remove JSON formatting artifacts
  let cleaned = text
    .replace(/[\{\}\[\]"]/g, '') // Remove JSON brackets and quotes
    .replace(/\\n/g, '\n') // Replace escaped newlines with actual newlines
    .replace(/\\t/g, '  ') // Replace escaped tabs with spaces
    .replace(/\\r/g, '') // Remove carriage returns
    .replace(/\\\//g, '/') // Replace escaped forward slashes
    .replace(/\\'/g, "'") // Replace escaped single quotes
    .replace(/\\"|"/g, '') // Replace escaped double quotes
    .replace(/title:|content:/gi, '') // Remove JSON field names
    .replace(/,$/gm, '') // Remove trailing commas
    .replace(/^\s*,/gm, '') // Remove leading commas
    .replace(/\s*:\s*/g, ': ') // Normalize spacing around colons
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
    .replace(/^\s*\d+\s*[:.)]\s*/gm, '') // Remove numbering artifacts
    .replace(/^\s*["']|["']\s*$/gm, '') // Remove quotes at beginning/end of lines
    .replace(/\{\s*\}/g, '') // Remove empty objects
    .replace(/\[\s*\]/g, '') // Remove empty arrays
    .replace(/\(\s*\)/g, '') // Remove empty parentheses
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/\n\s*,/g, '\n') // Remove commas at beginning of lines
    .replace(/^\s*\{\s*$|^\s*\}\s*$/gm, '') // Remove lone braces on lines
    .replace(/^\s*\[\s*$|^\s*\]\s*$/gm, ''); // Remove lone brackets on lines
  
  // Second pass: Remove code patterns
  cleaned = cleaned
    .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '') // Remove function declarations
    .replace(/const|let|var\s+[a-zA-Z0-9_]+\s*=/g, '') // Remove variable declarations
    .replace(/if\s*\([^)]*\)\s*\{[^}]*\}/g, '') // Remove if statements
    .replace(/for\s*\([^)]*\)\s*\{[^}]*\}/g, '') // Remove for loops
    .replace(/while\s*\([^)]*\)\s*\{[^}]*\}/g, '') // Remove while loops
    .replace(/try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/g, '') // Remove try-catch blocks
    .replace(/import\s+[^;]+;/g, '') // Remove import statements
    .replace(/export\s+[^;]+;/g, '') // Remove export statements
    .replace(/console\.log\([^)]*\);/g, '') // Remove console.log statements
    .replace(/return\s+[^;]+;/g, '') // Remove return statements
    .replace(/\s*=>\s*/g, ' '); // Remove arrow functions
  
  // Third pass: Clean up any remaining artifacts
  cleaned = cleaned
    .replace(/^\s*[{}\[\],:;]\s*$/gm, '') // Remove lines with only brackets/punctuation
    .replace(/^\s*".*"\s*$/gm, '') // Remove lines with only quoted strings
    .replace(/^\s*'.*'\s*$/gm, '') // Remove lines with only quoted strings
    .replace(/^\s*\(.*\)\s*$/gm, '') // Remove lines with only parentheses
    .replace(/^\s*\d+\s*$/gm, '') // Remove lines with only numbers
    .replace(/^\s*true|false\s*$/gm, '') // Remove lines with only booleans
    .replace(/^\s*null|undefined\s*$/gm, '') // Remove lines with only null/undefined
    .replace(/^\s*\w+\s*:\s*$/gm, '') // Remove lines with only property names
    .replace(/^\s*\.\w+\s*$/gm, '') // Remove lines with only dot notation
    .replace(/^\s*\w+\(\)\s*$/gm, ''); // Remove lines with only function calls

  // Fix spacing and formatting
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s*\n\s*/g, '\n') // Normalize newlines
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim(); // Remove leading/trailing whitespace
  
  return cleaned;
};

export default {
  generateBusinessAgreement,
  exportAgreementToPDF,
  getAgreementTypeName
};
