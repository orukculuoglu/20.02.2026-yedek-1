/**
 * Vehicle Intelligence Graph - Base Edge Contract
 *
 * Represents the base structure for all edges (relationships) in the vehicle intelligence graph.
 *
 * Supported edge types:
 * - HAS_EVENT
 * - HAS_SOURCE
 * - HAS_INTELLIGENCE
 * - GENERATED_BY_SOURCE
 * - DERIVED_INTO
 * - RELATED_TO_EVENT
 * - PRECEDES
 * - OCCURRED_WITHIN_CONTEXT
 */

import type { GraphEdgeType } from '../enums/graph-edge-type';

/**
 * Base structure for all graph edges (relationships)
 */
export interface GraphEdge {
  /**
   * Unique identifier for the edge
   */
  id: string;

  /**
   * Type of edge relationship
   */
  edgeType: GraphEdgeType;

  /**
   * ID of the source node
   */
  fromNodeId: string;

  /**
   * ID of the target node
   */
  toNodeId: string;

  /**
   * Vehicle identifier this edge belongs to
   */
  vehicleId: string;

  /**
   * ISO 8601 timestamp when the edge was created
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp indicating when the edge validity begins
   */
  validFrom?: string;

  /**
   * ISO 8601 timestamp indicating when the edge validity ends
   */
  validTo?: string;

  /**
   * Contextual information about the edge
   * Examples: conditions, environment, state during relationship creation
   */
  context?: Record<string, unknown>;

  /**
   * Provenance information (source, derivation, lineage)
   * Tracks how and where the relationship originated
   */
  provenance?: Record<string, unknown>;

  /**
   * Trust metrics and confidence information
   * Examples: confidence score, relationship strength, validation status
   */
  trust?: Record<string, unknown>;

  /**
   * Additional metadata not covered by standard fields
   * Domain-specific or extension properties
   */
  metadata?: Record<string, unknown>;
}
