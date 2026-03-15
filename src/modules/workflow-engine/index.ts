/**
 * Workflow Engine module
 * Layer 7: Converts operational signals into workflows and work orders
 *
 * This module provides:
 * - Foundational domain model for workflows and work orders
 * - Action recommendation model
 * - Workflow engine service for deterministic workflow creation
 * - Work order engine service for deterministic work order creation
 * - Workflow runtime orchestration service for unified pipeline execution
 * - Signal → Workflow integration layer for deterministic signal mapping
 * - Workflow logging and snapshot layer for audit trails
 * - Public API facade for clean module-level access
 */

export * from './domain';
export { WorkflowEngineService } from './engine/workflow-engine.service';
export { resolveWorkflowPriority } from './engine/workflow-priority-resolver';
export { linkRecommendations } from './engine/workflow-recommendation-linker';
export type {
  WorkflowEngineInput,
  WorkflowEngineResult,
} from './engine/workflow-engine.types';
export { WorkOrderEngineService } from './work-order-engine/work-order-engine.service';
export { linkWorkOrderRecommendations } from './work-order-engine/work-order-recommendation-linker';
export { buildWorkOrderTitle } from './work-order-engine/work-order-title-builder';
export type {
  WorkOrderEngineInput,
  WorkOrderEngineResult,
} from './work-order-engine/work-order-engine.types';
export { WorkflowRuntimeService } from './runtime/workflow-runtime.service';
export { buildWorkflowRuntimeSnapshot } from './runtime/workflow-runtime.snapshot';
export type {
  WorkflowRuntimeInput,
  WorkflowRuntimeResult,
  WorkflowRuntimeSnapshot,
} from './runtime/workflow-runtime.types';
export { SignalWorkflowIntegrationService } from './integration/signal-workflow-integration.service';
export { mapSignalToWorkflowRuntime } from './integration/signal-workflow-mapper';
export type {
  SignalWorkflowIntegrationInput,
  SignalWorkflowIntegrationResult,
} from './integration/signal-workflow-integration.types';
export { WorkflowLogService } from './logging/workflow-log.service';
export { buildWorkflowLogSnapshot } from './logging/workflow-log.snapshot';
export { buildWorkflowLogEntry } from './logging/workflow-log.entry';
export { WorkflowLogEventType } from './logging/workflow-log.types';
export type {
  WorkflowLogSnapshot,
  WorkflowLogEntry,
  WorkflowLogResult,
} from './logging/workflow-log.types';
export { WorkflowApiService } from './api/workflow-api.service';
export type {
  CreateWorkflowFromRuntimeInput,
  CreateWorkflowFromRuntimeResult,
  PrepareSignalWorkflowInput,
  PrepareSignalWorkflowResult,
  CreateWorkflowLogInput,
  CreateWorkflowLogResult,
} from './api/workflow-api.types';
