/**
 * Data Engine Binding Issue
 *
 * Represents a specific identity binding concern encountered during evaluation.
 * Issues inform the final binding decision: whether they block, limit, or quarantine the feed.
 */

import type { DataEngineBindingIssueCode } from '../types/DataEngineBindingIssueCode';

/**
 * Binding issue model.
 *
 * Describes a specific problem encountered during identity binding evaluation.
 * Multiple issues can accumulate and collectively determine the binding outcome.
 *
 * Severity levels:
 *   BLOCKING: Issue prevents any binding outcome other than REJECTED or QUARANTINED
 *   LIMITING: Issue permits BOUND_WITH_LIMITATIONS but not full BOUND
 *   WARNING: Issue noted but does not prevent full BOUND
 */
export interface DataEngineBindingIssue {
  /**
   * Machine-readable issue code.
   * Uniquely identifies the type of binding concern.
   */
  readonly issueCode: DataEngineBindingIssueCode;

  /**
   * Issue severity level.
   *
   * BLOCKING:
   *   Hard failure in binding evaluation.
   *   Multiple blocking issues lead to REJECTED or QUARANTINED.
   *   Only one blocking issue is often sufficient to prevent BOUND outcome.
   *
   * LIMITING:
   *   Issue permits binding but with operational limitations.
   *   Multiple limiting issues → BOUND_WITH_LIMITATIONS.
   *   Limiting issues do not alone cause rejection or quarantine.
   *
   * WARNING:
   *   Issue is noted for operational awareness.
   *   Does not change binding outcome in most cases.
   *   Intent: inform downstream systems of known identity context concerns.
   */
  readonly severity: 'BLOCKING' | 'LIMITING' | 'WARNING';

  /**
   * Human-readable issue description.
   * Explains what was found and why it's a concern.
   *
   * Examples:
   * - "Identity has been revoked as of 2026-02-15"
   * - "Identity issuer 'TELEMATICS_PROVIDER_XYZ' does not match expected SERVICE issuer"
   * - "Federation context incomplete; federated identity chain cannot be validated"
   */
  readonly message: string;

  /**
   * Identity context field affected (optional).
   * Helps pinpoint which part of identity context is problematic.
   *
   * Examples:
   * - "issuerContext"
   * - "scope"
   * - "environment"
   * - "expiresAt"
   */
  readonly fieldReference?: string;

  /**
   * Whether this issue can theoretically be remedied.
   * True means: upstream system could resubmit with corrected context.
   * False means: issue cannot be fixed by providing more information.
   *
   * Examples:
   * - remediable: true → MISSING_ISSUER_CONTEXT (can be added)
   * - remediable: false → REVOKED_IDENTITY (cannot be undone)
   * - remediable: false → EXPIRED_IDENTITY (only passes with time or policy change)
   */
  readonly remediable: boolean;
}
