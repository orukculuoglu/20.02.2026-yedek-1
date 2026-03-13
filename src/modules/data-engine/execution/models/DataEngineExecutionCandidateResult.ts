/**
 * Data Engine Execution Candidate Result
 *
 * Output from the execution candidate preparation engine.
 * Contains all prepared execution candidates and summary statistics.
 *
 * Flows from: prepareExecutionCandidates()
 * Flows to: Execution Engine (Phase 15+)
 */

import type { DataEngineExecutionCandidate } from './DataEngineExecutionCandidate';
import type { DataEngineExecutionTaskType } from '../types/DataEngineExecutionTaskType';
import type { DataEngineTimelinePriority } from '../../timeline/types/DataEngineTimelinePriority';

/**
 * Priority distribution statistics
 */
export interface ExecutionPriorityDistribution {
  [priority: string]: number;
}

/**
 * Execution task type distribution statistics
 */
export interface ExecutionTypeDistribution {
  [taskType: string]: number;
}

/**
 * Summary statistics for execution candidate preparation
 */
export interface ExecutionSummary {
  /**
   * Total number of execution candidates prepared
   */
  totalCandidates: number;

  /**
   * Distribution of candidates by task type
   */
  taskTypeDistribution: ExecutionTypeDistribution;

  /**
   * Distribution of candidates by priority
   */
  priorityDistribution: ExecutionPriorityDistribution;

  /**
   * Highest priority candidate priority
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
 * Result of execution candidate preparation
 *
 * Contains all execution candidates with comprehensive summary
 */
export interface DataEngineExecutionCandidateResult {
  /**
   * All prepared execution candidates
   */
  executionCandidates: DataEngineExecutionCandidate[];

  /**
   * Summary statistics
   */
  summary: ExecutionSummary;

  /**
   * Timestamp of execution candidate preparation
   */
  preparedAt: string;
}

/**
 * Helper to calculate summary from execution candidates
 */
export function calculateExecutionSummary(
  candidates: DataEngineExecutionCandidate[]
): ExecutionSummary {
  const taskTypeDistribution: ExecutionTypeDistribution = {};
  const priorityDistribution: ExecutionPriorityDistribution = {};
  let highestPriority: DataEngineTimelinePriority | null = null;
  let immediateCandidateCount = 0;
  let criticalCandidateCount = 0;

  const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

  for (const candidate of candidates) {
    // Track task type distribution
    taskTypeDistribution[candidate.executionTaskType] =
      (taskTypeDistribution[candidate.executionTaskType] || 0) + 1;

    // Track priority distribution
    priorityDistribution[candidate.priority] = (priorityDistribution[candidate.priority] || 0) + 1;

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
    totalCandidates: candidates.length,
    taskTypeDistribution,
    priorityDistribution,
    highestPriority,
    immediateCandidateCount,
    criticalCandidateCount,
  };
}

/**
 * Helper to create result
 */
export function createExecutionResult(
  executionCandidates: DataEngineExecutionCandidate[],
  preparedAt: string
): DataEngineExecutionCandidateResult {
  return {
    executionCandidates,
    summary: calculateExecutionSummary(executionCandidates),
    preparedAt,
  };
}
