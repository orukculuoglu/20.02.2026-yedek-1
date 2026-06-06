/**
 * Fleet Intake Evaluation Result Contract
 * 
 * Defines the contract for evaluation outcomes.
 * 
 * Represents the aggregate result of evaluating a normalized record.
 * Contains all findings, signals, and candidates produced by evaluation.
 * 
 * Evaluation result is:
 * - Status-classified (accepted, accepted-with-warnings, rejected, quarantined)
 * - Outcome-eligibility determined for internal tracking
 * - Complete audit trail of all evaluation decisions
 * - Read-only after creation
 * 
 * Contract-only: contains no runtime evaluation logic.
 */

import { FleetIntakeDataQualityFinding } from './fleet-intake-data-quality.contract';
import { FleetIntakeReadinessSignal } from './fleet-intake-readiness-signal.contract';
import { FleetIntakeServiceRoutingCandidate } from './fleet-intake-service-candidate.contract';

/**
 * FleetIntakeEvaluationStatus
 * 
 * Overall acceptance status of the evaluation result.
 * Determines if the normalized record can be used downstream.
 */
export enum FleetIntakeEvaluationStatus {
  /** Record accepted and safe for use */
  ACCEPTED = 'accepted',
  
  /** Record accepted but with non-critical issues */
  ACCEPTED_WITH_WARNINGS = 'accepted-with-warnings',
  
  /** Record rejected and not safe for use */
  REJECTED = 'rejected',
  
  /** Record quarantined pending manual review */
  QUARANTINED = 'quarantined',
}

/**
 * FleetIntakeOutcomeEligibility
 * 
 * Eligibility status for internal outcome tracking.
 * Determines if this record can be tracked through service outcome flows.
 */
export enum FleetIntakeOutcomeEligibility {
  /** Record is eligible for outcome tracking */
  ELIGIBLE = 'eligible',
  
  /** Record is not eligible for outcome tracking */
  NOT_ELIGIBLE = 'not-eligible',
  
  /** Record requires manual review before outcome tracking decision */
  REQUIRES_REVIEW = 'requires-review',
}

/**
 * FleetIntakeEvaluationResult
 * 
 * Complete evaluation result for a normalized record.
 * 
 * Safety principles:
 * - No raw data fields
 * - No direct sensitive vehicle identity fields
 * - No external update fields
 * - No external transformation or sync models
 * - All findings/signals/candidates are enum-based
 * - Timestamps are caller-provided
 * - Read-only after creation
 */
export interface FleetIntakeEvaluationResult {
  /** Unique identifier for this evaluation result */
  evaluationResultId: string;
  
  /** Evaluation input that was processed */
  evaluationInputId: string;
  
  /** Connector context */
  connectorId: string;
  
  /** Tenant context */
  tenantId: string;
  
  /** Fleet context (optional) */
  fleetId?: string;
  
  /** Overall acceptance status */
  status: FleetIntakeEvaluationStatus;
  
  /** Eligibility for internal outcome tracking */
  outcomeEligibility: FleetIntakeOutcomeEligibility;
  
  /**
   * Data quality findings from evaluation.
   * 
   * Enum-based issues detected during quality assessment.
   * No free-text messages.
   * Empty array if no findings detected.
   */
  dataQualityFindings: FleetIntakeDataQualityFinding[];
  
  /**
   * Readiness signals from evaluation.
   * 
   * Operational readiness assessments.
   * Empty array if no signals generated.
   */
  readinessSignals: FleetIntakeReadinessSignal[];
  
  /**
   * Service routing candidates from evaluation.
   * 
   * Potential service opportunities identified.
   * Important: These are CANDIDATES only, not actual routing requests.
   * Empty array if no candidates generated.
   */
  serviceRoutingCandidates: FleetIntakeServiceRoutingCandidate[];
  
  /**
   * When this evaluation result was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller at result creation time.
   */
  createdAt: string;
}
