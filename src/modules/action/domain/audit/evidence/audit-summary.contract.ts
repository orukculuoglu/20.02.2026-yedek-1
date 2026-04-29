/**
 * AuditSummary - Deterministic audit summary surface
 * Count-only reference structure, no computed analytics or timeline
 */
export interface AuditSummary {
  readonly evidenceReferenceCount: number;
  readonly decisionRationaleCount: number;
  readonly selectedExplanationCount: number;
  readonly rejectedExplanationCount: number;
  readonly suppressedExplanationCount: number;
  readonly deferredExplanationCount: number;
}
