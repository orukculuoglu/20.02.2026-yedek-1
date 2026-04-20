/**
 * PolicyPriority - Domain vocabulary for policy priority level
 * Pure vocabulary term with no runtime behavior.
 */
export enum PolicyPriority {
  LOWEST = "lowest",
  VERY_LOW = "very_low",
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  VERY_HIGH = "very_high",
  CRITICAL = "critical",
}

/**
 * Type-safe policy priority value type
 */
export type PolicyPriorityValue = `${PolicyPriority}`;

/**
 * Bounded set of all valid policy priorities
 */
export const POLICY_PRIORITIES_ALL: ReadonlyArray<PolicyPriority> =
  Object.values(PolicyPriority);
