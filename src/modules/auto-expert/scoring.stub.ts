/**
 * Auto Expert Scoring Engine - Phase 1 STUB
 * Real algorithm will be implemented in Phase 2
 * For now, returns default score=100 and no risk flags
 */

import type { ExpertReport, RiskFlag } from './types';

/**
 * Phase 1: Stub implementation
 * Always returns score 100 and no flags
 * Phase 2 will implement actual scoring logic based on:
 * - ChecklistItem.result (OK/Minor/Major)
 * - ChecklistItem.weight
 * - ChecklistItem.riskTrigger
 */
export function recomputeScoreAndFlags(report: ExpertReport): void {
  // Phase 1: Default values
  report.score = 100;
  report.riskFlags = [];

  // TODO Phase 2: Implement scoring algorithm
  // - Calculate score based on item results and weights
  // - Trigger risk flags based on items marked as Major
  // - Example:
  //   let score = 100;
  //   const flags: RiskFlag[] = [];
  //   for (const section of report.checklist) {
  //     for (const item of section.items) {
  //       if (item.result === 'Major') {
  //         score -= item.weight * item.scoreImpact;
  //         if (item.riskTrigger) flags.push(item.riskTrigger);
  //       } else if (item.result === 'Minor') {
  //         score -= Math.ceil(item.weight * 0.5 * item.scoreImpact);
  //       }
  //     }
  //   }
  //   report.score = Math.max(0, score);
  //   report.riskFlags = [...new Set(flags)];
}
