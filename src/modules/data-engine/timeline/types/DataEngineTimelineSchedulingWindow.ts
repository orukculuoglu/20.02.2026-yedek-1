/**
 * Data Engine Timeline Scheduling Window
 *
 * Defines deterministic operational time windows for timeline entries.
 */

/**
 * IMMEDIATE
 *
 * Requires immediate action/attention.
 * No delay acceptable.
 */
export const IMMEDIATE = 'IMMEDIATE' as const;

/**
 * NEXT_SERVICE_WINDOW
 *
 * Schedule for next available service window.
 * Typically within 1-2 weeks depending on vehicle usage patterns.
 */
export const NEXT_SERVICE_WINDOW = 'NEXT_SERVICE_WINDOW' as const;

/**
 * NEXT_30_DAYS
 *
 * Schedule within next 30 days.
 * Provides reasonable planning window for non-urgent items.
 */
export const NEXT_30_DAYS = 'NEXT_30_DAYS' as const;

/**
 * NEXT_90_DAYS
 *
 * Schedule within next 90 days.
 * Longer window for routine monitoring and planning.
 */
export const NEXT_90_DAYS = 'NEXT_90_DAYS' as const;

/**
 * Union type of all scheduling windows
 */
export type DataEngineTimelineWindow =
  | typeof IMMEDIATE
  | typeof NEXT_SERVICE_WINDOW
  | typeof NEXT_30_DAYS
  | typeof NEXT_90_DAYS;

/**
 * Array of all windows for iteration
 */
export const ALL_TIMELINE_WINDOWS: DataEngineTimelineWindow[] = [
  IMMEDIATE,
  NEXT_SERVICE_WINDOW,
  NEXT_30_DAYS,
  NEXT_90_DAYS,
];

/**
 * Urgency ordering (IMMEDIATE is highest/most urgent)
 */
export const WINDOW_URGENCY: Record<DataEngineTimelineWindow, number> = {
  IMMEDIATE: 3,
  NEXT_SERVICE_WINDOW: 2,
  NEXT_30_DAYS: 1,
  NEXT_90_DAYS: 0,
};
