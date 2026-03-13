/**
 * Data Engine Acceptance Status
 *
 * Defines the structural evaluation outcomes for acceptance criteria.
 *
 * These represent evaluation states, not action states.
 * The conversion from evaluation to action happens in Phase 13+.
 */

/**
 * ACCEPTED — Score meets all acceptance criteria
 *
 * Score is within the accepted threshold range.
 * Vehicle signals are normal and unremarkable.
 * No escalation triggers.
 *
 * Example: Component health score 25 (low degradation = accepted)
 */
export const ACCEPTED = 'ACCEPTED' as const;

/**
 * WATCH — Score exceeds accepted but below escalation trigger
 *
 * Score is elevated but not yet critical.
 * Vehicle shows signals worth monitoring.
 * May trigger observation workflows (in Phase 13+).
 *
 * Example: Component health score 68 (moderate degradation = watch)
 */
export const WATCH = 'WATCH' as const;

/**
 * ESCALATE — Score significantly elevated, requires attention
 *
 * Score is high and crosses escalation threshold.
 * Vehicle shows patterns requiring intervention decision.
 * May trigger prioritization workflows (in Phase 13+).
 *
 * Example: Component health score 82 (high degradation = escalate)
 */
export const ESCALATE = 'ESCALATE' as const;

/**
 * REJECTED — Score exceeds all thresholds
 *
 * Score is critical or invalid.
 * Vehicle signals are severe or data quality is poor.
 * May trigger urgent workflows (in Phase 13+).
 *
 * Example: Component health score 95 (critical degradation = rejected)
 */
export const REJECTED = 'REJECTED' as const;

/**
 * Union type of all acceptance statuses
 */
export type DataEngineAcceptanceStatus =
  | typeof ACCEPTED
  | typeof WATCH
  | typeof ESCALATE
  | typeof REJECTED;

/**
 * Array of all statuses for iteration
 */
export const ALL_ACCEPTANCE_STATUSES: DataEngineAcceptanceStatus[] = [
  ACCEPTED,
  WATCH,
  ESCALATE,
  REJECTED,
];

/**
 * Severity ordering (REJECTED is highest/most severe)
 */
export const ACCEPTANCE_SEVERITY: Record<DataEngineAcceptanceStatus, number> = {
  ACCEPTED: 0,
  WATCH: 1,
  ESCALATE: 2,
  REJECTED: 3,
};

/**
 * Get the most severe status from a list
 */
export function getMostSevereStatus(
  statuses: DataEngineAcceptanceStatus[]
): DataEngineAcceptanceStatus {
  if (statuses.length === 0) return ACCEPTED;
  
  return statuses.reduce((most, current) => {
    return ACCEPTANCE_SEVERITY[current] > ACCEPTANCE_SEVERITY[most] ? current : most;
  });
}
