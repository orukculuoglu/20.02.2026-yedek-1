/**
 * Runtime State Consumption Surfaces
 *
 * Minimal bounded exposure of internal runtime state contracts.
 * Direct structural projections - no enrichment, no reinterpretation, no derived fields.
 */

/**
 * Capacity measurement (direct from internal CapacityMeasurement)
 */
export interface CapacityMeasurementConsumption {
  readonly capacityResourceId: string;
  readonly available: number;
  readonly used: number;
  readonly limit: number;
}

/**
 * CapacityStateConsumption: Direct bounded exposure of CapacityState
 */
export interface CapacityStateConsumption {
  readonly capacityStateId: string;
  readonly measurements: ReadonlyArray<CapacityMeasurementConsumption>;
}

/**
 * Stock measurement (direct from internal StockMeasurement)
 */
export interface StockMeasurementConsumption {
  readonly stockItemId: string;
  readonly onHand: number;
  readonly reserved: number;
  readonly available: number;
  readonly minimum: number;
}

/**
 * StockStateConsumption: Direct bounded exposure of StockState
 */
export interface StockStateConsumption {
  readonly stockStateId: string;
  readonly measurements: ReadonlyArray<StockMeasurementConsumption>;
}

/**
 * SLA window (direct from internal SLAWindow)
 */
export interface SLAWindowConsumption {
  readonly slaWindowId: string;
  readonly referenceTime: string;
  readonly deadline: string | null;
  readonly slaDurationMs: number;
}

/**
 * SLATimeStateConsumption: Direct bounded exposure of SLATimeState
 */
export interface SLATimeStateConsumption {
  readonly slaTimeStateId: string;
  readonly referenceTime: string;
  readonly slaWindows: ReadonlyArray<SLAWindowConsumption>;
}

/**
 * Resource availability (direct from internal ResourceAvailability)
 */
export interface ResourceAvailabilityConsumption {
  readonly resourceId: string;
  readonly status: string;
  readonly isReady: boolean;
  readonly statusReason: string | null;
}

/**
 * AvailabilityStateConsumption: Direct bounded exposure of AvailabilityState
 */
export interface AvailabilityStateConsumption {
  readonly availabilityStateId: string;
  readonly resources: ReadonlyArray<ResourceAvailabilityConsumption>;
  readonly systemReady: boolean;
}

/**
 * RuntimeContextConsumption: Direct bounded exposure of RuntimeContext
 *
 * This is a read-only projection of the internal RuntimeContext.
 * No fields are invented, derived, or semantically reinterpreted.
 * All fields exist directly in the internal contract.
 */
export interface RuntimeContextConsumption {
  readonly contextId: string;
  readonly capacityState: CapacityStateConsumption | null;
  readonly stockState: StockStateConsumption | null;
  readonly slaTimeState: SLATimeStateConsumption | null;
  readonly availabilityState: AvailabilityStateConsumption | null;
}
