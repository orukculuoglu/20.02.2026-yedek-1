import { DispatchIntent, DispatchRecord } from './dispatch.types';
import { DispatchStatus, DispatchPriority, DispatchActorType, DispatchChannelType, DispatchResultType } from './dispatch.enums';
import { DispatchRefs } from './dispatch-refs.types';

/**
 * Input contract for creating a DispatchIntent entity.
 * All timestamps must be explicitly provided for deterministic creation.
 */
export interface CreateDispatchIntentInput {
  dispatchId: string;
  workflowId: string;
  workOrderId: string;
  vehicleId: string;
  actorType: DispatchActorType;
  channelType: DispatchChannelType;
  priority: DispatchPriority;
  title: string;
  summary: string;
  reason: string;
  createdAt: number;
  updatedAt: number;
  refs: DispatchRefs;
}

/**
 * Input contract for updating a DispatchIntent status.
 * The new timestamp must be explicitly provided for deterministic updates.
 */
export interface UpdateDispatchIntentStatusInput {
  dispatchIntent: DispatchIntent;
  newStatus: DispatchStatus;
  updatedAt: number;
}

/**
 * Input contract for creating a DispatchRecord entity.
 * All timestamps must be explicitly provided for deterministic creation.
 */
export interface CreateDispatchRecordInput {
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

/**
 * Input contract for updating a DispatchRecord status.
 * The new timestamp must be explicitly provided for deterministic updates.
 */
export interface UpdateDispatchRecordStatusInput {
  dispatchRecord: DispatchRecord;
  newStatus: DispatchStatus;
  updatedAt: number;
}

/**
 * Factory for deterministic DispatchIntent entity construction.
 * Ensures dispatch intents are created with consistent, valid state.
 * All timestamps and values are deterministic from input.
 */
export class DispatchIntentEntity {
  /**
   * Create a new DispatchIntent entity.
   *
   * @param input - Dispatch intent creation input with explicit timestamps
   * @returns New DispatchIntent entity with CREATED status
   */
  static createDispatchIntent(input: CreateDispatchIntentInput): DispatchIntent {
    return {
      dispatchId: input.dispatchId,
      workflowId: input.workflowId,
      workOrderId: input.workOrderId,
      vehicleId: input.vehicleId,
      actorType: input.actorType,
      channelType: input.channelType,
      status: DispatchStatus.CREATED,
      priority: input.priority,
      title: input.title,
      summary: input.summary,
      reason: input.reason,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      refs: input.refs,
    };
  }

  /**
   * Update a DispatchIntent's status.
   *
   * @param input - Status update input with explicit timestamp
   * @returns Updated DispatchIntent entity
   */
  static updateDispatchIntentStatus(input: UpdateDispatchIntentStatusInput): DispatchIntent {
    return {
      ...input.dispatchIntent,
      status: input.newStatus,
      updatedAt: input.updatedAt,
    };
  }
}

/**
 * Factory for deterministic DispatchRecord entity construction.
 * Ensures dispatch records are created with consistent, valid state.
 * All timestamps and values are deterministic from input.
 */
export class DispatchRecordEntity {
  /**
   * Create a new DispatchRecord entity.
   *
   * @param input - Dispatch record creation input with explicit timestamps
   * @returns New DispatchRecord entity
   */
  static createDispatchRecord(input: CreateDispatchRecordInput): DispatchRecord {
    return {
      dispatchRecordId: input.dispatchRecordId,
      dispatchId: input.dispatchId,
      actorType: input.actorType,
      channelType: input.channelType,
      resultType: input.resultType,
      status: input.status,
      message: input.message,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      refs: input.refs,
    };
  }

  /**
   * Update a DispatchRecord's status.
   *
   * @param input - Status update input with explicit timestamp
   * @returns Updated DispatchRecord entity
   */
  static updateDispatchRecordStatus(input: UpdateDispatchRecordStatusInput): DispatchRecord {
    return {
      ...input.dispatchRecord,
      status: input.newStatus,
      updatedAt: input.updatedAt,
    };
  }
}
