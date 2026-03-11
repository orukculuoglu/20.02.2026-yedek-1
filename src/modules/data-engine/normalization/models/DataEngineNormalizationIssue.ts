/**
 * Data Engine Normalization Issue
 *
 * Represents a specific issue encountered during semantic normalization.
 */

import type { DataEngineNormalizationIssueCode } from '../types/DataEngineNormalizationIssueCode';

export interface DataEngineNormalizationIssue {
  /**
   * Specific issue code identifying the problem category
   */
  issueCode: DataEngineNormalizationIssueCode;

  /**
   * Severity level:
   * - BLOCKING: Prevents normalization entirely (results in REJECTED status)
   * - LIMITING: Allows normalization but with caution (results in NORMALIZED_WITH_WARNINGS)
   * - WARNING: Informational; normalization continues without concern
   */
  severity: 'BLOCKING' | 'LIMITING' | 'WARNING';

  /**
   * Human-readable description of the issue
   */
  message: string;

  /**
   * Field path in the payload where issue occurred
   * Example: "feedPayload.repairCodes[0]"
   */
  fieldReference?: string;

  /**
   * Whether this issue can be remedied upstream
   */
  remediable: boolean;

  /**
   * Remediation guidance if remediable
   */
  remediationHint?: string;
}
