/**
 * Data Engine Signal Preparation Engine — Phase 7
 *
 * Transform Phase 6 index records to deterministic signal candidates.
 *
 * SCOPE (STRICTLY BOUNDED):
 * ✓ Deterministic signal candidate generation
 * ✓ Four signal families: timeline density, component recurrence, actor concentration, event type frequency
 * ✓ Vehicle-centric signal anchoring
 * ✓ Evidence-based signal preparation
 * ✓ Compact, reusable output
 *
 * NOT INCLUDED:
 * ✗ Decision logic
 * ✗ Recommendation generation
 * ✗ Risk scoring
 * ✗ Severity assignment
 * ✗ Business rule application
 * ✗ Persistence or storage
 * ✗ External service calls
 */

import { generateDeterministicId } from '../../utils/deterministicIdGenerator';
import type { DataEngineSignalPreparationCandidate } from '../models/DataEngineSignalPreparationCandidate';
import type { DataEngineSignalPreparationResult } from '../models/DataEngineSignalPreparationResult';
import type { DataEngineSignalCandidate } from '../models/DataEngineSignalCandidate';
import { DataEngineSignalType } from '../types/DataEngineSignalType';
import type { DataEngineIndexRecord } from '../../indexing/models/DataEngineIndexRecord';
import type { DataEngineIndexRecordType } from '../../indexing/types/DataEngineIndexRecordType';

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL PREPARATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prepare signal candidates from Phase 6 index records.
 *
 * Transforms index records into four signal families:
 * 1. TIMELINE_DENSITY — event/observation clustering in time
 * 2. COMPONENT_RECURRENCE — repeated component involvement
 * 3. ACTOR_CONCENTRATION — repeated actor concentration
 * 4. EVENT_TYPE_FREQUENCY — event type family frequency
 *
 * Returns deterministic, traceable, evidence-based signal candidates.
 */
