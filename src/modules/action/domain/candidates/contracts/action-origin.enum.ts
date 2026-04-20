/**
 * ActionOrigin - Bounded vocabulary for how an action candidate is derived
 * Distinguishes between direct candidates from policy and derived candidates from policy + evaluation.
 * Pure vocabulary; no generation logic.
 */
export enum ActionOrigin {
  /**
   * Direct action: derived directly from policy definition
   */
  DIRECT = "direct",

  /**
   * Derived action: derived from policy in combination with evaluation outcome
   */
  DERIVED = "derived",
}

/**
 * ActionOrigin value type for serialized action origin strings
 */
export type ActionOriginValue = `${ActionOrigin}`;

/**
 * All values in ActionOrigin for bounded collection usage
 */
export const ACTION_ORIGINS_ALL = Object.freeze([
  ActionOrigin.DIRECT,
  ActionOrigin.DERIVED,
] as const);
