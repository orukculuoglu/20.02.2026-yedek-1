/**
 * Vehicle Intelligence Graph - Root Node Binding Contract
 *
 * Defines the canonical attachment contract between a vehicle root node
 * and any node attached to the vehicle graph.
 *
 * Supports binding for:
 * - Event nodes
 * - Source nodes
 * - Intelligence nodes
 */

import type { GraphNodeType } from '../enums/graph-node-type';
import type { GraphEdgeType } from '../enums/graph-edge-type';

/**
 * Binding contract for vehicle root node attachments
 *
 * Represents the relationship context when a node is bound to the vehicle root.
 * Provides metadata about the binding itself, separate from node and edge data.
 */
export interface VehicleRootBinding {
  /**
   * ID of the root node being the attachment anchor
   */
  rootNodeId: string;

  /**
   * Vehicle identifier for the binding
   */
  vehicleId: string;

  /**
   * ID of the target node being attached
   */
  targetNodeId: string;

  /**
   * Type of the target node (EVENT, SOURCE, INTELLIGENCE)
   */
  targetNodeType: GraphNodeType;

  /**
   * Edge type that represents the binding relationship
   */
  bindingEdgeType: GraphEdgeType;

  /**
   * ISO 8601 timestamp when the binding was established
   */
  boundAt: string;

  /**
   * Contextual information about the binding
   */
  context?: Record<string, unknown>;

  /**
   * Provenance information about the binding origin and creation
   */
  provenance?: Record<string, unknown>;

  /**
   * Trust and confidence metrics for the binding
   */
  trust?: Record<string, unknown>;

  /**
   * Additional metadata not covered by standard fields
   */
  metadata?: Record<string, unknown>;
}
