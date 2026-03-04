/**
 * VehicleState Snapshot Accessor
 * Primary way for UI components to read vehicle state
 * 
 * Design:
 * - Single entry point: getVehicleStateSnapshot()
 * - Type-safe accessors for each domain
 * - Read-only: All data flows from snapshots
 * - Consistent: Same data across all UI screens
 * 
 * This is the official "Single Source of Truth" for UI components.
 * NEVER call event sources directly - use this accessor instead.
 */

import { getSnapshot, VehicleStateSnapshot } from './vehicleStateSnapshotStore';

/**
 * Get the latest vehicle state snapshot
 * 
 * This is the primary method UI components should use to read vehicle data.
 * Returns null if snapshot doesn't exist.
 * 
 * @param vehicleId - Vehicle identifier
 * @returns Latest snapshot or null
 */
export function getVehicleStateSnapshot(vehicleId: string): VehicleStateSnapshot | null {
  return getSnapshot(vehicleId);
}

/**
 * Get risk indices from snapshot
 * Safe accessor with null chain protection
 */
export function getRiskIndices(vehicleId: string) {
  const snapshot = getSnapshot(vehicleId);
  return snapshot?.risk?.indices || [];
}

/**
 * Get insurance indices from snapshot
 * Safe accessor with null chain protection
 */
export function getInsuranceIndices(vehicleId: string) {
  const snapshot = getSnapshot(vehicleId);
  return snapshot?.insurance?.indices || [];
}

/**
 * Get part indices from snapshot
 * Safe accessor with null chain protection
 */
export function getPartIndices(vehicleId: string) {
  const snapshot = getSnapshot(vehicleId);
  return snapshot?.part?.indices || [];
}

/**
 * Get expertise findings from snapshot
 * Safe accessor that returns empty array if no findings
 * 
 * All findings are guaranteed to be { code, severity, message } objects
 * Safe to render directly in JSX
 */
export function getExpertiseFindings(vehicleId: string) {
  const snapshot = getSnapshot(vehicleId);
  return snapshot?.expertise?.findings || [];
}

/**
 * Get all indices across all domains
 * @returns { risk, insurance, part } all as arrays
 */
export function getAllIndices(vehicleId: string) {
  const snapshot = getSnapshot(vehicleId);
  return {
    risk: snapshot?.risk?.indices || [],
    insurance: snapshot?.insurance?.indices || [],
    part: snapshot?.part?.indices || [],
  };
}

/**
 * Check if snapshot is fresh (updated within N milliseconds)
 * Useful for UI to show "last updated" info
 */
export function isSnapshotFresh(vehicleId: string, maxAgeMs: number = 30000): boolean {
  const snapshot = getSnapshot(vehicleId);
  if (!snapshot) return false;

  const lastUpdate = new Date(snapshot.updatedAt);
  const now = new Date();
  return now.getTime() - lastUpdate.getTime() <= maxAgeMs;
}

/**
 * Get snapshot metadata (freshness, last event, sources)
 */
export function getSnapshotMetadata(vehicleId: string) {
  const snapshot = getSnapshot(vehicleId);
  if (!snapshot) return null;

  return {
    vehicleId: snapshot.vehicleId,
    schemaVersion: snapshot.schemaVersion,
    updatedAt: snapshot.updatedAt,
    lastEvent: snapshot.lastEvent,
    sources: snapshot.sources,
    domains: {
      hasRisk: !!snapshot.risk?.indices?.length,
      hasInsurance: !!snapshot.insurance?.indices?.length,
      hasPart: !!snapshot.part?.indices?.length,
      hasExpertise: !!snapshot.expertise?.findings?.length,
      hasService: !!snapshot.service,
      hasOdometer: !!snapshot.odometer,
      hasDiagnostics: !!snapshot.diagnostics,
    },
    timestamps: {
      snapshot: snapshot.updatedAt,
      risk: snapshot.risk?.lastUpdatedAt,
      insurance: snapshot.insurance?.lastUpdatedAt,
      part: snapshot.part?.lastUpdatedAt,
      expertise: snapshot.expertise?.lastUpdatedAt,
      service: snapshot.service?.lastUpdatedAt,
      odometer: snapshot.odometer?.lastUpdatedAt,
      diagnostics: snapshot.diagnostics?.lastUpdatedAt,
    },
  };
}

/**
 * DEV: Get all snapshots for debugging
 * Use for dashboard or admin panels only
 */
export function getAllVehicleSnapshots() {
  if (!import.meta.env.DEV) {
    console.warn('[snapshotAccessor] getAllVehicleSnapshots() is DEV-only');
    return [];
  }

  // Lazy load to avoid circular dependency
  const { getAllSnapshots } = require('./vehicleStateSnapshotStore');
  return getAllSnapshots();
}

/**
 * DEV: Clear all snapshots
 * Use for testing/development only
 */
export function clearAllSnapshots() {
  if (!import.meta.env.DEV) {
    console.warn('[snapshotAccessor] clearAllSnapshots() is DEV-only');
    return;
  }

  const { clearSnapshots } = require('./vehicleStateSnapshotStore');
  clearSnapshots();
}
