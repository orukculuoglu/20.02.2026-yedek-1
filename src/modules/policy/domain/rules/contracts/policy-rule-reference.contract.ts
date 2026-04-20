/**
 * PolicyRuleReference - Minimal reference contract for policy rules
 * Pure reference structure with no rule loading or resolution behavior.
 */
export interface PolicyRuleReference {
  /**
   * Unique identifier for the referenced rule
   * No rule loading or rule structure resolution included
   */
  readonly ruleId: string;
}
