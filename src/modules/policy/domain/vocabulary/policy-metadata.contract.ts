import type { PolicyKind } from "./policy-kind.enum.js";
import type { PolicyStatus } from "./policy-status.enum.js";
import type { PolicyScope } from "./policy-scope.enum.js";
import type { PolicyTriggerSource } from "./policy-trigger-source.enum.js";
import type { PolicyPriority } from "./policy-priority.enum.js";
import type { ApprovalMode } from "./approval-mode.enum.js";

/**
 * PolicyMetadata - Pure composition of policy vocabulary terms
 * Represents policy classification only, no governance/audit/history.
 */
export interface PolicyMetadata {
  readonly kind: PolicyKind;
  readonly status: PolicyStatus;
  readonly scope: PolicyScope;
  readonly triggerSource: PolicyTriggerSource;
  readonly priority: PolicyPriority;
  readonly approvalMode: ApprovalMode;
}
