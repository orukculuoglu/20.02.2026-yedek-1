/**
 * Data Engine Graph Attachment Result
 *
 * Output from the graph attachment engine.
 * Contains the constructed graph nodes and edges with audit statistics.
 */

import type { DataEngineGraphNode } from './DataEngineGraphNode';
import type { DataEngineGraphEdge } from './DataEngineGraphEdge';

export interface DataEngineGraphAttachmentResult {
  /**
   * Success status: all attachments succeeded without dropping data.
   */
  success: boolean;

  /**
   * All graph nodes constructed from the entity.
   */
  nodes: DataEngineGraphNode[];

  /**
   * All graph edges (relationships) constructed from the entity.
   */
  edges: DataEngineGraphEdge[];

  /**
   * Audit statistics for monitoring and debugging.
   */
  statistics: {
    /**
     * Total nodes attached.
     */
    nodesCount: number;

    /**
     * Total edges attached.
     */
    edgesCount: number;

    /**
     * Breakdown by node type.
     */
    nodesByType: Record<string, number>;

    /**
     * Breakdown by edge type.
     */
    edgesByType: Record<string, number>;

    /**
     * Source reference (for audit trail).
     */
    sourceEntityRef: string;

    /**
     * Timestamp when attachment was processed.
     */
    attachedAt: string;
  };
}
