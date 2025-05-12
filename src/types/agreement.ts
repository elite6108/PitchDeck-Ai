/**
 * Types for business agreement generation feature
 */

/**
 * Types of business agreements supported by the application
 */
export type AgreementType = 
  | 'NDA'           // Non-Disclosure Agreement
  | 'SERVICE'       // Service Agreement
  | 'EMPLOYMENT'    // Employment Contract
  | 'PARTNERSHIP'   // Partnership Agreement
  | 'SALES'         // Sales Contract
  | 'CONSULTING'    // Consulting Agreement
  | 'LICENSING';    // Licensing Agreement

/**
 * Section of a business agreement
 */
export interface AgreementSection {
  title: string;
  content: string;
}

/**
 * Business agreement document
 */
export interface BusinessAgreement {
  id?: string;  // Optional for new agreements, required for saved ones
  type: AgreementType;
  title: string;
  partyA: string;
  partyB: string;
  purpose: string;
  duration: string;
  governingLaw: string;
  createdAt: string;
  sections: AgreementSection[];
}
