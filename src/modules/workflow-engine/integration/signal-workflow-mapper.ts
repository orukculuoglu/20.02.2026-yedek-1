import { SignalWorkflowIntegrationInput, SignalWorkflowIntegrationResult } from './signal-workflow-integration.types';
import { WorkflowRuntimeInput } from '../runtime/workflow-runtime.types';
import { WorkflowEngineInput } from '../engine/workflow-engine.types';
import { WorkOrderEngineInput } from '../work-order-engine/work-order-engine.types';
import { linkRecommendations } from '../engine/workflow-recommendation-linker';
import { buildWorkOrderTitle } from '../work-order-engine/work-order-title-builder';

/**
 * Map Signal Engine output to Workflow Runtime input deterministically.
 *
 * This mapper:
 * - Normalizes recommendation IDs into stable deterministic array
 * - Maps signal summary to workflow summary
 * - Resolves workflow title (explicit or generated)
 * - Resolves work order title (explicit or generated)
 * - Builds complete WorkflowRuntimeInput contract
 * - Preserves signal traceability through refs
 *
 * @param input - Signal workflow integration input
 * @returns Mapped workflow runtime input with normalized recommendations
 *
 * Guarantees:
 * - No hidden lookups or inferences
 * - All fields explicitly mapped from input
 * - Timestamps explicit from input
 * - Deterministic title generation
 * - Pure function, no side effects
 */
export function mapSignalToWorkflowRuntime(
  input: SignalWorkflowIntegrationInput,
): SignalWorkflowIntegrationResult {
  // 1. Normalize recommendation IDs (deduplicate, preserve order)
  const normalizedRecommendationIds = linkRecommendations(input.recommendationIds);

  // 2. Resolve workflow title (explicit or generated from signal type + vehicleId)
  const workflowTitle = resolveWorkflowTitle(input.title, input.signalType, input.vehicleId);

  // 3. Resolve work order title (explicit or generated from orderType + vehicleId)
  const workOrderTitle = buildWorkOrderTitle(input.title, input.orderType, input.vehicleId);

  // 4. Build WorkflowEngineInput from signal mapping
  const workflowInput: WorkflowEngineInput = {
    workflowId: input.workflowId,
    vehicleId: input.vehicleId,
    workflowType: input.workflowType,
    title: workflowTitle,
    summary: input.summary,
    createdAt: input.runtimeTimestamp,
    updatedAt: input.runtimeTimestamp,
    refs: input.refs,
    recommendationIds: normalizedRecommendationIds,
    requestedPriority: undefined,
  };

  // 5. Build WorkOrderEngineInput (omitting inherited fields that runtime layer handles)
  const workOrderInput: Omit<WorkOrderEngineInput, 'workflowId' | 'vehicleId' | 'priority' | 'refs'> = {
    workOrderId: input.workOrderId,
    orderType: input.orderType,
    title: workOrderTitle,
    summary: input.summary,
    reason: input.reason,
    createdAt: input.runtimeTimestamp,
    updatedAt: input.runtimeTimestamp,
    recommendationIds: normalizedRecommendationIds,
  };

  // 6. Build complete WorkflowRuntimeInput
  const runtimeInput: WorkflowRuntimeInput = {
    workflowInput,
    workOrderInput,
    recommendationIds: normalizedRecommendationIds,
    runtimeTimestamp: input.runtimeTimestamp,
  };

  return {
    runtimeInput,
    normalizedRecommendationIds,
  };
}

/**
 * Resolve workflow title deterministically.
 *
 * @param explicitTitle - Optional explicit title from input
 * @param signalType - Signal type for fallback generation
 * @param vehicleId - Vehicle ID for fallback generation
 * @returns Resolved workflow title
 *
 * Rules:
 * - If explicit title provided and non-empty, use it
 * - Otherwise, generate deterministic title from signalType + vehicleId
 */
function resolveWorkflowTitle(
  explicitTitle: string | undefined,
  signalType: string,
  vehicleId: string,
): string {
  if (explicitTitle && explicitTitle.length > 0) {
    return explicitTitle;
  }

  // Deterministic fallback: "{signalType}: {vehicleId}"
  return `${signalType}: ${vehicleId}`;
}
