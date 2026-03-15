import { WorkflowRuntimeResult } from '../runtime/workflow-runtime.types';
import { WorkflowLogSnapshot } from './workflow-log.types';

/**
 * Build a deterministic log snapshot from workflow runtime result.
 *
 * Maps runtime result fields directly to log snapshot.
 * Preserves recommendationIds ordering exactly as runtime provides.
 * No internal timestamps or side effects.
 *
 * @param runtimeResult - Complete workflow runtime execution result
 * @returns WorkflowLogSnapshot with all audit data
 *
 * Guarantees:
 * - Deterministic mapping from runtime result
 * - All fields derived from actual result data
 * - RecommendationIds order preserved exactly
 * - No mutations or side effects
 */
export function buildWorkflowLogSnapshot(runtimeResult: WorkflowRuntimeResult): WorkflowLogSnapshot {
  return {
    workflowId: runtimeResult.workflow.workflowId,
    workOrderId: runtimeResult.workOrder.workOrderId,
    vehicleId: runtimeResult.workflow.vehicleId,
    workflowType: runtimeResult.workflow.workflowType,
    orderType: runtimeResult.workOrder.orderType,
    priority: runtimeResult.workflow.priority,
    recommendationIds: runtimeResult.recommendationIds,
    createdAt: runtimeResult.workflow.createdAt,
    refs: runtimeResult.workflow.refs,
  };
}
