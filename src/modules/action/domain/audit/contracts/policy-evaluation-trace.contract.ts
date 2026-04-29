/**
 * PolicyEvaluationTrace - Links audit trace to policy evaluation structures
 */
export interface PolicyEvaluationTrace {
  readonly traceId: string;
  readonly policyId: string;
  readonly evaluationId: string;
  readonly evaluationInputReference?: string;
  readonly evaluationResultReference?: string;
}
