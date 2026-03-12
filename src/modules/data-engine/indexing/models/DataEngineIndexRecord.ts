/**
 * Data Engine Index Record
 *
 * Represents one prepared index record from Phase 6.
 * Compact, query-friendly, and deterministically generated.
 *
 * NOT a persistence schema.
 * NOT a search result.
 * Just a prepared index dimension ready for storage or consumption.
 */

import type { DataEngineIndexRecordType } from '../types/DataEngineIndexRecordType';

export interface DataEngineIndexRecord {
  /**
   * Deterministic record ID.
   * Generated from: identityId + recordType + indexKey + indexValue.
   * Collision-resistant, reproducible.
   */
  recordId: string;

  /**
   * Index family type.
   * Indicates which dimension this record represents.
   */
  recordType: DataEngineIndexRecordType;

  /**
   * Vehicle identity reference.
   * All index records remain anchored to the vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   * Traces back to the original entity from Phase 5.
   */
  sourceEntityRef: string;

  /**
   * Index key.
   * Semantic key for this dimension.
   *
   * Examples:
   * - VEHICLE_TIMELINE: "timestamp"
   * - VEHICLE_COMPONENT: component name
   * - VEHICLE_ACTOR: actor ID
   * - VEHICLE_EVENT_TYPE: event type name
   */
  indexKey: string;

  /**
   * Index value.
   * Associated value for this dimension.
   *
   * Examples:
   * - VEHICLE_TIMELINE: ISO timestamp or sequence position
   * - VEHICLE_COMPONENT: canonical component name
   * - VEHICLE_ACTOR: actor role
   * - VEHICLE_EVENT_TYPE: count or semantic class
   */
  indexValue: string;

  /**
   * Sortable timestamp.
   * Present for timeline and temporal dimensions.
   * ISO 8601 format, enables chronological ordering.
   * Optional for non-temporal records.
   */
  sortableTimestamp?: string;

  /**
   * Additional properties.
   * Context-specific metadata for this record.
   *
   * Examples:
   * - VEHICLE_TIMELINE: { eventType, nodeName, semanticClass }
   * - VEHICLE_COMPONENT: { originalComponent, normalizedComponent, eventCount }
   * - VEHICLE_ACTOR: { sourceId, sourceType, involvementCount }
   * - VEHICLE_EVENT_TYPE: { family, count, latestTimestamp }
   */
  properties: Record<string, unknown>;

  /**
   * Preparation timestamp.
   * When this index record was prepared.
   * Deterministic source: from candidate or stable fallback.
   */
  preparedAt: string;
}
