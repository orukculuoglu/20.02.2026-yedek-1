/**
 * PolicyKind - Domain vocabulary for policy type classification
 * Pure vocabulary term with no runtime behavior.
 */
export enum PolicyKind {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  ADAPTIVE = "adaptive",
  CONDITIONAL = "conditional",
  REACTIVE = "reactive",
}

/**
 * Type-safe policy kind value type
 */
export type PolicyKindValue = `${PolicyKind}`;

/**
 * Bounded set of all valid policy kinds
 */
export const POLICY_KINDS_ALL: ReadonlyArray<PolicyKind> = Object.values(
  PolicyKind
);
