/**
 * Temporal Preparation Layer Entry Point
 * Exports all preparation components for the temporal execution foundation.
 */

// Context and intent definitions
export type {
  TemporalPreparationContext,
  CollectionAssemblyIntent,
  PartitioningIntent,
  ComparisonReadyWindowPair,
} from "./TemporalPreparationContext.ts";
export { TemporalPreparationContextValidator } from "./TemporalPreparationContext.ts";

// Result definitions
export type { TemporalPreparationResult, ComparisonReadyStructure } from "./TemporalPreparationResult.ts";
export { TemporalPreparationResultBuilder } from "./TemporalPreparationResult.ts";

// Runtime orchestration
export { TemporalPreparationRuntime } from "./TemporalPreparationRuntime.ts";

// Execution integration
export type {
  ExecutionPreparationContract,
  ExecutionRequirements,
} from "./ExecutionPreparationIntegration.ts";
export {
  ExecutionPreparationContractBuilder,
  ExecutionPreparationValidator,
} from "./ExecutionPreparationIntegration.ts";

// Validation utilities
export type { PreparationValidationResult } from "./PreparationValidationUtilities.ts";
export {
  PreparationValidationUtilities,
  ValidationBuilder,
} from "./PreparationValidationUtilities.ts";
