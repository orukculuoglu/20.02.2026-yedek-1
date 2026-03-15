import { DispatchStatus, DispatchPriority, DispatchActorType, DispatchChannelType, DispatchResultType } from './dispatch.enums';
import { DispatchRefs } from './dispatch-refs.types';

/**
 * DispatchIntent represents the deterministic outbound operational intent derived from a work order.
 *
 * A dispatch intent encodes the complete specification for executing a work order via a specific actor and channel:
 * - Target system (actor type)
 * - Delivery mechanism (channel type)
 * - Operational context (work order lineage)
 * - Priority and timeline
 * - Full traceability back to signal origin
 *
 * This is the primary entity driving enterprise-grade delivery orchestration.
 */
export interface DispatchIntent {
  dispatchId: string;
  workflowId: string;
  workOrderId: string;
  vehicleId: string;
  actorType: DispatchActorType;
  channelType: DispatchChannelType;
  status: DispatchStatus;
  priority: DispatchPriority;
  title: string;
  summary: string;
  reason: string;
  createdAt: number;
  updatedAt: number;
  refs: DispatchRefs;
}

/**
 * DispatchRecord represents the tracked lifecycle artifact created around a dispatch attempt or state update.
 *
 * Each dispatch record captures:
 * - The dispatch being tracked
 * - The attempt outcome (result type)
 * - Communication metadata (actor, channel)
 * - Operational status
 * - Timestamp for lifecycle tracking
 *
 * Multiple records may be created for a single dispatch as it transitions through states.
 */
export interface DispatchRecord {
  dispatchRecordId: string;
  dispatchId: string;
  actorType: DispatchActorType;
  channelType: DispatchChannelType;
  resultType: DispatchResultType;
  status: DispatchStatus;
  message: string;
  createdAt: number;
  updatedAt: number;
  refs: DispatchRefs;
}
