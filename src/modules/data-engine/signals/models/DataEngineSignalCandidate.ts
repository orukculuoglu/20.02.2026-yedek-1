/**
 * Data Engine Signal Candidate
 *
 * Represents one prepared signal candidate from Phase 7.
 * Deterministic, evidence-based, traceable to source records.
 *
 * NOT a decision output.
 * NOT a recommendation.
 * Just a prepared signal dimension ready for downstream processing.
 */

import type { DataEngineSignalType } from '../types/DataEngineSignalType';

export interface DataEngineSignalCandidate {
  /**
   * Deterministic signal ID.
   * Generated from: identityId + signalType + signalKey + supportingEvidenceCount.
   * Collision-resistant, reproducible.
   */
  signalId: string;

  /**
   * Signal family type.
   * Indicates which signal dimension this candidate represents.
   */
  signalType: DataEngineSignalType;

  /**
   * Vehicle identity reference.
   * All signals remain anchored to the vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   * Traces back to the original entity from Phase 6.
   */
  sourceEntityRef: string;

  /**
   * Source index record references.
   * IDs of Phase 6 records that contributed to this signal.
   * Enables full traceability and evidence reconstruction.
   */
  sourceRecordRefs: string[];

  /**
   * Signal key.
   * Semantic key for this signal dimension.
   *
   * Examples:
   * - TIMELINE_DENSITY: time window key (e.g., "7d", "30d")
   * - COMPONENT_RECURRENCE: component name
   * - ACTOR_CONCENTRATION: actor key (sourceId:role)
   * - EVENT_TYPE_FREQUENCY: event type family
   */
  signalKey: string;

  /**
   * Signal value.
   * Associated quantitative value for this signal.
   *
   * Examples:
   * - TIMELINE_DENSITY: event count in window
   * - COMPONENT_RECURRENCE: occurrence count
   * - ACTOR_CONCENTRATION: involvement percentage
   * - EVENT_TYPE_FREQUENCY: frequency ratio
   */
  signalValue: number;

  /**
   * Supporting evidence count.
   * Number of index records that support this signal.
   * Helps downstream consumers gauge signal confidence.
   */
  supportingEvidenceCount: number;

  /**
   * Signal timestamp.
   * Present for temporal signals.
   * ISO 8601 format, marks when this signal was observed.
   * Optional for non-temporal signals.
   */
  signalTimestamp?: string;

  /**
   * Additional properties.
   * Context-specific metadata for this signal.
   *
   * Examples:
   * - TIMELINE_DENSITY: { windowSize, eventCount, densityRatio }
   * - COMPONENT_RECURRENCE: { component, occurrenceCount, lastOccurrence }
   * - ACTOR_CONCENTRATION: { actor, concentrationPercent, relatedCount }
   * - EVENT_TYPE_FREQUENCY: { eventType, frequency, dominancePercent }
   */
  properties: Record<string, unknown>;

  /**
   * Preparation timestamp.
   * When this signal candidate was prepared.
   * Deterministic source: from candidate or stable fallback.
   */
  preparedAt: string;
}
