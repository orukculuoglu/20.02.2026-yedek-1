/**
 * Action Audit Layer - Pure declarative audit contracts
 * Phase 1: Action Log Foundation
 * Phase 2: Policy Traceability
 * Phase 3: Evidence / Decision Audit
 * Phase 4: Audit Consumption Surface
 */

// Phase 1: Action Log Foundation
export {
  ActionLogEventKind,
  ACTION_LOG_EVENT_KINDS_ALL,
} from "./action-log-event-kind.enum.js";
export type { ActionLogEventKindValue } from "./action-log-event-kind.enum.js";

export {
  ActionLogSource,
  ACTION_LOG_SOURCES_ALL,
} from "./action-log-source.enum.js";
export type { ActionLogSourceValue } from "./action-log-source.enum.js";

export type { ActionLogReference } from "./action-log-reference.contract.js";
export type { ActionLogActorReference } from "./action-log-actor-reference.contract.js";
export type { ActionAuditLinkage } from "./action-audit-linkage.contract.js";
export type { ActionLogEventRecord } from "./action-log-event-record.contract.js";
export type { ActionLog } from "./action-log-aggregate.contract.js";

// Phase 2: Policy Traceability
export { PolicyTraceKind, POLICY_TRACE_KINDS_ALL } from "./policy-trace-kind.enum.js";
export type { PolicyTraceKindValue } from "./policy-trace-kind.enum.js";

export type { PolicyTraceReference } from "./policy-trace-reference.contract.js";
export type { PolicyEvaluationTrace } from "./policy-evaluation-trace.contract.js";
export type { PolicyRuleTrace } from "./policy-rule-trace.contract.js";
export type { ThresholdTrace } from "./threshold-trace.contract.js";
export type { ApprovalBoundaryTrace } from "./approval-boundary-trace.contract.js";
export type { ActionSelectionTraceReference } from "./action-selection-trace-reference.contract.js";
export type { ActionHandoffTraceReference } from "./action-handoff-trace-reference.contract.js";
export type { ActionOutcomeTraceReference } from "./action-outcome-trace-reference.contract.js";
export type { PolicyTrace } from "./policy-trace-aggregate.contract.js";

// Phase 3: Evidence / Decision Audit
export {
  AuditEvidenceKind,
  AUDIT_EVIDENCE_KINDS_ALL,
} from "../evidence/audit-evidence-kind.enum.js";
export type { AuditEvidenceKindValue } from "../evidence/audit-evidence-kind.enum.js";

export type { AuditEvidenceReference } from "../evidence/audit-evidence-reference.contract.js";

export {
  DecisionAuditKind,
  DECISION_AUDIT_KINDS_ALL,
} from "../evidence/decision-audit-kind.enum.js";
export type { DecisionAuditKindValue } from "../evidence/decision-audit-kind.enum.js";

export {
  DecisionRationaleCode,
  DECISION_RATIONALE_CODES_ALL,
} from "../evidence/decision-rationale-code.enum.js";
export type { DecisionRationaleCodeValue } from "../evidence/decision-rationale-code.enum.js";

export type { DecisionRationale } from "../evidence/decision-rationale.contract.js";
export type { SelectedActionAuditExplanation } from "../evidence/selected-action-audit-explanation.contract.js";
export type { RejectedActionAuditExplanation } from "../evidence/rejected-action-audit-explanation.contract.js";
export type { SuppressedActionAuditExplanation } from "../evidence/suppressed-action-audit-explanation.contract.js";
export type { DeferredActionAuditExplanation } from "../evidence/deferred-action-audit-explanation.contract.js";
export type { EvidenceDecisionLinkage } from "../evidence/evidence-decision-linkage.contract.js";
export type { AuditSummary } from "../evidence/audit-summary.contract.js";
export type { EvidenceDecisionAudit } from "../evidence/evidence-decision-audit-aggregate.contract.js";

// Phase 4: Audit Consumption Surface
export {
  AuditConsumptionKind,
  AUDIT_CONSUMPTION_KINDS_ALL,
} from "../consumption/audit-consumption-kind.enum.js";
export type { AuditConsumptionKindValue } from "../consumption/audit-consumption-kind.enum.js";

export type { AuditReadModel } from "../consumption/audit-read-model.contract.js";
export type { ActionAuditView } from "../consumption/action-audit-view.contract.js";
export type { PolicyTraceView } from "../consumption/policy-trace-view.contract.js";
export type { EvidenceDecisionAuditView } from "../consumption/evidence-decision-audit-view.contract.js";
export type { AuditExplanationView } from "../consumption/audit-explanation-view.contract.js";
export type { AuditSummaryView } from "../consumption/audit-summary-view.contract.js";
export type { AuditConsumption } from "../consumption/audit-consumption-aggregate.contract.js";
