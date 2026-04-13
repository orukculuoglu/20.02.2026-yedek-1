/**
 * Graph Node Input Collection Contract
 * Structural specification for node input collection during graph assembly.
 * Carries only the caller-provided collection of nodes.
 * No validation, no lookup, no mutation, pure structural collection specification.
 */

import type { GraphNode } from "../../domain/contracts/index.ts";

/**
 * GraphNodeInputCollection
 * Minimal structural specification for node input collection.
 * Carries nodes to be assembled into the graph.
 * Caller must provide all nodes explicitly.
 */
export interface GraphNodeInputCollection {
  /** Graph nodes collection (caller-provided, required) */
  readonly nodes: readonly GraphNode[];
}
