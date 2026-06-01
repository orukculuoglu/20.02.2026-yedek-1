/**
 * Fleet Rental Binding Service
 * 
 * Safe domain-scoped binding infrastructure between Vehicle Library and Fleet Rental.
 * 
 * ARCHITECTURE:
 * - Vehicle Library: domain-scoped L-prefixed operational IDs
 * - Fleet Rental: domain-scoped F-prefixed operational IDs
 * - Binding Registry: metadata-only cross-domain relations (internal, not exposed to UI)
 * 
 * CONSTRAINTS:
 * - No implicit second vehicle identity
 * - No exposed cross-domain ID mapping in UI
 * - Deterministic ID generation (stable seed-based, no runtime randomization)
 * - Safe field transformation (no PII, no VIN, no plate copy)
 */

import type { VehicleProfile } from '../types';
import type { Vehicle } from '../types/fleetRental';

// ============================================================================
// BINDING METADATA TYPES (SERVICE-INTERNAL)
// ============================================================================

/**
 * VehicleFleetRentalBinding
 * 
 * Metadata structure for cross-domain vehicle binding.
 * Stores relational information only - NOT operational identities.
 * 
 * sourceVehicleRef: Library vehicle_id (e.g., "L-WBALZ7C5-1")
 * targetVehicleRef: Fleet Rental vehicleId (e.g., "F-FLEET001-V-3a4b2c1d")
 * 
 * This binding enables status display without exposing ID mapping to UI.
 */
interface VehicleFleetRentalBinding {
  bindingId: string;                // Deterministic binding ID (e.g., "BIND-20260531-ab3d")
  sourceDomain: 'vehicle-library';
  targetDomain: 'fleet-rental';
  sourceVehicleRef: string;         // Library vehicle_id (L-prefixed)
  targetVehicleRef: string;         // Fleet Rental vehicleId (F-prefixed)
  fleetId: string;                  // Context: which fleet
  bindingEffectiveAt: string;       // ISO date (deterministic, no runtime generation)
  bindingCreatedBy: string;         // Operator ID for audit trail
  status: 'active' | 'inactive' | 'archived';
}

// ============================================================================
// MOCK BINDING REGISTRY (SERVICE-INTERNAL, NOT EXPORTED)
// ============================================================================

/**
 * In-memory binding registry.
 * Service-internal only - not exported to UI or other modules.
 * In production, would be replaced with persistent storage.
 */
const MOCK_FLEET_RENTAL_BINDINGS: VehicleFleetRentalBinding[] = [];

/**
 * In-memory storage for bound Fleet Rental vehicles.
 * Service-internal only - not exported to UI or other modules.
 * Stores only safe Fleet Rental Vehicle objects (no Library ID fields, no PII).
 * 
 * When a Library vehicle is bound to Fleet Rental, the generated Fleet vehicle
 * is stored here for retrieval by FleetRental.tsx component.
 * 
 * Key point: This stores ONLY the Fleet Rental vehicle object,
 * not the cross-domain binding metadata.
 */
const MOCK_BOUND_FLEET_RENTAL_VEHICLES: Vehicle[] = [];

// ============================================================================
// DETERMINISTIC HELPERS (NO RANDOMNESS)
// ============================================================================

/**
 * Simple deterministic hash function
 * Input: stable string
 * Output: deterministic hex string
 * 
 * Uses character code sum + XOR for simplicity.
 * Same input always produces same output.
 */
function deterministicHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex and ensure positive
  const hex = (Math.abs(hash) >>> 0).toString(16);
  return hex.padStart(8, '0');
}

/**
 * Create deterministic Fleet Rental vehicle ID
 * 
 * Pattern: F-${fleetIdSafe}-V-${hashPart}
 * 
 * Example: F-FLEET001-V-3a4b2c1d
 * 
 * @param input.fleetId - Fleet context
 * @param input.sourceVehicleRef - Source Library vehicle ID
 * @param input.sequence - Sequence number (registry size)
 * @returns Deterministic F-prefixed vehicleId
 */
export function createFleetRentalVehicleId(input: {
  fleetId: string;
  sourceVehicleRef: string;
  sequence: number;
}): string {
  const seed = `${input.fleetId}|${input.sourceVehicleRef}|${input.sequence}|FLEET_VEHICLE`;
  const hash = deterministicHash(seed);
  // Take first 8 chars of hash for conciseness
  const hashPart = hash.substring(0, 8);
  return `F-${input.fleetId}-V-${hashPart}`;
}

/**
 * Create deterministic binding ID
 * 
 * Pattern: BIND-${dateStamp}-${hashPart}
 * 
 * Example: BIND-20260531-ab3d
 * 
 * @param input.fleetId - Fleet context
 * @param input.sourceVehicleRef - Source vehicle reference
 * @param input.targetVehicleRef - Target vehicle reference
 * @param input.sequence - Registry sequence
 * @returns Deterministic BIND-prefixed ID
 */
