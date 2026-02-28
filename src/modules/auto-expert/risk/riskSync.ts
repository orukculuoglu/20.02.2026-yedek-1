/**
 * Risk Sync - Orchestrates the flow: ExpertReport → RiskEngine → VehicleStore
 * Handles success and failure scenarios
 */

import type { ExpertReport } from '../types';
import { vehicleStore } from '../vehicle/vehicleStore';
import { auditStore } from '../audit';
import { buildRiskPayload } from './riskPayload';
import { sendToRiskEngine } from './riskClient';

/**
 * Sync vehicle risk score from finalized expert report
 * - Builds Risk Engine payload
 * - Sends to Risk Engine
 * - Updates vehicle store with computed risk score
 * - Logs result to audit trail
 *
 * @returns { success: bool, riskScore?: number, reason?: string }
 */
export async function syncRiskFromExpertReport(report: ExpertReport) {
  try {
    // Ensure report is finalized
    if (report.status !== 'Final' || !report.finalizedAt) {
      throw new Error('Cannot sync risk: Report not finalized');
    }

    // Get vehicle data (create if doesn't exist)
    let vehicle = vehicleStore.getById(report.vehicleId);
    if (!vehicle) {
      vehicle = {
        id: report.vehicleId,
        vin: report.vin,
        plate: report.plate,
        model: report.vehicleModel,
      };
      vehicleStore.upsert(vehicle);
    }

    // Build and send payload
    const payload = buildRiskPayload(report, vehicle);
    const response = await sendToRiskEngine(payload);

    // Update vehicle with new risk score
    vehicleStore.setRiskScore(report.vehicleId, response.riskScore);

    // Audit log: success
    auditStore.append({
      reportId: report.id,
      action: 'RISK_SYNC',
      actorId: 'system',
      meta: {
        vehicleId: report.vehicleId,
        riskScore: response.riskScore,
        reasonFlags: response.reasonFlags,
      },
    });

    console.log(`[RiskSync] ✓ Vehicle ${report.plate}: riskScore=${response.riskScore}`);

    return {
      success: true,
      riskScore: response.riskScore,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // Audit log: failure
    auditStore.append({
      reportId: report.id,
      action: 'RISK_SYNC_FAILED',
      actorId: 'system',
      meta: {
        vehicleId: report.vehicleId,
        reason: errorMsg,
      },
    });

    console.error(`[RiskSync] ✗ Vehicle ${report.plate}: ${errorMsg}`);

    return {
      success: false,
      reason: errorMsg,
    };
  }
}
