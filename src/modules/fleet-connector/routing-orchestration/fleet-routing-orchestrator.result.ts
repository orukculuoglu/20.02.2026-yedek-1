/**
 * Fleet Routing Orchestrator Result
 * 
 * Defines the result structure from routing orchestrator transformation.
 * 
 * The orchestrator promotes zero or more service routing candidates into
 * actual routing requests, collecting both promoted requests and bridge
 * transformation results structurally for complete observability.
 */

import { FleetServiceRoutingRequest } from '../contracts';
import type { FleetRoutingBridgeResult } from '../routing-bridge';

/**
 * FleetRoutingOrchestratorStatus
 * 
 * High-level outcome status of the orchestration.
 */
export enum FleetRoutingOrchestratorStatus {
  /** No candidates present in evaluation result */
  NO_CANDIDATES = 'no-candidates',
  
  /** All candidates promoted successfully, no rejections */
  COMPLETED = 'completed',
  
  /** Some candidates promoted, but some bridge rejections occurred */
  COMPLETED_WITH_REJECTIONS = 'completed-with-rejections',
  
  /** No candidates promoted, at least one bridge rejection */
  FAILED = 'failed',
}

/**
 * FleetRoutingOrchestratorResult
 * 
 * Complete result from routing orchestrator transformation.
 * 
 * Contains all promoted requests and all bridge results for complete
 * observability. Status indicates high-level outcome.
 * 
 * Safety principles:
 * - No free-text message fields
 * - No raw data fields
 * - No external update fields
 * - All information in enum statuses and structured arrays
 */
export interface FleetRoutingOrchestratorResult {
  /** High-level outcome status */
  status: FleetRoutingOrchestratorStatus;
  
  /**
   * Successfully promoted routing requests.
   * 
   * Only includes requests where bridge result status was "promoted".
   * Empty if no candidates or all bridge rejections occurred.
   * Order matches order of candidates in evaluationResult.serviceRoutingCandidates.
   */
  requests: FleetServiceRoutingRequest[];
  
  /**
   * All bridge transformation results.
   * 
   * Includes promoted, rejected, and suppressed results for complete
   * observability. Order matches order of candidates in evaluationResult.
   * 
   * Retention of complete results enables full audit trail without
   * free-text message fields - all information is in enum statuses and
   * standardized reason codes.
   */
  bridgeResults: FleetRoutingBridgeResult[];
}
