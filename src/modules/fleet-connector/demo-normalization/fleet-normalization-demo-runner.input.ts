/**
 * Fleet Normalization Demo Runner Input
 * 
 * Defines the runtime input structure for demo normalization processing.
 * 
 * The demo runner transforms mock external fleet records into normalized
 * data with caller-provided contextual information.
 */

/**
 * FleetNormalizationDemoRuntimeInput
 * 
 * Complete runtime input for the demo normalization runner.
 * 
 * Determinism principles:
 * - normalizedRecordIds are caller-provided
 * - normalizedAt is caller-provided (ISO 8601 string)
 * - tenantId is caller-provided
 * - No internal generation of IDs or timestamps
 * - Demo runner is pure composition only
 */
export interface FleetNormalizationDemoRuntimeInput {
  /**
   * Pre-allocated unique IDs for normalized records, in order.
   * 
   * Provided by caller to maintain determinism.
   * Used as-is for each corresponding mock record.
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
