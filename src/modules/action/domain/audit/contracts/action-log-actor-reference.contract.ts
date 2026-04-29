/**
 * ActionLogActorReference - Minimal actor/reference surface for audit log records
 * Pure reference structure with no identity lookup, permission checks, or session behavior.
 * Carries actor reference information for audit trail attribution.
 */
export interface ActionLogActorReference {
  /**
   * Reference identifier to the actor that triggered this log entry
   */
  readonly actorReferenceId: string;
}
