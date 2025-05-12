import React from 'react';
import { BusinessAgreement, AgreementSection } from '../../types';

// Helper function to clean text content from code artifacts
const cleanContent = (content: string): string => {
  if (!content) return '';
  
  // First pass: Remove JSON/code structure
  let cleaned = content
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
    .replace(/\n\s*,/g, '\n'); // Remove commas at beginning of lines
  
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
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/^\s*\d+\s*$/gm, '') // Remove lines with only numbers
    .replace(/^\s*true|false\s*$/gm, '') // Remove lines with only booleans
    .replace(/^\s*null|undefined\s*$/gm, '') // Remove lines with only null/undefined
    .replace(/^\s*\w+\s*:\s*$/gm, '') // Remove lines with only property names
    .replace(/^\s*\.\w+\s*$/gm, '') // Remove lines with only dot notation
    .replace(/^\s*\w+\(\)\s*$/gm, ''); // Remove lines with only function calls

  return cleaned.trim();
}

interface AgreementPreviewProps {
  agreement: BusinessAgreement;
}

const AgreementPreview: React.FC<AgreementPreviewProps> = ({ agreement }) => {
  return (
    <div className="flex-1 overflow-auto border border-slate-200 rounded-lg p-8 bg-white text-slate-800 font-serif agreement-preview">
      <div className="max-w-3xl mx-auto" id="agreement-document">
        {/* Agreement Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold uppercase mb-3 text-slate-900 tracking-tight">{agreement.title}</h1>
          <div className="text-base text-slate-600 border-t border-b border-slate-200 py-2 inline-block px-4">
            Between <span className="font-semibold">{agreement.partyA}</span> and <span className="font-semibold">{agreement.partyB}</span>
          </div>
        </div>

        {/* Agreement Content */}
        <div className="space-y-8">
          {agreement.sections.map((section: AgreementSection, index: number) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-bold mb-3 text-primary-700 border-b border-primary-100 pb-1">
                {index + 1}. {section.title}
              </h2>
              <div className="text-base leading-relaxed whitespace-pre-line text-slate-700">
                {cleanContent(section.content)}
              </div>
            </div>
          ))}
        </div>

        {/* Signature Block */}
        <div className="mt-16 pt-8 border-t border-slate-300">
          <h2 className="text-xl font-bold mb-8 text-center text-slate-800">SIGNATURES</h2>
          <div className="grid grid-cols-2 gap-12">
            <div className="border-r pr-6 border-slate-200">
              <p className="font-bold mb-6 text-slate-800">{agreement.partyA}</p>
              <div className="border-b-2 border-slate-400 h-12 mb-2"></div>
              <p className="text-sm font-medium text-slate-600">Authorized Signature</p>
              <div className="border-b-2 border-slate-400 h-10 mt-6 mb-2"></div>
              <p className="text-sm font-medium text-slate-600">Date</p>
              <div className="border-b-2 border-slate-400 h-10 mt-6 mb-2"></div>
              <p className="text-sm font-medium text-slate-600">Title/Position</p>
            </div>
            <div className="pl-6">
              <p className="font-bold mb-6 text-slate-800">{agreement.partyB}</p>
              <div className="border-b-2 border-slate-400 h-12 mb-2"></div>
              <p className="text-sm font-medium text-slate-600">Authorized Signature</p>
              <div className="border-b-2 border-slate-400 h-10 mt-6 mb-2"></div>
              <p className="text-sm font-medium text-slate-600">Date</p>
              <div className="border-b-2 border-slate-400 h-10 mt-6 mb-2"></div>
              <p className="text-sm font-medium text-slate-600">Title/Position</p>
            </div>
          </div>
        </div>
        
        {/* Document Footer */}
        <div className="mt-16 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>This document was generated on {new Date().toLocaleDateString()} using AI Pitch Deck Generator</p>
          <p className="mt-1">Page 1 of 1</p>
        </div>
      </div>

      {/* Print Styles - Only applied when printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        #agreement-document {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #1e293b;
        }
        
        #agreement-document h1 {
          font-family: 'Arial', sans-serif;
        }
        
        #agreement-document h2 {
          font-family: 'Arial', sans-serif;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .agreement-preview, .agreement-preview * {
            visibility: visible;
          }
          .agreement-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
          @page {
            size: A4;
            margin: 2cm;
          }
        }
      `}} />
    </div>
  );
};

export default AgreementPreview;
