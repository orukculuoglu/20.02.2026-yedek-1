/**
 * Data Engine Index Preparation Engine — Phase 6
 *
 * Transform Phase 5 graph structure to index-ready records.
 *
 * SCOPE (STRICTLY BOUNDED):
 * ✓ Deterministic index record generation
 * ✓ Four index families: timeline, component, actor, event-type
 * ✓ Vehicle-centric record anchoring
 * ✓ Compact, query-friendly output
 *
 * NOT INCLUDED:
 * ✗ Database persistence
 * ✗ Query execution
 * ✗ Signal generation
 * ✗ Risk scoring
 * ✗ Graph traversal analytics
 * ✗ External service calls
 */

import { generateDeterministicId } from '../../utils/deterministicIdGenerator';
import type { DataEngineIndexPreparationCandidate } from '../models/DataEngineIndexPreparationCandidate';
import type { DataEngineIndexPreparationResult } from '../models/DataEngineIndexPreparationResult';
import type { DataEngineIndexRecord } from '../models/DataEngineIndexRecord';
import { DataEngineIndexRecordType } from '../types/DataEngineIndexRecordType';

// ─────────────────────────────────────────────────────────────────────────────
// INDEX PREPARATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prepare index records from Phase 5 graph attachment output.
 *
 * Transforms graph nodes and edges into four index families:
 * 1. VEHICLE_TIMELINE — chronological event/observation ordering
 * 2. VEHICLE_COMPONENT — asset involvement tracking
 * 3. VEHICLE_ACTOR — actor involvement tracking
 * 4. VEHICLE_EVENT_TYPE — semantic event grouping
 *
 * Returns deterministic, traceable, query-ready index records.
 */
