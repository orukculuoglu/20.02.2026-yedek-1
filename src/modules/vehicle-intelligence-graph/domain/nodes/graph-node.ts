/**
 * Vehicle Intelligence Graph - Base Node Contract
 *
 * Represents the base structure for all nodes in the vehicle intelligence graph.
 *
 * This interface is extended by:
 * - VehicleRootNode
 * - EventNode
 * - SourceNode
 * - IntelligenceNode
 */

import type { GraphNodeType } from '../enums/graph-node-type';

/**
 * Base structure for all graph nodes
 */
export interface GraphNode {
  /**
   * Unique identifier for the node
   */
  id: string;

  /**
   * Type of node (VEHICLE_ROOT, EVENT, SOURCE, INTELLIGENCE)
   */
  nodeType: GraphNodeType;

  /**
   * Vehicle identifier this node belongs to
   */
  vehicleId: string;

  /**
   * ISO 8601 timestamp when the node was created
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp when the node was last updated
   */
  updatedAt?: string;

  /**
   * ISO 8601 timestamp indicating when the node validity begins
   */
  validFrom?: string;

  /**
   * ISO 8601 timestamp indicating when the node validity ends
   */
  validTo?: string;

  /**
   * Contextual information about the node
   * Examples: conditions, environment, state during creation
   */
  context?: Record<string, unknown>;

  /**
   * Provenance information (source, derivation, lineage)
   * Tracks how and where the node data originated
   */
  provenance?: Record<string, unknown>;

  /**
   * Trust metrics and confidence information
   * Examples: confidence score, validation status, source reliability
   */
  trust?: Record<string, unknown>;

  /**
   * Additional metadata not covered by standard fields
   * Domain-specific or extension properties
   */
  metadata?: Record<string, unknown>;
}
