/**
 * Data Engine Timeline Priority
 *
 * Defines priority levels for timeline entries.
 *
 * Priority determines operational urgency and sequencing.
 */

/**
 * LOW Priority
 *
 * Routine monitoring or low-urgency action.
 * Can be deferred or batched with other low-priority items.
 *
 * Examples:
 * - Routine monitoring entries
 * - Non-critical observations
 */
export const LOW = 'LOW' as const;

/**
 * MEDIUM Priority
 *
 * Moderate-urgency action requiring planning.
 * Should be scheduled within normal operational windows.
 *
 * Examples:
 * - Maintenance review entries
 * - Monitor entries with concerning signals
 */
export const MEDIUM = 'MEDIUM' as const;

/**
 * HIGH Priority
 *
 * High-urgency action requiring prompt scheduling.
 * Should be escalated to next available service window.
 *
 * Examples:
 * - Service inspection entries
 * - Urgent review entries
 */
export const HIGH = 'HIGH' as const;

/**
 * CRITICAL Priority
 *
 * Immediate critical action required.
 * Must be addressed immediately or deferred only with explicit decision.
 *
 * Examples:
 * - Critical attention entries
 * - Multi-domain critical convergence
 */
export const CRITICAL = 'CRITICAL' as const;

/**
 * Union type of all priorities
 */
export type DataEngineTimelinePriority =
  | typeof LOW
  | typeof MEDIUM
  | typeof HIGH
  | typeof CRITICAL;

/**
 * Array of all priorities for iteration
 */
export const ALL_TIMELINE_PRIORITIES: DataEngineTimelinePriority[] = [LOW, MEDIUM, HIGH, CRITICAL];

/**
 * Priority severity ordering (CRITICAL is highest/most severe)
 */
export const PRIORITY_SEVERITY: Record<DataEngineTimelinePriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

/**
 * Get the highest/most severe priority from a list
 */
export function getHighestPriority(
  priorities: DataEngineTimelinePriority[]
): DataEngineTimelinePriority {
  if (priorities.length === 0) return LOW;

  return priorities.reduce((highest, current) => {
    return PRIORITY_SEVERITY[current] > PRIORITY_SEVERITY[highest] ? current : highest;
  });
}
