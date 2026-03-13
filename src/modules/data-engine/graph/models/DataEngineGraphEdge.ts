/**
 * Data Engine Graph Edge Model
 *
 * Represents a relationship between two nodes in the vehicle maintenance graph.
 * Supports seven semantic relationship types.
 */

import type { DataEngineGraphEdgeType } from '../types/DataEngineGraphEdgeType';

export interface DataEngineGraphEdge {
  /**
   * Deterministic edge identifier (stable hash of sourceNodeId + edgeType + targetNodeId).
   */
  edgeId: string;

  /**
   * Source node ID (from node).
   */
  sourceNodeId: string;

  /**
   * Target node ID (to node).
   */
  targetNodeId: string;

  /**
   * Semantic relationship type.
   */
  edgeType: DataEngineGraphEdgeType;

  /**
   * Timestamp when edge was created (ISO 8601).
   * Uses fallback: eventTimestamp → observedTimestamp → ingestedTimestamp → now.
   */
  createdAt: string;

  /**
   * Source reference for audit trail.
   */
  sourceEntityRef: string;

  /**
   * Flexible properties for this relationship (semantically typed by edgeType).
   */
  properties: Record<string, unknown>;
}
