/**
 * Vehicle Intelligence Graph - Event Node
 *
 * Represents a vehicle-related event in the intelligence graph.
 *
 * Events are concrete occurrences such as inspections, service actions,
 * maintenance activities, faults, claims, or diagnostic observations.
 * Each event provides a normalized event identity and temporal anchor.
 *
 * Extends: GraphNode
 */

import type { GraphNode } from './graph-node';
import { GraphNodeType } from '../enums/graph-node-type';

/**
 * Node representing a vehicle event
 *
 * Captures discrete occurrences in the vehicle's lifecycle including:
 * - Service and maintenance events
 * - Diagnostic and inspection findings
 * - Technical faults and alerts
 * - Claims and incidents
 * - Warranty and compliance events
 */
export interface EventNode extends GraphNode {
  /**
   * Always EVENT for this node type
   */
  nodeType: GraphNodeType.EVENT;

  /**
   * Classification of the event
   *
   * Examples: "service_visit", "diagnostic_scan", "fault_code",
   *           "maintenance_alert", "warranty_claim", "inspection_finding"
   */
  eventType: string;

  /**
   * ISO 8601 timestamp of when the event occurred
   */
  timestamp: string;

  /**
   * Current status of the event
   *
   * Examples: "open", "closed", "resolved", "pending", "escalated"
   */
  eventStatus?: string;

  /**
   * Severity level of the event
   *
   * Examples: "critical", "high", "medium", "low", "info"
   */
  severity?: string;

  /**
   * References to related entities (other events, sources, intelligence nodes)
   *
   * Used to link related events or establish causal chains
   */
  relatedEntities?: string[];
}
