/**
 * Policy Approval Boundary Contracts - Phase 4 Export Surface
 * Compile-time approval boundary definition layer for Motor 3 Policy Foundation
 * Strict, declarative, contract-first - zero workflow semantics
 */

// Approval boundary kind vocabulary
export {
  ApprovalBoundaryKind,
  type ApprovalBoundaryKindValue,
  APPROVAL_BOUNDARY_KINDS_ALL,
} from "./approval-boundary-kind.enum.js";

// Approver role vocabulary
export {
  ApproverRole,
  type ApproverRoleValue,
  APPROVER_ROLES_ALL,
} from "./approver-role.enum.js";

// Approval boundary reference
export type { ApprovalBoundaryReference } from "./approval-boundary-reference.contract.js";

// Auto-approval boundary definition
export type { AutoApprovalBoundary } from "./auto-approval-boundary.contract.js";

// Manual approval boundary definition
export type { ManualApprovalBoundary } from "./manual-approval-boundary.contract.js";

// Confirmation-required boundary definition
export type { ConfirmationRequiredBoundary } from "./confirmation-required-boundary.contract.js";

// Blocked approval boundary definition
export type { BlockedApprovalBoundary } from "./blocked-approval-boundary.contract.js";

// Deferred approval boundary definition
export type { DeferredApprovalBoundary } from "./deferred-approval-boundary.contract.js";

// Escalated approval boundary definition
export type { EscalatedApprovalBoundary } from "./escalated-approval-boundary.contract.js";

// Approval requirement binding structure
export type { ApprovalRequirementBinding } from "./approval-requirement-binding.contract.js";

// Policy-level approval boundary aggregation (with structural enforcement)
export type { PolicyApprovalBoundarySet } from "./policy-approval-boundary-set.contract.js";
