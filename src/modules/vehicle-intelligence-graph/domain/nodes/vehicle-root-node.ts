/**
 * Vehicle Intelligence Graph - Vehicle Root Node
 *
 * Represents the root/anchor node of the vehicle intelligence graph.
 *
 * The VehicleRootNode is the entry point for all events, sources, and intelligence
 * associated with a vehicle. It anchors the entire graph structure and provides
 * the single reference point from which all relationships derive.
 *
 * Extends: GraphNode
 */

import type { GraphNode } from './graph-node';
import { GraphNodeType } from '../enums/graph-node-type';

/**
 * Root node representing a vehicle in the intelligence graph
 *
 * Serves as the anchor point for:
 * - All events related to the vehicle
 * - All data sources feeding into the vehicle profile
 * - All derived intelligence and insights
 */
export interface VehicleRootNode extends GraphNode {
  /**
   * Always VEHICLE_ROOT for this node type
   */
  nodeType: GraphNodeType.VEHICLE_ROOT;

  /**
   * Reference to the vehicle identity from the data engine
   *
   * This links the graph node to the vehicle's anonymous identity
   * within the data engine intelligence pipeline.
   */
  identityRef: string;

  /**
   * Domain or category the vehicle belongs to
   *
   * Examples: "commercial_fleet", "personal_transport", "insurance_pool"
   */
  domain?: string;

  /**
   * Current status of the vehicle root node
   *
   * Examples: "active", "archived", "monitoring", "maintenance"
   */
  status?: string;
}
