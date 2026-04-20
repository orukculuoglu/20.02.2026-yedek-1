/**
 * DownstreamExecutionTarget - Minimal reference to downstream execution target
 * Pure reference structure with no execution implementation or delivery semantics.
 * Identifies where/how the action should be handed off without runtime behavior.
 */
export interface DownstreamExecutionTarget {
  /**
   * Reference identifier for the downstream target system/channel/boundary
   */
  readonly targetReference: string;

  /**
   * Optional additional context for the downstream target
   */
  readonly targetContext?: string;
}
