/**
 * Dispatch Tracking Module
 *
 * Layer 8: Tracking Core - Delivery Lifecycle & Acknowledgement Model
 *
 * This module provides the tracking core foundation for delivery lifecycle management
 * and acknowledgement orchestration. It defines deterministic state updates for tracking
 * dispatch delivery progress and acknowledgement outcomes.
 *
 * Exports:
 * - Deterministic acknowledgement and delivery status enums
 * - Acknowledgement contract (DispatchAck)
 * - Tracking record contract (DispatchTrackingRecord)
 * - Factory functions for creating and updating tracking artifacts
 *
 * Constraints:
 * - No Date.now() - all timestamps explicit from tracking boundaries
 * - No Math.random() - fully deterministic
 * - No hidden state - all state transitions explicit
 * - Immutable updates - spread pattern only
 * - All IDs explicit - no generation
 * - Pure deterministic state - no side effects
 *
 * Lifecycle:
 * This phase establishes the tracking core foundation only.
 * It does NOT implement:
 * - Retry orchestration logic
 * - External adapter integration
 * - Snapshot/log persistence
 * - API layer
 * - Background jobs
 *
 * Next phases will build on this foundation to add adapter execution,
 * retry orchestration, persistence, and delivery lifecycle management.
 */

export {
  DispatchAckStatus,
  DispatchDeliveryStatus,
} from './dispatch-tracking.enums';

export type { DispatchAck } from './dispatch-ack.types';

export type { DispatchTrackingRecord } from './dispatch-tracking.types';

export {
  createDispatchAck,
  updateDispatchAckStatus,
  createDispatchTrackingRecord,
  updateDispatchTrackingStatus,
  type CreateDispatchAckInput,
  type UpdateDispatchAckStatusInput,
  type CreateDispatchTrackingRecordInput,
  type UpdateDispatchTrackingStatusInput,
} from './dispatch-tracking.entity';
