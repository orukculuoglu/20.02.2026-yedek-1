/**
 * PolicyTraceKind - Bounded vocabulary for policy trace classification
 */
export enum PolicyTraceKind {
  POLICY_EVALUATION_TRACE = "policy_evaluation_trace",
  POLICY_RULE_TRACE = "policy_rule_trace",
  THRESHOLD_TRACE = "threshold_trace",
  APPROVAL_BOUNDARY_TRACE = "approval_boundary_trace",
  ACTION_SELECTION_TRACE = "action_selection_trace",
  ACTION_HANDOFF_TRACE = "action_handoff_trace",
  ACTION_OUTCOME_TRACE = "action_outcome_trace",
}

export type PolicyTraceKindValue = `${PolicyTraceKind}`;

export const POLICY_TRACE_KINDS_ALL = Object.freeze([
  PolicyTraceKind.POLICY_EVALUATION_TRACE,
  PolicyTraceKind.POLICY_RULE_TRACE,
  PolicyTraceKind.THRESHOLD_TRACE,
  PolicyTraceKind.APPROVAL_BOUNDARY_TRACE,
  PolicyTraceKind.ACTION_SELECTION_TRACE,
  PolicyTraceKind.ACTION_HANDOFF_TRACE,
  PolicyTraceKind.ACTION_OUTCOME_TRACE,
] as const);
