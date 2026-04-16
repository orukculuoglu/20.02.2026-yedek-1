/**
 * Graph Assembly Result Contract
 * Structural carrier for the result of a graph assembly operation.
 * Holds the assembled graph produced by an assembly operation.
 * Result is caller-provided from the graph assembly operation only.
 * No validation, no diagnostics, no issue tracking, pure structural result carrier.
 */

import type { AssembledNetworkGraph } from "../entities/assembled-network-graph.entity.ts";

/**
 * GraphAssemblyResult
 * Minimal structural carrier for graph assembly operation output.
 * Represents the result of a complete graph assembly operation.
 * Carries the successfully assembled graph as the operation output.
 * This is the carrier contract for assembly operation results, not a container for issues or diagnostics.
 */
export interface GraphAssemblyResult {
  /** Assembled graph from the assembly operation (operation-provided, required) */
  readonly assembledGraph: AssembledNetworkGraph;
}
