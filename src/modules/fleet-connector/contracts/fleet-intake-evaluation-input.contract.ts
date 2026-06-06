/**
 * Fleet Intake Evaluation Input Contract
 * 
 * Defines the contract for evaluation input data.
 * 
 * Represents a normalized fleet record that has passed normalization
 * and is ready for evaluation to determine usability for Fleet Rental
 * intelligence, readiness, service routing, and outcome tracking.
 * 
 * Evaluation input is immutable once created and serves as the
 * reference point for all evaluation findings, signals, and candidates.
 * 
 * Contract-only: contains no runtime evaluation logic.
 */

import { FleetNormalizedVehicleRecord } from './fleet-normalized-vehicle.contract';

/**
 * FleetIntakeEvaluationSource
 * 
 * Origin of the evaluation input.
 * Indicates how the normalized record reached the evaluation layer.
 */
export enum FleetIntakeEvaluationSource {
  /** Record from active connector sync operation */
  CONNECTOR_SYNC = 'connector-sync',
  
  /** Record from scheduled/batch import */
  SCHEDULED_IMPORT = 'scheduled-import',
  
  /** Record from webhook/real-time intake */
  WEBHOOK_INTAKE = 'webhook-intake',
  
  /** Record from manual review/override */
  MANUAL_REVIEW = 'manual-review',
  
  /** Record from normalization result */
  NORMALIZATION_RESULT = 'normalization-result',
}

/**
 * FleetIntakeEvaluationInput
 * 
 * Container for a normalized record ready for evaluation.
 * 
 * Safety principles:
 * - No direct sensitive vehicle identity fields
 * - No raw external data storage
 * - No runtime-generated timestamps
 * - All timestamps caller-provided (ISO 8601 strings)
 * - Reference only through safe normalized record
 */
export interface FleetIntakeEvaluationInput {
  /** Unique identifier for this evaluation input */
  evaluationInputId: string;
  
  /** Connector that sourced this record */
  connectorId: string;
  
  /** Tenant context */
  tenantId: string;
  
  /** Fleet context (optional - may not exist in all evaluation flows) */
  fleetId?: string;
  
  /** Normalized vehicle record for evaluation */
  normalizedRecord: FleetNormalizedVehicleRecord;
  
  /** Origin of this evaluation input */
  source: FleetIntakeEvaluationSource;
  
  /**
   * When this evaluation input was received.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller at input creation time.
   * Used for chronological tracking and audit.
   */
  receivedAt: string;
}
