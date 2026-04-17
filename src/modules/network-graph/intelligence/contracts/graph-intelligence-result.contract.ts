/**
 * Graph Intelligence Result Contract
 * Structural output surface produced by deterministic graph intelligence evaluation.
 * Explicitly separates local intelligence (single-entity observations) from network intelligence (network-scoped observations).
 * Composes explicit local and network result contracts with single correlation boundary.
 * Pure structural result, no scoring, no recommendations, no policy logic, no propagation status.
 */

import type { GraphLocalIntelligenceResult } from "./graph-local-intelligence-result.contract";
import type { GraphNetworkIntelligenceResult } from "./graph-network-intelligence-result.contract";

/**
 * GraphIntelligenceResult
 * Explicit structural carrier for graph intelligence evaluation results.
 * Makes local vs network intelligence distinction clear at contract level by composing specialized result types.
 * Manages single correlation boundary at top level.
 * All output is explicitly derived from input, caller-readable, with no hidden defaults or inferences.
 */
export interface GraphIntelligenceResult {
  /** Optional correlation ID from input request context (for tracking and correlation) */
  readonly requestId?: string;

  /** Local intelligence branch: contains local observations about single specific entities (optional if no local observations produced) */
  readonly local?: GraphLocalIntelligenceResult;

  /** Network intelligence branch: contains network observations about entity sets (optional if no network observations produced) */
  readonly network?: GraphNetworkIntelligenceResult;
}

