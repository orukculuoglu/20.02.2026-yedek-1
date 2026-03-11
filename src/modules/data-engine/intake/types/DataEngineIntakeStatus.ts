/**
 * Data Engine Intake Status
 *
 * Represents the decision outcome of intake evaluation.
 * Supports nuanced operational decisions beyond binary accept/reject.
 */

/**
 * Intake status classification.
 *
 * - ACCEPTED: Feed passes all critical requirements and can proceed
 * - ACCEPTED_WITH_WARNINGS: Feed passes but has non-critical issues requiring attention
 * - REJECTED: Feed fails one or more critical requirements and cannot proceed
 * - QUARANTINED: Feed is valid but risky; requires manual review before proceeding
 */
export type DataEngineIntakeStatus =
  | 'ACCEPTED'
  | 'ACCEPTED_WITH_WARNINGS'
  | 'REJECTED'
  | 'QUARANTINED';
