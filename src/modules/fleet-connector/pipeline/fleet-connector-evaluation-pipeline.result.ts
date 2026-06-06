/**
 * Fleet Connector Evaluation Pipeline Result
 * 
 * Defines the result structure from evaluation pipeline transformation.
 * 
 * The pipeline returns both the evaluation result and the routing orchestration
 * result together, with a high-level status indicating the overall outcome.
 */

import { FleetIntakeEvaluationResult } from '../contracts';
import type { FleetRoutingOrchestratorResult } from '../routing-orchestration';

/**
 * FleetConnectorEvaluationPipelineStatus
 * 
 * High-level outcome status of the complete pipeline.
 */
export enum FleetConnectorEvaluationPipelineStatus {
  /** Evaluation rejected or quarantined - pipeline failed */
  FAILED = 'failed',
  
  /** Evaluation succeeded but no routing candidates - pipeline completed without routing */
  EVALUATED_WITHOUT_ROUTING = 'evaluated-without-routing',
  
  /** Evaluation and routing completed with some routing rejections */
  COMPLETED_WITH_ROUTING_REJECTIONS = 'completed-with-routing-rejections',
  
  /** Evaluation and routing completed successfully */
  COMPLETED = 'completed',
}

/**
 * FleetConnectorEvaluationPipelineResult
 * 
 * Complete result from evaluation pipeline transformation.
 * 
 * Contains both evaluation result and routing orchestration result
 * for complete visibility into the pipeline execution.
 * 
 * Safety principles:
 * - No free-text message fields
 * - No raw data fields
 * - No external update fields
 * - All information in enum statuses and structured results
 */
export interface FleetConnectorEvaluationPipelineResult {
  /** High-level outcome status of the complete pipeline */
  status: FleetConnectorEvaluationPipelineStatus;
  
  /**
   * Complete evaluation result from intake evaluator.
   * 
   * Contains data quality findings, readiness signals, service routing
   * candidates, and evaluation status.
   */
  evaluationResult: FleetIntakeEvaluationResult;
  
  /**
   * Complete routing orchestration result.
   * 
   * Contains promoted routing requests and bridge transformation results
   * for all service routing candidates.
   */
  routingResult: FleetRoutingOrchestratorResult;
}
