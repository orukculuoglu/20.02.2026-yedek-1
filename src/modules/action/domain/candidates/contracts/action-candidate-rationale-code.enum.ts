/**
 * ActionCandidateRationaleCode - Bounded vocabulary for structural rationale of action candidates
 * Identifies the reason or category explaining why a candidate action exists from policy structure perspective.
 * Captures only candidate-definition justifications, not evaluation outcomes or runtime state.
 * Pure vocabulary; no decision logic or narrative generation.
 */
export enum ActionCandidateRationaleCode {
  /**
   * Candidate generated because a policy rule matched
   */
  RULE_MATCH_TRIGGERED = "rule_match_triggered",

  /**
   * Candidate generated because a policy rule did not match and remediation action is needed
   */
  RULE_MISMATCH_REMEDIATION = "rule_mismatch_remediation",

  /**
   * Candidate generated because evidence required by policy is missing
   */
  EVIDENCE_MISSING = "evidence_missing",
}

/**
 * ActionCandidateRationaleCode value type for serialized rationale code strings
 */
export type ActionCandidateRationaleCodeValue = `${ActionCandidateRationaleCode}`;

/**
 * All values in ActionCandidateRationaleCode for bounded collection usage
 */
export const ACTION_CANDIDATE_RATIONALE_CODES_ALL = Object.freeze([
  ActionCandidateRationaleCode.RULE_MATCH_TRIGGERED,
  ActionCandidateRationaleCode.RULE_MISMATCH_REMEDIATION,
  ActionCandidateRationaleCode.EVIDENCE_MISSING,
] as const);
