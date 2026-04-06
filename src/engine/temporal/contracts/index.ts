/**
 * Temporal Contracts Barrel Export
 * Single entry point for all temporal domain contracts.
 * Type-only exports for compile-time consumption only.
 */

// Phase 1: Core temporal definitions
// Window type definitions
export type { WindowTypeContract } from "./WindowType.ts";
export { WindowType, WindowRole } from "./WindowType.ts";

// Temporal comparison definitions
export type { TemporalComparisonContract } from "./TemporalComparison.ts";
export {
  ComparisonType,
  AlignmentType,
  TemporalGrain,
} from "./TemporalComparison.ts";

// Relationship definitions
export type {
  WindowRelationship,
  ReferenceWindowRelationship,
  BaselineWindowRelationship,
} from "./RelationshipTypes.ts";
export {
  ReferenceRelationType,
  BaselineRelationType,
  RelationshipArity,
} from "./RelationshipTypes.ts";

// Core contracts
export type {
  TemporalWindowBoundary,
  TemporalWindowMetadata,
  MultiWindowTemporalContract,
  MultiWindowSet,
  TemporalValidationResult,
} from "./CoreTemporalContracts.ts";
export { SetPurpose } from "./CoreTemporalContracts.ts";

// Window type compatibility
export {
  VALID_WINDOW_TYPE_ROLES,
  isValidWindowTypeContract,
  getWindowTypeValidationError,
} from "./WindowTypeCompatibility.ts";

// Phase 2: Multi-window entity models
// Window descriptors and family models
export type {
  WindowDescriptor,
  WindowFamily,
} from "./WindowDescriptors.ts";
export { WindowFamilyType } from "./WindowDescriptors.ts";

// Window state models
export type {
  BaseWindowState,
  ObservedWindowState,
  BaselineWindowState,
  ReferenceWindowState,
  WindowState,
  StateSnapshot,
} from "./WindowStates.ts";

// Comparison entity models
export type {
  ComparisonPair,
  ComparisonGroup,
  ComparisonMatrix,
} from "./ComparisonEntities.ts";
export {
  ComparisonWindowRole,
  ComparisonPairType,
  ComparisonGroupType,
} from "./ComparisonEntities.ts";

// Window collections and membership models
export type {
  WindowSetMember,
  OrderingMetadata,
  OrderedWindowCollection,
  WindowCollectionOperationPrep,
  WindowSequenceBinding,
  PartitionedWindowSet,
} from "./WindowCollections.ts";
export { OrderingType } from "./WindowCollections.ts";

// Phase 3: Comparison result contracts
// Delta contracts
export type { AbsoluteDelta, RelativeDelta } from "./DeltaContracts.ts";
export {
  ZeroDenominatorStrategy,
  type SuccessfulRelativeDelta,
  type ZeroDenominatorRelativeDelta,
} from "./DeltaContracts.ts";

// Comparison direction contracts
export type { ComparisonDirectionContract } from "./ComparisonDirection.ts";
export {
  ComparisonDirectionType,
  DirectionBasis,
} from "./ComparisonDirection.ts";

// Rate of change contracts
export type { RateOfChange } from "./RateOfChange.ts";

// Acceleration/deceleration contracts
export type { AccelerationDeceleration } from "./AccelerationDeceleration.ts";

// Volatility and instability contracts
export type {
  VolatilityFlag,
  InstabilityFlag,
  VolatilityInstabilityContract,
} from "./VolatilityInstability.ts";
export {
  VolatilityBasisType,
  InstabilityBasisType,
} from "./VolatilityInstability.ts";

// Threshold breach contracts
export type {
  ThresholdBreachReference,
  ThresholdBreach,
} from "./ThresholdBreach.ts";
export { BreachDirection } from "./ThresholdBreach.ts";

// Comparison trace contracts
export type {
  ComparisonTraceReference,
  ComparisonExplanationReferences,
} from "./ComparisonTrace.ts";
export {
  ComparisonTraceSource,
  ContributionType,
} from "./ComparisonTrace.ts";

// Pair-level comparison results
export type { PairComparisonResult } from "./PairComparisonResult.ts";

// Group-level comparison results
export type { GroupComparisonResult } from "./GroupComparisonResult.ts";

// Aggregate comparison results
export type { AggregateComparisonResult } from "./AggregateComparisonResult.ts";
export { ComparisonFailureReason } from "./AggregateComparisonResult.ts";

// Phase 4: Window lineage contracts
// Lineage identity and ancestry
export type {
  WindowLineageReference,
  WindowLineageContract,
  WindowLineageChain,
  WindowLineageAncestry,
} from "./WindowLineageContract.ts";
export type { WindowLineageRole, WindowLineageRelationType } from "./WindowLineageContract.ts";
