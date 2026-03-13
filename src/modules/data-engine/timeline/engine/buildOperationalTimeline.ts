/**
 * Build Operational Timeline Engine
 *
 * Main engine function for generating operational timeline entries
 * from acceptance evaluations.
 *
 * This engine converts Phase 12 acceptance evaluations into Phase 13
 * timeline entries with deterministic mapping rules.
 *
 * NOT EXECUTED: These are structured workflow directives only.
 * No service orders, alerts, or external calls are made.
 */

import { createHash } from 'crypto';
import type { DataEngineTimelineCandidate } from '../models/DataEngineTimelineCandidate';
import type { DataEngineTimelineResult } from '../models/DataEngineTimelineResult';
import type { DataEngineTimelineEntry } from '../models/DataEngineTimelineEntry';
import { createTimelineEntry } from '../models/DataEngineTimelineEntry';
import { createTimelineResult } from '../models/DataEngineTimelineResult';
import {
  MONITORING_ENTRY,
  MAINTENANCE_REVIEW_ENTRY,
  SERVICE_INSPECTION_ENTRY,
  URGENT_REVIEW_ENTRY,
  CRITICAL_ATTENTION_ENTRY,
  type DataEngineTimelineEntryType,
} from '../types/DataEngineTimelineEntryType';
import { LOW, MEDIUM, HIGH, CRITICAL, type DataEngineTimelinePriority } from '../types/DataEngineTimelinePriority';
import {
  IMMEDIATE,
  NEXT_SERVICE_WINDOW,
  NEXT_30_DAYS,
  NEXT_90_DAYS,
  type DataEngineTimelineWindow,
} from '../types/DataEngineTimelineSchedulingWindow';

/** Mapping rules from acceptance status to timeline entry components */
interface StatusTimelineMapping {
  entryType: DataEngineTimelineEntryType;
  basePriority: DataEngineTimelinePriority;
  window: DataEngineTimelineWindow;
}

/** Maps acceptance statuses to timeline entry types and priorities */
const STATUS_TIMELINE_MAPPING: Record<string, StatusTimelineMapping> = {
  ACCEPTED: {
    entryType: MONITORING_ENTRY,
    basePriority: LOW,
    window: NEXT_90_DAYS,
  },
  WATCH: {
    entryType: MONITORING_ENTRY,
    basePriority: MEDIUM,
    window: NEXT_30_DAYS,
  },
  ESCALATE: {
    entryType: SERVICE_INSPECTION_ENTRY,
    basePriority: HIGH,
    window: NEXT_SERVICE_WINDOW,
  },
  REJECTED: {
    entryType: CRITICAL_ATTENTION_ENTRY,
    basePriority: CRITICAL,
    window: IMMEDIATE,
  },
};

/**
 * Generate deterministic timeline entry ID
 *
 * Based on: identityId + entryType + sourceEntityRef + priority
 */
