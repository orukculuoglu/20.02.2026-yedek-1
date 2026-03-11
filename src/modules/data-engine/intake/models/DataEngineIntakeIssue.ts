/**
 * Data Engine Intake Issue
 *
 * Represents a single issue detected during intake evaluation.
 * Supports both blocking failures and non-blocking warnings.
 */

import type { DataEngineIntakeIssueCode } from '../types/DataEngineIntakeIssueCode';

/**
 * Intake Issue model.
 *
 * Represents a specific issue encountered during intake evaluation.
 *
 * Issues can be:
 * - BLOCKING: Critical failure, prevents acceptance
 * - WARNING: Non-critical concern, feeds can proceed with policy allowance
 */
export interface DataEngineIntakeIssue {
  /**
   * Machine-readable issue code.
   * Enables structured logging, policy decisions, and remediation tracking.
   */
  readonly issueCode: DataEngineIntakeIssueCode;

  /**
   * Severity level.
   * - BLOCKING: This issue prevents acceptance unless policy allows override
   * - WARNING: This issue is noted but doesn't prevent acceptance
   */
  readonly severity: 'BLOCKING' | 'WARNING';

  /**
   * Field reference (optional).
   * If the issue relates to a specific field, reference it here.
   *
   * Example: 'timestamps.eventTimestamp'
   */
  readonly fieldReference?: string;

  /**
   * Human-readable issue message.
   * Describes what the issue is for operations, debugging, and decision-making.
   *
   * Example: 'Feed provides no identityId linkage; cannot link to known vehicle'
   */
  readonly message: string;

  /**
   * Whether this issue can be remedied by retry/resubmission.
   * True when the issue is transient (delayed feed, timestamp clock drift).
   * False when the issue indicates a structural problem.
   *
   * Used for operational decision-making:
   * - REMEDIABLE: May succeed on resubmission
   * - NOT_REMEDIABLE: Requires upstream fix
   */
  readonly remediable: boolean;
}
