/**
 * Window Type Definitions
 * Defines the categorical types and roles for temporal windows.
 * No implicit behavior. All window properties are explicit and deterministic.
 */

/**
 * WindowType enum
 * Represents the fundamental nature of a temporal window.
 * - REFERENCE: The authoritative baseline for comparison
 * - COMPARISON: A window being measured against reference(s)
 * - BASELINE: A historical control window for anomaly detection
 * - SNAPSHOT: A point-in-time window for specific state capture
 */
export enum WindowType {
  REFERENCE = "REFERENCE",
  COMPARISON = "COMPARISON",
  BASELINE = "BASELINE",
  SNAPSHOT = "SNAPSHOT",
}

/**
 * WindowRole enum
 * Defines the functional role a window plays in analysis.
 * - PRIMARY: Main window under investigation
 * - SECONDARY: Supporting window for context
 * - CONTROL: Unaffected baseline for comparison
 * - TARGET: Projected/desired state
 * - ANCHOR: Reference point for alignment
 */
export enum WindowRole {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  CONTROL = "CONTROL",
  TARGET = "TARGET",
  ANCHOR = "ANCHOR",
}

/**
 * WindowTypeContract
 * The contract interface for any temporal window.
 * Every window must explicitly declare its type and role.
 * 
 * Constraint Mapping (see WindowTypeCompatibility for full validation):
 * - REFERENCE type: roles can be ANCHOR or PRIMARY
 * - COMPARISON type: roles can be PRIMARY or SECONDARY
 * - BASELINE type: roles can be CONTROL or ANCHOR
 * - SNAPSHOT type: roles can be PRIMARY or SECONDARY
 */
export interface WindowTypeContract {
  type: WindowType;
  role: WindowRole;
}
