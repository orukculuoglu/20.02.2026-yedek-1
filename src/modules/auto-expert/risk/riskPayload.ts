/**
 * Risk Payload Builder - Constructs standardized payload for Risk Engine
 * From ExpertReport + Vehicle data
 */

import type { ExpertReport, ChecklistSection } from '../types';
import type { Vehicle } from '../vehicle/vehicleTypes';

export interface ChecklistSummarySection {
  name: string;
  okCount: number;
  minorCount: number;
  majorCount: number;
  weightedImpactSum: number;
}

export interface RiskEnginePayload {
  vehicleId: string;
  vin: string;
  plate: string;
  reportId: string;
  finalizedAt: string;
  expertScore: number; // 0-100
  riskFlags: string[]; // StructuralRisk, MechanicalRisk, AirbagRisk
  checklistSummary: {
    sections: ChecklistSummarySection[];
    totalItems: number;
    okItems: number;
    minorItems: number;
    majorItems: number;
  };
  odometer?: number; // Optional, for future use
}

/**
 * Calculate weighted impact sum for a checklist section
 */
function calculateSectionImpact(section: ChecklistSection): number {
  return section.items.reduce((sum, item) => {
    let impact = item.weight * (item.scoreImpact || 0);
    // Penalize based on result
    if (item.result === 'Minor') impact *= 0.5;
    if (item.result === 'Major') impact *= 1.0;
    return sum + impact;
  }, 0);
}

/**
 * Build standardized Risk Engine payload
 */
export function buildRiskPayload(
  report: ExpertReport,
  vehicle: Vehicle | null
): RiskEnginePayload {
  // Calculate checklist summary
  const checklistSummary = {
    sections: report.checklist.map(section => {
      const okCount = section.items.filter(i => i.result === 'OK').length;
      const minorCount = section.items.filter(i => i.result === 'Minor').length;
      const majorCount = section.items.filter(i => i.result === 'Major').length;

      return {
        name: section.name,
        okCount,
        minorCount,
        majorCount,
        weightedImpactSum: calculateSectionImpact(section),
      };
    }),
    totalItems: report.checklist.reduce((sum, s) => sum + s.items.length, 0),
    okItems: report.checklist.reduce((sum, s) => sum + s.items.filter(i => i.result === 'OK').length, 0),
    minorItems: report.checklist.reduce((sum, s) => sum + s.items.filter(i => i.result === 'Minor').length, 0),
    majorItems: report.checklist.reduce((sum, s) => sum + s.items.filter(i => i.result === 'Major').length, 0),
  };

  return {
    vehicleId: report.vehicleId,
    vin: report.vin,
    plate: report.plate,
    reportId: report.id,
    finalizedAt: report.finalizedAt || new Date().toISOString(),
    expertScore: report.score,
    riskFlags: report.riskFlags,
    checklistSummary,
    // odometer: vehicle?.odometer, // For future use
  };
}
