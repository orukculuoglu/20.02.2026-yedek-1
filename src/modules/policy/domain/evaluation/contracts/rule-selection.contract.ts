import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * RuleSelection - Explicit, bounded rule selection for policy evaluation
 * Pure structural definition of which rules to evaluate in a policy.
 * No hidden semantics: empty collections do not imply special meaning.
 * Rule selection must be explicit: either all rules or specific named rules.
 *
 * Variant 1: ALL - explicitly select all rules in the policy
 * Variant 2: SPECIFIC - explicitly select specific rule IDs (non-empty collection required)
 */
export type RuleSelection =
  | {
      /**
       * Select all rules in the policy for evaluation
       * Explicit declaration; not implied by empty collection
       */
      readonly selectionMode: "ALL";
    }
  | {
      /**
       * Select specific rules identified by their IDs
       * Required: at least one rule ID must be specified
       */
      readonly selectionMode: "SPECIFIC";
      readonly specificRuleIds: NonEmptyReadonlyArray<string>;
    };
