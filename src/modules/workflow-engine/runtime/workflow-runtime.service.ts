import { WorkflowRuntimeInput, WorkflowRuntimeResult } from './workflow-runtime.types';
import { buildWorkflowRuntimeSnapshot } from './workflow-runtime.snapshot';
import { WorkflowEngineService } from '../engine/workflow-engine.service';
import { WorkOrderEngineService } from '../work-order-engine/work-order-engine.service';

/**
 * Service for orchestrating deterministic workflow runtime execution.
 *
 * Responsibilities:
 * - Accept unified runtime input
 * - Create workflow via Workflow Engine service
 * - Create work order via Work Order Engine service
 * - Inherit workflow results into work order creation
 * - Normalize and maintain recommendation ID stability
 * - Generate runtime snapshot
 * - Return complete runtime result
 *
 * This is a pure orchestration layer with no persistence, queue logic, or signal integration.
 * All operations are deterministic: same input → same output.
 */
export class WorkflowRuntimeService {
  /**
   * Execute deterministic workflow runtime orchestration.
   *
   * Pipeline:
   * 1. Create workflow from workflowInput
   * 2. Extract inherited values: workflowId, vehicleId, priority, refs
   * 3. Merge inherited values with workOrderInput
   * 4. Create work order with merged input
   * 5. Build runtime snapshot
   * 6. Return result with both entities and snapshot
   *
   * @param input - Unified workflow runtime input
   * @returns Complete workflow runtime result
   *
   * Guarantees:
   * - No external calls or side effects
   * - No hidden data lookups
   * - No queue or persistence logic
   * - Deterministic execution
   * - All timestamps explicit from input
   */
  static executeRuntime(input: WorkflowRuntimeInput): WorkflowRuntimeResult {
    // 1. Create workflow from workflow engine input
    const workflowResult = WorkflowEngineService.createWorkflow(input.workflowInput);

    // 2. Extract inherited values from workflow result
    const {
      workflowId,
      vehicleId,
      priority,
      refs,
    } = workflowResult.workflow;

    // 3. Build work order input with inherited workflow values
    const workOrderInput = {
      ...input.workOrderInput,
      workflowId,
      vehicleId,
      priority,
      refs,
    };

    // 4. Create work order from merged input
    const workOrderResult = WorkOrderEngineService.createWorkOrder(workOrderInput);

    // 5. Build deterministic runtime snapshot
    const snapshot = buildWorkflowRuntimeSnapshot(
      workflowResult.workflow,
      workOrderResult.workOrder,
      workOrderResult.recommendationIds,
    );

    // 6. Return unified result with both entities and snapshot
    return {
      workflow: workflowResult.workflow,
      workOrder: workOrderResult.workOrder,
      recommendationIds: workOrderResult.recommendationIds,
      snapshot,
    };
  }
}
