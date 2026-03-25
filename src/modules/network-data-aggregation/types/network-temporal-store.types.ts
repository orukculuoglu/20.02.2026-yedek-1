/**
 * MOTOR 3 — PHASE 53: V2 TEMPORAL STORAGE / AUDIT CONTRACT
 * Deterministic Storage and Audit Contracts for Motor 3 V2 Temporal Pipeline
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No storage implementation
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define immutable contracts for storing and auditing temporal pipeline records.
 * Ensures deterministic storage and audit query structure throughout the system.
 */

// ============================================================================
// STORED TEMPORAL PIPELINE RECORD
// ============================================================================

/**
 * Stored temporal pipeline record representing a complete temporal pipeline execution.
 * Immutable record containing all critical IDs and storage timestamp.
 *
 * Fields:
 * - recordId: Unique identifier for the stored record (deterministic string)
 * - windowId: Identifier from temporal window aggregation
 * - temporalPressureId: Identifier from temporal pressure derivation
 * - bridgeId: Identifier from temporal pressure bridge mapping
 * - storedAt: Timestamp string when record was persisted
 */
export interface StoredTemporalPipelineRecord {
  readonly recordId: string;
  readonly windowId: string;
  readonly temporalPressureId: string;
  readonly bridgeId: string;
  readonly storedAt: string;
}

// ============================================================================
// TEMPORAL PIPELINE STORE WRITE INPUT
// ============================================================================

/**
 * Input contract for writing temporal pipeline record to storage.
 * Contains critical IDs extracted from pipeline execution and storage timestamp.
 *
 * Fields:
 * - windowId: Identifier from temporal window aggregation
 * - temporalPressureId: Identifier from temporal pressure derivation
 * - bridgeId: Identifier from temporal pressure bridge mapping
 * - storedAt: Timestamp string for persistence
 */
export interface TemporalPipelineStoreWriteInput {
  readonly windowId: string;
  readonly temporalPressureId: string;
  readonly bridgeId: string;
  readonly storedAt: string;
}

// ============================================================================
// TEMPORAL PIPELINE STORE WRITE RESULT
// ============================================================================

/**
 * Result contract for temporal pipeline storage write operation.
 * Contains the complete stored record with generated record ID.
 *
 * Fields:
 * - record: StoredTemporalPipelineRecord containing all persisted data
 */
export interface TemporalPipelineStoreWriteResult {
  readonly record: StoredTemporalPipelineRecord;
}

// ============================================================================
// TEMPORAL PIPELINE AUDIT QUERY
// ============================================================================

/**
 * Query contract for auditing temporal pipeline records.
 * Specifies which temporal pipeline record to retrieve by window identifier.
 *
 * Fields:
 * - windowId: Window identifier to query stored records
 */
export interface TemporalPipelineAuditQuery {
  readonly windowId: string;
}

// ============================================================================
// TEMPORAL PIPELINE AUDIT RESULT
// ============================================================================

/**
 * Result contract for temporal pipeline audit query.
 * Contains the stored record matching the audit query criteria.
 *
 * Fields:
 * - record: StoredTemporalPipelineRecord retrieved from storage
 */
export interface TemporalPipelineAuditResult {
  readonly record: StoredTemporalPipelineRecord;
}
