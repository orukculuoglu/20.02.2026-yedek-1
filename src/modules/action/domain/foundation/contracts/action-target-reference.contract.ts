/**
 * ActionTargetReference - Minimal reference to the target of an action
 * Pure reference structure with no loading, permission checking, or domain resolution behavior.
 * Identifies what the action points to or affects.
 */
export interface ActionTargetReference {
  /**
   * Unique identifier for the action target
   */
  readonly targetId: string;

  /**
   * Optional domain or type classification of the target
   * Indicates the category or domain the target belongs to.
   * No domain-specific logic or resolution included.
   */
  readonly targetDomain?: string;
}
