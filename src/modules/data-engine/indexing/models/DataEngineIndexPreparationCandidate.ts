/**
 * Data Engine Index Preparation Candidate
 *
 * Represents Phase 5 graph output entering Phase 6.
 * Input structure for index preparation engine.
 *
 * NOT a persistence object.
 * Simply the contract for what Phase 5 provides to Phase 6.
 */

import type { DataEngineGraphNode } from '../../graph/models/DataEngineGraphNode';
import type { DataEngineGraphEdge } from '../../graph/models/DataEngineGraphEdge';

export interface DataEngineIndexPreparationCandidate {
  /**
   * Vehicle identity reference.
   * Anchors all index records back to the vehicle.
   */
  identityId: string;

  /**
   * Graph nodes from Phase 5 attachment.
   * Contains VEHICLE, EVENT, OBSERVATION, ACTOR, ASSET nodes.
   */
  nodes: DataEngineGraphNode[];

  /**
   * Graph edges from Phase 5 attachment.
   * Contains relationships between nodes.
   */
  edges: DataEngineGraphEdge[];

  /**
   * Original entity reference.
   * Source of the graph structure.
   */
  sourceEntityRef: string;

  /**
   * Timestamp when graph was attached.
   * Used as reference for index preparation timestamps if needed.
   */
  attachedAt: string;
}
