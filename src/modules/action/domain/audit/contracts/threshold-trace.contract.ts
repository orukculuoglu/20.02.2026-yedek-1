import type { ThresholdKind } from "../../../../policy/domain/thresholds/contracts/threshold-kind.enum.js";

/**
 * ThresholdTrace - Links audit trace to policy threshold structures
 */
export interface ThresholdTrace {
  readonly traceId: string;
  readonly policyId: string;
  readonly thresholdId: string;
  readonly thresholdSetReference?: string;
  readonly thresholdKind?: ThresholdKind;
}
