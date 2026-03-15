/**
 * Execution / Dispatch Engine domain module
 * Foundational domain model for enterprise-grade dispatch orchestration
 */

export {
  DispatchStatus,
  DispatchPriority,
  DispatchActorType,
  DispatchChannelType,
  DispatchResultType,
} from './dispatch.enums';
export type { DispatchRefs } from './dispatch-refs.types';
export type { DispatchIntent, DispatchRecord } from './dispatch.types';
export {
  DispatchIntentEntity,
  DispatchRecordEntity,
  type CreateDispatchIntentInput,
  type UpdateDispatchIntentStatusInput,
  type CreateDispatchRecordInput,
  type UpdateDispatchRecordStatusInput,
} from './dispatch.entity';
