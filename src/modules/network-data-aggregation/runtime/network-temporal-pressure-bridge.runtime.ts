/**
 * MOTOR 3 — PHASE 49: TEMPORAL PRESSURE BRIDGE RUNTIME
 * Deterministic Runtime Logic for Mapping Temporal Pressure to Bridge
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No external calls
 * - No async
 * - No randomness
 * - No validation library
 * - No logging
 *
 * Purpose:
 * Implement deterministic runtime logic to map NetworkTemporalPressure into
 * NetworkTemporalPressureBridge, creating bridge structures compatible with
 * core pressure types.
 */

import type { NetworkTemporalPressure, NetworkTemporalPressureLevel } from '../types/network-temporal-pressure.types';
import { NetworkTemporalPressureLevel as NetworkTemporalPressureLevelEnum } from '../types/network-temporal-pressure.types';
import type { NetworkPressureType } from '../types/network-pressure.types';
import { NetworkPressureType as NetworkPressureTypeEnum } from '../types/network-pressure.types';
import type { NetworkTemporalPressureBridgeResult } from '../types/network-temporal-pressure-bridge.types';
import {
  NetworkTemporalPressureBridgeEntity,
  NetworkTemporalPressureBridgeResultEntity,
} from '../entities/network-temporal-pressure-bridge.entity';

// ============================================================================
// DETERMINISTIC MAPPING OBJECTS
// ============================================================================

/**
 * Deterministic mapping from temporal pressure levels to core pressure types.
 */
const PRESSURE_TYPE_MAPPING: Record<string, NetworkPressureType> = {
  [NetworkTemporalPressureLevelEnum.LOW]: NetworkPressureTypeEnum.CAPACITY_PRESSURE,
  [NetworkTemporalPressureLevelEnum.MEDIUM]: NetworkPressureTypeEnum.SUPPLY_PRESSURE,
  [NetworkTemporalPressureLevelEnum.HIGH]: NetworkPressureTypeEnum.DEMAND_PRESSURE,
  [NetworkTemporalPressureLevelEnum.CRITICAL]: NetworkPressureTypeEnum.PRICE_PRESSURE,
};

/**
 * Deterministic mapping from temporal pressure levels to normalized magnitudes.
 */
const MAGNITUDE_MAPPING: Record<string, number> = {
  [NetworkTemporalPressureLevelEnum.LOW]: 25,
  [NetworkTemporalPressureLevelEnum.MEDIUM]: 50,
  [NetworkTemporalPressureLevelEnum.HIGH]: 75,
  [NetworkTemporalPressureLevelEnum.CRITICAL]: 100,
};

// ============================================================================
// TEMPORAL PRESSURE BRIDGE RUNTIME
// ============================================================================

/**
 * Map temporal pressure into bridge structure compatible with core pressure types.
 * Performs deterministic conversion of temporal pressure levels into mapped pressure types
 * and normalized magnitude values.
 *
 * Processing:
 * - Extract temporal pressure properties (ID, domain, level, timestamp)
 * - Map pressure level to pressure type (deterministic)
 * - Map pressure level to magnitude 0-100 (deterministic)
 * - Generate bridge IDs from temporal pressure ID
 * - Create bridge entity with all fields
 * - Wrap in result entity
 * - Return plain contract object
 *
 * Pressure Type Mappings:
 * - LOW → CAPACITY_PRESSURE
 * - MEDIUM → SUPPLY_PRESSURE
 * - HIGH → DEMAND_PRESSURE
 * - CRITICAL → PRICE_PRESSURE
 *
 * Magnitude Mappings:
 * - LOW → 25
 * - MEDIUM → 50
 * - HIGH → 75
 * - CRITICAL → 100
 *
 * ID Generation:
 * - bridgeId: bridge_${temporalPressureId}
 * - targetPressureId: pressure_${temporalPressureId}
 *
 * @param temporalPressure NetworkTemporalPressure to bridge
 * @returns NetworkTemporalPressureBridgeResult with bridge mapping
 */
export function mapTemporalPressureToBridge(
  temporalPressure: NetworkTemporalPressure
): NetworkTemporalPressureBridgeResult {
  // Extract temporal pressure properties
  const temporalPressureId = temporalPressure.temporalPressureId;
  const domain = temporalPressure.domain;
  const temporalPressureLevel = temporalPressure.pressureLevel;
  const createdAt = temporalPressure.createdAt;

  // Map pressure level to pressure type deterministically
  const mappedPressureType = PRESSURE_TYPE_MAPPING[temporalPressureLevel];

  // Map pressure level to magnitude 0-100 deterministically
  const mappedMagnitude = MAGNITUDE_MAPPING[temporalPressureLevel];

  // Generate deterministic bridge IDs from temporal pressure ID
  const bridgeId = `bridge_${temporalPressureId}`;
  const targetPressureId = `pressure_${temporalPressureId}`;

  // Create bridge entity
  const bridgeEntity = new NetworkTemporalPressureBridgeEntity({
    bridgeId,
    temporalPressureId,
    targetPressureId,
    domain,
    temporalPressureLevel,
    mappedPressureType,
    mappedMagnitude,
    createdAt,
    metadata: {},
  });

  // Create result entity
  const resultEntity = new NetworkTemporalPressureBridgeResultEntity({
    bridge: bridgeEntity,
  });

  // Return plain contract object (not entity instance)
  return {
    bridge: {
      bridgeId: resultEntity.bridge.bridgeId,
      temporalPressureId: resultEntity.bridge.temporalPressureId,
      targetPressureId: resultEntity.bridge.targetPressureId,
      domain: resultEntity.bridge.domain,
      temporalPressureLevel: resultEntity.bridge.temporalPressureLevel,
      mappedPressureType: resultEntity.bridge.mappedPressureType,
      mappedMagnitude: resultEntity.bridge.mappedMagnitude,
      createdAt: resultEntity.bridge.createdAt,
      metadata: resultEntity.bridge.metadata,
    },
  };
}
