/**
 * Agreement Storage Service
 * 
 * Provides functionality to save, retrieve, and manage business agreements
 * in local storage. This could be replaced with API calls to a backend in the future.
 */
import { v4 as uuidv4 } from 'uuid';
import { BusinessAgreement } from '../types';

const STORAGE_KEY = 'saved_agreements';

/**
 * Save a business agreement to storage
 * @param agreement The agreement to save
 * @returns The saved agreement with an ID
 */
export const saveAgreement = async (agreement: BusinessAgreement): Promise<BusinessAgreement> => {
  try {
    // Get existing agreements
    const existingAgreements = await getSavedAgreements();
    
    // Create a new agreement with ID if it doesn't have one
    const agreementToSave: BusinessAgreement = {
      ...agreement,
      id: agreement.id || uuidv4(),
      createdAt: agreement.createdAt || new Date().toISOString()
    };
    
    // If the agreement already exists, update it
    const updatedAgreements = agreement.id 
      ? existingAgreements.map(a => a.id === agreement.id ? agreementToSave : a)
      : [...existingAgreements, agreementToSave];
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgreements));
    
    return agreementToSave;
  } catch (error) {
    console.error('Error saving agreement:', error);
    throw new Error('Failed to save agreement');
  }
};

/**
 * Get all saved agreements
 * @returns Array of saved business agreements
 */
export const getSavedAgreements = async (): Promise<BusinessAgreement[]> => {
  try {
    const savedAgreements = localStorage.getItem(STORAGE_KEY);
    return savedAgreements ? JSON.parse(savedAgreements) : [];
  } catch (error) {
    console.error('Error retrieving agreements:', error);
    return [];
  }
};

/**
 * Get a specific agreement by ID
 * @param id The ID of the agreement to retrieve
 * @returns The agreement if found, null otherwise
 */
export const getSavedAgreementById = async (id: string): Promise<BusinessAgreement | null> => {
  try {
    const agreements = await getSavedAgreements();
    return agreements.find(agreement => agreement.id === id) || null;
  } catch (error) {
    console.error('Error retrieving agreement:', error);
    return null;
  }
};

/**
 * Delete a saved agreement
 * @param id The ID of the agreement to delete
 * @returns True if successful, false otherwise
 */
export const deleteSavedAgreement = async (id: string): Promise<boolean> => {
  try {
    const agreements = await getSavedAgreements();
    const filteredAgreements = agreements.filter(agreement => agreement.id !== id);
    
    if (filteredAgreements.length === agreements.length) {
      // No agreement was removed
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAgreements));
    return true;
  } catch (error) {
    console.error('Error deleting agreement:', error);
    throw new Error('Failed to delete agreement');
  }
};

export default {
  saveAgreement,
  getSavedAgreements,
  getSavedAgreementById,
  deleteSavedAgreement
};
