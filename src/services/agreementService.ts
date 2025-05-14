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
  const prompt = `Generate an extensive, highly detailed, professional, and legally sound ${getAgreementTypeName(agreementType as AgreementType)} between "${partyA}" and "${partyB}".

**AGREEMENT DETAILS TO INCORPORATE**
Purpose: ${purpose}
Duration: ${duration} ${durationUnit || ''}
Governing Law: ${governingLaw}
${additionalTerms ? `Additional Terms: ${additionalTerms}` : ''}

**KEY REQUIREMENTS**
1. LENGTH AND DETAIL: Create a substantially longer agreement (at least 15-20 detailed sections) with comprehensive coverage of all standard and specialized provisions. Each section should be thorough with multiple subsections and clauses.

2. EXTENSIVE USE OF PROVIDED DETAILS: Thoroughly incorporate all the above agreement details throughout the document:
   - Use the specific purpose ("${purpose}") as the foundation for detailed clauses about objectives, scope, and deliverables
   - Elaborate on the duration ("${duration} ${durationUnit || ''}") with specific start dates, renewal terms, and termination procedures
   - Detail the governing law ("${governingLaw}") with extensive jurisdiction-specific legal provisions and compliance requirements
   - Incorporate any additional terms provided with custom clauses and special provisions

3. PROFESSIONAL LEGAL STRUCTURE: Format the content as a formal legal document with:
   - Formal recitals (WHEREAS clauses) that extensively introduce the parties' relationship and purpose
   - Multiple definitions of key terms used throughout the agreement
   - Hierarchical clause numbering (1.1, 1.1.1, 1.1.2, 1.2, etc.) 
   - Proper indentation of subclauses and traditional paragraph spacing
   - Comprehensive representations and warranties sections
   - Detailed remedies for various breach scenarios
   - Thorough indemnification provisions
   - Extensive limitation of liability language
   - Complete confidentiality and intellectual property provisions

4. **CRITICAL REQUIREMENT: You MUST include ALL of these sections with detailed subclauses in each. This list is not optional - EVERY section MUST be present in your output:**

1. PREAMBLE & RECITALS - Required
2. DEFINITIONS (minimum 10-15 terms) - Required
3. SCOPE OF AGREEMENT - Required
4. TERM & RENEWAL - Required
5. RIGHTS & OBLIGATIONS OF ${partyA} - Required
6. RIGHTS & OBLIGATIONS OF ${partyB} - Required
7. PAYMENT TERMS & SCHEDULE - Required
8. REPRESENTATIONS & WARRANTIES - Required
9. CONFIDENTIALITY - Required
10. INTELLECTUAL PROPERTY - Required
11. DATA PRIVACY & SECURITY - Required
12. TERMINATION - Required
13. EFFECTS OF TERMINATION - Required
14. INDEMNIFICATION - Required
15. LIMITATION OF LIABILITY - Required
16. FORCE MAJEURE - Required
17. DISPUTE RESOLUTION - Required
18. ASSIGNMENT & SUCCESSION - Required
19. NOTICES - Required
20. AMENDMENTS & WAIVERS - Required
21. SEVERABILITY - Required
22. ENTIRE AGREEMENT - Required
23. COUNTERPARTS & EXECUTION - Required
24. GOVERNING LAW & JURISDICTION - Required
25. SIGNATURES - Required

Do not skip any of these sections. Each section must include multiple paragraphs with complete, properly formatted clauses. The agreement must be comprehensive, substantial, and professionally formatted.

Produce the output as a JSON object with this structure:
{
  "title": "DETAILED [TYPE] AGREEMENT BETWEEN ${partyA} AND ${partyB}",
  "sections": [
    {
      "title": "SECTION TITLE",
      "content": "Detailed section content with proper paragraph structure and legal formatting. Each section should be substantial (multiple paragraphs) with proper clause numbering and indentation for subclauses.\n\nFor example:\n\nThis Agreement (the \"Agreement\") is made and entered into as of [Effective Date], by and between ${partyA}, a [entity type] with its principal place of business at [Address] (\"${partyA}\"), and ${partyB}, a [entity type] with its principal place of business at [Address] (\"${partyB}\").\n\nWHEREAS, ${partyA} [detailed description of party A's business and interest in this agreement related to the purpose: ${purpose}];\n\nWHEREAS, ${partyB} [detailed description of party B's business and interest in this agreement related to the purpose: ${purpose}];\n\nWHEREAS, the parties desire to enter into this Agreement to [detailed purpose description based on: ${purpose}]; and\n\nWHEREAS, both parties acknowledge the mutual benefits and considerations contained herein;\n\nNOW, THEREFORE, in consideration of the mutual covenants, promises, and agreements set forth herein, the sufficiency of which is hereby acknowledged, the parties agree as follows:\n\n1. DEFINITIONS\n\n1.1 'Affiliate' means, with respect to any entity, any other entity that directly or indirectly controls, is controlled by, or is under common control with such entity, where 'control' means the possession, directly or indirectly, of the power to direct the management and policies of an entity whether through the ownership of voting securities, contract, or otherwise.\n\n1.2 'Confidential Information' means [extensive definition specific to this agreement and its purpose].\n\n...[additional definitions]\n\n2. TERM AND COMMENCEMENT\n\n2.1 Term. This Agreement shall commence on [Start Date] and continue for a period of ${duration} ${durationUnit || ''}, unless earlier terminated in accordance with Section [x] (the \"Initial Term\").\n\n2.2 Renewal. This Agreement shall automatically renew for successive periods of [renewal period] (each, a \"Renewal Term\") unless either party provides written notice of non-renewal at least [notice period] prior to the expiration of the then-current Initial Term or Renewal Term. The Initial Term and all Renewal Terms are collectively referred to as the \"Term.\"\n\n2.3 Survival. The provisions of Sections [list sections], and any accrued rights to payment, shall survive the termination or expiration of this Agreement for any reason."
    },
    // Additional sections follow the same format
  ]
}`;



  
  // Get the response from OpenAI
  const response = await queryOpenAI(prompt);
  
  console.log('Raw OpenAI response:', response);
  
  // Parse the response to extract sections
  let sections: AgreementSection[] = [];
  let title = getAgreementTypeName(agreementType as AgreementType);
  
  try {
    // Try to parse as JSON first
    // First, clean any potential text before or after the JSON object
    const jsonStartIndex = response.indexOf('{');
    const jsonEndIndex = response.lastIndexOf('}') + 1;
    
    if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
      let jsonString = response.substring(jsonStartIndex, jsonEndIndex);
      console.log('Extracted JSON string:', jsonString);
      
      // Try to fix incomplete JSON by checking for balanced brackets and quotes
      // Check if we have complete sections array
      const sectionsStart = jsonString.indexOf('"sections"');
      if (sectionsStart > 0) {
        // Count opening and closing brackets to ensure they're balanced
        let openBrackets = 0;
        let closeBrackets = 0;
        let inQuote = false;
        let escapeNext = false;
        
        for (let i = 0; i < jsonString.length; i++) {
          const char = jsonString[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inQuote = !inQuote;
          }
          
          if (!inQuote) {
            if (char === '[') openBrackets++;
            if (char === ']') closeBrackets++;
          }
        }
        
        // If brackets aren't balanced, try to fix it
        if (openBrackets > closeBrackets) {
          console.log('Fixing unbalanced brackets in JSON');
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            jsonString += ']';
          }
          // Make sure to close the object too
          if (!jsonString.endsWith('}')) {
            jsonString += '}';
          }
        }
      }
      
      try {
        const parsedResponse = JSON.parse(jsonString);
        console.log('Parsed JSON response:', parsedResponse);
        
        if (parsedResponse.title) {
          title = parsedResponse.title;
        }
        
        if (parsedResponse.sections && Array.isArray(parsedResponse.sections)) {
          sections = parsedResponse.sections.map((section: any) => ({
            title: section.title || '',
            content: section.content || ''
          }));
          console.log('Successfully parsed JSON sections:', sections.length);
        } else {
          // If JSON doesn't have expected structure, parse as text
          console.log('JSON missing sections array, falling back to text parsing');
          sections = parseAgreementSections(response);
        }
      } catch (jsonError) {
        console.error('Error parsing fixed JSON:', jsonError);
        sections = parseAgreementSections(response);
      }
    } else {
      // No valid JSON found, parse as text
      console.log('No JSON object found in response, falling back to text parsing');
      sections = parseAgreementSections(response);
    }
  } catch (error) {
    // If not valid JSON, parse as text
    console.error('Error parsing JSON:', error);
    sections = parseAgreementSections(response);
  }
  
  // Create the agreement object
  const agreement: BusinessAgreement = {
    type: agreementType as AgreementType,
    title,  // Use the title from the response or the default
    partyA,
    partyB,
    purpose,
    duration,
    governingLaw,
    createdAt: new Date().toISOString(),
    sections
  };
  
  console.log('Final agreement object:', {
    title: agreement.title,
    sectionCount: agreement.sections.length,
    firstSection: agreement.sections[0]?.title
  });
  
  // Verify we have all required sections
  const requiredSections = [
    'PREAMBLE', 'RECITAL', 'DEFINITION', 'SCOPE', 'TERM', 'RIGHT', 'OBLIGATION', 
    'PAYMENT', 'REPRESENTATION', 'WARRANT', 'CONFIDENTIAL', 'INTELLECTUAL PROPERTY', 
    'DATA PRIVACY', 'SECURITY', 'TERMINATION', 'INDEMNIFICATION', 'LIABILITY', 
    'FORCE MAJEURE', 'DISPUTE', 'ASSIGNMENT', 'NOTICE', 'AMENDMENT', 'WAIVER', 
    'SEVERABILITY', 'ENTIRE AGREEMENT', 'COUNTERPART', 'GOVERNING LAW', 'JURISDICTION', 'SIGNATURE'
  ];
  
  // Check for missing sections
  const missingSections = [];
  for (const required of requiredSections) {
    const found = agreement.sections.some(section => 
      section.title.toUpperCase().includes(required));
    if (!found) {
      missingSections.push(required);
    }
  }
  
  // Log any missing sections
  if (missingSections.length > 0) {
    console.warn('Agreement is missing some recommended sections:', missingSections.join(', '));
  }
  
  return agreement;
};

