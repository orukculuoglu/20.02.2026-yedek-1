/**
 * Dispatch Engine Result Status Enum
 *
 * Defines the outcome status of dispatch engine assembly/orchestration.
 */
export enum DispatchEngineResultStatus {
  ASSEMBLED = 'ASSEMBLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Dispatch Engine Result Type
 *
 * Represents the output/result produced by the dispatch engine during assembly.
 * Captures the outcome of orchestrating dispatch intent, actor, channel, and package.
 */
export interface DispatchEngineResult {
  /**
   * Unique identifier for this engine result
   */
  engineResultId: string;

  /**
   * The dispatch intent ID being orchestrated
   */
  dispatchId: string;

  /**
   * The target actor ID receiving the dispatch
   */
  actorId: string;

  /**
   * The delivery channel ID being used
   */
  channelId: string;

  /**
   * The dispatch package ID prepared for delivery
   */
  packageId: string;

  /**
   * Result status (ASSEMBLED, REJECTED, CANCELLED)
   */
  status: DispatchEngineResultStatus;

  /**
   * Summary of the assembly result or rejection reason
   */
  summary: string;

  /**
   * Timestamp when the result was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the result was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
