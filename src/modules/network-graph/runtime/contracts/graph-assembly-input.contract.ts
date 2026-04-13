/**
 * Graph Assembly Input Contract
 * Structural specification for deterministic graph assembly input.
 * Composes node, edge, and relation input collections with optional metadata.
 * All collections caller-provided only.
 * No validation, no mutation, no runtime behavior, pure structural input specification.
 */

import type { GraphNodeInputCollection } from "./graph-node-input-collection.contract.ts";
import type { GraphEdgeInputCollection } from "./graph-edge-input-collection.contract.ts";
import type { GraphRelationInputCollection } from "./graph-relation-input-collection.contract.ts";
import type { GraphMetadata } from "../../domain/contracts/index.ts";
import type { GraphTimestamps } from "../../domain/contracts/index.ts";

/**
 * GraphAssemblyInput
 * Minimal structural specification for graph assembly input.
 * Composes node, edge, and relation input collections.
 * Caller must provide all graph element collections explicitly.
 * No assembly logic, no validation, no lookup, no runtime mutation.
 */
export interface GraphAssemblyInput
  extends GraphNodeInputCollection,
    GraphEdgeInputCollection,
    GraphRelationInputCollection {
  /** Graph identifier (caller-provided, optional) */
  graphId?: string;

  /** Optional descriptive metadata (caller-provided) */
  metadata?: GraphMetadata;

  /** Optional temporal information (caller-provided) */
  timestamps?: GraphTimestamps;
}

