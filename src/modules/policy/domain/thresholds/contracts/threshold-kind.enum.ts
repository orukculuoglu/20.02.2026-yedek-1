/**
 * ThresholdKind - Domain vocabulary for threshold role classification
 * Pure vocabulary term with no evaluation behavior or trigger semantics.
 */
export enum ThresholdKind {
  TRIGGER = "trigger",
  BLOCK = "block",
  ESCALATION = "escalation",
}

/**
 * Type-safe threshold kind value type
 */
export type ThresholdKindValue = `${ThresholdKind}`;

/**
 * Bounded set of all valid threshold kinds
 */
export const THRESHOLD_KINDS_ALL: ReadonlyArray<ThresholdKind> = Object.values(
  ThresholdKind
);
