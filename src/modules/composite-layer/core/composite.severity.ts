/**
 * CompositeSeverity defines action-oriented severity levels
 * Distinct from bands: a composite can have CRITICAL band but WATCH severity
 * (if only one source is available, for example)
 */
export enum CompositeSeverity {
  /**
   * Informational - no action required
   */
  INFO = 'INFO',

  /**
   * Watch - monitor, no immediate action
   */
  WATCH = 'WATCH',

  /**
   * Elevated - review recommended
   */
  ELEVATED = 'ELEVATED',

  /**
   * High - attention required
   */
  HIGH = 'HIGH',

  /**
   * Critical - immediate action recommended
   */
  CRITICAL = 'CRITICAL',
}

/**
 * Ranking of severity levels (numerical ordering for comparisons)
 * 1 = least actionable, 5 = most actionable
 */
export const SeverityRanking: Record<CompositeSeverity, number> = {
  [CompositeSeverity.INFO]: 1,
  [CompositeSeverity.WATCH]: 2,
  [CompositeSeverity.ELEVATED]: 3,
  [CompositeSeverity.HIGH]: 4,
  [CompositeSeverity.CRITICAL]: 5,
};
