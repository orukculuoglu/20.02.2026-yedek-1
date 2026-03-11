/**
 * Data Engine Normalization Candidate
 *
 * Represents a successfully bound feed that is ready for semantic normalization.
 * This is the input to the normalization engine.
 */

import type { DataEngineIdentityBindingResult } from '../../binding/models/DataEngineIdentityBindingResult';

export interface DataEngineNormalizationCandidate {
  /**
   * Unique reference to the binding result from Phase 3
   */
  bindingResultRef: string;

  /**
   * Identity ID from binding result (guaranteed to be present)
   */
  identityId: string;

  /**
   * Source type classification
   */
  sourceType: string;

  /**
   * Feed payload (source-specific structure)
   * To be transformed into normalized attributes
   */
  feedPayload: Record<string, unknown>;

  /**
   * Feed metadata from envelope
   */
  feedMetadata: {
    schemaVersion?: string;
    sourceSystem?: string;
    classification?: string;
  };

  /**
   * Temporal information
   */
  feedTimestamps: {
    intakeAt: string;
    bindingEvaluatedAt: string;
    normalizationStartsAt?: string;
  };

  /**
   * Reference to original binding result for audit trail (optional)
   */
  bindingResult?: DataEngineIdentityBindingResult;

  /**
   * Reference to original feed envelope for audit trail (optional)
   * Structure varies by source system
   */
  originalEnvelope?: Record<string, unknown>;
}
