/**
 * PolicyTriggerSource - Domain vocabulary for policy trigger mechanism
 * Pure vocabulary term with no runtime behavior.
 */
export enum PolicyTriggerSource {
  EVENT = "event",
  SCHEDULE = "schedule",
  THRESHOLD = "threshold",
  MANUAL = "manual",
  SYSTEM_INIT = "system_init",
  CONTINUOUS = "continuous",
}

/**
 * Type-safe policy trigger source value type
 */
export type PolicyTriggerSourceValue = `${PolicyTriggerSource}`;

/**
 * Bounded set of all valid policy trigger sources
 */
export const POLICY_TRIGGER_SOURCES_ALL: ReadonlyArray<PolicyTriggerSource> =
  Object.values(PolicyTriggerSource);
