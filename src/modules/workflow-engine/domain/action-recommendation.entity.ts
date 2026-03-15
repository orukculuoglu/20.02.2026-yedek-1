import { ActionRecommendation } from './action-recommendation.types';
import {
  ActionRecommendationType,
  ActionActorType,
  ActionExecutionMode,
  ActionRationaleType,
} from './action-recommendation.enums';
import { WorkflowPriority } from './workflow.enums';
import { ActionRecommendationRefs } from './action-recommendation.types';

/**
 * Input contract for creating an ActionRecommendation entity.
 * All values including timestamps must be explicitly provided.
 */
export interface CreateActionRecommendationInput {
  recommendationId: string;
  workflowId: string;
  vehicleId: string;
  type: ActionRecommendationType;
  actor: ActionActorType;
  executionMode: ActionExecutionMode;
  rationaleType: ActionRationaleType;
  priority: WorkflowPriority;
  title: string;
  summary: string;
  reason: string;
  recommendedAt: number;
  refs: ActionRecommendationRefs;
  metadata?: Record<string, unknown>;
}

/**
 * Input contract for updating an ActionRecommendation.
 * Allows selective updates with explicit timestamp.
 */
export interface UpdateActionRecommendationInput {
  recommendation: ActionRecommendation;
  updates: {
    type?: ActionRecommendationType;
    actor?: ActionActorType;
    executionMode?: ActionExecutionMode;
    rationaleType?: ActionRationaleType;
    priority?: WorkflowPriority;
    title?: string;
    summary?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  };
  updatedAt: number;
}

/**
 * Factory for deterministic ActionRecommendation entity construction.
 * Ensures recommendations are created with consistent, valid state.
 * All values are deterministic from input with no hidden timestamp generation.
 */
export class ActionRecommendationEntity {
  /**
   * Create a new ActionRecommendation entity.
   *
   * @param input - ActionRecommendation creation input with explicit timestamp
   * @returns New ActionRecommendation entity
   */
  static createActionRecommendation(
    input: CreateActionRecommendationInput,
  ): ActionRecommendation {
    return {
      recommendationId: input.recommendationId,
      workflowId: input.workflowId,
      vehicleId: input.vehicleId,
      type: input.type,
      actor: input.actor,
      executionMode: input.executionMode,
      rationaleType: input.rationaleType,
      priority: input.priority,
      title: input.title,
      summary: input.summary,
      reason: input.reason,
      recommendedAt: input.recommendedAt,
      refs: input.refs,
      ...(input.metadata && { metadata: input.metadata }),
    };
  }

  /**
   * Update an ActionRecommendation entity.
   *
   * @param input - Update input with explicit timestamp
   * @returns Updated ActionRecommendation entity
   */
  static updateActionRecommendation(
    input: UpdateActionRecommendationInput,
  ): ActionRecommendation {
    return {
      ...input.recommendation,
      ...(input.updates.type !== undefined && { type: input.updates.type }),
      ...(input.updates.actor !== undefined && { actor: input.updates.actor }),
      ...(input.updates.executionMode !== undefined && {
        executionMode: input.updates.executionMode,
      }),
      ...(input.updates.rationaleType !== undefined && {
        rationaleType: input.updates.rationaleType,
      }),
      ...(input.updates.priority !== undefined && {
        priority: input.updates.priority,
      }),
      ...(input.updates.title !== undefined && { title: input.updates.title }),
      ...(input.updates.summary !== undefined && {
        summary: input.updates.summary,
      }),
      ...(input.updates.reason !== undefined && { reason: input.updates.reason }),
      ...(input.updates.metadata !== undefined && {
        metadata: input.updates.metadata,
      }),
    };
  }
}
