/**
 * Data Engine Normalization Result
 *
 * Complete output of the semantic normalization process.
 * Includes the normalized entity, status, and complete issue audit trail.
 */

import type { DataEngineNormalizationStatus } from '../types/DataEngineNormalizationStatus';
import type { DataEngineNormalizationIssue } from './DataEngineNormalizationIssue';
import type { DataEngineEntity } from './DataEngineEntity';

export interface DataEngineNormalizationResult {
  /**
   * Normalization outcome status
   */
  status: DataEngineNormalizationStatus;

  /**
   * Normalized entity (present if status is NORMALIZED or NORMALIZED_WITH_WARNINGS)
   */
  entity?: DataEngineEntity;

  /**
   * Complete list of issues encountered
   */
  issues: DataEngineNormalizationIssue[];

  /**
   * Reference to the normalization candidate
   */
  candidateRef: string;

  /**
   * Timestamp of normalization completion
   */
  normalizedAt: string;

  /**
   * Human-readable summary of normalization outcome
   */
  summary: string;

  /**
   * Count of each severity level for quick assessment
   */
  issueStats: {
    blocking: number;
    limiting: number;
    warnings: number;
  };

  /**
   * Indicates whether normalization included inferred or default values
   */
  hasInferredValues: boolean;

  /**
   * Applied schema version for normalization
   */
  appliedSchemaVersion: string;
}
