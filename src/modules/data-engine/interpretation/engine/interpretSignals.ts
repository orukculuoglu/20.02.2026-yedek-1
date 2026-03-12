/**
 * interpretSignals — Phase 8 Core Engine
 *
 * Transform prepared signals (Phase 7) into interpreted signals (Phase 8).
 *
 * Signal candidates → Interpreted patterns
 *
 * Mappings:
 * TIMELINE_DENSITY → TEMPORAL_ANOMALY_PATTERN
 * COMPONENT_RECURRENCE → COMPONENT_DEGRADATION_PATTERN
 * ACTOR_CONCENTRATION → ACTOR_DEPENDENCY_PATTERN
 * EVENT_TYPE_FREQUENCY → SERVICE_CLUSTER_PATTERN
 *
 * This phase:
 * ✓ Groups signals by interpretation families
 * ✓ Generates deterministic interpreted signal IDs
 * ✓ Preserves full traceability via sourceSignalRefs
 * ✓ Produces deterministic results
 *
 * This phase does NOT:
 * ✗ Generate recommendations
 * ✗ Assign severity scores
 * ✗ Trigger workflows
 * ✗ Make business decisions
 */

import { generateDeterministicId } from '../../utils/deterministicIdGenerator';
import type { DataEngineSignalInterpretationCandidate } from '../models/DataEngineSignalInterpretationCandidate';
import type { DataEngineSignalInterpretationResult } from '../models/DataEngineSignalInterpretationResult';
import type { DataEngineInterpretedSignal } from '../models/DataEngineInterpretedSignal';
import { DataEngineInterpretedSignalType } from '../types/DataEngineInterpretedSignalType';
import { DataEngineSignalType } from '../../signals/types/DataEngineSignalType';

/**
 * Interpret Phase 7 signals into Phase 8 semantic patterns.
 *
 * Algorithm:
 *
 * 1. Group prepared signals by signalType
 * 2. For each signal group:
 *    a. Map signalType → interpretedSignalType
 *    b. Extract patternKey from signal metadata
 *    c. Determine patternValue (intensity/strength)
 *    d. Collect sourceSignalRefs (for traceability)
 *    e. Generate deterministic interpretedSignalId
 *    f. Create interpreted signal
 * 3. Generate summary statistics
 * 4. Return result
 *
 * @param candidate Phase 7 signal interpretation candidate
 * @returns Phase 8 interpretation result
 */
