/**
 * Vehicle Intelligence Graph - Root Binding Rules
 *
 * Defines the canonical root-to-node binding policy for the vehicle graph.
 *
 * Specifies the allowed bindings between VehicleRootNode and other node types,
 * and the required edge type for each binding.
 */

import { GraphNodeType } from '../enums/graph-node-type';
import { GraphEdgeType } from '../enums/graph-edge-type';

/**
 * Root binding rules mapping
 *
 * Maps each bindable node type to its required edge type when attached to the root.
 *
 * Allowed bindings:
 * - EVENT nodes attach via HAS_EVENT edges
 * - SOURCE nodes attach via HAS_SOURCE edges
 * - INTELLIGENCE nodes attach via HAS_INTELLIGENCE edges
 *
 * VEHICLE_ROOT nodes do not have bindings (they are not attached to other roots).
 */
export const ROOT_BINDING_RULES: Partial<Record<GraphNodeType, GraphEdgeType>> = {
  [GraphNodeType.EVENT]: GraphEdgeType.HAS_EVENT,
  [GraphNodeType.SOURCE]: GraphEdgeType.HAS_SOURCE,
  [GraphNodeType.INTELLIGENCE]: GraphEdgeType.HAS_INTELLIGENCE,
};
