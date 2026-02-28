/**
 * Auto-Expert Module - VIO Orchestrator
 * Standardized VIO generation, persistence, and audit logging
 * Version: 1.0
 */

import { buildVIO } from './vioBuilder';
import { vioStore } from './vioStore';
import { auditStore } from '../audit';
import type { VehicleAggregate } from '../../vehicle-intelligence/types';

/**
 * VIO Generation Result
 * Discriminated union for success/failure handling
 */
export type VioGenerationResult =
  | {
      ok: true;
      vehicleId: string;
      generatedAt: string;
      schemaVersion: string;
      indexCount: number;
      signalCount: number;
    }
  | {
      ok: false;
      vehicleId: string;
      error: string;
    };

/**
 * Generate VIO from VehicleAggregate and persist with audit logging
 *
 * Process:
 * 1. Build VIO from aggregate using vioBuilder
 * 2. Persist to vioStore
 * 3. Track generation status using vioStore.storeLastStatus()
 * 4. Log success audit entry (VIO_GENERATED)
 * 5. Return result with metadata
 *
 * On error:
 * 1. Log failure audit entry (VIO_FAILED)
 * 2. Store error status
 * 3. Return failure result with error message
 */
export function generateAndStoreVIO(aggregate: VehicleAggregate): VioGenerationResult {
  try {
    // Build VIO from aggregate
    const vio = buildVIO(aggregate);

    // Persist to localStorage
    vioStore.save(vio.vehicleId, vio);

    // Store generation status (success)
    vioStore.storeLastStatus(vio.vehicleId, 'ok', vio.generatedAt);

    // Append audit log entry (VIO_GENERATED)
    auditStore.append({
      action: 'VIO_GENERATED',
      reportId: undefined,
      actorId: 'system',
      meta: {
        vehicleId: vio.vehicleId,
        plate: aggregate.plate,
        schemaVersion: vio.schemaVersion,
        generatedAt: vio.generatedAt,
        indexCount: vio.indexes.length,
        signalCount: vio.signals.length,
        dataSourceCount: Object.values(aggregate.dataSources).filter((arr) => arr.length > 0)
          .length,
      },
    });

    console.log(
      `[VIOOrchestrator] ✓ VIO generated and persisted for ${aggregate.plate} (${vio.indexes.length} indexes, ${vio.signals.length} signals)`
    );

    return {
      ok: true,
      vehicleId: vio.vehicleId,
      generatedAt: vio.generatedAt,
      schemaVersion: vio.schemaVersion,
      indexCount: vio.indexes.length,
      signalCount: vio.signals.length,
    } as const;
  } catch (e: any) {
    const errorMessage = e?.message || String(e);
    const vehicleId = aggregate.vehicleId;
    const at = new Date().toISOString();

    // Store generation status (failed)
    vioStore.storeLastStatus(vehicleId, 'failed', at, errorMessage);

    // Append audit log entry (VIO_FAILED)
    auditStore.append({
      action: 'VIO_FAILED',
      reportId: undefined,
      actorId: 'system',
      meta: {
        vehicleId,
        plate: aggregate.plate,
        error: errorMessage,
        errorType: e?.constructor?.name || 'Unknown',
      },
    });

    console.error(`[VIOOrchestrator] ✗ VIO generation failed for ${aggregate.plate}:`, errorMessage);

    return {
      ok: false,
      vehicleId,
      error: errorMessage,
    } as const;
  }
}

/**
 * Get last generation status for a vehicle
 * Returns null if never generated
 */
export function getLastGenerationStatus(vehicleId: string): {
  status: 'ok' | 'failed';
  at: string;
  error?: string;
} | null {
  return vioStore.getLastStatus(vehicleId);
}
