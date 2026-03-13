/**
 * Data Engine Graph Attachment — Actor Extraction Result
 *
 * Strict return type for actor node extraction from a normalized entity.
 * Enables type-safe processing without `any` casts.
 */

export interface DataEngineActorExtraction {
  /**
   * Deterministic actor node identifier derived from sourceId + sourceType + role.
   */
  actorId: string;

  /**
   * Graph node ID for this actor (same as actorId, included for consistency).
   */
  nodeId: string;

  /**
   * Human-readable label for the actor (e.g., "ServiceCenter EXPERTISE", "Telematics Provider").
   */
  label: string;

  /**
   * Actor node properties.
   */
  properties: {
    /**
     * Source identifier for the actor (e.g., "EXPERTISE", "FLEET_OPERATOR_001").
     */
    sourceId: string;

    /**
     * Source type classification (e.g., "SERVICE_CENTER", "FLEET_OPERATOR", "TELEMATICS_PROVIDER").
     * Optional for backward compatibility with sources that don't specify type.
     */
    sourceType?: string;

    /**
     * Actor's role in the event (e.g., "MAINTAINER", "OPERATOR", "INSPECTOR").
     */
    role: string;
  };
}
