/**
 * MOTOR 3 — PHASE 0: NETWORK FOUNDATION
 * Type Guard Functions (Runtime Validation)
 *
 * Purpose:
 * Provide runtime validation for canonical network foundation types.
 * These are utility functions for type narrowing and assertion.
 *
 * Note:
 * Type guards are runtime logic and separated from Phase 0 pure definitions.
 */

import type {
  NetworkServiceRef,
  NetworkPartRef,
  NetworkFleetRef,
  NetworkRegionRef,
  NetworkSourceRef,
} from './network-foundation.types';
import { NetworkEventSourceKind } from './network-foundation.types';

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for NetworkServiceRef validation.
 * Narrows unknown type to NetworkServiceRef.
 */
export function isNetworkServiceRef(value: unknown): value is NetworkServiceRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'serviceId' in value &&
    'serviceName' in value &&
    'regionId' in value &&
    typeof (value as NetworkServiceRef).serviceId === 'string' &&
    typeof (value as NetworkServiceRef).serviceName === 'string' &&
    typeof (value as NetworkServiceRef).regionId === 'string'
  );
}

/**
 * Type guard for NetworkPartRef validation.
 * Narrows unknown type to NetworkPartRef.
 */
export function isNetworkPartRef(value: unknown): value is NetworkPartRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'partId' in value &&
    'partName' in value &&
    typeof (value as NetworkPartRef).partId === 'string' &&
    typeof (value as NetworkPartRef).partName === 'string'
  );
}

/**
 * Type guard for NetworkFleetRef validation.
 * Narrows unknown type to NetworkFleetRef.
 */
export function isNetworkFleetRef(value: unknown): value is NetworkFleetRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fleetId' in value &&
    'fleetName' in value &&
    typeof (value as NetworkFleetRef).fleetId === 'string' &&
    typeof (value as NetworkFleetRef).fleetName === 'string'
  );
}

/**
 * Type guard for NetworkRegionRef validation.
 * Narrows unknown type to NetworkRegionRef.
 */
export function isNetworkRegionRef(value: unknown): value is NetworkRegionRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'regionId' in value &&
    'regionName' in value &&
    typeof (value as NetworkRegionRef).regionId === 'string' &&
    typeof (value as NetworkRegionRef).regionName === 'string'
  );
}

/**
 * Type guard for NetworkSourceRef validation.
 * Narrows unknown type to NetworkSourceRef.
 */
export function isNetworkSourceRef(value: unknown): value is NetworkSourceRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sourceKind' in value &&
    'sourceId' in value &&
    'originModule' in value &&
    'originEntityId' in value &&
    Object.values(NetworkEventSourceKind).includes((value as NetworkSourceRef).sourceKind) &&
    typeof (value as NetworkSourceRef).sourceId === 'string' &&
    typeof (value as NetworkSourceRef).originModule === 'string' &&
    typeof (value as NetworkSourceRef).originEntityId === 'string'
  );
}
