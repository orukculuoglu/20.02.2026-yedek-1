/**
 * Composite layer core types
 * Defines base composite record structure and specific composite variants
 */

import { CompositeType } from './composite.enums';
import { CompositeBand } from './composite.band';
import { CompositeSeverity } from './composite.severity';
import { CompositeExplanation } from './composite.explanation';
import { CompositeSourceIndexRef } from './composite.source-ref';
import { CompositeMetadata } from './composite.metadata';

/**
 * BaseCompositeRecord is the canonical composite measurement model
 * All composites extend this structure with optional type-specific fields
 */
export interface BaseCompositeRecord {
  /**
   * Unique identifier for this composite record
   * Format: {compositeType}:{vehicleId}:{timestamp}
   */
  compositeId: string;

  /**
   * Type of composite measurement
   */
  compositeType: CompositeType;

  /**
   * Vehicle being measured (if applicable)
   */
  vehicleId?: string;

  /**
   * Fleet being measured (if applicable)
   */
  fleetId?: string;

  /**
   * Raw score before normalization
   */
  score: number;

  /**
   * Normalized score (0.0 - 1.0)
   * Primary output value
   */
  normalizedScore: number;

  /**
   * Overall confidence in this composite (0.0 - 1.0)
   * Reflects data availability and input quality
   */
  confidence: number;

  /**
   * Categorical band derived from normalized score
   */
  band?: CompositeBand;

  /**
   * Action-oriented severity level
   */
  severity?: CompositeSeverity;

  /**
   * Human-readable and machine-readable explanation
   */
  explanation?: CompositeExplanation;

  /**
   * References to source index records that contributed to this composite
   */
  sourceIndexRefs: CompositeSourceIndexRef[];

  /**
   * ISO 8601 timestamp when this composite was created
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp when this composite becomes valid
   */
  validFrom?: string;

  /**
   * ISO 8601 timestamp when this composite expires/becomes stale
   */
  validTo?: string;

  /**
   * Version of this composite record (for schema evolution)
   */
  version: string;

  /**
   * Calculation context and version metadata
   */
  metadata?: CompositeMetadata;
}

/**
 * Vehicle Health Composite
 * Combines reliability, maintenance readiness, and data quality
 */
export interface VehicleHealthComposite extends BaseCompositeRecord {
  compositeType: CompositeType.VEHICLE_HEALTH;
}

/**
 * Operational Risk Composite
 * Combines maintenance urgency and reliability degradation
 */
export interface OperationalRiskComposite extends BaseCompositeRecord {
  compositeType: CompositeType.OPERATIONAL_RISK;
}

/**
 * Insurance Exposure Composite
 * Combines insurance risk and operational readiness
 */
export interface InsuranceExposureComposite extends BaseCompositeRecord {
  compositeType: CompositeType.INSURANCE_EXPOSURE;
}

/**
 * Fleet Vehicle Composite
 * Measure of a vehicle's health relative to fleet average
 */
export interface FleetVehicleComposite extends BaseCompositeRecord {
  compositeType: CompositeType.FLEET_VEHICLE;
}

/**
 * Trust-Adjusted Composite
 * All measurements adjusted for data provenance and quality
 */
export interface TrustAdjustedComposite extends BaseCompositeRecord {
  compositeType: CompositeType.TRUST_ADJUSTED;
}

/**
 * Union type of all composite variants
 * Use for type-safe handling of any composite
 */
export type CompositeRecord =
  | VehicleHealthComposite
  | OperationalRiskComposite
  | InsuranceExposureComposite
  | FleetVehicleComposite
  | TrustAdjustedComposite;