function generateTimelineEntryId(
  identityId: string,
  entryType: DataEngineTimelineEntryType,
  sourceEntityRef: string,
  priority: DataEngineTimelinePriority
): string {
  const data = `${identityId}:${entryType}:${sourceEntityRef}:${priority}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Adjust priority based on evaluation severity and confidence
 *
 * Rules:
 * - Higher confidence → higher priority
 * - Multiple evaluations with same status → higher priority
 * - High severity status → maintain/increase priority
 */
function adjustPriorityForEvaluation(
  basePriority: DataEngineTimelinePriority,
  confidence: number,
  evaluationCount: number
): DataEngineTimelinePriority {
  const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  let adjustedLevel = priorityOrder[basePriority];

  // High confidence and multiple evaluations → bump priority
  if (confidence > 0.8 && evaluationCount > 1) {
    adjustedLevel = Math.min(adjustedLevel + 1, 3); // Cap at CRITICAL
  }

  const reversePriorityMap = { 0: LOW, 1: MEDIUM, 2: HIGH, 3: CRITICAL };
  return reversePriorityMap[adjustedLevel as keyof typeof reversePriorityMap];
}

/**
 * Determine scheduling window based on priority and evaluation type
 *
 * Rules:
 * - CRITICAL or HIGH → faster window (IMMEDIATE or NEXT_SERVICE_WINDOW)
 * - MEDIUM → mid-range window (NEXT_SERVICE_WINDOW or NEXT_30_DAYS)
 * - LOW → longer window (NEXT_30_DAYS or NEXT_90_DAYS)
 */
function determineSchedulingWindow(
  basePriority: DataEngineTimelinePriority,
  evaluationType: string,
  confidence: number
): DataEngineTimelineWindow {
  if (basePriority === CRITICAL) {
    return confidence > 0.85 ? IMMEDIATE : NEXT_SERVICE_WINDOW;
  }

  if (basePriority === HIGH) {
    return confidence > 0.75 ? NEXT_SERVICE_WINDOW : NEXT_30_DAYS;
  }

  if (basePriority === MEDIUM) {
    return NEXT_30_DAYS;
  }

  return NEXT_90_DAYS;
}

/**
 * Generate rationale text for timeline entry
 */
function generateRationale(
  acceptanceStatus: string,
  evaluationType: string,
  entryType: DataEngineTimelineEntryType
): string {
  const statusDescriptions: Record<string, string> = {
    ACCEPTED: 'meets acceptance criteria',
    WATCH: 'requires ongoing monitoring',
    ESCALATE: 'requires escalated review',
    REJECTED: 'does not meet acceptance criteria',
  };

  const status = statusDescriptions[acceptanceStatus] || acceptanceStatus;
  const actionMap: Record<DataEngineTimelineEntryType, string> = {
    MONITORING_ENTRY: 'Monitor',
    MAINTENANCE_REVIEW_ENTRY: 'Review maintenance requirements for',
    SERVICE_INSPECTION_ENTRY: 'Schedule service inspection for',
    URGENT_REVIEW_ENTRY: 'Urgent review required for',
    CRITICAL_ATTENTION_ENTRY: 'Critical attention required for',
  };

  const action = actionMap[entryType];
  return `${action} ${evaluationType.toLowerCase()} - ${status}`;
}

/**
 * Main timeline building engine
 *
 * Converts acceptance evaluations to operational timeline entries.
 * Implementation rules:
 *
 * 1. ACCEPTED evaluations → minimal timeline entries (optional MONITORING for record)
 * 2. WATCH evaluations → MONITORING entries with MEDIUM priority
 * 3. ESCALATE evaluations → SERVICE_INSPECTION or MAINTENANCE_REVIEW with HIGH priority
 * 4. REJECTED evaluations → URGENT_REVIEW or CRITICAL_ATTENTION with HIGH/CRITICAL priority
 *
 * For each acceptance evaluation:
 * - Generate deterministic entry ID
 * - Assign appropriate entry type based on acceptance status
 * - Determine priority from confidence and evaluation count
 * - Set scheduling window based on priority
 * - Create structured rationale text
 * - Maintain traceability to source evaluation
 *
 * @param candidate Timeline candidate with acceptance evaluations
 * @returns Timeline result with all generated entries and summary
 */
export function buildOperationalTimeline(
  candidate: DataEngineTimelineCandidate
): DataEngineTimelineResult {
  const timelineEntries: DataEngineTimelineEntry[] = [];
  const timestamp = new Date().toISOString();

  // Group evaluations by status for processing
  const evaluationsByStatus: Record<string, typeof candidate.acceptanceEvaluations> = {};
  for (const evaluation of candidate.acceptanceEvaluations) {
    if (!evaluationsByStatus[evaluation.acceptanceStatus]) {
      evaluationsByStatus[evaluation.acceptanceStatus] = [];
    }
    evaluationsByStatus[evaluation.acceptanceStatus].push(evaluation);
  }

  // Process each acceptance status group
  for (const [status, evaluations] of Object.entries(evaluationsByStatus)) {
    const mapping = STATUS_TIMELINE_MAPPING[status];
    if (!mapping) {
      continue; // Skip unmapped statuses
    }

    for (const evaluation of evaluations) {
      // Skip ACCEPTED with very high confidence (no timeline entry needed)
      if (status === 'ACCEPTED' && evaluation.confidence > 0.9) {
        continue;
      }

      // Adjust priority based on confidence and evaluation count
      const adjustedPriority = adjustPriorityForEvaluation(
        mapping.basePriority,
        evaluation.confidence,
        evaluations.length
      );

      // Determine scheduling window
      const schedulingWindow = determineSchedulingWindow(
        adjustedPriority,
        evaluation.evaluationType,
        evaluation.confidence
      );

      // Generate deterministic ID
      const timelineEntryId = generateTimelineEntryId(
        candidate.identityId,
        mapping.entryType,
        candidate.sourceEntityRef,
        adjustedPriority
      );

      // Generate rationale
      const rationale = generateRationale(status, evaluation.evaluationType, mapping.entryType);

      // Create timeline entry
      const entry = createTimelineEntry(
        timelineEntryId,
        mapping.entryType,
        adjustedPriority,
        candidate.identityId,
        candidate.sourceEntityRef,
        [evaluation.evaluationId], // Traceability to source evaluation
        schedulingWindow,
        rationale,
        {
          sourceEvaluationType: evaluation.evaluationType,
          sourceAcceptanceStatus: status,
          sourceEvaluationConfidence: evaluation.confidence,
          sourceEvaluationBasis: evaluation.evaluationBasis,
        }
      );

      timelineEntries.push(entry);
    }
  }

  // Create and return result with summary
  return createTimelineResult(timelineEntries, timestamp);
}
