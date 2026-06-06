/**
 * Fleet Batch Normalization Runner Input
 * 
 * Defines the runtime input structure for batch normalization processing.
 * 
 * The runner transforms an array of external fleet vehicle records into
 * safe normalized internal records with caller-provided contextual information.
 */

import { ExternalFleetVehicleRecord } from '../contracts';

/**
 * FleetBatchNormalizationRuntimeInput
 * 
 * Complete runtime input for the batch normalization runner.
 * 
 * Determinism principles:
 * - normalizedRecordIds are caller-provided
 * - normalizedAt is caller-provided (ISO 8601 string)
 * - tenantId is caller-provided
 * - No internal generation of IDs or timestamps
 * - Batch runner is pure transformation only
 */
export interface FleetBatchNormalizationRuntimeInput {
  /**
   * Array of external fleet vehicle records from connector.
   * 
   * Contains raw operational data from external system.
   * Batch runner will not mutate this array or records.
   * 
   * May be empty.
   */
  externalRecords: ExternalFleetVehicleRecord[];

  /**
   * Pre-allocated unique IDs for normalized records, in order.
   * 
   * Provided by caller to maintain determinism.
   * Used as-is in returned FleetNormalizedVehicleRecord for each record.
   * 
   * Each element must be non-empty string, or record will be rejected.
   */
  normalizedRecordIds: string[];

  /**
   * Tenant identifier for the normalized records.
   * 
   * Provided by caller to maintain multi-tenancy context.
   * Applied to all normalized records.
   * 
   * Must be non-empty string, or entire batch is rejected.
   */
  tenantId: string;

  /**
   * Optional fleet identifier for context.
   * 
   * If provided, included in normalized records for fleet grouping.
   * If not provided, normalized records will have undefined fleetId.
   */
  fleetId?: string;

  /**
   * When these normalizations are performed.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller.
   * Applied to all normalized records.
   * 
   * Must be non-empty string, or entire batch is rejected.
   */
  normalizedAt: string;
}
