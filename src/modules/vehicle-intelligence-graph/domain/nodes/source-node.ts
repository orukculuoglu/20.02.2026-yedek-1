/**
 * Vehicle Intelligence Graph - Source Node
 *
 * Represents the origin of data in the vehicle intelligence graph.
 *
 * Sources are the starting points for data entry into the graph,
 * including expertise platforms, service systems, insurance feeds,
 * fleet systems, manual entry channels, and derived internal systems.
 *
 * Extends: GraphNode
 */

import type { GraphNode } from './graph-node';
import { GraphNodeType } from '../enums/graph-node-type';

/**
 * Node representing a data source
 *
 * Provides the origin and classification of data feeding into the graph:
 * - OEM service systems
 * - Insurance claim platforms
 * - Commercial fleet management systems
 * - Diagnostic equipment feeds
 * - Manual data entry channels
 * - Internal calculation/derivation
 */
export interface SourceNode extends GraphNode {
  /**
   * Always SOURCE for this node type
   */
  nodeType: GraphNodeType.SOURCE;

  /**
   * Classification of the source
   *
   * Examples: "oem_service_system", "insurance_feed", "fleet_management",
   *           "diagnostic_equipment", "manual_entry", "internal_derivation"
   */
  sourceType: string;

  /**
   * System or platform name that provided the data
   *
   * Examples: "autodata_service_api", "insurance_claims_hub",
   *           "fleet_telematics_platform", "diagnostic_scanner_network"
   */
  sourceSystem?: string;

  /**
   * Domain or category of the source system
   *
   * Examples: "maintenance", "insurance", "fleet_operations", "diagnostics"
   */
  sourceDomain?: string;

  /**
   * External record reference for traceability
   *
   * Links back to the original record in the source system.
   * Format depends on source: service ticket ID, claim number, vehicle ID, etc.
   */
  sourceRecordRef?: string;

  /**
   * ISO 8601 timestamp when the data was ingested from the source
   */
  ingestedAt?: string;
}
