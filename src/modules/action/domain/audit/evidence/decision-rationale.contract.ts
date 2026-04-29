import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { DecisionRationaleCode } from "./decision-rationale-code.enum.js";

/**
 * DecisionRationale - Structural decision rationale reference
 * Reference-only surface: no evaluation logic, no runtime decision computation
 */
export interface DecisionRationale {
  readonly decisionRationaleId: string;
  readonly rationaleCode: DecisionRationaleCode;
  readonly policyTraceId?: string;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
  readonly candidateActionId?: string;
  readonly selectedActionId?: string;
  readonly selectionId?: string;
  readonly handoffId?: string;
  readonly outcomeId?: string;
}
