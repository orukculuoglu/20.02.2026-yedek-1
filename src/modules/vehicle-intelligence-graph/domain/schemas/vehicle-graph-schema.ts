/**
 * Vehicle Intelligence Graph - Aggregate Schema
 *
 * Represents the complete in-memory graph structure for a single vehicle.
 * Aggregates all nodes (root, events, sources, intelligence) and edges.
 *
 * This schema serves as the canonical representation for:
 * - Graph queries and traversal
 * - Analytics and intelligence projection
 * - Data persistence and reconstruction
 * - Serialization and export
 */

import type { VehicleRootNode } from '../nodes/vehicle-root-node';
import type { EventNode } from '../nodes/event-node';
import type { SourceNode } from '../nodes/source-node';
import type { IntelligenceNode } from '../nodes/intelligence-node';
import type { GraphEdge } from '../edges/graph-edge';

/**
 * Complete vehicle intelligence graph structure
 *
 * Represents all nodes and edges associated with a single vehicle.
 * Forms the atomic unit for graph operations, storage, and analysis.
 */
export interface VehicleGraphSchema {
  /**
   * Root node anchoring the vehicle in the graph
   *
   * Every vehicle graph has exactly one root node that serves as
   * the entry point for all relationships and subgraphs.
   */
  root: VehicleRootNode;

  /**
   * All event nodes related to this vehicle
   *
   * Events represent concrete occurrences including services,
   * inspections, faults, claims, and diagnostic observations.
   */
  events: EventNode[];

  /**
   * All source nodes providing data to this vehicle graph
   *
   * Sources represent the origins of data: OEM systems, insurance feeds,
   * fleet management platforms, diagnostic equipment, and manual entry.
   */
  sources: SourceNode[];

  /**
   * All intelligence nodes derived from events and sources
   *
   * Intelligence represents higher-order insights: maintenance tendencies,
   * anomalies, component weakness, behavior clusters, and risk indicators.
   */
  intelligence: IntelligenceNode[];

  /**
   * All edges connecting the graph nodes
   *
   * Edges define relationships between nodes (events-to-events,
   * sources-to-events, events-to-intelligence, etc.)
   * and support the complete graph traversal.
   */
  edges: GraphEdge[];
}
