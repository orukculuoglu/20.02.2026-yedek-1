/**
 * Data Engine Graph Node Model
 *
 * Represents a single node in the vehicle maintenance intelligence graph.
 * Supports five explicit node families: Vehicle, Event, Observation, Actor, Asset.
 */

import type { DataEngineGraphNodeType } from '../types/DataEngineGraphNodeType';

export interface DataEngineGraphNode {
  /**
   * Deterministic node identifier (stable hash of nodeType + sourceId + semantic class).
   */
  nodeId: string;

  /**
   * Node family classification.
   */
  nodeType: DataEngineGraphNodeType;

  /**
   * Universal timestamp when node was attached to graph (ISO 8601).
   */
  attachedAt: string;

  /**
   * Human-readable label for the node.
   */
  label: string;

  /**
   * Source reference for audit trail (e.g., entity ID, feed candidateId).
   */
  sourceEntityRef: string;

  /**
   * Semantic classification for forward compatibility (open string).
   * Examples: "MAINTENANCE_EVENT", "REPAIR_EVENT", "BRAKE_PAD_REPLACEMENT".
   */
  semanticClass: string;

  /**
   * Flexible properties attached to this node (varies by nodeType and semanticClass).
   * Type-safe for well-known properties; allows extension for new node types.
   */
  properties: Record<string, unknown>;
}
