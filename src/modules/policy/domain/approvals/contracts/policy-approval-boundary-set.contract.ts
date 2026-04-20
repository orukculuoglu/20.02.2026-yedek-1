import type { AutoApprovalBoundary } from "./auto-approval-boundary.contract.js";
import type { ManualApprovalBoundary } from "./manual-approval-boundary.contract.js";
import type { ConfirmationRequiredBoundary } from "./confirmation-required-boundary.contract.js";
import type { BlockedApprovalBoundary } from "./blocked-approval-boundary.contract.js";
import type { DeferredApprovalBoundary } from "./deferred-approval-boundary.contract.js";
import type { EscalatedApprovalBoundary } from "./escalated-approval-boundary.contract.js";
import type { ApprovalRequirementBinding } from "./approval-requirement-binding.contract.js";
import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * PolicyApprovalBoundarySet - Complete aggregation container for policy-level approval boundary definitions
 * Pure structural aggregation with no approval workflow execution or decision orchestration.
 * Structurally enforced: must contain at least one approval boundary type.
 * An empty approval boundary aggregate is impossible at the type level.
 *
 * Valid structures:
 * - Variant 1: autoApprovalBoundaries required (non-empty)
 * - Variant 2: manualApprovalBoundaries required (non-empty)
 * - Variant 3: confirmationRequiredBoundaries required (non-empty)
 * - Variant 4: blockedApprovalBoundaries required (non-empty)
 * - Variant 5: deferredApprovalBoundaries required (non-empty)
 * - Variant 6: escalatedApprovalBoundaries required (non-empty)
 */
export type PolicyApprovalBoundarySet =
  | {
      readonly policyId: string;
      readonly autoApprovalBoundaries: NonEmptyReadonlyArray<AutoApprovalBoundary>;
      readonly manualApprovalBoundaries?: ReadonlyArray<ManualApprovalBoundary>;
      readonly confirmationRequiredBoundaries?: ReadonlyArray<ConfirmationRequiredBoundary>;
      readonly blockedApprovalBoundaries?: ReadonlyArray<BlockedApprovalBoundary>;
      readonly deferredApprovalBoundaries?: ReadonlyArray<DeferredApprovalBoundary>;
      readonly escalatedApprovalBoundaries?: ReadonlyArray<EscalatedApprovalBoundary>;
      readonly bindings: ReadonlyArray<ApprovalRequirementBinding>;
    }
  | {
      readonly policyId: string;
      readonly autoApprovalBoundaries?: ReadonlyArray<AutoApprovalBoundary>;
      readonly manualApprovalBoundaries: NonEmptyReadonlyArray<ManualApprovalBoundary>;
      readonly confirmationRequiredBoundaries?: ReadonlyArray<ConfirmationRequiredBoundary>;
      readonly blockedApprovalBoundaries?: ReadonlyArray<BlockedApprovalBoundary>;
      readonly deferredApprovalBoundaries?: ReadonlyArray<DeferredApprovalBoundary>;
      readonly escalatedApprovalBoundaries?: ReadonlyArray<EscalatedApprovalBoundary>;
      readonly bindings: ReadonlyArray<ApprovalRequirementBinding>;
    }
  | {
      readonly policyId: string;
      readonly autoApprovalBoundaries?: ReadonlyArray<AutoApprovalBoundary>;
      readonly manualApprovalBoundaries?: ReadonlyArray<ManualApprovalBoundary>;
      readonly confirmationRequiredBoundaries: NonEmptyReadonlyArray<ConfirmationRequiredBoundary>;
      readonly blockedApprovalBoundaries?: ReadonlyArray<BlockedApprovalBoundary>;
      readonly deferredApprovalBoundaries?: ReadonlyArray<DeferredApprovalBoundary>;
      readonly escalatedApprovalBoundaries?: ReadonlyArray<EscalatedApprovalBoundary>;
      readonly bindings: ReadonlyArray<ApprovalRequirementBinding>;
    }
  | {
      readonly policyId: string;
      readonly autoApprovalBoundaries?: ReadonlyArray<AutoApprovalBoundary>;
      readonly manualApprovalBoundaries?: ReadonlyArray<ManualApprovalBoundary>;
      readonly confirmationRequiredBoundaries?: ReadonlyArray<ConfirmationRequiredBoundary>;
      readonly blockedApprovalBoundaries: NonEmptyReadonlyArray<BlockedApprovalBoundary>;
      readonly deferredApprovalBoundaries?: ReadonlyArray<DeferredApprovalBoundary>;
      readonly escalatedApprovalBoundaries?: ReadonlyArray<EscalatedApprovalBoundary>;
      readonly bindings: ReadonlyArray<ApprovalRequirementBinding>;
    }
  | {
      readonly policyId: string;
      readonly autoApprovalBoundaries?: ReadonlyArray<AutoApprovalBoundary>;
      readonly manualApprovalBoundaries?: ReadonlyArray<ManualApprovalBoundary>;
      readonly confirmationRequiredBoundaries?: ReadonlyArray<ConfirmationRequiredBoundary>;
      readonly blockedApprovalBoundaries?: ReadonlyArray<BlockedApprovalBoundary>;
      readonly deferredApprovalBoundaries: NonEmptyReadonlyArray<DeferredApprovalBoundary>;
      readonly escalatedApprovalBoundaries?: ReadonlyArray<EscalatedApprovalBoundary>;
      readonly bindings: ReadonlyArray<ApprovalRequirementBinding>;
    }
  | {
      readonly policyId: string;
      readonly autoApprovalBoundaries?: ReadonlyArray<AutoApprovalBoundary>;
      readonly manualApprovalBoundaries?: ReadonlyArray<ManualApprovalBoundary>;
      readonly confirmationRequiredBoundaries?: ReadonlyArray<ConfirmationRequiredBoundary>;
      readonly blockedApprovalBoundaries?: ReadonlyArray<BlockedApprovalBoundary>;
      readonly deferredApprovalBoundaries?: ReadonlyArray<DeferredApprovalBoundary>;
      readonly escalatedApprovalBoundaries: NonEmptyReadonlyArray<EscalatedApprovalBoundary>;
      readonly bindings: ReadonlyArray<ApprovalRequirementBinding>;
    };