export function interpretSignals(
  candidate: DataEngineSignalInterpretationCandidate
): DataEngineSignalInterpretationResult {
  const interpretedSignals: DataEngineInterpretedSignal[] = [];
  const patternMap = new Map<string, { signals: typeof candidate.preparedSignals; interpretedType: DataEngineInterpretedSignalType }>();

  // Step 1: Group signals by interpretation family and pattern key
  for (const signal of candidate.preparedSignals) {
    let interpretedType: DataEngineInterpretedSignalType | null = null;
    let groupKey = '';

    // Map Phase 7 signal types to Phase 8 interpreted types
    switch (signal.signalType) {
      case DataEngineSignalType.TIMELINE_DENSITY:
        interpretedType = DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN;
        // Group by day (from signalTimestamp)
        const eventDate = signal.signalTimestamp ? signal.signalTimestamp.split('T')[0] : 'UNKNOWN_DATE';
        groupKey = `${interpretedType}:::${eventDate}`;
        break;

      case DataEngineSignalType.COMPONENT_RECURRENCE:
        interpretedType = DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN;
        // Group by component identifier (from signalKey or properties)
        const componentId =
          signal.signalKey || (signal.properties as Record<string, unknown>)?.componentId || 'UNKNOWN_COMPONENT';
        groupKey = `${interpretedType}:::${componentId}`;
        break;

      case DataEngineSignalType.ACTOR_CONCENTRATION:
        interpretedType = DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN;
        // Group by actor identifier (sourceId:role format)
        const actorId =
          signal.signalKey || (signal.properties as Record<string, unknown>)?.actorId || 'UNKNOWN_ACTOR';
        groupKey = `${interpretedType}:::${actorId}`;
        break;

      case DataEngineSignalType.EVENT_TYPE_FREQUENCY:
        interpretedType = DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN;
        // Group by event type family
        const eventTypeFamily =
          signal.signalKey || (signal.properties as Record<string, unknown>)?.eventTypeFamily || 'UNKNOWN_EVENT_TYPE';
        groupKey = `${interpretedType}:::${eventTypeFamily}`;
        break;
    }

    if (!interpretedType || !groupKey) {
      continue;
    }

    // Add to group
    if (!patternMap.has(groupKey)) {
      patternMap.set(groupKey, {
        signals: [],
        interpretedType,
      });
    }

    patternMap.get(groupKey)!.signals.push(signal);
  }

  // Step 2: Generate interpreted signals from grouped patterns
  const recordTypeDistribution: Record<string, number> = {};

  for (const [, { signals: groupedSignals, interpretedType }] of patternMap) {
    if (groupedSignals.length === 0) {
      continue;
    }

    // Determine pattern characteristics from signal group
    const firstSignal = groupedSignals[0];
    const patternKey = firstSignal.signalKey || 'UNKNOWN_PATTERN';
    const patternValue = determinePatternValue(interpretedType, groupedSignals);
    const sourceSignalRefs = groupedSignals.map((s) => s.signalId);

    // Generate deterministic ID
    const interpretedSignalId = generateDeterministicId(
      `${candidate.identityId}|${interpretedType}|${patternKey}|${candidate.sourceEntityRef}`
    );

    // Build properties object based on interpreted type
    const properties = buildPatternProperties(interpretedType, groupedSignals);

    // Create interpreted signal
    const interpretedSignal: DataEngineInterpretedSignal = {
      interpretedSignalId,
      interpretedSignalType: interpretedType,
      identityId: candidate.identityId,
      sourceEntityRef: candidate.sourceEntityRef,
      sourceSignalRefs,
      patternKey,
      patternValue,
      supportingSignalCount: groupedSignals.length,
      interpretationTimestamp: candidate.interpretedAt,
      properties,
    };

    interpretedSignals.push(interpretedSignal);

    // Track for summary
    recordTypeDistribution[interpretedType] = (recordTypeDistribution[interpretedType] || 0) + 1;
  }

  // Step 3: Sort for deterministic output
  interpretedSignals.sort((a, b) => a.interpretedSignalId.localeCompare(b.interpretedSignalId));

  // Step 4: Build result
  const result: DataEngineSignalInterpretationResult = {
    interpretedSignals,
    summary: {
      totalSignalsInterpreted: candidate.preparedSignals.length,
      uniquePatterns: interpretedSignals.length,
      patternDistribution: recordTypeDistribution,
    },
    interpretedAt: candidate.interpretedAt,
  };

  return result;
}

/**
 * Determine pattern value (intensity) based on signal group characteristics.
 *
 * Does NOT implement decision logic.
 * Purely structural interpretation of signal properties.
 *
 * @param interpretedType Type of interpreted pattern
 * @param signals Grouped signals contributing to pattern
 * @returns Semantic pattern value
 */
