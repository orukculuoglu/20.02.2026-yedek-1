/**
 * Data Engine - Indices Domain Engine
 * Converts vehicle data to machine-readable DataEngineIndex format
 * Domain: Risk scoring and trust metrics
 *
 * Primary source: VIO (VehicleIntelligenceOutput) for explainability
 * Fallback source: VehicleAggregate for numeric-only indices
 */

import type { VehicleAggregate } from '../vehicle-intelligence/types';
import type { VehicleIntelligenceOutput } from '../auto-expert/intelligence/vioTypes';

/**
 * DataEngineDomain: Classification of data domains
 * - "part": Parts ecosystem indices
 * - "risk": Risk and trust indices
 * - "insurance": Insurance domain indices
 */
export type DataEngineDomain = 'part' | 'risk' | 'insurance';

/**
 * DataEngineIndex: Machine-readable index format for external consumption
 * Standardized representation of calculated indices with confidence and metadata
 */
export interface DataEngineIndex {
  domain: DataEngineDomain;
  key: string;
  value: number;
  confidence: number;
  updatedAt: string;
  meta?: Record<string, any>;
}

/**
 * Normalize reason codes: consolidate duplicates into canonical forms
 * Example: INSURANCE_DAMAGE_MISMATCH + INSURANCE_CLAIM_MISMATCH → INSURANCE_DAMAGE_INCONSISTENCY
 * Removes redundant signals to reduce noise and improve clarity
 *
 * @param reasonCodes - Original reason codes from VIO
 * @returns Normalized reason codes (de-duplicated, canonical)
 */
function normalizeReasonCodes(reasonCodes?: string[]): string[] | undefined {
  if (!reasonCodes || reasonCodes.length === 0) return reasonCodes;

  const codeSet = new Set(reasonCodes);
  
  // Rule 1: Insurance damage inconsistency consolidation
  // If any insurance-damage mismatch codes present, use canonical form
  const hasInsuranceDamageCodes = [
    'INSURANCE_DAMAGE_MISMATCH',
    'INSURANCE_CLAIM_MISMATCH',
    'INSURANCE_DAMAGE_INCONSISTENCY'
  ].some(code => codeSet.has(code));

  if (hasInsuranceDamageCodes) {
    // Remove variant forms, keep only canonical
    codeSet.delete('INSURANCE_DAMAGE_MISMATCH');
    codeSet.delete('INSURANCE_CLAIM_MISMATCH');
    codeSet.add('INSURANCE_DAMAGE_INCONSISTENCY');
  }

  return codeSet.size > 0 ? Array.from(codeSet) : undefined;
}

/**
 * Build risk domain indices from VIO (primary source with explainability)
 * Uses VIO indexes which include reasonCodes, confidence, and evidence sources
 * Applies normalization to reduce reason code duplication
 *
 * @param vio - Vehicle Intelligence Output with full explainability data
 * @returns Array of DataEngineIndex objects for risk domain with metadata
 */
export function buildRiskDomainIndicesFromVIO(
  vio: VehicleIntelligenceOutput
): DataEngineIndex[] {
  const indices: DataEngineIndex[] = [];

  // Map each VIO index to DataEngineIndex format
  vio.indexes.forEach((idx) => {
    const meta: Record<string, any> = {};

    // Include confidence reason if available
    if (idx.meta?.confidenceReason) {
      meta.confidenceReason = idx.meta.confidenceReason;
    }

    // Include normalized reason codes if available
    if (idx.meta?.reasonCodes) {
      const normalized = normalizeReasonCodes(idx.meta.reasonCodes);
      if (normalized) {
        meta.reasonCodes = normalized;
      }
    }

    // Include evidence sources if available
    if (idx.evidenceSources) {
      meta.evidenceSources = idx.evidenceSources;
    }

    indices.push({
      domain: 'risk',
      key: idx.key,
      value: idx.value,
      confidence: idx.confidence ?? 50,
      updatedAt: vio.generatedAt,
      ...(Object.keys(meta).length > 0 && { meta }),
    });
  });

  return indices;
}

/**
 * Build risk domain indices from VehicleAggregate (fallback/numeric only)
 * Returns numeric indices without metadata (aggregate doesn't reliably carry reason codes)
 * Maps core indices: trustIndex, reliabilityIndex, maintenanceDiscipline
 *
 * @param aggregate - Vehicle intelligence aggregate with calculated indices
 * @returns Array of DataEngineIndex objects for risk domain (numeric values only)
 */
export function buildRiskDomainIndices(
  aggregate: VehicleAggregate
): DataEngineIndex[] {
  const indices: DataEngineIndex[] = [];

  // trustIndex
  indices.push({
    domain: 'risk',
    key: 'trustIndex',
    value: aggregate.indexes.trustIndex,
    confidence: 50,
    updatedAt: aggregate.timestamp,
  });

  // reliabilityIndex
  indices.push({
    domain: 'risk',
    key: 'reliabilityIndex',
    value: aggregate.indexes.reliabilityIndex,
    confidence: 50,
    updatedAt: aggregate.timestamp,
  });

  // maintenanceDiscipline
  indices.push({
    domain: 'risk',
    key: 'maintenanceDiscipline',
    value: aggregate.indexes.maintenanceDiscipline,
    confidence: 50,
    updatedAt: aggregate.timestamp,
  });

  return indices;
}

