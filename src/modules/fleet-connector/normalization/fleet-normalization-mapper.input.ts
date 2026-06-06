/**
 * Fleet Normalization Mapper Runtime Input
 * 
 * Defines the runtime input structure for the normalization mapper.
 * 
 * The mapper transforms external fleet vehicle records into safe normalized
 * internal records with caller-provided contextual information.
 */

import { ExternalFleetVehicleRecord } from '../contracts';

/**
 * FleetNormalizationMapperRuntimeInput
 * 
 * Complete runtime input for the normalization mapper.
 * 
 * Determinism principles:
 * - normalizedRecordId is caller-provided
 * - normalizedAt is caller-provided (ISO 8601 string)
 * - tenantId is caller-provided
 * - No internal generation of IDs or timestamps
 * - Mapper is pure transformation only
 */
export interface FleetNormalizationMapperRuntimeInput {
  /**
   * The external fleet vehicle record from connector.
   * 
   * Contains raw operational data from external system.
   * Mapper will not mutate this object.
   */
  externalRecord: ExternalFleetVehicleRecord;
  
  /**
   * Pre-allocated unique ID for the normalized record.
   * 
   * Provided by caller to maintain determinism.
   * Used as-is in returned FleetNormalizedVehicleRecord.
   * 
   * Must be non-empty string.
   */
  normalizedRecordId: string;
  
  /**
   * Tenant identifier for the normalized record.
   * 
   * Provided by caller to maintain multi-tenancy context.
   * 
   * Must be non-empty string.
   */
  tenantId: string;
  
  /**
   * Optional fleet identifier for context.
   * 
   * If provided, included in normalized record for fleet grouping.
   * If not provided, normalized record will have undefined fleetId.
   */
  fleetId?: string;
  
  /**
   * When this normalization was performed.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller.
   * 
   * Must be non-empty string.
   */
  normalizedAt: string;
}
