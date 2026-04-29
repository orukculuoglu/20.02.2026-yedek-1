import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { ActionAuditView } from "./action-audit-view.contract.js";
import type { PolicyTraceView } from "./policy-trace-view.contract.js";
import type { EvidenceDecisionAuditView } from "./evidence-decision-audit-view.contract.js";
import type { AuditExplanationView } from "./audit-explanation-view.contract.js";
import type { AuditSummaryView } from "./audit-summary-view.contract.js";

/**
 * AuditConsumptionBase - Base structure for audit consumption aggregate
 */
interface AuditConsumptionBase {
  readonly consumptionId: string;
  readonly actionLogView?: ActionAuditView;
  readonly policyTraceView?: PolicyTraceView;
  readonly evidenceDecisionView?: EvidenceDecisionAuditView;
  readonly explanationView?: AuditExplanationView;
  readonly summaryView?: AuditSummaryView;
}

/**
 * AuditConsumption - Non-hollow audit consumption aggregate
 * Union ensures at least one view is present.
 */
export type AuditConsumption =
  | (AuditConsumptionBase & { readonly actionLogView: ActionAuditView })
  | (AuditConsumptionBase & { readonly policyTraceView: PolicyTraceView })
  | (AuditConsumptionBase & { readonly evidenceDecisionView: EvidenceDecisionAuditView })
  | (AuditConsumptionBase & { readonly explanationView: AuditExplanationView })
  | (AuditConsumptionBase & { readonly summaryView: AuditSummaryView });
