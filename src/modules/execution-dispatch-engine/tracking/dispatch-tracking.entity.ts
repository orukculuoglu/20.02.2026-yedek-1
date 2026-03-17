import {
  DispatchAckStatus,
  DispatchDeliveryStatus,
} from './dispatch-tracking.enums';
import { DispatchAck } from './dispatch-ack.types';
import { DispatchTrackingRecord } from './dispatch-tracking.types';

/**
 * Input contract for creating a new DispatchAck
 *
 * All timestamps and IDs must be explicitly provided from tracking boundaries.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 */
export interface CreateDispatchAckInput {
  /**
   * Acknowledgement ID (explicitly provided, not generated)
   */
  ackId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The dispatch package ID
   */
  packageId: string;

  /**
   * The target actor ID
   */
  actorId: string;

  /**
   * Acknowledgement status message
   */
  message: string;

  /**
   * Timestamp of creation (explicitly provided from tracking layer)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from tracking layer)
   */
  updatedAt: number;
}

/**
 * Input contract for updating a DispatchAck status
 *
 * Used to transition an acknowledgement to a new status state.
 *
 * Constraints:
 * - No mutation of original ack
 * - No Date.now() - new timestamp explicit
 * - Produces new immutable object
 */
export interface UpdateDispatchAckStatusInput {
  /**
   * The existing acknowledgement record to update
   */
  ack: DispatchAck;

  /**
   * New acknowledgement status
   */
  newStatus: DispatchAckStatus;

  /**
   * Updated message providing context for status change
   */
  message: string;

  /**
   * Timestamp of update (explicitly provided, no Date.now())
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchTrackingRecord
 *
 * All timestamps and IDs must be explicitly provided from tracking boundaries.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 * - deliveryStatus set to CREATED
 * - ack initialized as null
 */
export interface CreateDispatchTrackingRecordInput {
  /**
   * Tracking record ID (explicitly provided, not generated)
   */
  trackingId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The dispatch package ID
   */
  packageId: string;

  /**
   * The runtime aggregate ID
   */
  runtimeAggregateId: string;

  /**
   * Timestamp of creation (explicitly provided from tracking layer)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from tracking layer)
   */
  updatedAt: number;
}

/**
 * Input contract for updating a DispatchTrackingRecord status
 *
 * Used to transition a tracking record to a new delivery status state.
 *
 * Constraints:
 * - No mutation of original record
 * - No Date.now() - new timestamp explicit
 * - Produces new immutable object
 */
export interface UpdateDispatchTrackingStatusInput {
  /**
   * The existing tracking record to update
   */
  record: DispatchTrackingRecord;

  /**
   * New delivery status
   */
  newDeliveryStatus: DispatchDeliveryStatus;

  /**
   * Optional acknowledgement to associate with this update
   */
  ack?: DispatchAck;

  /**
   * Timestamp of update (explicitly provided, no Date.now())
   */
  updatedAt: number;
}

/**
 * Factory function to create a DispatchAck
 *
 * Produces a deterministic acknowledgement entity with:
 * - ackStatus set to PENDING
 * - All IDs and timestamps explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchAckInput
 * @returns DispatchAck - Immutable acknowledgement object
 */
export function createDispatchAck(
  input: CreateDispatchAckInput
): DispatchAck {
  return Object.freeze({
    ackId: input.ackId,
    dispatchId: input.dispatchId,
    packageId: input.packageId,
    actorId: input.actorId,
    ackStatus: DispatchAckStatus.PENDING,
    message: input.message,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Update DispatchAck status deterministically
 *
 * Produces a new immutable acknowledgement with updated status.
 *
 * Constraints:
 * - No mutation of original ack
 * - Immutable spread pattern
 * - All timestamps explicit
 * - Pure deterministic update only
 *
 * @param input - UpdateDispatchAckStatusInput
 * @returns DispatchAck - New immutable acknowledgement object
 */
export function updateDispatchAckStatus(
  input: UpdateDispatchAckStatusInput
): DispatchAck {
  return Object.freeze({
    ...input.ack,
    ackStatus: input.newStatus,
    message: input.message,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a DispatchTrackingRecord
 *
 * Produces a deterministic tracking record entity with:
 * - deliveryStatus set to CREATED
 * - ack initialized to null
 * - All IDs and timestamps explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchTrackingRecordInput
 * @returns DispatchTrackingRecord - Immutable tracking record object
 */
export function createDispatchTrackingRecord(
  input: CreateDispatchTrackingRecordInput
): DispatchTrackingRecord {
  return Object.freeze({
    trackingId: input.trackingId,
    dispatchId: input.dispatchId,
    packageId: input.packageId,
    runtimeAggregateId: input.runtimeAggregateId,
    deliveryStatus: DispatchDeliveryStatus.CREATED,
    ack: null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Update DispatchTrackingRecord status deterministically
 *
 * Produces a new immutable tracking record with updated delivery status
 * and optional acknowledgement.
 *
 * Constraints:
 * - No mutation of original record
 * - Immutable spread pattern
 * - All timestamps explicit
 * - Pure deterministic update only
 *
 * @param input - UpdateDispatchTrackingStatusInput
 * @returns DispatchTrackingRecord - New immutable tracking record object
 */
export function updateDispatchTrackingStatus(
  input: UpdateDispatchTrackingStatusInput
): DispatchTrackingRecord {
  return Object.freeze({
    ...input.record,
    deliveryStatus: input.newDeliveryStatus,
    ack: input.ack ?? input.record.ack,
    updatedAt: input.updatedAt,
  });
}