/**
 * Export a business agreement to PDF format
 * @param agreement The business agreement to export
 * @returns The PDF document as a blob
 */
export const exportAgreementToPDF = (agreement: BusinessAgreement): jsPDF => {
  // Initialize jsPDF with white background only (no decorative elements)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true, // Only include used fonts to reduce file size
    compress: true // Enable compression
  });
  
  // Define colors
  const primaryColor = [0.12, 0.35, 0.6]; // RGB for #1e5799 (dark blue)
  const secondaryColor = [0.4, 0.6, 0.8]; // RGB for #6699cc (medium blue)
  const textColor = [0.2, 0.2, 0.2]; // RGB for #333333 (dark gray)
  
  // Add solid white background (no black edges)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 210, 297, 'F'); // A4 size in mm
  
  // Leave clean margins at top - no header element
  
  // Ensure text is black for contrast on white background
  pdf.setTextColor(0, 0, 0);
  
  // This line is redundant since we already set text color to black above
  
  // Completely reset formatting for a clean start
  pdf.deletePage(1);
  pdf.addPage();
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 210, 297, 'F');
  
  // Title placement with significant margins from all edges
  const titleStartY = 40; // Start much lower on the page
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14); // Clear, readable size
  pdf.setTextColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
  
  // Clean up title text - remove any "CONTRACT" or "AGREEMENT" prefixes if present
  let titleText = agreement.title
    .replace(/CONTRACT\s+BETWEEN/i, 'BETWEEN')
    .replace(/AGREEMENT\s+BETWEEN/i, 'BETWEEN');
  
  // If title is very long, use a smaller font
  if (titleText.length > 50) {
    pdf.setFontSize(12);
  }
    
  const titleWidth = 150; // Sufficient width for title
  const titleLines = pdf.splitTextToSize(titleText, titleWidth);
  pdf.text(titleLines, 105, titleStartY, { align: 'center' });
  
  // Parties placement - positioned based on title height
  pdf.setFontSize(10); // Smaller text
  pdf.setTextColor(textColor[0] * 255, textColor[1] * 255, textColor[2] * 255);
  
  // Calculate position based on actual title height
  const titleHeight = titleLines.length * 6; // Approximate height based on font size
  const partiesYPos = titleStartY + titleHeight + 8; // Add more space after title
  
  // Create parties text with proper spacing
  pdf.text(`Between ${agreement.partyA} and ${agreement.partyB}`, 105, partiesYPos, { align: 'center' });
  
  // Add decorative line - positioned relative to parties text with more space
  pdf.setDrawColor(secondaryColor[0] * 255, secondaryColor[1] * 255, secondaryColor[2] * 255);
  pdf.setLineWidth(0.5);
  const lineYPos = partiesYPos + 8; // More space after parties
  pdf.line(35, lineYPos, 175, lineYPos);
  
  // Add content with better spacing and formatting - positioned relative to decorative line
  let yPosition = lineYPos + 15; // More space after decorative line
  const margin = 35; // Significantly increased margin for better readability
  const contentWidth = 140; // Narrower content width for better margins
  
  // Calculate optimal font size based on content length and number of sections
  const totalContentLength = agreement.sections.reduce((total: number, section: AgreementSection) => {
    return total + section.content.length;
  }, 0);
  
  const sectionCount = agreement.sections.length;
  
  // Font sizing for professional contract appearance
  // Using slightly larger fonts for better readability in legal documents
  let baseFontSize;
  if (totalContentLength > 4000 || sectionCount > 12) {
    baseFontSize = 9; // Small but readable for very long agreements
  } else if (totalContentLength > 3000 || sectionCount > 9) {
    baseFontSize = 9.5; // Readable size for long agreements
  } else if (totalContentLength > 2000 || sectionCount > 7) {
    baseFontSize = 10; // Standard size for moderate agreements
  } else {
    baseFontSize = 10.5; // Comfortable size for shorter agreements
  }
  
  // Use appropriate line spacing for contract-style formatting
  // We need slightly more space between lines for a professional legal document look
  const lineSpacing = (totalContentLength > 3000) ? 
    baseFontSize * 0.9 : // Sufficient spacing for long documents
    baseFontSize * 1.1;  // More spacious formatting for shorter documents
  
  agreement.sections.forEach((section: AgreementSection) => {
    // Add section title with accent color (without section number)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(baseFontSize + 2);
    pdf.setTextColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
    pdf.text(section.title, margin, yPosition);
    yPosition += 6;
    
    // Add section content with proper formatting
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(baseFontSize);
    pdf.setTextColor(textColor[0] * 255, textColor[1] * 255, textColor[2] * 255);
    
      // Process content for a professional contract display with proper spacing
    // We'll preserve formatting like clause numbering (1.1, 1.2) but clean up other artifacts
    let cleanedContent = section.content
      // Preserve proper contract formatting
      .replace(/^\s*(\d+\.\d+)\s+/gm, '  $1 ') // Keep but format "1.1 " at start
      .replace(/\n\s*(\d+\.\d+)\s+/g, '\n\n  $1 ') // Format "1.1 " after breaks with spacing
      
      // Remove unwanted formatting
      .replace(/^\s*\d+\.\s(?!\d)/gm, '') // Remove simple "1. " (not 1.1) at start of lines
      .replace(/\n\s*\d+\.\s(?!\d)/g, '\n') // Remove simple "1. " (not 1.1) after line breaks
      .replace(/^\s*\d+\)\s+/gm, '')  // Remove "1) " at start of lines
      .replace(/\n\s*\d+\)\s+/g, '\n') // Remove "1) " after line breaks
      .replace(/^\s*[a-z]\)\s+/gim, '') // Remove "a) " at start of lines
      .replace(/\n\s*[a-z]\)\s+/gim, '\n') // Remove "a) " after line breaks
      .replace(/^\s*[a-z]\.\s+/gim, '') // Remove "a. " at start of lines
      .replace(/\n\s*[a-z]\.\s+/gim, '\n') // Remove "a. " after line breaks
      .replace(/^\s*[ivxIVX]+\.\s+/gm, '') // Remove Roman numerals with period
      .replace(/\n\s*[ivxIVX]+\.\s+/g, '\n') // Remove Roman numerals after breaks
      .replace(/^\s*[•\-*⋅◦○●■]\s+/gm, '') // Remove bullets/dashes at start
      .replace(/\n\s*[•\-*⋅◦○●■]\s+/g, '\n') // Remove bullets after breaks
      
      // Clean up artifacts but preserve quotes/parentheses that might be needed
      .replace(/\[([^\]]+)\]/g, '$1') // Remove square brackets
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      
      // Add proper paragraph spacing (double breaks between paragraphs)
      .replace(/\.\n(?![\n\s])/g, '.\n\n') // Add extra break after periods
      .replace(/\n{3,}/g, '\n\n') // Limit to max double breaks
      .trim(); // Remove leading/trailing whitespace
    
    // Split cleaned content into lines to fit page width with proper spacing
    const contentLines = pdf.splitTextToSize(cleanedContent, contentWidth);
            
    // Check if we need to add a new page
    if (yPosition + contentLines.length * lineSpacing > 270) {
      pdf.addPage();
              
      // Add clean white background for the new page (no decorative elements)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, 'F'); // A4 size in mm
      
      // No header elements on continuation pages for cleaner look
      
      // Ensure text is black for contrast on white background
      pdf.setTextColor(0, 0, 0);
      
      // Start content higher on continuation pages
      yPosition = 25;
    }
            
    // Apply proper formatting for contract-style text with paragraph indentation
    // This creates a more professional legal document appearance
    let currYPos = yPosition;
    
    // Process line by line to apply proper indentation and spacing
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const nextLine = i < contentLines.length - 1 ? contentLines[i + 1] : null;
      
      // Check if current line is a numbered clause (e.g., "1.1 Term.") 
      const isClauseHeading = /^\s*\d+\.\d+\s+[A-Z][a-z]+\./.test(line);
      
      // Check if line is a new paragraph (often starts with indentation)
      const isNewParagraph = line.startsWith('  ') && !isClauseHeading;
      
      // Apply different indentation based on content type
      const lineMargin = isClauseHeading ? margin : 
                         isNewParagraph ? margin + 5 : 
                         margin;
                         
      // Apply different font weight for clause headings
      if (isClauseHeading) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      // Draw the text with appropriate indentation
      pdf.text(line, lineMargin, currYPos);
      
      // If next line is a heading or empty, add more space after this line
      if (nextLine && (nextLine.trim() === '' || /^\s*\d+\.\d+\s+/.test(nextLine))) {
        currYPos += lineSpacing * 1.5; // Extra space before headings
      } else {
        currYPos += lineSpacing; // Normal line spacing
      }
    }
    
    yPosition = currYPos + 8; // Add some space after the section
  });
          
  // Add signature block with enhanced styling
  yPosition += 5;
          
  // Add signature title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
  pdf.text('SIGNATURES', 105, yPosition, { align: 'center' });
  yPosition += 10;
          
  // Keep signature section within the page
  if (yPosition > 250) {
    // If we're too close to the bottom, add a new page for signatures
    pdf.addPage();
            
    // Add clean white background for the new page
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 210, 297, 'F'); // A4 size in mm
            
    // Add thin blue header line
    pdf.setDrawColor(primaryColor[0] * 255, primaryColor[1] * 255, primaryColor[2] * 255);
    pdf.setLineWidth(0.8);
    pdf.line(10, 15, 200, 15);
            
    yPosition = 30;
  }
          
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
