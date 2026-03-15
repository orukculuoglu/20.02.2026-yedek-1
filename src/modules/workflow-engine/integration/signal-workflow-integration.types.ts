import { WorkflowType, WorkOrderType } from '../domain';
import { WorkflowRefs } from '../domain';
import { WorkflowRuntimeInput } from '../runtime/workflow-runtime.types';

/**
 * Input contract for Signal → Workflow integration.
 * Bridges signal engine outputs to workflow runtime pipeline.
 *
 * Contains:
 * - Signal metadata (signalId, signalType, signalCode, severity, confidence, triggeredAt)
 * - Workflow configuration (workflowId, workflowType, title, summary)
 * - Work order configuration (workOrderId, orderType, reason)
 * - Operational context (vehicleId, recommendationIds, refs, runtimeTimestamp)
 *
 * All fields are explicit: no hidden lookups or assumed inferences.
 * Signal fields remain traceable end-to-end.
 */
export interface SignalWorkflowIntegrationInput {
  // Signal metadata
  signalId: string;
  signalType: string;
  signalCode: string;
  severity: string;
  confidence: number;
  triggeredAt: number;
  summary: string;

  // Operational context
  vehicleId: string;
  recommendationIds: string[];

  // Workflow configuration
  workflowId: string;
  workflowType: WorkflowType;
  title?: string;

  // Work order configuration
  workOrderId: string;
  orderType: WorkOrderType;
  reason: string;

  // Runtime context
  runtimeTimestamp: number;
  refs: WorkflowRefs;
}

/**
 * Output contract for Signal → Workflow integration.
 * Provides mapped runtime input ready for workflow runtime execution.
 */
export interface SignalWorkflowIntegrationResult {
  runtimeInput: WorkflowRuntimeInput;
  normalizedRecommendationIds: string[];
}
