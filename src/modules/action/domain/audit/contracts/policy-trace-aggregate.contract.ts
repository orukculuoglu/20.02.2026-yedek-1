import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { PolicyEvaluationTrace } from "./policy-evaluation-trace.contract.js";
import type { PolicyRuleTrace } from "./policy-rule-trace.contract.js";
import type { ThresholdTrace } from "./threshold-trace.contract.js";
import type { ApprovalBoundaryTrace } from "./approval-boundary-trace.contract.js";
import type { ActionSelectionTraceReference } from "./action-selection-trace-reference.contract.js";
import type { ActionHandoffTraceReference } from "./action-handoff-trace-reference.contract.js";
import type { ActionOutcomeTraceReference } from "./action-outcome-trace-reference.contract.js";

/**
 * PolicyTraceBase - Shared base for policy traceability variants
 */
interface PolicyTraceBase {
  readonly policyTraceId: string;
  readonly evaluationTraces?: ReadonlyArray<PolicyEvaluationTrace>;
  readonly ruleTraces?: ReadonlyArray<PolicyRuleTrace>;
  readonly thresholdTraces?: ReadonlyArray<ThresholdTrace>;
  readonly approvalBoundaryTraces?: ReadonlyArray<ApprovalBoundaryTrace>;
  readonly actionSelectionReference?: ActionSelectionTraceReference;
  readonly actionHandoffReference?: ActionHandoffTraceReference;
  readonly actionOutcomeReference?: ActionOutcomeTraceReference;
}

/**
 * PolicyTrace - Non-hollow policy traceability aggregate
 * Union-based: at least one trace section/reference required
 */
export type PolicyTrace =
  | (PolicyTraceBase & { readonly evaluationTraces: NonEmptyReadonlyArray<PolicyEvaluationTrace> })
  | (PolicyTraceBase & { readonly ruleTraces: NonEmptyReadonlyArray<PolicyRuleTrace> })
  | (PolicyTraceBase & { readonly thresholdTraces: NonEmptyReadonlyArray<ThresholdTrace> })
  | (PolicyTraceBase & { readonly approvalBoundaryTraces: NonEmptyReadonlyArray<ApprovalBoundaryTrace> })
  | (PolicyTraceBase & { readonly actionSelectionReference: ActionSelectionTraceReference })
  | (PolicyTraceBase & { readonly actionHandoffReference: ActionHandoffTraceReference })
  | (PolicyTraceBase & { readonly actionOutcomeReference: ActionOutcomeTraceReference });
