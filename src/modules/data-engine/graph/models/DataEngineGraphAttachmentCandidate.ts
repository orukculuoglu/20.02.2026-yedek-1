/**
 * Data Engine Graph Attachment Candidate
 *
 * Input to the graph attachment engine.
 * Represents a normalized entity ready for graph structure construction.
 */

import type { DataEngineEntity } from '../../normalization/models/DataEngineEntity';

export interface DataEngineGraphAttachmentCandidate {
  /**
   * Normalized entity from Phase 4 (normalization layer).
   */
  entity: DataEngineEntity;

  /**
   * Anonymous vehicle identity binding context (source reference only).
   * Not used for graph logic; preserved for audit trail.
   */
  identityBindingRef: {
    identityId: string;
    bindingStatus: string;
  };
}
