import { WorkflowEngineInput, WorkflowEngineResult } from './workflow-engine.types';
import { WorkflowEntity } from '../domain';
import { WorkflowStatus } from '../domain';
import { resolveWorkflowPriority } from './workflow-priority-resolver';
import { linkRecommendations } from './workflow-recommendation-linker';

/**
 * Service for creating workflows from operational intent.
 * Orchestrates priority resolution, recommendation linking, and entity creation.
 *
 * This service is deterministic: same input → same output.
 * No runtime side effects, no external dependencies.
 */
export class WorkflowEngineService {
  /**
   * Create a workflow from operational intent.
   *
   * @param input - Workflow engine input with operational details
   * @returns Workflow engine result with created workflow and resolved priority
   *
   * Process:
   * 1. Normalize and link recommendation IDs (deduplicate)
   * 2. Resolve workflow priority (explicit request or MEDIUM fallback)
   * 3. Create Workflow entity using domain factory
   * 4. Return comprehensive result with resolved values
   *
   * All operations are deterministic and use only data present in input.
   */
  static createWorkflow(input: WorkflowEngineInput): WorkflowEngineResult {
    // 1. Normalize recommendation IDs
    const normalizedRecommendationIds = linkRecommendations(input.recommendationIds);

    // 2. Resolve workflow priority
    const resolvedPriority = resolveWorkflowPriority(input.requestedPriority);

    // 3. Create workflow entity using domain factory
    const workflow = WorkflowEntity.createWorkflow({
      workflowId: input.workflowId,
      vehicleId: input.vehicleId,
      workflowType: input.workflowType,
      priority: resolvedPriority,
      title: input.title,
      summary: input.summary,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      refs: input.refs,
    });

    // 4. Return result with resolved values
    return {
      workflow,
      recommendationIds: normalizedRecommendationIds,
      resolvedPriority,
    };
  }
}
