/**
 * Window Type Compatibility Mapping
 * Encodes valid combinations of WindowType and WindowRole.
 * Prevents ambiguous or structurally invalid combinations.
 * 
 * Responsibility: Provide deterministic constraint validation for temporal contracts.
 * This is a structural constraint guide, not business logic.
 */

import { WindowType, WindowRole } from "./WindowType.ts";
import type { WindowTypeContract } from "./WindowType.ts";

/**
 * Valid combinations mapping.
 * Key: WindowType, Value: Array of valid WindowRole values for that type.
 * 
 * Design rationale:
 * - REFERENCE type windows must be ANCHOR (fixed point) or PRIMARY (main reference)
 * - COMPARISON type windows must be PRIMARY (under investigation) or SECONDARY (support)
 * - BASELINE type windows must be CONTROL (unaffected) or ANCHOR (fixed baseline)
 * - SNAPSHOT type windows must be PRIMARY (point-in-time main) or SECONDARY (point-in-time support)
 */
export const VALID_WINDOW_TYPE_ROLES: Record<WindowType, WindowRole[]> = {
  [WindowType.REFERENCE]: [WindowRole.ANCHOR, WindowRole.PRIMARY],
  [WindowType.COMPARISON]: [WindowRole.PRIMARY, WindowRole.SECONDARY],
  [WindowType.BASELINE]: [WindowRole.CONTROL, WindowRole.ANCHOR],
  [WindowType.SNAPSHOT]: [WindowRole.PRIMARY, WindowRole.SECONDARY],
};

/**
 * Validate a window type contract against allowed combinations.
 * 
 * Deterministic constraint check - no side effects, no inference.
 * 
 * @param contract - WindowTypeContract to validate
 * @returns true if the type/role combination is valid, false otherwise
 */
export function isValidWindowTypeContract(contract: WindowTypeContract): boolean {
  const allowedRoles = VALID_WINDOW_TYPE_ROLES[contract.type];
  return allowedRoles.includes(contract.role);
}

/**
 * Get human-readable error message for invalid type/role combination.
 * 
 * @param contract - WindowTypeContract that failed validation
 * @returns Descriptive error message
 */
export function getWindowTypeValidationError(contract: WindowTypeContract): string {
  const allowedRoles = VALID_WINDOW_TYPE_ROLES[contract.type];
  return `Window type '${contract.type}' does not support role '${contract.role}'. Allowed roles: ${allowedRoles.join(", ")}`;
}

/**
 * WindowTypeCompatibility documentation reference.
 * 
 * Type/Role Compatibility Matrix:
 * 
 * REFERENCE (authoritative baseline for comparison)
 *   └─ ANCHOR: Fixed reference point for alignment
 *   └─ PRIMARY: Main reference window in analysis
 * 
 * COMPARISON (window being measured against reference)
 *   └─ PRIMARY: Main window under investigation
 *   └─ SECONDARY: Supporting window for context
 * 
 * BASELINE (historical control window for anomaly detection)
 *   └─ CONTROL: Unaffected control baseline
 *   └─ ANCHOR: Fixed baseline point
 * 
 * SNAPSHOT (point-in-time state capture)
 *   └─ PRIMARY: Point-in-time main state
 *   └─ SECONDARY: Point-in-time support state
 */
