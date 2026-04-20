/**
 * ActionReference - Minimal reference to an action
 * Pure reference structure with no loading or resolution behavior.
 * Identifies an action by its unique identifier only.
 */
export interface ActionReference {
  /**
   * Unique identifier for the action
   */
  readonly actionId: string;
}
