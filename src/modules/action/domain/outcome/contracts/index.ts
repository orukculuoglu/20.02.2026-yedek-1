/**
 * Action Outcome Flow Surface - Pure declarative action outcome flow definition layer
 * Defines how action outcome flow outcomes are structurally represented at compile time.
 * Contains no execution logic, dispatch behavior, retry semantics, scheduling, or audit behavior.
 */

// Action outcome kind vocabulary
export {
  ActionOutcomeKind,
  ACTION_OUTCOME_KINDS_ALL,
} from "./action-outcome-kind.enum.js";
export type { ActionOutcomeKindValue } from "./action-outcome-kind.enum.js";

// Outcome rationale vocabulary
export {
  OutcomeRationaleCode,
  OUTCOME_RATIONALE_CODES_ALL,
} from "./outcome-rationale-code.enum.js";
export type { OutcomeRationaleCodeValue } from "./outcome-rationale-code.enum.js";

// Outcome rationale and linkage reference structures
export type { OutcomeRationale } from "./outcome-rationale.contract.js";
export type { OutcomeLinkage } from "./outcome-linkage.contract.js";

// Action outcome kind contracts
export type { SuccessActionOutcome } from "./success-action-outcome.contract.js";
export type { FailedActionOutcome } from "./failed-action-outcome.contract.js";
export type { BlockedActionOutcome } from "./blocked-action-outcome.contract.js";
export type { ExpiredActionOutcome } from "./expired-action-outcome.contract.js";
export type { CancelledActionOutcome } from "./cancelled-action-outcome.contract.js";
export type { DeferredActionOutcome } from "./deferred-action-outcome.contract.js";

// Lifecycle summary and aggregate
export type { ActionLifecycleSummary } from "./action-lifecycle-summary.contract.js";
export type { ActionOutcomeFlow } from "./action-outcome-flow-aggregate.contract.js";
