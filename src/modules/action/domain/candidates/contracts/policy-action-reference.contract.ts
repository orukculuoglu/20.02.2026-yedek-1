/**
 * PolicyActionReference - Minimal reference to the policy source of an action candidate
 * Pure reference structure with no policy loading or resolution behavior.
 * Links candidate back to the policy and optionally the specific rule that produced it.
 */
export interface PolicyActionReference {
  /**
   * Identifier of the policy that is the source of this candidate action
   */
  readonly policyId: string;

  /**
   * Optional identifier of the specific rule within the policy that produced this candidate
   * Present only if the candidate is rule-specific
   */
  readonly ruleId?: string;
}
