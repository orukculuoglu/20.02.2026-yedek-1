/**
 * Graph Local Intelligence Result Contract
 * Explicit structural container for local intelligence observations.
 * Local intelligence is scoped to single-entity observations and local structural readings.
 * Pure observation carrier, no scoring, no recommendations, no policy logic.
 */

import type { GraphIntelligenceLocalObservation } from "./graph-intelligence-observation.contract";

/**
 * GraphLocalIntelligenceResult
 * Minimal explicit carrier for local-scoped graph intelligence observations.
 * Contains only observations that target single specific entities.
 * Responsibility: carry local observations (single-entity subjects only).
 * Correlation is managed at the top-level GraphIntelligenceResult.
 * Local intelligence is bounded to:
 * - Single-entity observation subjects (node, edge, or relation)
 * - Phase 4 local structural interpretations (neighborhood, relation reading)
 * No multi-hop, no network-scoped structure, no derived patterns.
 */
export interface GraphLocalIntelligenceResult {
  /** Collection of local observations about single entities (readonly, deterministic) */
  readonly observations: readonly GraphIntelligenceLocalObservation[];
}
