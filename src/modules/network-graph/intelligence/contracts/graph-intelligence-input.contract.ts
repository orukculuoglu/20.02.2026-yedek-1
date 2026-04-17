/**
 * Graph Intelligence Input Contract
 * Structural input surface for deterministic graph intelligence evaluation.
 * Composes runtime envelope, observation scope, and evaluation context into single carrier.
 * No intelligence logic, no evaluation behavior, pure structural input definition.
 */

import type { GraphRuntimeEnvelope } from "../../runtime/contracts/graph-runtime-envelope.contract";
import type { GraphObservationScope } from "./graph-observation-scope.contract";
import type { GraphIntelligenceContext } from "./graph-intelligence-context.contract";

/**
 * GraphIntelligenceInput
 * Minimal structural carrier for graph intelligence evaluation input.
 * Provides the complete input surface needed to deterministically evaluate graph intelligence.
 * Composes runtime envelope, observation scope, and evaluation context.
 * All input is caller-provided from prior runtime assembly and evaluation operations.
 */
export interface GraphIntelligenceInput {
  /** Runtime envelope containing evaluated graph (caller-provided from runtime layer, required) */
  readonly envelope: GraphRuntimeEnvelope;

  /** Observation scope defining focus areas and boundaries (caller-provided, optional) */
  readonly scope?: GraphObservationScope;

  /** Caller-provided request context for tracking and correlation (caller-provided, optional) */
  readonly context?: GraphIntelligenceContext;
}
