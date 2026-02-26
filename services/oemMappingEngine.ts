import type { OemCrossReference } from '../types/partMaster';

/**
 * OEM Mapping Engine
 * Deterministic mapping between OEM parts and aftermarket alternatives
 * No randomization - reproducible results
 */

const QUALITY_GRADE_PRIORITY = {
  'OEM': 0,
  'OES': 1,
  'AFTERMARKET_A': 2,
  'AFTERMARKET_B': 3,
};

/**
 * Get alternatives for an OEM part number
 * Primary: exact OEM match + brand match
 * Secondary: sorted by compatibility_score DESC, then quality_grade priority
 * 
 * @param oemPartNumber - e.g. "7701208177"
 * @param brand - e.g. "Renault"
 * @returns Sorted list of alternatives (OEM first, then OES, then AFTERMARKET_A, AFTERMARKET_B)
 */
export async function getAlternativesByOem(
  oemPartNumber: string,
  brand: string
): Promise<OemCrossReference[]> {
  try {
    // Load seed data
    const { MOCK_OEM_CROSS_REFERENCES } = await import('./oemCross.seed');
    
    // Find all references for this OEM + brand combo
    const matches = MOCK_OEM_CROSS_REFERENCES.filter(
      ref => 
        ref.oem_part_number.toLowerCase() === oemPartNumber.toLowerCase() &&
        ref.brand.toLowerCase() === brand.toLowerCase()
    );
    
    console.log(`[OemMapping] Found ${matches.length} alternatives for ${brand} ${oemPartNumber}`);
    
    if (matches.length === 0) {
      return [];
    }
    
    // Sort deterministically:
    // PRIMARY: quality_grade priority (OEM > OES > AFTERMARKET_A > AFTERMARKET_B)
    // SECONDARY: compatibility_score DESC
    // TERTIARY: created_at DESC (newest first within same grade/score)
    const sorted = matches.sort((a, b) => {
      const gradeDiff = QUALITY_GRADE_PRIORITY[a.quality_grade] - QUALITY_GRADE_PRIORITY[b.quality_grade];
      if (gradeDiff !== 0) return gradeDiff;
      
      const scoreDiff = b.compatibility_score - a.compatibility_score;
      if (scoreDiff !== 0) return scoreDiff;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log(`[OemMapping] Sorted ${sorted.length} alternatives by grade+score+date`);
    return sorted;
  } catch (error) {
    console.error('[OemMapping] Error loading seed data', error);
    return [];
  }
}

/**
 * Get all OEM + aftermarket data (admin/debug)
 */
export async function getAllOemMappings(): Promise<OemCrossReference[]> {
  try {
    const { MOCK_OEM_CROSS_REFERENCES } = await import('./oemCross.seed');
    return MOCK_OEM_CROSS_REFERENCES;
  } catch (error) {
    console.error('[OemMapping] Error loading all mappings', error);
    return [];
  }
}

/**
 * Search OEM by part_master_id
 * Used by UI: given a part, find its OEM number(s)
 */
export async function getOemByPartMasterId(
  partMasterId: string
): Promise<OemCrossReference[]> {
  try {
    const { MOCK_OEM_CROSS_REFERENCES } = await import('./oemCross.seed');
    
    const matches = MOCK_OEM_CROSS_REFERENCES.filter(
      ref => ref.part_master_id === partMasterId
    );
    
    console.log(`[OemMapping] Found ${matches.length} OEM entries for part=${partMasterId}`);
    return matches;
  } catch (error) {
    console.error('[OemMapping] Error searching by part_master_id', error);
    return [];
  }
}
