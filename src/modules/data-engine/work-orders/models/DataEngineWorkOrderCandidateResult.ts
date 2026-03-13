/**
 * Data Engine Work Order Candidate Result
 *
 * Output from the work order candidate preparation engine.
 * Contains all prepared work order candidates and summary statistics.
 *
 * Flows from: createWorkOrderCandidates()
 * Flows to: Work Order Execution Engine (Phase 16+)
 */

import type { DataEngineWorkOrderCandidate } from './DataEngineWorkOrderCandidate';
import type { DataEngineWorkOrderType } from '../types/DataEngineWorkOrderType';
import type { DataEngineTimelinePriority } from '../../timeline/types/DataEngineTimelinePriority';

/**
 * Priority distribution statistics
 */
export interface WorkOrderPriorityDistribution {
  [priority: string]: number;
}

/**
 * Work order type distribution statistics
 */
export interface WorkOrderTypeDistribution {
  [workOrderType: string]: number;
}

/**
 * Summary statistics for work order candidate preparation
 */
export interface WorkOrderSummary {
  /**
   * Total number of work order candidates prepared
   */
  totalWorkOrderCandidates: number;

  /**
   * Distribution of candidates by work order type
   */
  workOrderTypeDistribution: WorkOrderTypeDistribution;

  /**
   * Distribution of candidates by priority
   */
  priorityDistribution: WorkOrderPriorityDistribution;

  /**
   * Highest priority work order candidate priority
   */
  highestPriority: DataEngineTimelinePriority | null;

  /**
   * Count of IMMEDIATE window candidates
   */
  immediateCandidateCount: number;

  /**
   * Count of CRITICAL priority candidates
   */
  criticalCandidateCount: number;
}

/**
 * Result of work order candidate preparation
 *
 * Contains all work order candidates with comprehensive summary
 */
export interface DataEngineWorkOrderCandidateResult {
  /**
   * All prepared work order candidates
   */
  workOrderCandidates: DataEngineWorkOrderCandidate[];

  /**
   * Summary statistics
   */
  summary: WorkOrderSummary;

  /**
   * Timestamp of work order candidate preparation
   */
  preparedAt: string;
}

/**
 * Helper to calculate summary from work order candidates
 */
export function calculateWorkOrderSummary(
  candidates: DataEngineWorkOrderCandidate[]
): WorkOrderSummary {
  const workOrderTypeDistribution: WorkOrderTypeDistribution = {};
  const priorityDistribution: WorkOrderPriorityDistribution = {};
  let highestPriority: DataEngineTimelinePriority | null = null;
  let immediateCandidateCount = 0;
  let criticalCandidateCount = 0;

  const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

  for (const candidate of candidates) {
    // Track work order type distribution
    workOrderTypeDistribution[candidate.workOrderType] =
      (workOrderTypeDistribution[candidate.workOrderType] || 0) + 1;

    // Track priority distribution
    priorityDistribution[candidate.priority] =
      (priorityDistribution[candidate.priority] || 0) + 1;

    // Track highest priority
    if (!highestPriority || priorityOrder[candidate.priority] > priorityOrder[highestPriority]) {
      highestPriority = candidate.priority;
    }

    // Count immediate and critical
    if (candidate.suggestedWindow === 'IMMEDIATE') {
      immediateCandidateCount++;
    }
    if (candidate.priority === 'CRITICAL') {
      criticalCandidateCount++;
    }
  }

  return {
    totalWorkOrderCandidates: candidates.length,
    workOrderTypeDistribution,
    priorityDistribution,
    highestPriority,
    immediateCandidateCount,
    criticalCandidateCount,
  };
}

/**
 * Helper to create result
 */
export function createWorkOrderResult(
  workOrderCandidates: DataEngineWorkOrderCandidate[],
  preparedAt: string
): DataEngineWorkOrderCandidateResult {
  return {
    workOrderCandidates,
    summary: calculateWorkOrderSummary(workOrderCandidates),
    preparedAt,
  };
}
