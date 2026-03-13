/**
 * Data Engine Timeline Entry Type
 *
 * Defines the taxonomy of operational timeline entry types.
 *
 * Each type represents a specific operational action category
 * derived from acceptance evaluations.
 */

/**
 * MONITORING_ENTRY
 *
 * Represents ongoing observation/monitoring of vehicle signals.
 * Triggered by WATCH acceptance status.
 *
 * Example: "Monitor component health monthly"
 * Window: NEXT_30_DAYS (repeating)
 * Priority: LOW or MEDIUM
 */
export const MONITORING_ENTRY = 'MONITORING_ENTRY' as const;

/**
 * MAINTENANCE_REVIEW_ENTRY
 *
 * Represents planned maintenance review and decision-making.
 * Triggered by ESCALATE acceptance status.
 *
 * Example: "Review maintenance requirements for service dependency"
 * Window: NEXT_30_DAYS
 * Priority: MEDIUM or HIGH
 */
export const MAINTENANCE_REVIEW_ENTRY = 'MAINTENANCE_REVIEW_ENTRY' as const;

/**
 * SERVICE_INSPECTION_ENTRY
 *
 * Represents scheduled service inspection.
 * Triggered by ESCALATE acceptance status (for components/temporal).
 *
 * Example: "Schedule component inspection"
 * Window: NEXT_30_DAYS or NEXT_SERVICE_WINDOW
 * Priority: MEDIUM or HIGH
 */
export const SERVICE_INSPECTION_ENTRY = 'SERVICE_INSPECTION_ENTRY' as const;

/**
 * URGENT_REVIEW_ENTRY
 *
 * Represents urgent specialist review required.
 * Triggered by REJECTED acceptance status (non-critical).
 *
 * Example: "Urgent review of composite risk alignment"
 * Window: NEXT_SERVICE_WINDOW or IMMEDIATE
 * Priority: HIGH
 */
export const URGENT_REVIEW_ENTRY = 'URGENT_REVIEW_ENTRY' as const;

/**
 * CRITICAL_ATTENTION_ENTRY
 *
 * Represents critical immediate attention required.
 * Triggered by REJECTED acceptance status (critical signals).
 *
 * Example: "Critical multi-domain alignment requires immediate attention"
 * Window: IMMEDIATE
 * Priority: CRITICAL
 */
export const CRITICAL_ATTENTION_ENTRY = 'CRITICAL_ATTENTION_ENTRY' as const;

/**
 * Union type of all timeline entry types
 */
export type DataEngineTimelineEntryType =
  | typeof MONITORING_ENTRY
  | typeof MAINTENANCE_REVIEW_ENTRY
  | typeof SERVICE_INSPECTION_ENTRY
  | typeof URGENT_REVIEW_ENTRY
  | typeof CRITICAL_ATTENTION_ENTRY;

/**
 * Array of all entry types for iteration
 */
export const ALL_TIMELINE_ENTRY_TYPES: DataEngineTimelineEntryType[] = [
  MONITORING_ENTRY,
  MAINTENANCE_REVIEW_ENTRY,
  SERVICE_INSPECTION_ENTRY,
  URGENT_REVIEW_ENTRY,
  CRITICAL_ATTENTION_ENTRY,
];

/**
 * Timeline entry type descriptions
 */
export const TIMELINE_ENTRY_TYPE_DESCRIPTIONS: Record<
  DataEngineTimelineEntryType,
  string
> = {
  MONITORING_ENTRY: 'Ongoing monitoring and observation',
  MAINTENANCE_REVIEW_ENTRY: 'Planned maintenance review and planning',
  SERVICE_INSPECTION_ENTRY: 'Scheduled service inspection',
  URGENT_REVIEW_ENTRY: 'Urgent specialist review required',
  CRITICAL_ATTENTION_ENTRY: 'Critical immediate attention required',
};
