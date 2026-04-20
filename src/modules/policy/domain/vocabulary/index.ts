/**
 * Policy Domain Vocabulary Layer
 * Pure declarative vocabulary and reference contracts.
 * No business logic, no runtime behavior, no interpretation.
 */

// Vocabulary enums and types
export { PolicyKind, POLICY_KINDS_ALL, type PolicyKindValue } from "./policy-kind.enum.js";

export { PolicyStatus, POLICY_STATUSES_ALL, type PolicyStatusValue } from "./policy-status.enum.js";

export { PolicyScope, POLICY_SCOPES_ALL, type PolicyScopeValue } from "./policy-scope.enum.js";

export {
  PolicyTriggerSource,
  POLICY_TRIGGER_SOURCES_ALL,
  type PolicyTriggerSourceValue,
} from "./policy-trigger-source.enum.js";

export {
  PolicyPriority,
  POLICY_PRIORITIES_ALL,
  type PolicyPriorityValue,
} from "./policy-priority.enum.js";

export { ApprovalMode, APPROVAL_MODES_ALL, type ApprovalModeValue } from "./approval-mode.enum.js";

// Reference and metadata contracts
export type { PolicyReference } from "./policy-reference.contract.js";

export type { PolicyMetadata } from "./policy-metadata.contract.js";
