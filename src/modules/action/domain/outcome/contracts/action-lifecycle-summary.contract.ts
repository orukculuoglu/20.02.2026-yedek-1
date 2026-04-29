/**
 * ActionLifecycleSummary - Structural summary of action outcome distribution
 * Pure structural summary reporting the distribution of outcome kinds.
 * No computed runtime metrics, duration calculations, or audit trail.
 * Declarative only: reports what was structurally documented.
 */
export interface ActionLifecycleSummary {
  /**
   * Total number of actions with outcomes recorded
   */
  readonly totalActionsOutcomed: number;

  /**
   * Number of actions with successful outcomes
   */
  readonly successCount: number;

  /**
   * Number of actions with failed outcomes
   */
  readonly failedCount: number;

  /**
   * Number of actions with blocked outcomes
   */
  readonly blockedCount: number;

  /**
   * Number of actions with expired outcomes
   */
  readonly expiredCount: number;

  /**
   * Number of actions with cancelled outcomes
   */
  readonly cancelledCount: number;

  /**
   * Number of actions with deferred outcomes
   */
  readonly deferredCount: number;
}
