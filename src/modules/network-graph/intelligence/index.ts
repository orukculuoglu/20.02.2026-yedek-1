/**
 * Graph Intelligence Layer - Foundation Phase Closure
 * 
 * Complete, bounded, deterministic structural intelligence foundation.
 * 
 * Core Responsibility:
 * Deterministic transformation of graph intelligence input into structural observations.
 * No mutation, no business logic, no propagation, no scoring.
 * 
 * Public API Structure:
 * 1. Input: GraphIntelligenceInput (caller-provided)
 * 2. Process: GraphIntelligenceEvaluator (deterministic service)
 * 3. Output: GraphIntelligenceResult (evaluation result with explicit local vs network separation)
 * 
 * Local Interpretation: GraphNodeNeighborhood, GraphRelationLocalStructure
 * Observations: GraphIntelligenceObservation (discriminated union: local | network)
 * Input Contracts: GraphObservationScope, GraphIntelligenceContext
 * 
 * Layer Boundary: Intelligence layer is self-contained, runtime-safe, and ready for consumption.
 */

export * from "./contracts/index";
export * from "./services/index";
