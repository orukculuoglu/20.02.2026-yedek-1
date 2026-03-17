import { DispatchAckStatus } from './dispatch-tracking.enums';

/**
 * Dispatch Acknowledgement Type
 *
 * Represents an acknowledgement record created when a dispatch receives a response
 * from the target actor.
 *
 * An acknowledgement captures:
 * - The dispatch being acknowledged
 * - The actor providing the acknowledgement
 * - The acknowledgement status
 * - A message providing context about the acknowledgement
 * - Explicit timestamps for lifecycle tracking
 *
 * Each dispatch may have multiple acknowledgements as it progresses through states,
 * although typically the final acknowledgement is the most relevant for tracking.
 */
export interface DispatchAck {
  /**
   * Unique identifier for this acknowledgement record
   * Explicitly provided, not generated
   */
  ackId: string;

  /**
   * The dispatch intent being acknowledged
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The dispatch package being acknowledged
   * Reused from package layer
   */
  packageId: string;

  /**
   * The target actor providing this acknowledgement
   * Reused from actor layer
   */
  actorId: string;

  /**
   * Current acknowledgement status
   * Must be one of DispatchAckStatus enum values
   */
  ackStatus: DispatchAckStatus;

  /**
   * Human-readable message providing context for the acknowledgement
   * May contain acceptance details, rejection reasons, or error information
   */
  message: string;

  /**
   * Timestamp when this acknowledgement was created (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this acknowledgement was last updated (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no hidden calculations
   */
  updatedAt: number;
}
