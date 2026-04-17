/**
 * Graph Intelligence Contracts Layer
 * Export surface for graph intelligence evaluation contracts.
 * Organized by responsibility: input, output, processing, and interpretation.
 * Foundation phase closure: all contract surfaces are complete and boundary-clean.
 */

// ============================================================================
// INPUT CONTRACTS (Phase 1)
// Caller-provided input for graph intelligence evaluation
// ============================================================================

/** Observation scope constraints and focus area definitions */
export type { GraphObservationScope } from "./graph-observation-scope.contract";

/** Request correlation and processing context from caller */
export type { GraphIntelligenceContext } from "./graph-intelligence-context.contract";

/** Complete input envelope for graph intelligence evaluation */
export type { GraphIntelligenceInput } from "./graph-intelligence-input.contract";

// ============================================================================
// OBSERVATION CONTRACTS (Phase 2 - internal, but exported for type reference)
// Discriminated union distinguishes local vs network observation subjects
// ============================================================================

export type {
  GraphIntelligenceLocalObservation,
  GraphIntelligenceNetworkObservation,
  GraphIntelligenceObservation,
} from "./graph-intelligence-observation.contract";

// ============================================================================
// RESULT CONTRACTS (Phase 5 - refinement of Phase 2)
// Explicitly separates local vs network intelligence at result level
// GraphLocalIntelligenceResult and GraphNetworkIntelligenceResult are
// internal implementation details of GraphIntelligenceResult structure.
// ============================================================================

/** Deterministic evaluation result with explicit local vs network separation */
export type { GraphIntelligenceResult } from "./graph-intelligence-result.contract";

// ============================================================================
// EVALUATOR CONTRACT (Phase 3)
// Deterministic transformation service: input -> result
// ============================================================================

/** Graph intelligence evaluation service interface */
export type { GraphIntelligenceEvaluator } from "./graph-intelligence-evaluator.contract";

// ============================================================================
// INTERPRETATION CONTRACTS (Phase 4)
// Local structural reading surfaces for graph neighborhoods and relations
// ============================================================================

/** Node neighborhood interpretation: direct structural connectivity */
export type { GraphNodeNeighborhood } from "./graph-neighborhood-interpretation.contract";

/** Relation interpretation: explicitly linked local structure */
export type { GraphRelationLocalStructure } from "./graph-relation-interpretation.contract";
