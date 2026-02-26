import type { OemCatalogItem, OemAftermarketMap, AftermarketCandidate, PartMasterPart, Brand } from '../types/partMaster';
import * as crypto from 'crypto';

/**
 * OEM Master Engine
 * 
 * Handles:
 * - Normalization of OEM part numbers (cleanup, standardization)
 * - Generation of canonical, deterministic SKUs
 * - PartMasterPart creation from raw OEM catalog items
 * - Aftermarket candidate detection (similarity + crossRef database)
 * - OEM↔Aftermarket mapping and confidence scoring
 * 
 * Discipline:
 * - PartMasterId = PM-XXXX (eternal, canonical identifier)
 * - SKU = display/search only, never used in API logic
 * - mapping_status starts as "AUTO" or "REVIEW" based on confidence
 */

// ============================================
// 1. NORMALIZATION
// ============================================

/**
 * Normalize OEM part number:
 * - Remove spaces, dashes, dots, slashes
 * - Uppercase
 * - Trim
 * 
 * Examples:
 * "34 11 6 789 123" → "34116789123"
 * "BMW-34-11-6-789-123" → "34116789123"
 * "34.11.6.789/123" → "34116789123"
 */
export function normalizeOemPartNumber(partNumber: string): string {
  if (!partNumber) return '';
  return partNumber
    .toUpperCase()
    .replace(/[\s\-./]/g, '')  // Remove spaces, dashes, dots, slashes
    .trim();
}

/**
 * Generate canonical SKU deterministically
 * Format: {CATEGORY_PREFIX}-{SEQUENCE}
 * 
 * Examples:
 * "BRAKE_PAD_FRONT_001"
 * "OIL_FILTER_001"
 * "CLUTCH_KIT_001"
 * 
 * Deterministic: Same inputs always produce same output
 */
export function generateCanonicalSku(input: {
  category: string;
  name: string;
  oem_brand?: string;
}): string {
  // Category to prefix mapping
  const categoryPrefixes: Record<string, string> = {
    'BRAKE_SYSTEM': 'BRAKE',
    'FILTERS': 'FILTER',
    'IGNITION': 'SPARK',
    'SUSPENSION': 'SUSPENSION',
    'CLUTCH': 'CLUTCH',
    'TRANSMISSION': 'TRANSMISSION',
    'ENGINE': 'ENGINE',
    'COOLING': 'COOLING',
    'ELECTRICAL': 'ELEC',
    'FUEL': 'FUEL',
    'EXHAUST': 'EXHAUST',
  };

  const prefix = categoryPrefixes[input.category] || input.category.substring(0, 3).toUpperCase();
  
  // Name-based suffix: take first meaningful word, clean it
  const namePart = input.name
    .split(' ')
    .filter(w => w.length > 2 && !/^(and|the|for|from|with|by|to)$/i.test(w))
    .map(w => w.substring(0, 4).toUpperCase())
    .join('_');

  // Generate deterministic number from hash
  const hashInput = `${input.category}|${input.name}|${input.oem_brand || ''}`;
  const hash = crypto.createHash('md5').update(hashInput).digest('hex');
  const sequenceNum = parseInt(hash.substring(0, 3), 16) % 1000;
  const sequence = String(sequenceNum + 1).padStart(3, '0');

  return `${prefix}${namePart ? '_' + namePart : ''}_${sequence}`;
}

/**
 * Create canonical hash for deduplication
 * Based on normalized OEM brand + part number
 * Used to prevent duplicate ingestion of same OEM part
 */
