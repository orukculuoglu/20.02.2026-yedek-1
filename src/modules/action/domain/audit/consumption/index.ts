/**
 * Action Audit Layer Phase 4 - Audit Consumption Surface
 * Pure declarative audit consumption/read surface
 */

// Audit consumption vocabulary
export {
  AuditConsumptionKind,
  AUDIT_CONSUMPTION_KINDS_ALL,
} from "./audit-consumption-kind.enum.js";
export type { AuditConsumptionKindValue } from "./audit-consumption-kind.enum.js";

// Audit read model reference
export type { AuditReadModel } from "./audit-read-model.contract.js";

// Consumption views
export type { ActionAuditView } from "./action-audit-view.contract.js";
export type { PolicyTraceView } from "./policy-trace-view.contract.js";
export type { EvidenceDecisionAuditView } from "./evidence-decision-audit-view.contract.js";
export type { AuditExplanationView } from "./audit-explanation-view.contract.js";
export type { AuditSummaryView } from "./audit-summary-view.contract.js";

// Main aggregate
export type { AuditConsumption } from "./audit-consumption-aggregate.contract.js";