export function prepareSignals(
  candidate: DataEngineSignalPreparationCandidate,
): DataEngineSignalPreparationResult {
  const signals: DataEngineSignalCandidate[] = [];
  const warnings: string[] = [];

  const identityId = candidate.identityId;
  const sourceEntityRef = candidate.sourceEntityRef;
  const preparedAt = candidate.preparedAt;

  // Track unique values for summary
  const seenComponents = new Set<string>();
  const seenActors = new Set<string>();
  const seenEventTypes = new Set<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // TIMELINE_DENSITY SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  // Analyze event clustering using timeline records

  const timelineRecords = candidate.preparedRecords.filter(
    (r) => r.recordType === 'VEHICLE_TIMELINE',
  );

  if (timelineRecords.length > 0) {
    // Group timeline records by time windows
    const timelinesByDay = new Map<string, DataEngineIndexRecord[]>();

    timelineRecords.forEach((record) => {
      const timestamp = record.sortableTimestamp || record.preparedAt;
      // Extract day from ISO timestamp
      const dayKey = timestamp.substring(0, 10); // YYYY-MM-DD
      if (!timelinesByDay.has(dayKey)) {
        timelinesByDay.set(dayKey, []);
      }
      timelinesByDay.get(dayKey)!.push(record);
    });

    // Create density signals for days with multiple events
    timelinesByDay.forEach((records, dayKey) => {
      if (records.length > 1) {
        const signalKey = `7d:${dayKey}`;
        const recordIds = records.map((r) => r.recordId);
        const recordKey = `${identityId}:TIMELINE_DENSITY:${signalKey}:${records.length}`;
        const signalId = generateDeterministicId(recordKey);

        const densitySignal: DataEngineSignalCandidate = {
          signalId,
          signalType: DataEngineSignalType.TIMELINE_DENSITY,
          identityId,
          sourceEntityRef,
          sourceRecordRefs: recordIds,
          signalKey,
          signalValue: records.length,
          supportingEvidenceCount: records.length,
          signalTimestamp: dayKey,
          properties: {
            windowSize: '1d',
            eventCount: records.length,
            densityRatio: (records.length / timelineRecords.length).toFixed(2),
            dayKey,
            recordIds,
          },
          preparedAt,
        };

        signals.push(densitySignal);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPONENT_RECURRENCE SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  // Analyze component involvement frequency using component records

  const componentRecords = candidate.preparedRecords.filter(
    (r) => r.recordType === 'VEHICLE_COMPONENT',
  );

  componentRecords.forEach((record) => {
    const component = String(record.indexKey);
    const occurrenceCount = Number(record.properties?.['involvementCount']) || 1;

    if (!seenComponents.has(component) && occurrenceCount > 1) {
      const recordKey = `${identityId}:COMPONENT_RECURRENCE:${component}:${occurrenceCount}`;
      const signalId = generateDeterministicId(recordKey);

      const componentSignal: DataEngineSignalCandidate = {
        signalId,
        signalType: DataEngineSignalType.COMPONENT_RECURRENCE,
        identityId,
        sourceEntityRef,
        sourceRecordRefs: [record.recordId],
        signalKey: component,
        signalValue: occurrenceCount,
        supportingEvidenceCount: 1,
        signalTimestamp: record.sortableTimestamp,
        properties: {
          component,
          occurrenceCount,
          originalComponent: record.properties?.['originalComponent'],
          involvedInEventTypes: record.properties?.['involvedInEventTypes'],
        },
        preparedAt,
      };

      signals.push(componentSignal);
      seenComponents.add(component);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTOR_CONCENTRATION SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  // Analyze actor involvement concentration using actor records

  const actorRecords = candidate.preparedRecords.filter(
    (r) => r.recordType === 'VEHICLE_ACTOR',
  );

  actorRecords.forEach((record) => {
    const actorKey = String(record.indexKey);
    const involvementCount = Number(record.properties?.['involvementCount']) || 1;
    const role = String(record.properties?.['role']) || 'UNKNOWN';

    if (!seenActors.has(actorKey) && involvementCount > 1) {
      const recordKey = `${identityId}:ACTOR_CONCENTRATION:${actorKey}:${involvementCount}`;
      const signalId = generateDeterministicId(recordKey);

      // Calculate concentration percentage
      const concentrationPercent =
        ((involvementCount / Math.max(timelineRecords.length, 1)) * 100).toFixed(2);

      const actorSignal: DataEngineSignalCandidate = {
        signalId,
        signalType: DataEngineSignalType.ACTOR_CONCENTRATION,
        identityId,
        sourceEntityRef,
        sourceRecordRefs: [record.recordId],
        signalKey: actorKey,
        signalValue: involvementCount,
        supportingEvidenceCount: 1,
        properties: {
          actorKey,
          involvementCount,
          concentrationPercent,
          actor: String(record.properties?.['sourceId']),
          sourceType: record.properties?.['sourceType'],
          role,
        },
        preparedAt,
      };

      signals.push(actorSignal);
      seenActors.add(actorKey);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT_TYPE_FREQUENCY SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  // Analyze event type frequency using event type records

  const eventTypeRecords = candidate.preparedRecords.filter(
    (r) => r.recordType === 'VEHICLE_EVENT_TYPE',
  );

  eventTypeRecords.forEach((record) => {
    const eventType = String(record.indexKey);
    const frequency = Number(record.indexValue) || 0;

    if (!seenEventTypes.has(eventType) && frequency > 1) {
      const recordKey = `${identityId}:EVENT_TYPE_FREQUENCY:${eventType}:${frequency}`;
      const signalId = generateDeterministicId(recordKey);

      // Calculate frequency ratio/dominance
      const totalEvents = timelineRecords.length;
      const dominancePercent =
        totalEvents > 0 ? ((frequency / totalEvents) * 100).toFixed(2) : '0.00';

      const eventTypeSignal: DataEngineSignalCandidate = {
        signalId,
        signalType: DataEngineSignalType.EVENT_TYPE_FREQUENCY,
        identityId,
        sourceEntityRef,
        sourceRecordRefs: [record.recordId],
        signalKey: eventType,
        signalValue: frequency,
        supportingEvidenceCount: 1,
        signalTimestamp: record.sortableTimestamp,
        properties: {
          eventType,
          frequency,
          dominancePercent,
          latestTimestamp: record.properties?.['latestTimestamp'],
          earliestTimestamp: record.properties?.['earliestTimestamp'],
          eventNodeIds: record.properties?.['nodeIds'],
        },
        preparedAt,
      };

      signals.push(eventTypeSignal);
      seenEventTypes.add(eventType);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────

  const signalsByType: Record<string, number> = {};
  signals.forEach((signal) => {
    signalsByType[signal.signalType] = (signalsByType[signal.signalType] ?? 0) + 1;
  });

  const totalEvidenceCount = signals.reduce((sum, s) => sum + s.supportingEvidenceCount, 0);
  const averageSupportingEvidencePerSignal =
    signals.length > 0 ? totalEvidenceCount / signals.length : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULT
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    success: true,
    preparedSignals: signals,
    candidateRef: {
      identityId,
      sourceEntityRef,
      preparedAt,
    },
    preparedAt,
    summary: {
      totalSignalsPrepared: signals.length,
      signalsByType,
      uniqueVehicles: 1, // Per candidate
      uniqueComponents: seenComponents.size,
      uniqueActors: seenActors.size,
      uniqueEventTypes: seenEventTypes.size,
      averageSupportingEvidencePerSignal: parseFloat(averageSupportingEvidencePerSignal.toFixed(2)),
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
