/**
 * Dispatch Acknowledgement Status Enum
 *
 * Defines the acknowledgement state of a dispatch across the delivery lifecycle.
 *
 * Status transitions:
 * - PENDING: Acknowledgement not yet received (initial state)
 * - ACKNOWLEDGED: Actor has acknowledged receipt and acceptance of dispatch
 * - REJECTED: Actor has rejected the dispatch (will not process)
 * - FAILED: Acknowledgement attempt failed (requires retry logic)
 */
export enum DispatchAckStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

/**
 * Dispatch Delivery Status Enum
 *
 * Defines the delivery progress state of a dispatch operation.
 *
 * Status progression:
 * - CREATED: Tracking record initialized (initial state)
 * - SENT: Dispatch has been sent to the delivery channel
 * - DELIVERED: Dispatch reached the target actor
 * - FAILED: Delivery attempt encountered a failure
 * - RETRY_REQUIRED: Delivery failed but requires retry attempt
 */
export enum DispatchDeliveryStatus {
  CREATED = 'CREATED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETRY_REQUIRED = 'RETRY_REQUIRED',
}