export function createFleetRentalBindingId(input: {
  fleetId: string;
  sourceVehicleRef: string;
  targetVehicleRef: string;
  sequence: number;
}): string {
  // Use fixed reference date (2026-05-31) for determinism
  const dateStamp = '20260531';
  const seed = `${input.fleetId}|${input.sourceVehicleRef}|${input.targetVehicleRef}|${input.sequence}|BINDING`;
  const hash = deterministicHash(seed);
  const hashPart = hash.substring(0, 4);
  return `BIND-${dateStamp}-${hashPart}`;
}

// ============================================================================
// SAFE FIELD TRANSFORMATION
// ============================================================================

/**
 * mapLibraryVehicleToFleetRentalVehicle
 * 
 * Safe transformation from Library vehicle to Fleet vehicle.
 * 
 * SAFE TO COPY:
 * - brand, model, year (descriptive fields)
 * - mileage → currentMileage (operational metric)
 * - risk_score → riskScore (analytical metric)
 * 
 * MUST NOT COPY:
 * - VIN (PII - KVKK violation)
 * - plate (PII - KVKK violation)
 * - customer data (PII)
 * - Library vehicle_id to Fleet vehicleId (domain isolation)
 * 
 * MUST SET EMPTY:
 * - plateNumber: "" (fleet assigns its own, not copied from library)
 * - vin: "" (never expose PII)
 * 
 * @param input.libraryVehicle - Source VehicleProfile from library
 * @param input.fleetId - Target fleet context
 * @param input.fleetVehicleId - Deterministically generated F-prefixed vehicleId
 * @returns Fleet Rental Vehicle object with safe defaults
 */
export function mapLibraryVehicleToFleetRentalVehicle(input: {
  libraryVehicle: VehicleProfile;
  fleetId: string;
  fleetVehicleId: string;
}): Vehicle {
  return {
    vehicleId: input.fleetVehicleId, // ← F-prefixed, NOT library ID
    fleetId: input.fleetId,
    plateNumber: '', // ← Empty: fleet assigns its own plate
    brand: input.libraryVehicle.brand,
    model: input.libraryVehicle.model,
    year: input.libraryVehicle.year,
    vin: '', // ← Empty: never copy PII
    currentMileage: input.libraryVehicle.mileage || 0,
    status: 'ACTIVE' as const,
    nextMaintenanceKm: (input.libraryVehicle.mileage || 0) + 10000,
    nextMaintenanceDate: '2026-06-30', // ← Deterministic policy date
    riskScore: input.libraryVehicle.risk_score || 0,
    avidVerificationStatus: 'pending' as const, // ← Must be verified in fleet context
  };
}

// ============================================================================
// BINDING LOOKUP FUNCTIONS
// ============================================================================

/**
 * getFleetRentalMembershipStatus
 * 
 * Check if a Library vehicle is bound to any Fleet Rental.
 * 
 * UI-SAFE: Returns only status and count, no ID mapping exposed.
 * 
 * @param sourceVehicleRef - Library vehicle_id (L-prefixed)
 * @returns Status object for UI display
 */
export function getFleetRentalMembershipStatus(sourceVehicleRef: string): {
  bound: boolean;
  status: 'Aktif' | 'Pasif';
  bindingCount: number;
} {
  const activeBindings = MOCK_FLEET_RENTAL_BINDINGS.filter(
    b => b.sourceVehicleRef === sourceVehicleRef && b.status === 'active'
  );

  return {
    bound: activeBindings.length > 0,
    status: activeBindings.length > 0 ? 'Aktif' : 'Pasif',
    bindingCount: activeBindings.length,
  };
}

/**
 * getFleetRentalBindingsForLibraryVehicle
 * 
 * Internal/operator function to find all Fleet Rental bindings for a Library vehicle.
 * Does NOT return targetVehicleRef (Fleet ID mapping) to UI callers.
 * 
 * @param sourceVehicleRef - Library vehicle_id (L-prefixed)
 * @returns Array of active bindings with fleet context only
 */
export function getFleetRentalBindingsForLibraryVehicle(
  sourceVehicleRef: string
): Array<{
  fleetId: string;
  status: 'active' | 'inactive' | 'archived';
}> {
  return MOCK_FLEET_RENTAL_BINDINGS.filter(b => b.sourceVehicleRef === sourceVehicleRef)
    .map(b => ({
      fleetId: b.fleetId,
      status: b.status,
    }));
}

// ============================================================================
// BINDING CREATION
// ============================================================================

