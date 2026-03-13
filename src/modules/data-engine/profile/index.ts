/**
 * Phase 9 — Vehicle Intelligence Profile Module Exports
 *
 * Exports:
 * ✓ Type definitions (DataEngineVehicleProfileDomain)
 * ✓ Data models (contracts)
 *
 * NOT exported:
 * ✗ Engine function (buildVehicleProfile) — backend-only
 *
 * This maintains phase boundaries and prevents unintended usage.
 */

// Type exports
export { DataEngineVehicleProfileDomain } from './types/DataEngineVehicleProfileType';

// Model exports
export type { DataEngineVehicleProfile } from './models/DataEngineVehicleProfile';
export type { DataEngineVehicleProfileCandidate } from './models/DataEngineVehicleProfileCandidate';
export type { DataEngineVehicleProfileResult } from './models/DataEngineVehicleProfileResult';