function determinePatternValue(
  interpretedType: DataEngineInterpretedSignalType,
  signals: Array<{
    signalValue: number;
    supportingEvidenceCount: number;
    properties: Record<string, unknown>;
  }>
): string {
  // Use signal properties to determine value - no business logic
  if (signals.length === 0) {
    return 'neutral';
  }

  switch (interpretedType) {
    case DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN: {
      // Interpret based on signalValue or involvement count from properties
      const maxValue = Math.max(
        ...signals.map((s) => {
          const propCount = (s.properties as Record<string, unknown>)?.involvementCount;
          return typeof propCount === 'number' ? propCount : s.signalValue || 1;
        })
      );
      if (maxValue >= 5) return 'high_recurrence';
      if (maxValue >= 3) return 'medium_recurrence';
      return 'low_recurrence';
    }

    case DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN: {
      // Interpret based on signalValue or involvement count
      const maxValue = Math.max(
        ...signals.map((s) => {
          const propCount = (s.properties as Record<string, unknown>)?.involvementCount;
          return typeof propCount === 'number' ? propCount : s.signalValue || 1;
        })
      );
      if (maxValue >= 4) return 'high_concentration';
      if (maxValue >= 2) return 'medium_concentration';
      return 'low_concentration';
    }

    case DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN: {
      // Interpret based on signalValue (frequency count)
      const maxFreq = Math.max(
        ...signals.map((s) => {
          const propCount = (s.properties as Record<string, unknown>)?.count;
          return typeof propCount === 'number' ? propCount : s.signalValue || 1;
        })
      );
      if (maxFreq >= 3) return 'dense_cluster';
      if (maxFreq >= 2) return 'moderate_cluster';
      return 'sparse_cluster';
    }

    case DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN: {
      // Interpret based on signalValue (event count in time window)
      const totalEvents = signals.reduce((sum, s) => {
        const propCount = (s.properties as Record<string, unknown>)?.eventCount;
        return sum + (typeof propCount === 'number' ? propCount : s.signalValue || 1);
      }, 0);
      if (totalEvents >= 4) return 'high_density';
      if (totalEvents >= 2) return 'moderate_density';
      return 'low_density';
    }

    default:
      return 'neutral';
  }
}

/**
 * Build additional properties object for interpreted signal.
 *
 * Captures context from source signals without introducing business logic.
 *
 * @param interpretedType Type of interpreted pattern
 * @param signals Grouped signals
 * @returns Properties object
 */
function buildPatternProperties(
  interpretedType: DataEngineInterpretedSignalType,
  signals: Array<{ properties: Record<string, unknown> }>
): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    signalFamily: interpretedType,
    sourceSignalCount: signals.length,
  };

  switch (interpretedType) {
    case DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN: {
      // Collect event types from signal properties
      const eventTypes = new Set<string>();
      let totalInvolvement = 0;

      for (const signal of signals) {
        const types = (signal.properties as Record<string, unknown>)?.involvedInEventTypes;
        if (Array.isArray(types)) {
          types.forEach((t) => eventTypes.add(String(t)));
        }
        const count = (signal.properties as Record<string, unknown>)?.involvementCount;
        if (typeof count === 'number') {
          totalInvolvement = Math.max(totalInvolvement, count);
        }
      }

      properties.involvedEventTypes = Array.from(eventTypes);
      properties.peakInvolvement = totalInvolvement;
      break;
    }

    case DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN: {
      // Collect role and source info
      let role = '';
      let sourceId = '';
      let totalInvolvement = 0;

      for (const signal of signals) {
        role = (signal.properties as Record<string, unknown>)?.role as string || role;
        sourceId = (signal.properties as Record<string, unknown>)?.sourceId as string || sourceId;
        const count = (signal.properties as Record<string, unknown>)?.involvementCount;
        if (typeof count === 'number') {
          totalInvolvement = Math.max(totalInvolvement, count);
        }
      }

      if (role) properties.role = role;
      if (sourceId) properties.sourceId = sourceId;
      properties.peakInvolvement = totalInvolvement;
      break;
    }

    case DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN: {
      // Collect event family info
      let family = '';
      let totalCount = 0;

      for (const signal of signals) {
        family = (signal.properties as Record<string, unknown>)?.family as string || family;
        const count = (signal.properties as Record<string, unknown>)?.count;
        if (typeof count === 'number') {
          totalCount = Math.max(totalCount, count);
        }
      }

      if (family) properties.eventTypeFamily = family;
      properties.peakFrequency = totalCount;
      break;
    }

    case DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN: {
      // Collect temporal context
      let timeWindow = '';
      let totalEvents = 0;

      for (const signal of signals) {
        const window = (signal.properties as Record<string, unknown>)?.timeWindow;
        if (window) {
          timeWindow = window as string;
        }
        const count = (signal.properties as Record<string, unknown>)?.eventCount;
        if (typeof count === 'number') {
          totalEvents = Math.max(totalEvents, count);
        }
      }

      if (timeWindow) properties.timeWindow = timeWindow;
      properties.peakEventCount = totalEvents;
      break;
    }
  }

  return properties;
}
