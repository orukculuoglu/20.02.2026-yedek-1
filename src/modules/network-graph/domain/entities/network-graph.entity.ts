/**
 * Network Graph Entity
 * Structural container for the complete graph including nodes, edges, and relations.
 * Carries the graph as a collection of structural elements.
 * All identifiers, timestamps, and contents caller-provided only.
 * No runtime logic, no validation, no lookup behavior, pure structural container.
 */

import type { GraphNode } from "../contracts/index.ts";
import type { GraphEdge } from "../contracts/index.ts";
import type { GraphRelation } from "../contracts/index.ts";
import type { GraphMetadata } from "../contracts/index.ts";
import type { GraphTimestamps } from "../contracts/index.ts";

/**
 * NetworkGraph
 * Minimal structural container for a complete network graph.
 * Carries nodes, edges, and relations as separate structural collections.
 * Caller must provide all graph contents explicitly.
 * No graph assembly, no traversal, no lookup, no validation.
 */
export interface NetworkGraph {
  /** Graph identifier (caller-provided, optional) */
  graphId?: string;

  /** Graph nodes collection (caller-provided, required) */
  nodes: GraphNode[];

  /** Graph edges collection (caller-provided, required) */
  edges: GraphEdge[];

  /** Graph relations collection (caller-provided, required) */
  relations: GraphRelation[];

  /** Optional descriptive metadata (caller-provided) */
  metadata?: GraphMetadata;

  /** Optional temporal information (caller-provided) */
  timestamps?: GraphTimestamps;
}
