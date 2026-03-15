/**
 * Dispatch Target Actor Capability Type
 *
 * Represents a single typed capability that a target actor possesses.
 * Capabilities are the unit of operational capacity that determine
 * an actor's ability to handle specific dispatch types or channels.
 */
export interface DispatchTargetActorCapability {
  /**
   * Unique code identifier for this capability (e.g., 'ERP_PUSH', 'API_REST', 'WEBHOOK')
   */
  capabilityCode: string;

  /**
   * Human-readable name of the capability
   */
  capabilityName: string;

  /**
   * Type of capability (e.g., 'CHANNEL', 'PROTOCOL', 'INTEGRATION', 'WORKFLOW')
   */
  capabilityType: string;

  /**
   * Whether this capability is currently enabled and available for dispatch routing
   */
  isEnabled: boolean;
}
