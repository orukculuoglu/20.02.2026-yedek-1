/**
 * Vehicle Intelligence Graph - Intelligence Node
 *
 * Represents derived intelligence attached to the vehicle intelligence graph.
 *
 * Intelligence nodes capture interpreted signals, maintenance tendencies,
 * anomaly findings, dependency warnings, behavior clusters, and component
 * weakness indicators derived from events and sources.
 *
 * Extends: GraphNode
 */

import type { GraphNode } from './graph-node';
import { GraphNodeType } from '../enums/graph-node-type';

/**
 * Node representing derived vehicle intelligence
 *
 * Captures higher-order insights and conclusions derived from graph data:
 * - Interpreted diagnostic signals
 * - Maintenance trend analysis
 * - Anomaly and fault predictions
 * - Component degradation patterns
 * - Behavioral risk clustering
 * - Dependency and causality relationships
 */
export interface IntelligenceNode extends GraphNode {
  /**
   * Always INTELLIGENCE for this node type
   */
  nodeType: GraphNodeType.INTELLIGENCE;

  /**
   * Classification of the derived intelligence
   *
   * Examples: "maintenance_tendency", "anomaly_finding", "component_weakness",
   *           "behavior_cluster", "dependency_warning", "interpreted_signal",
   *           "degradation_pattern", "risk_indicator"
   */
  intelligenceType: string;

  /**
   * References to source events/nodes this intelligence was derived from
   *
   * Provides full traceability back to original data
   */
  derivedFrom?: string[];

  /**
   * ISO 8601 timestamp when the intelligence was generated/computed
   */
  generatedAt: string;

  /**
   * Confidence score for the derived intelligence
   *
   * Range: 0.0 to 1.0 (0% to 100%)
   * Indicates the reliability and strength of the conclusion
   */
  confidence?: number;

  /**
   * Human-readable explanation of the intelligence
   *
   * Describes what the intelligence represents and why it was derived
   * Examples: "Component shows 3 failure codes in past 30 days",
   *           "Maintenance pattern suggests oil change overdue",
   *           "Anomalous sensor readings detected"
   */
  explanation?: string;
}
