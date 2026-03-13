/**
 * Prepare Execution Candidates Engine
 *
 * Main engine function for generating operational execution candidates
 * from timeline entries.
 *
 * This engine converts Phase 13 timeline entries into Phase 14
 * execution candidates with deterministic mapping rules.
 *
 * NOT EXECUTED: These are structured task preparations only.
 * No work orders, ERP calls, or external integrations are made.
 */

import { createHash } from 'crypto';
import type { DataEngineExecutionCandidateInput } from '../models/DataEngineExecutionCandidateInput';
import type { DataEngineExecutionCandidateResult } from '../models/DataEngineExecutionCandidateResult';
import type { DataEngineExecutionCandidate } from '../models/DataEngineExecutionCandidate';
import { createExecutionCandidate } from '../models/DataEngineExecutionCandidate';
import { createExecutionResult } from '../models/DataEngineExecutionCandidateResult';
import {
  MONITORING_TASK,
  INSPECTION_TASK,
  MAINTENANCE_PLANNING_TASK,
  DIAGNOSTIC_REVIEW_TASK,
  CRITICAL_INTERVENTION_TASK,
  type DataEngineExecutionTaskType,
} from '../types/DataEngineExecutionTaskType';
import {
  MONITORING_ENTRY,
  SERVICE_INSPECTION_ENTRY,
  MAINTENANCE_REVIEW_ENTRY,
  URGENT_REVIEW_ENTRY,
  CRITICAL_ATTENTION_ENTRY,
} from '../../timeline/types/DataEngineTimelineEntryType';

/** Mapping rules from timeline entry type to execution task type */
interface TimelineExecutionMapping {
  executionTaskType: DataEngineExecutionTaskType;
}

/** Maps timeline entry types to execution task types */
const TIMELINE_EXECUTION_MAPPING: Record<string, TimelineExecutionMapping> = {
  [MONITORING_ENTRY]: {
    executionTaskType: MONITORING_TASK,
  },
  [SERVICE_INSPECTION_ENTRY]: {
    executionTaskType: INSPECTION_TASK,
  },
  [MAINTENANCE_REVIEW_ENTRY]: {
    executionTaskType: MAINTENANCE_PLANNING_TASK,
  },
  [URGENT_REVIEW_ENTRY]: {
    executionTaskType: DIAGNOSTIC_REVIEW_TASK,
  },
  [CRITICAL_ATTENTION_ENTRY]: {
    executionTaskType: CRITICAL_INTERVENTION_TASK,
  },
};

/**
 * Generate deterministic execution candidate ID
 *
 * Based on: identityId + executionTaskType + sourceEntityRef + priority
 */
function generateExecutionCandidateId(
  identityId: string,
  executionTaskType: DataEngineExecutionTaskType,
  sourceEntityRef: string,
  priority: string
): string {
  const data = `${identityId}:${executionTaskType}:${sourceEntityRef}:${priority}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Generate rationale text for execution candidate
 */
function generateExecutionRationale(
  timelineType: string,
  priority: string,
  executionTaskType: DataEngineExecutionTaskType
): string {
  const taskDescriptions: Record<DataEngineExecutionTaskType, string> = {
    MONITORING_TASK: 'Prepare monitoring task',
    INSPECTION_TASK: 'Prepare inspection task',
    MAINTENANCE_PLANNING_TASK: 'Prepare maintenance planning task',
    DIAGNOSTIC_REVIEW_TASK: 'Prepare diagnostic review task',
    CRITICAL_INTERVENTION_TASK: 'Prepare critical intervention task',
  };

  const description = taskDescriptions[executionTaskType];
  return `${description} from ${timelineType.toLowerCase()} (${priority} priority)`;
}

/**
 * Main execution candidate preparation engine
 *
 * Converts timeline entries to operational execution candidates.
 * Implementation rules:
 *
 * 1. For each timeline entry, determine execution task type based on timeline type
 * 2. Generate deterministic candidate ID
 * 3. Preserve priority from timeline entry
 * 4. Preserve suggested window from timeline entry
 * 5. Create structured rationale text
 * 6. Maintain traceability to source timeline entry
 *
 * @param input Execution candidate input with timeline entries
 * @returns Execution result with all prepared candidates and summary
 */
export function prepareExecutionCandidates(
  input: DataEngineExecutionCandidateInput
): DataEngineExecutionCandidateResult {
  const executionCandidates: DataEngineExecutionCandidate[] = [];
  const timestamp = new Date().toISOString();

  // Process each timeline entry
  for (const timelineEntry of input.timelineEntries) {
    const mapping = TIMELINE_EXECUTION_MAPPING[timelineEntry.timelineType];
    if (!mapping) {
      continue; // Skip unmapped timeline types
    }

    // Generate deterministic ID
    const executionCandidateId = generateExecutionCandidateId(
      input.identityId,
      mapping.executionTaskType,
      input.sourceEntityRef,
      timelineEntry.priority
    );

    // Generate rationale
    const rationale = generateExecutionRationale(
      timelineEntry.timelineType,
      timelineEntry.priority,
      mapping.executionTaskType
    );

    // Create execution candidate
    const candidate = createExecutionCandidate(
      executionCandidateId,
      mapping.executionTaskType,
      timelineEntry.priority,
      input.identityId,
      input.sourceEntityRef,
      [timelineEntry.timelineEntryId], // Traceability to source timeline entry
      timelineEntry.scheduledWindow,
      rationale,
      {
        sourceTimelineType: timelineEntry.timelineType,
        sourceTimelinePriority: timelineEntry.priority,
        sourceTimelineWindow: timelineEntry.scheduledWindow,
        sourceTimelineRationale: timelineEntry.rationale,
      }
    );

    executionCandidates.push(candidate);
  }

  // Create and return result with summary
  return createExecutionResult(executionCandidates, timestamp);
}
