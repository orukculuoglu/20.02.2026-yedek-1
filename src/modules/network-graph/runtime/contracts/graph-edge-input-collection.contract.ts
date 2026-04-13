/**
 * Graph Edge Input Collection Contract
 * Structural specification for edge input collection during graph assembly.
 * Carries only the caller-provided collection of edges.
 * No validation, no lookup, no mutation, pure structural collection specification.
 */

import type { GraphEdge } from "../../domain/contracts/index.ts";

/**
 * GraphEdgeInputCollection
 * Minimal structural specification for edge input collection.
 * Carries edges to be assembled into the graph.
 * Caller must provide all edges explicitly.
 */
export interface GraphEdgeInputCollection {
  /** Graph edges collection (caller-provided, required) */
  readonly edges: readonly GraphEdge[];
}
