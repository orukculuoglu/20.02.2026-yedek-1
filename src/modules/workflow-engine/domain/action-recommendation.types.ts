import {
  ActionRecommendationType,
  ActionActorType,
  ActionExecutionMode,
  ActionRationaleType,
} from './action-recommendation.enums';
import { WorkflowPriority } from './workflow.enums';

/**
 * References to upstream Motor 2 layers and internal workflow entities.
 * Preserves complete traceability for action recommendations.
 */
export interface ActionRecommendationRefs {
  signalRefs: string[];
  graphRefs: string[];
  indexRefs: string[];
  compositeRefs: string[];
  sourceRefs: string[];
  workflowRefs: string[];
  workOrderRefs: string[];
}

/**
 * Action Recommendation entity.
 * Describes a recommended operational action derived from workflows and signals.
 *
 * An action recommendation specifies:
 * - What action should be taken (type)
 * - Who should execute it (actor)
 * - How it should be executed (executionMode)
 * - Why it's recommended (rationaleType)
 * - When it should be executed (priority)
 * - Where it applies (vehicleId)
 * - Complete traceability (refs)
 */
export interface ActionRecommendation {
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
