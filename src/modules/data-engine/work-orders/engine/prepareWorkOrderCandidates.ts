/**
 * Prepare Work Order Candidates Engine
 *
 * Main engine function for generating work order candidates
 * from execution candidates.
 *
 * This engine converts Phase 14 execution candidates into Phase 15
 * work order candidates with deterministic mapping rules.
 *
 * NOT EXECUTED: These are structured work order preparations only.
 * No real work orders, ERP calls, or external integrations are made.
 */

import { createHash } from 'crypto';
import type { DataEngineWorkOrderCandidateInput } from '../models/DataEngineWorkOrderCandidateInput';
import type { DataEngineWorkOrderCandidateResult } from '../models/DataEngineWorkOrderCandidateResult';
import type { DataEngineWorkOrderCandidate } from '../models/DataEngineWorkOrderCandidate';
import { createWorkOrderCandidate } from '../models/DataEngineWorkOrderCandidate';
import { createWorkOrderResult } from '../models/DataEngineWorkOrderCandidateResult';
import {
  VEHICLE_MONITORING_ORDER,
  DIAGNOSTIC_INSPECTION_ORDER,
  MAINTENANCE_PLANNING_ORDER,
  EXPERT_DIAGNOSTIC_REVIEW_ORDER,
  CRITICAL_SERVICE_INTERVENTION_ORDER,
  type DataEngineWorkOrderType,
} from '../types/DataEngineWorkOrderType';
import {
  MONITORING_TASK,
  INSPECTION_TASK,
  MAINTENANCE_PLANNING_TASK,
  DIAGNOSTIC_REVIEW_TASK,
  CRITICAL_INTERVENTION_TASK,
} from '../../execution/types/DataEngineExecutionTaskType';

/** Mapping rules from execution task type to work order type */
interface ExecutionWorkOrderMapping {
  workOrderType: DataEngineWorkOrderType;
  actionTemplates: string[];
}

/** Maps execution task types to work order types and recommended actions */
const EXECUTION_WORKORDER_MAPPING: Record<string, ExecutionWorkOrderMapping> = {
  [MONITORING_TASK]: {
    workOrderType: VEHICLE_MONITORING_ORDER,
    actionTemplates: [
      'Collect vehicle telemetry data',
      'Monitor component health signals',
      'Log signal trends',
      'Update vehicle health profile',
    ],
  },
  [INSPECTION_TASK]: {
    workOrderType: DIAGNOSTIC_INSPECTION_ORDER,
    actionTemplates: [
      'Perform diagnostic assessment',
      'Inspect identified components',
      'Collect diagnostic codes',
      'Document inspection findings',
      'Generate diagnostic report',
    ],
  },
  [MAINTENANCE_PLANNING_TASK]: {
    workOrderType: MAINTENANCE_PLANNING_ORDER,
    actionTemplates: [
      'Review maintenance requirements',
      'Plan maintenance activities',
      'Estimate maintenance costs',
      'Schedule maintenance window',
      'Prepare maintenance documentation',
    ],
  },
  [DIAGNOSTIC_REVIEW_TASK]: {
    workOrderType: EXPERT_DIAGNOSTIC_REVIEW_ORDER,
    actionTemplates: [
      'Conduct expert diagnostic review',
      'Analyze multi-domain signals',
      'Provide specialist assessment',
      'Recommend intervention actions',
      'Document expert findings',
    ],
  },
  [CRITICAL_INTERVENTION_TASK]: {
    workOrderType: CRITICAL_SERVICE_INTERVENTION_ORDER,
    actionTemplates: [
      'Initiate critical assessment',
      'Prepare intervention plan',
      'Coordinate urgent response',
      'Execute critical actions',
      'Document intervention results',
    ],
  },
};

/**
 * Generate deterministic work order candidate ID
 *
 * Based on: identityId + workOrderType + sourceEntityRef + priority
 */
function generateWorkOrderCandidateId(
  identityId: string,
  workOrderType: DataEngineWorkOrderType,
  sourceEntityRef: string,
  priority: string
): string {
  const data = `${identityId}:${workOrderType}:${sourceEntityRef}:${priority}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Generate rationale text for work order candidate
 */
function generateWorkOrderRationale(
  executionTaskType: string,
  priority: string,
  workOrderType: DataEngineWorkOrderType
): string {
  return `${executionTaskType} (${priority}) execution candidate → ${workOrderType} work order`;
}

/**
 * Main work order candidate preparation engine
 *
 * Converts execution candidates to work order candidates.
 * Implementation rules:
 *
 * 1. For each execution candidate, determine work order type based on task type
 * 2. Generate deterministic candidate ID
 * 3. Preserve priority from execution candidate
 * 4. Preserve suggested window from execution candidate
 * 5. Generate recommended actions based on work order type
 * 6. Create structured rationale text
 * 7. Maintain traceability to source execution candidate
 *
 * @param input Work order candidate input (Phase 14 result)
 * @returns Work order result with all prepared candidates and summary
 */
export function createWorkOrderCandidates(
  input: DataEngineWorkOrderCandidateInput
): DataEngineWorkOrderCandidateResult {
  const workOrderCandidates: DataEngineWorkOrderCandidate[] = [];
  const timestamp = new Date().toISOString();

  // Process each execution candidate
  for (const executionCandidate of input.executionCandidates) {
    const mapping = EXECUTION_WORKORDER_MAPPING[executionCandidate.executionTaskType];
    if (!mapping) {
      continue; // Skip unmapped execution task types
    }

    // Generate deterministic ID
    const workOrderCandidateId = generateWorkOrderCandidateId(
      input.identityId,
      mapping.workOrderType,
      input.sourceEntityRef,
      executionCandidate.priority
    );

    // Generate rationale
    const rationale = generateWorkOrderRationale(
      executionCandidate.executionTaskType,
      executionCandidate.priority,
      mapping.workOrderType
    );

    // Create work order candidate
    const candidate = createWorkOrderCandidate(
      workOrderCandidateId,
      mapping.workOrderType,
      executionCandidate.priority,
      input.identityId,
      input.sourceEntityRef,
      [executionCandidate.executionCandidateId], // Traceability to source execution candidate
      executionCandidate.suggestedWindow,
      rationale,
      mapping.actionTemplates,
      {
        sourceExecutionTaskType: executionCandidate.executionTaskType,
        sourceExecutionPriority: executionCandidate.priority,
        sourceExecutionWindow: executionCandidate.suggestedWindow,
        sourceExecutionRationale: executionCandidate.rationale,
      }
    );

    workOrderCandidates.push(candidate);
  }

  // Create and return result with summary
  return createWorkOrderResult(workOrderCandidates, timestamp);
}