export function createCanonicalHash(oem_brand: string, oem_part_number: string): string {
  const normalized = `${oem_brand.toUpperCase()}|${normalizeOemPartNumber(oem_part_number)}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// ============================================
// 2. PARTMASTER CREATION
// ============================================

/**
 * Build PartMasterPart from OEM catalog item
 * This is the primary ingestion path for canonical part master
 */
export function buildPartMasterFromOem(
  item: OemCatalogItem,
  sequenceNumber: number = 1
): PartMasterPart {
  // Generate canonical identifiers
  const canonicalHash = createCanonicalHash(item.oem_brand, item.oem_part_number);
  const partMasterId = `PM-${String(sequenceNumber).padStart(5, '0')}`;
  const sku = generateCanonicalSku({
    category: item.category,
    name: item.part_name,
    oem_brand: item.oem_brand,
  });

  // Build fitments
  const fitments = item.vehicle_fitment?.map((fit, idx) => ({
    fitmentId: `FIT-${partMasterId}-${idx}`,
    partId: partMasterId,
    vehiclePlatform: `${fit.make}_${fit.model}_${fit.year_from}_${fit.year_to}`,
    applicableModels: [fit.model],
    engineTypes: fit.engine ? [fit.engine] : undefined,
    notes: fit.transmission ? `Transmission: ${fit.transmission}` : undefined,
  })) || [];

  // Build the PartMasterPart
  const partMaster: PartMasterPart = {
    partMasterId,
    tenantId: 'LENT-CORP-DEMO',
    
    // Identification
    sku,
    name: item.part_name,
    description: `${item.oem_brand} OEM Part: ${item.oem_part_number}`,
    
    // Taxonomy
    category: item.category as any,
    partGroup: mapCategoryToGroup(item.category),
    
    // Quality & Brand
    qualityTier: 'OEM',
    quality_default: 'OEM',
    brand: {
      brandId: `BRAND-${item.oem_brand.toUpperCase().substring(0, 3)}`,
      name: item.oem_brand,
      tier: 'OEM',
      reliability: 100,
    },
    
    // Cross-references
    oemRefs: [
      {
        refId: `OEM-${canonicalHash.substring(0, 12)}`,
        oemCode: item.oem_part_number,
        brand: item.oem_brand,
        confidence: 100,
      },
    ],
    aftermarketRefs: [],  // Will be populated by mapping engine
    
    // Fitments from item
    fitments,
    
    // Physical metadata
    unit: 'adet',
    packSize: 1,
    weight: item.attributes?.weight ? parseFloat(item.attributes.weight) : undefined,
    
    // OEM source tracking
    oem_source: {
      brand: item.oem_brand,
      part_number: item.oem_part_number,
      catalog_date: item.last_updated,
    },
    canonical_hash: canonicalHash,
    mapping_status: 'REVIEW',  // Default: needs human review
    
    // Audit trail
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'OEM_ENGINE',
    dataQuality: 90,  // High quality - comes from official OEM catalog
  };

  return partMaster;
}

// ============================================
// 3. AFTERMARKET DETECTION
// ============================================

/**
 * Detect aftermarket candidates using:
 * 1. Cross-reference database (fastest, highest confidence)
 * 2. Attribute similarity (measurement, diameter, capacity, etc.)
 * 3. Name similarity (fuzzy match)
 */
export async function detectAftermarketCandidates(
  oemItem: OemCatalogItem,
  crossRefMap?: Map<string, Array<{ brand: string; pn: string; quality: string }>>
): Promise<AftermarketCandidate[]> {
  const candidates: AftermarketCandidate[] = [];
  
  const normalizedOemPn = normalizeOemPartNumber(oemItem.oem_part_number);

  // 1. Try crossRef database first (highest confidence)
  if (crossRefMap?.has(normalizedOemPn)) {
    const crossRefs = crossRefMap.get(normalizedOemPn)!;
    
    for (const ref of crossRefs) {
      candidates.push({
        candidate_id: `CAND-${crypto.randomUUID().substring(0, 8)}`,
        brand: ref.brand,
        aftermarket_part_number: ref.pn,
        quality_grade: ref.quality as any,
        confidence: 95,  // CrossRef is highly reliable
        evidence: ['crossref_database_match'],
      });
    }
  }

  // 2. If insufficient candidates, generate based on attributes
  if (candidates.length < 2 && oemItem.attributes) {
    // This is mock generation; in production would call proper engines
    const similarCandidates = generateSimilarCandidates(oemItem);
    candidates.push(...similarCandidates);
  }

  // Sort by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);

  return candidates;
}

/**
 * Generate candidate suggestions based on part attributes
 * Mock implementation: in production would use sophisticated ML/similarity matching
 */
function generateSimilarCandidates(oemItem: OemCatalogItem): AftermarketCandidate[] {
  // This is simplified; real implementation would:
  // - Measure similarity between OEM attributes and known aftermarket parts
  // - Use fuzzy name matching
  // - Check dimension databases
  
  const candidates: AftermarketCandidate[] = [];
  
  // Only generate suggestions if we have enough attribute data
  if (!oemItem.attributes || Object.keys(oemItem.attributes).length === 0) {
    return candidates;
  }

  // Mock suggestion: create one generic aftermarket candidate
  // In production, would be database of thousands of parts
  candidates.push({
    candidate_id: `CAND-${crypto.randomUUID().substring(0, 8)}`,
    brand: 'Generic Aftermarket',
    aftermarket_part_number: `AM-${normalizeOemPartNumber(oemItem.oem_part_number).substring(0, 10)}`,
    quality_grade: 'AFTERMARKET_A',
    confidence: 65,
    evidence: ['attribute_similarity'],
  });

  return candidates;
}

// ============================================
// 4. MAPPING & APPROVAL WORKFLOW
// ============================================

/**
 * Build OEM↔Aftermarket mapping
 * Status determination:
 * - confidence >= 90: AUTO (bypass review)
 * - 70-89: REVIEW (human sign-off needed)
 * - < 70: REVIEW (always needs review)
 */
export function buildOemAftermarketMap(
  oemItem: OemCatalogItem,
  partMaster: PartMasterPart,
  candidates: AftermarketCandidate[],
  confidenceThreshold: number = 70
): OemAftermarketMap {
  const hasHighConfidenceMatches = candidates.some(c => c.confidence >= 90);
  const hasValidMatches = candidates.some(c => c.confidence >= confidenceThreshold);

  // Determine status: AUTO only if high confidence AND matches found
  let status: 'AUTO' | 'REVIEW' = hasHighConfidenceMatches && hasValidMatches ? 'AUTO' : 'REVIEW';
  let reason: string | undefined = undefined;

  if (status === 'REVIEW') {
    if (!hasValidMatches) {
      reason = `No matches found with confidence >= ${confidenceThreshold}`;
    } else if (!hasHighConfidenceMatches) {
      reason = 'Candidates have medium confidence, require human review';
    }
  }

  const map: OemAftermarketMap = {
    map_id: `MAP-${crypto.randomUUID().substring(0, 12)}`,
    oem_part_number: oemItem.oem_part_number,
    oem_brand: oemItem.oem_brand,
    canonical_part_master_id: partMaster.partMasterId,
    matches: candidates.filter(c => c.confidence >= confidenceThreshold),  // Only high-confidence matches
    status,
    reason,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    confidence_threshold: confidenceThreshold,
  };

  return map;
}

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

/**
 * Map category string to part group (taxonomy)
 */
function mapCategoryToGroup(category: string): string {
  const mapping: Record<string, string> = {
    'BRAKE_SYSTEM': 'Brake System',
    'FILTERS': 'Filters & Fluids',
    'IGNITION': 'Engine Management',
    'SUSPENSION': 'Suspension & Steering',
    'CLUTCH': 'Drivetrain',
    'TRANSMISSION': 'Drivetrain',
    'ENGINE': 'Engine & Components',
    'COOLING': 'Cooling System',
    'ELECTRICAL': 'Electrical & Lighting',
    'FUEL': 'Fuel System',
    'EXHAUST': 'Exhaust System',
  };

  return mapping[category] || category;
}

/**
 * Build crossRef map from data sources
 * Input format: Array of { oem_pn: string, brand: string, pn: string, quality: string }
 * Output: Map<normalized_oem_pn, [{ brand, pn, quality }]>
 */
export function buildCrossRefMap(
  crossRefData: Array<{ oem_pn: string; brand: string; pn: string; quality: string }>
): Map<string, Array<{ brand: string; pn: string; quality: string }>> {
  const map = new Map();

  for (const ref of crossRefData) {
    const key = normalizeOemPartNumber(ref.oem_pn);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push({
      brand: ref.brand,
      pn: ref.pn,
      quality: ref.quality,
    });
  }

  return map;
}

// ============================================
// 6. BATCH INGESTION
// ============================================

/**
 * Batch ingest OEM catalog items
 * Returns: { created: PartMasterPart[], maps: OemAftermarketMap[] }
 */
export async function batchIngestOemCatalog(
  items: OemCatalogItem[],
  crossRefMap?: Map<string, Array<{ brand: string; pn: string; quality: string }>>
): Promise<{
  partMasters: PartMasterPart[];
  maps: OemAftermarketMap[];
  stats: { created: number; mapped: number; errors: number };
}> {
  const partMasters: PartMasterPart[] = [];
  const maps: OemAftermarketMap[] = [];
  let errorCount = 0;

  for (let idx = 0; idx < items.length; idx++) {
    try {
      const item = items[idx];
      
      // Create PartMasterPart
      const partMaster = buildPartMasterFromOem(item, 1000 + idx);
      partMasters.push(partMaster);

      // Detect aftermarket candidates
      const candidates = await detectAftermarketCandidates(item, crossRefMap);

      // Build mapping
      if (candidates.length > 0) {
        const map = buildOemAftermarketMap(item, partMaster, candidates);
        maps.push(map);
        
        // Update partMaster with mapping info
        partMaster.mapping_id = map.map_id;
        partMaster.mapping_status = map.status;
      }
    } catch (error) {
      console.error(`[OemMasterEngine] Error ingesting item ${idx}:`, error);
      errorCount++;
    }
  }

  return {
    partMasters,
    maps,
    stats: {
      created: partMasters.length,
      mapped: maps.length,
      errors: errorCount,
    },
  };
}
