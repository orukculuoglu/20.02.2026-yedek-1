/**
 * EvidenceBinding - Reference contract for policy condition evidence linkage
 * Pure reference structure with no evidence loading, resolution, or fetch behavior.
 */
export interface EvidenceBinding {
  /**
   * Unique identifier for the evidence piece
   * References evidence outside policy domain (caller-provided)
   */
  readonly evidenceId: string;

  /**
   * Source type classification for the evidence
   * Examples: "metric", "measurement", "event", "status", "audit_record"
   * No evidence loading or source resolution included
   */
  readonly evidenceSourceType: string;
}
