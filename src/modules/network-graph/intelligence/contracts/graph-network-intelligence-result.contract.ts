/**
 * Graph Network Intelligence Result Contract
 * Explicit structural container for network intelligence observations.
 * Network intelligence is scoped to network-level structural observations.
 * Pure observation carrier, no scoring, no recommendations, no policy logic, no graph-global reasoning.
 */

import type { GraphIntelligenceNetworkObservation } from "./graph-intelligence-observation.contract";

/**
 * GraphNetworkIntelligenceResult
 * Minimal explicit carrier for network-scoped graph intelligence observations.
 * Contains only observations that target sets of entities forming network structure.
 * Responsibility: carry network observations (entity set subjects only).
 * Correlation is managed at the top-level GraphIntelligenceResult.
 * Network intelligence is bounded to:
 * - Network observation subjects (node sets, edge sets, relation sets)
 * - Explicitly provided structural data from input, not derived patterns
 * - No propagation, no influence diffusion, no graph-global pattern inference
 * No multi-hop implicit traversal, no business importance scoring.
 */
export interface GraphNetworkIntelligenceResult {
  /** Collection of network observations about entity sets (readonly, deterministic) */
  readonly observations: readonly GraphIntelligenceNetworkObservation[];
}