/**
 * createFleetRentalBindingFromLibrary
 * 
 * Create a new binding and Fleet Rental vehicle from a Library vehicle.
 * 
 * PROCESS:
 * 1. Check: Active binding doesn't already exist for this sourceRef + fleetId
 * 2. Generate: F-prefixed vehicleId deterministically
 * 3. Generate: binding ID deterministically
 * 4. Transform: Library vehicle → Fleet vehicle (safe mapping, no PII)
 * 5. Store: Binding metadata in internal registry
 * 6. Return: Success flag + Fleet vehicle object (without exposing ID mapping)
 * 
 * SAFETY:
 * - No API calls (infrastructure layer only)
 * - No mutation of Library records
 * - No UI state changes
 * - Deterministic operations throughout
 * 
 * @param input.libraryVehicle - Source VehicleProfile from library
 * @param input.fleetId - Target fleet context
 * @param input.bindingEffectiveAt - ISO date for binding (caller provides)
 * @param input.bindingCreatedBy - Operator ID for audit
 * @returns Operation result with Fleet vehicle object if successful
 */
export function createFleetRentalBindingFromLibrary(input: {
  libraryVehicle: VehicleProfile;
  fleetId: string;
  bindingEffectiveAt: string;
  bindingCreatedBy: string;
}): {
  success: boolean;
  message: string;
  bindingId?: string;
  fleetVehicle?: Vehicle;
} {
  const sourceVehicleRef = input.libraryVehicle.vehicle_id;

  // Validation: Check if active binding already exists
  const existingBinding = MOCK_FLEET_RENTAL_BINDINGS.find(
    b =>
      b.sourceVehicleRef === sourceVehicleRef &&
      b.fleetId === input.fleetId &&
      b.status === 'active'
  );

  if (existingBinding) {
    return {
      success: false,
      message: 'Araç zaten bu filoda bağlı',
    };
  }

  // Generate deterministic IDs
  const sequence = MOCK_FLEET_RENTAL_BINDINGS.length + 1;
  const targetVehicleRef = createFleetRentalVehicleId({
    fleetId: input.fleetId,
    sourceVehicleRef,
    sequence,
  });

  const bindingId = createFleetRentalBindingId({
    fleetId: input.fleetId,
    sourceVehicleRef,
    targetVehicleRef,
    sequence,
  });

  // Safe transformation: Library vehicle → Fleet vehicle
  const fleetVehicle = mapLibraryVehicleToFleetRentalVehicle({
    libraryVehicle: input.libraryVehicle,
    fleetId: input.fleetId,
    fleetVehicleId: targetVehicleRef,
  });

  // Create binding metadata
  const binding: VehicleFleetRentalBinding = {
    bindingId,
    sourceDomain: 'vehicle-library',
    targetDomain: 'fleet-rental',
    sourceVehicleRef,
    targetVehicleRef,
    fleetId: input.fleetId,
    bindingEffectiveAt: input.bindingEffectiveAt,
    bindingCreatedBy: input.bindingCreatedBy,
    status: 'active',
  };

  // Store binding in registry
  MOCK_FLEET_RENTAL_BINDINGS.push(binding);

  // Store bound Fleet vehicle for retrieval by Fleet Rental UI
  // Deduplicate by fleetId + vehicleId to avoid storing same vehicle twice
  const existingBoundVehicle = MOCK_BOUND_FLEET_RENTAL_VEHICLES.find(
    v => v.fleetId === input.fleetId && v.vehicleId === fleetVehicle.vehicleId
  );
  if (!existingBoundVehicle) {
    MOCK_BOUND_FLEET_RENTAL_VEHICLES.push(fleetVehicle);
  }

  return {
    success: true,
    message: 'Araç filo kiralama sistemine başarıyla eklendi',
    bindingId,
    fleetVehicle, // ← Fleet vehicle object for downstream processing
  };
}

// ============================================================================
// BOUND VEHICLE RETRIEVAL (FOR FLEET RENTAL UI)
// ============================================================================

/**
 * getFleetRentalBoundVehicles
 * 
 * Get all Fleet Rental vehicles created from Library bindings for a specific fleet.
 * 
 * SAFETY:
 * - Returns ONLY safe Fleet Rental Vehicle objects.
 * - Does NOT expose Library ID fields.
 * - Does NOT expose bindingId.
 * - Does NOT expose source/target ID mapping together.
 * - Uses F-domain vehicleId only.
 * 
 * @param fleetId - Target fleet ID (e.g., 'FLEET001')
 * @returns Array of bound Fleet Rental vehicles (safe F-prefixed vehicleId)
 */
export function getFleetRentalBoundVehicles(fleetId: string): Vehicle[] {
  // Return only vehicles for the requested fleet
  return MOCK_BOUND_FLEET_RENTAL_VEHICLES.filter(v => v.fleetId === fleetId);
}

