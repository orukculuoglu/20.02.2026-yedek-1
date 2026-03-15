import { WorkOrderEngineInput, WorkOrderEngineResult } from './work-order-engine.types';
import { WorkOrderEntity } from '../domain';
import { linkWorkOrderRecommendations } from './work-order-recommendation-linker';
import { buildWorkOrderTitle } from './work-order-title-builder';

/**
 * Service for creating work orders from workflows.
 * Orchestrates recommendation linking, title building, and entity creation.
 *
 * This service is deterministic: same input → same output.
 * No runtime side effects, no external dependencies.
 */
export class WorkOrderEngineService {
  /**
   * Create a work order from workflow intent.
   *
   * @param input - Work order engine input with operational details
   * @returns Work order engine result with created work order and normalized recommendations
   *
   * Process:
   * 1. Normalize and link recommendations (deduplicate)
   * 2. Build final work order title (explicit or generated from orderType + vehicleId)
   * 3. Create WorkOrder entity using domain factory
   * 4. Return comprehensive result with normalized values
   */
  static createWorkOrder(input: WorkOrderEngineInput): WorkOrderEngineResult {
    // 1. Normalize recommendation IDs
    const normalizedRecommendationIds = linkWorkOrderRecommendations(
      input.recommendationIds,
    );

    // 2. Build work order title
    const finalTitle = buildWorkOrderTitle(
      input.title,
      input.orderType,
      input.vehicleId,
    );

    // 3. Create work order entity using domain factory
    const workOrder = WorkOrderEntity.createWorkOrder({
      workOrderId: input.workOrderId,
      workflowId: input.workflowId,
      vehicleId: input.vehicleId,
      orderType: input.orderType,
      priority: input.priority,
      title: finalTitle,
      summary: input.summary,
      reason: input.reason,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      refs: input.refs,
    });

    // 4. Return result with normalized values
    return {
      workOrder,
      recommendationIds: normalizedRecommendationIds,
    };
  }
}
