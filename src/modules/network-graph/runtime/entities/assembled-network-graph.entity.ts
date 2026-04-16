/**
 * Assembled Network Graph Entity
 * Structural carrier for the assembled graph with runtime state after assembly.
 * Holds the complete graph content and explicit runtime state.
 * All content of this entity is caller-provided from assembly operation only.
 * No runtime logic, no validation, no lookup behavior, pure structural carrier.
 */

import type { GraphNode } from "../../domain/contracts/index.ts";
import type { GraphEdge } from "../../domain/contracts/index.ts";
import type { GraphRelation } from "../../domain/contracts/index.ts";
import type { GraphMetadata } from "../../domain/contracts/index.ts";
import type { GraphTimestamps } from "../../domain/contracts/index.ts";
import type { GraphRuntimeState } from "../contracts/graph-runtime-state.contract.ts";

/**
 * AssembledNetworkGraph
 * Minimal structural carrier for an assembled network graph.
 * Holds assembled nodes, edges, and relations with explicit runtime state.
 * Represents the runtime-ready graph after assembly operation completes.
 * No assembly logic, no traversal, no lookup, no validation, no mutation.
 */
export interface AssembledNetworkGraph {
  /** Graph identifier (caller-provided, optional) */
  graphId?: string;

  /** Assembled nodes collection (caller-provided, required) */
  readonly nodes: readonly GraphNode[];

  /** Assembled edges collection (caller-provided, required) */
  readonly edges: readonly GraphEdge[];

  /** Assembled relations collection (caller-provided, required) */
  readonly relations: readonly GraphRelation[];

  /** Runtime state for this assembled graph (caller-provided, required) */
  readonly runtimeState: GraphRuntimeState;

  /** Optional descriptive metadata (caller-provided) */
  metadata?: GraphMetadata;

  /** Optional temporal information (caller-provided) */
  timestamps?: GraphTimestamps;
}
