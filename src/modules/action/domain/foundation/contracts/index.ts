/**
 * Action Type Foundation - Pure declarative action domain vocabulary layer
 * Defines how actions are classified and minimally represented at compile time.
 * Contains no runtime behavior, execution logic, or state management.
 * No hidden defaults; all structural choices explicit.
 */

// Action kind vocabulary
export { ActionKind, ACTION_KINDS_ALL } from "./action-kind.enum.js";
export type { ActionKindValue } from "./action-kind.enum.js";

// Action severity vocabulary
export { ActionSeverity, ACTION_SEVERITIES_ALL } from "./action-severity.enum.js";
export type { ActionSeverityValue } from "./action-severity.enum.js";

// Action reference structures
export type { ActionReference } from "./action-reference.contract.js";
export type { ActionTargetReference } from "./action-target-reference.contract.js";
export type { ActionMetadata } from "./action-metadata.contract.js";
