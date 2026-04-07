/**
 * Temporal Runtime Layer Entry Point
 * Exports all runtime components for temporal evaluation and trend analysis foundation.
 * 
 * LAYER COMPONENTS:
 * 1. Preparation Runtime (Temporal Foundation Assembly)
 *    - TemporalPreparationRuntime
 *    - TemporalPreparationContext
 *    - TemporalPreparationResult
 * 
 * 2. Trend Runtime (Temporal Evaluation - Delta/Direction/Strength)
 *    - TrendRuntime
 *    - TrendRuntimeContext
 *    - TrendRuntimeResult
 */

// Temporal Preparation Runtime Components
export type {
  TemporalPreparationContext,
  CollectionAssemblyIntent,
  PartitioningIntent,
  ComparisonReadyWindowPair,
} from "./TemporalPreparationContext.ts";
export { TemporalPreparationContextValidator } from "./TemporalPreparationContext.ts";

export type { TemporalPreparationResult, ComparisonReadyStructure } from "./TemporalPreparationResult.ts";
export { TemporalPreparationResultBuilder } from "./TemporalPreparationResult.ts";

export { TemporalPreparationRuntime } from "./TemporalPreparationRuntime.ts";

export type {
  ExecutionPreparationContract,
  ExecutionRequirements,
} from "./ExecutionPreparationIntegration.ts";
export {
  ExecutionPreparationContractBuilder,
  ExecutionPreparationValidator,
} from "./ExecutionPreparationIntegration.ts";

export type { PreparationValidationResult } from "./PreparationValidationUtilities.ts";
export {
  PreparationValidationUtilities,
  ValidationBuilder,
} from "./PreparationValidationUtilities.ts";

// Trend Runtime Components
export type {
  TrendRuntimeContext,
  DeltaValueSurface,
  RelatedTrendRuntimeInput,
} from "./TrendRuntimeContext.ts";
export { TrendRuntimeContextValidator } from "./TrendRuntimeContext.ts";

export type {
  DeltaComputationResult,
  DirectionDerivationResult,
  StrengthDerivationResult,
  TrendRuntimeResult,
  RelatedTrendRuntimeResult,
} from "./TrendRuntimeResult.ts";
export { TrendRuntimeResultBuilder } from "./TrendRuntimeResult.ts";

export { TrendRuntime } from "./TrendRuntime.ts";
