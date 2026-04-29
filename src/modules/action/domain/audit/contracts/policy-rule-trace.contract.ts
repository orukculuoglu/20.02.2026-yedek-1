/**
 * PolicyRuleTrace - Links audit trace to policy rule structures
 */
export interface PolicyRuleTrace {
  readonly traceId: string;
  readonly policyId: string;
  readonly ruleId: string;
  readonly conditionGroupId?: string;
}
