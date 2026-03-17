import { DispatchDeliveryStatus } from './dispatch-tracking.enums';
import { DispatchAck } from './dispatch-ack.types';

/**
 * Dispatch Tracking Record Type
 *
 * Represents the complete delivery tracking state for a dispatch operation.
 *
 * A tracking record captures:
 * - References to the dispatch, package, and runtime aggregate
 * - Current delivery status in the outbound lifecycle
 * - Associated acknowledgement (if received)
 * - Creation and update timestamps for full tracking
 *
 * Purpose:
 * The tracking record serves as the primary artifact for monitoring and querying
 * the state of dispatch deliveries throughout their lifecycle. It bridges the
 * runtime execution layer with acknowledgement outcomes.
 *
 * Multiple tracking record updates may occur for a single dispatch as it progresses
 * through delivery states (CREATED → SENT → DELIVERED) or encounters failures
 * (CREATED → SENT → FAILED or RETRY_REQUIRED).
 */
export interface DispatchTrackingRecord {
  /**
   * Unique identifier for this tracking record
   * Explicitly provided, not generated
   */
  trackingId: string;

  /**
   * The dispatch intent being tracked
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The dispatch package being tracked
   * Reused from package layer
   */
  packageId: string;

  /**
   * The runtime aggregate ID that produced this dispatch
   * Links to the execution-ready artifact
   */
  runtimeAggregateId: string;

  /**
   * Current delivery status in the outbound lifecycle
   * Must be one of DispatchDeliveryStatus enum values
   * Initially CREATED, transitions through SENT → DELIVERED or SENT → FAILED/RETRY_REQUIRED
   */
  deliveryStatus: DispatchDeliveryStatus;

  /**
   * The acknowledgement record (if an acknowledgement has been received)
   * Optional field - only populated when an acknowledgement is received from actor
   */
  ack: DispatchAck | null;

  /**
   * Timestamp when this tracking record was created (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this tracking record was last updated (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no hidden calculations
   */
  updatedAt: number;
}
