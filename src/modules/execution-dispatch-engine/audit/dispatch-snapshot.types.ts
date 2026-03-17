import { DispatchSnapshotStatus } from './dispatch-snapshot.enums';
import { DispatchRuntimeStatus } from '../runtime';
import { DispatchDeliveryStatus, DispatchAckStatus } from '../tracking';

/**
 * Dispatch Snapshot Type
 *
 * Represents a deterministic point-in-time snapshot of a dispatch execution state.
 *
 * A snapshot captures the complete state of a dispatch across all layers:
 * - Runtime execution state (from DispatchRuntimeAggregate)
 * - Delivery tracking state (from DispatchTrackingRecord)
 * - Acknowledgement state (from DispatchAck)
 *
 * Purpose:
 * Snapshots serve as immutable records of dispatch state at key lifecycle moments.
 * They enable audit trails, traceability, and future replay-safe diagnostics without
 * requiring persistence or replay engine implementation.
 *
 * A snapshot is created at runtime and may transition through states as the dispatch
 * progresses, but each snapshot instance is immutable once created.
 */
export interface DispatchSnapshot {
  /**
   * Unique identifier for this snapshot record
   * Explicitly provided, not generated
   */
  snapshotId: string;

  /**
   * The dispatch intent being captured
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The runtime aggregate ID captured in this snapshot
   * Links to the execution-ready artifact
   */
  runtimeAggregateId: string;

  /**
   * The tracking record ID captured in this snapshot
   * Links to the delivery tracking artifact
   */
  trackingId: string;

  /**
   * Current snapshot lifecycle status
   * Must be one of DispatchSnapshotStatus enum values
   */
  snapshotStatus: DispatchSnapshotStatus;

  /**
   * Human-readable summary of the dispatch state at snapshot time
   * Provides context for the captured state
   */
  summary: string;

  /**
   * Runtime execution status captured in this snapshot
   * Must be one of DispatchRuntimeStatus enum values (reused from runtime layer)
   */
  runtimeStatus: DispatchRuntimeStatus;

  /**
   * Delivery status captured in this snapshot
   * Must be one of DispatchDeliveryStatus enum values (reused from tracking layer)
   */
  deliveryStatus: DispatchDeliveryStatus;

  /**
   * Acknowledgement status captured in this snapshot
   * Must be one of DispatchAckStatus enum values (reused from tracking layer)
   */
  ackStatus: DispatchAckStatus;

  /**
   * Timestamp when this snapshot was created (milliseconds since epoch)
   * Explicitly provided from audit boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this snapshot was last updated (milliseconds since epoch)
   * Explicitly provided from audit boundaries, no hidden calculations
   */
  updatedAt: number;
}