export function prepareGraphIndexes(
  candidate: DataEngineIndexPreparationCandidate,
): DataEngineIndexPreparationResult {
  const records: DataEngineIndexRecord[] = [];
  const warnings: string[] = [];

  const identityId = candidate.identityId;
  const sourceEntityRef = candidate.sourceEntityRef;
  const attachedAt = candidate.attachedAt;
  const preparedAt = attachedAt; // Use graph attachment time as reference

  // Track unique values for summary
  const seenComponents = new Set<string>();
  const seenActors = new Set<string>();
  const seenEventTypes = new Set<string>();
  const timelineRecords = new Map<string, DataEngineIndexRecord>();

  // ─────────────────────────────────────────────────────────────────────────────
  // VEHICLE_TIMELINE RECORDS
  // ─────────────────────────────────────────────────────────────────────────────
  // One record per EVENT or OBSERVATION node, ordered by timestamp

  const eventObservationNodes = candidate.nodes.filter(
    (n) => n.nodeType === 'EVENT' || n.nodeType === 'OBSERVATION',
  );

  const sortedByTime = eventObservationNodes.sort((a, b) => {
    const timeA = a.properties?.['eventTimestamp'] || a.properties?.['recordedTimestamp'] || '';
    const timeB = b.properties?.['recordedTimestamp'] || b.properties?.['eventTimestamp'] || '';
    return String(timeA).localeCompare(String(timeB));
  });

  sortedByTime.forEach((node, index) => {
    const sortableTimestamp =
      (node.properties?.['eventTimestamp'] as string) ||
      (node.properties?.['recordedTimestamp'] as string) ||
      attachedAt;

    const recordKey = `${identityId}:VEHICLE_TIMELINE:${node.nodeId}`;
    const recordId = generateDeterministicId(recordKey);

    const timelineRecord: DataEngineIndexRecord = {
      recordId,
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId,
      sourceEntityRef,
      indexKey: 'timestamp',
      indexValue: sortableTimestamp,
      sortableTimestamp,
      properties: {
        nodeId: node.nodeId,
        nodeType: node.nodeType,
        semanticClass: node.semanticClass,
        label: node.label,
        sequencePosition: index,
        eventTimestamp: node.properties?.['eventTimestamp'],
        recordedTimestamp: node.properties?.['recordedTimestamp'],
      },
      preparedAt,
    };

    records.push(timelineRecord);
    timelineRecords.set(node.nodeId, timelineRecord);
    seenEventTypes.add(String(node.semanticClass || 'UNKNOWN'));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // VEHICLE_COMPONENT RECORDS
  // ─────────────────────────────────────────────────────────────────────────────
  // One record per ASSET node (component)

  const assetNodes = candidate.nodes.filter((n) => n.nodeType === 'ASSET');

  assetNodes.forEach((node) => {
    const normalizedComponent = String(node.semanticClass || node.label || 'unknown');

    if (!seenComponents.has(normalizedComponent)) {
      const recordKey = `${identityId}:VEHICLE_COMPONENT:${normalizedComponent}`;
      const recordId = generateDeterministicId(recordKey);

      // Count edges involving this component
      const componentEdges = candidate.edges.filter((e) => e.targetNodeId === node.nodeId);

      const componentRecord: DataEngineIndexRecord = {
        recordId,
        recordType: DataEngineIndexRecordType.VEHICLE_COMPONENT,
        identityId,
        sourceEntityRef,
        indexKey: normalizedComponent,
        indexValue: normalizedComponent,
        properties: {
          nodeId: node.nodeId,
          canonicalComponent: normalizedComponent,
          originalComponent: (node.properties?.['originalComponent'] as string) || normalizedComponent,
          involvementCount: componentEdges.length,
          involvedInEventTypes: Array.from(seenEventTypes),
          nodeLabel: node.label,
        },
        preparedAt,
      };

      records.push(componentRecord);
      seenComponents.add(normalizedComponent);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // VEHICLE_ACTOR RECORDS
  // ─────────────────────────────────────────────────────────────────────────────
  // One record per ACTOR node, grouped by role

  const actorNodes = candidate.nodes.filter((n) => n.nodeType === 'ACTOR');

  actorNodes.forEach((node) => {
    const role = (node.properties?.['role'] as string) || 'UNKNOWN_ROLE';
    const sourceId = (node.properties?.['sourceId'] as string) || 'UNKNOWN_SOURCE';
    const actorKey = `${sourceId}:${role}`;

    if (!seenActors.has(actorKey)) {
      const recordKey = `${identityId}:VEHICLE_ACTOR:${actorKey}`;
      const recordId = generateDeterministicId(recordKey);

      // Count edges involving this actor
      const actorEdges = candidate.edges.filter((e) => e.targetNodeId === node.nodeId);

      const actorRecord: DataEngineIndexRecord = {
        recordId,
        recordType: DataEngineIndexRecordType.VEHICLE_ACTOR,
        identityId,
        sourceEntityRef,
        indexKey: actorKey,
        indexValue: role,
        properties: {
          nodeId: node.nodeId,
          sourceId,
          sourceType: node.properties?.['sourceType'] as string,
          role,
          involvementCount: actorEdges.length,
          nodeLabel: node.label,
        },
        preparedAt,
      };

      records.push(actorRecord);
      seenActors.add(actorKey);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // VEHICLE_EVENT_TYPE RECORDS
  // ─────────────────────────────────────────────────────────────────────────────
  // One record per distinct event type family

  seenEventTypes.forEach((eventType) => {
    const recordKey = `${identityId}:VEHICLE_EVENT_TYPE:${eventType}`;
    const recordId = generateDeterministicId(recordKey);

    // Count events of this type
    const eventsOfType = sortedByTime.filter(
      (n) => String(n.semanticClass || 'UNKNOWN') === eventType,
    );

    // Latest timestamp of this event type
    const latestEvent = eventsOfType[eventsOfType.length - 1];
    const latestTimestamp =
      (latestEvent?.properties?.['eventTimestamp'] as string) ||
      (latestEvent?.properties?.['recordedTimestamp'] as string) ||
      attachedAt;

    const eventTypeRecord: DataEngineIndexRecord = {
      recordId,
      recordType: DataEngineIndexRecordType.VEHICLE_EVENT_TYPE,
      identityId,
      sourceEntityRef,
      indexKey: eventType,
      indexValue: String(eventsOfType.length),
      sortableTimestamp: latestTimestamp,
      properties: {
        family: eventType,
        count: eventsOfType.length,
        latestTimestamp,
        earliestTimestamp: (eventsOfType[0]?.properties?.['eventTimestamp'] as string) || attachedAt,
        nodeIds: eventsOfType.map((n) => n.nodeId),
      },
      preparedAt,
    };

    records.push(eventTypeRecord);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────

  const recordsByType: Record<string, number> = {};
  records.forEach((record) => {
    recordsByType[record.recordType] = (recordsByType[record.recordType] ?? 0) + 1;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULT
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    success: true,
    preparedRecords: records,
    candidateRef: {
      identityId,
      sourceEntityRef,
      attachedAt,
    },
    preparedAt,
    summary: {
      totalRecordsPrepared: records.length,
      recordsByType,
      uniqueVehicles: 1, // Per candidate
      uniqueComponents: seenComponents.size,
      uniqueActors: seenActors.size,
      uniqueEventTypes: seenEventTypes.size,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
