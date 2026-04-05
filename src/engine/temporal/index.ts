/**
 * Motor 3 V3 - Temporal Foundation
 * Multi-Window Time Series Comparison Layer
 * 
 * Responsibility:
 * Define and normalize the foundation for comparing multiple temporal windows.
 * Pure contracts - no business logic, scoring, liquidity interpretation, or forecasting.
 * 
 * Phase 1 Scope:
 * Domain contracts for window types, roles, comparison methods, alignment, 
 * temporal granularity, and inter-window relationships.
 * 
 * Phase 2 Scope:
 * Concrete structural entities and type guards for runtime instantiation.
 * Deterministic models, no business logic, no builders/operators.
 * 
 * Phase 3 Scope:
 * Deterministic builders for constructing entities and contracts.
 * No ID generation, no defaults, explicit inputs only.
 * 
 * Phase 4 Scope:
 * Deterministic operators for collection management and partitioning.
 * No business logic, no scoring, explicit transformation rules only.
 * 
 * Phase 5 Scope:
 * Deterministic example artifacts and verification scenarios.
 * Exercise foundation structure and contracts without business logic.
 */

// Contracts (Phase 1)
export * from "./contracts/index.ts";

// Entities (Phase 2)
export * from "./entities/WindowIdentity.ts";
export * from "./entities/TemporalWindowEntity.ts";
export * from "./entities/ComparisonEntityModels.ts";

// Guards (Phase 2)
export * from "./guards/WindowContractGuards.ts";
export * from "./guards/ComparisonEntityGuards.ts";

// Builders (Phase 3)
export * from "./builders/WindowBuilder.ts";
export * from "./builders/ComparisonPairBuilder.ts";
export * from "./builders/ComparisonGroupBuilder.ts";

// Operators (Phase 4)
export * from "./operators/WindowCollectionOperator.ts";
export * from "./operators/PartitionOperator.ts";

// Examples / Verification (Phase 5)
export * from "./examples/index.ts";
