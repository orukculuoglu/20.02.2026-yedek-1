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
 * Deterministic runtime preparation layer.
 * Converts explicit structural inputs into preparation outputs.
 * No ID/timestamp generation, all caller-provided.
 * 
 * Phase 6 Scope:
 * Deterministic execution orchestration layer.
 * Converts preparation outputs into execution plans.
 * No business logic, no interpretation, structural sequencing only.
 * 
 * Phase 7 Scope:
 * Deterministic analytics binding layer.
 * Converts execution plans into analytics-ready structural inputs.
 * No scoring, no anomaly interpretation, purely structural binding.
 * 
 * Phase 8 Scope:
 * Deterministic evaluation layer.
 * Converts analytics-ready inputs into comparison and interpretation results.
 * Pure structural evaluation only, no business logic, no hidden defaults.
 * 
 * Phase 9 Scope:
 * Deterministic pattern/pressure reading layer.
 * Converts evaluation outputs into pressure and pattern surfaces.
 * Derives structural measurements: repeated breaches, stage density, drift, clusters, concentrations.
 * Pure structural pattern reading only, no business logic, no hidden defaults.
 * 
 * Phase 10 Scope:
 * Deterministic example artifacts and verification scenarios.
 * Exercise foundation structure and contracts without business logic.
 * 
 * Window Lineage Foundation:
 * Explicit contracts for temporal continuity and window ancestry.
 * Lineage references, chains, ancestry models, and builders.
 * No inference, no implicit generation, all caller-provided.
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
export * from "./guards/index.ts";

// Builders (Phase 3)
export * from "./builders/WindowBuilder.ts";
export * from "./builders/ComparisonPairBuilder.ts";
export * from "./builders/ComparisonGroupBuilder.ts";
export * from "./builders/index.ts";

// Operators (Phase 4)
export * from "./operators/WindowCollectionOperator.ts";
export * from "./operators/PartitionOperator.ts";

// Window Lineage Foundation
export * from "./contracts/WindowLineageContract.ts";
export * from "./entities/WindowLineageEntity.ts";
export * from "./guards/WindowLineageGuards.ts";
export * from "./builders/WindowLineageBuilder.ts";

// Runtime Preparation (Phase 5)
export * from "./runtime/index.ts";

// Execution Orchestration (Phase 6)
export * from "./execution/index.ts";

// Analytics Binding (Phase 7)
export * from "./analytics/index.ts";

// Evaluation (Phase 8)
export * from "./evaluation/index.ts";

// Pattern / Pressure Reading (Phase 9)
export * from "./patterns/index.ts";

// Examples / Verification (Phase 10)
export * from "./examples/index.ts";
