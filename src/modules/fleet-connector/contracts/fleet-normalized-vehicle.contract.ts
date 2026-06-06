/**
 * Fleet Normalized Vehicle Contract
 * 
 * Defines the contract for normalized fleet vehicle records.
 * 
 * This contract represents external fleet records that have been normalized
 * into a safe, standardized internal format before use by Fleet Rental
 * intelligence, readiness, service routing, and outcome tracking.
 * 
 * Normalization ensures:
 * - No direct sensitive vehicle identity fields
 * - Only safe operational and status references
 * - Clear traceability to external source via safe references
 * 
 * Contract-only: contains no runtime normalization logic.
 */

/**
 * FleetNormalizedVehicleSource
 * 
 * Source origin of the normalized vehicle record.
 */
export enum FleetNormalizedVehicleSource {
  /** Record received directly from connector */
  CONNECTOR = 'connector',
  
  /** Record from scheduled import/batch operation */
  SCHEDULED_IMPORT = 'scheduled-import',
  
  /** Record from webhook/real-time event */
  WEBHOOK = 'webhook',
  
  /** Record from manual review/override */
  MANUAL_REVIEW = 'manual-review',
}

/**
 * FleetNormalizedRecordStatus
 * 
 * Processing status of the normalized record.
 */
export enum FleetNormalizedRecordStatus {
  /** Record accepted and ready for use */
  ACCEPTED = 'accepted',
  
  /** Record accepted with non-critical issues present */
  ACCEPTED_WITH_WARNINGS = 'accepted-with-warnings',
  
  /** Record rejected and not safe for use */
  REJECTED = 'rejected',
  
  /** Record quarantined pending manual review */
  QUARANTINED = 'quarantined',
}

/**
 * FleetNormalizedVehicleRecord
 * 
 * External fleet vehicle record normalized to safe internal format.
 * 
 * This represents a vehicle from an external fleet management system
 * after normalization. The record is designed to be safe for internal
 * use without exposing sensitive external data or identities.
 * 
 * Security:
 * - externalRecordRef is a provider-side reference key, not a sensitive identity
 * - internalOnlyPlateRef is only a reference for matching, never an actual value
 * - No direct sensitive vehicle identity fields
 * 
 * Timestamps:
 * - normalizedAt: when record was normalized (caller-provided)
 * - sourceUpdatedAt: when external system last updated the source record (caller-provided)
 * 
 * Traceability:
 * - Linked to connector via connectorId
 * - Linked to external system via externalRecordRef
 * - Linked to normalization result via normalizedRecordId
 */
export interface FleetNormalizedVehicleRecord {
  /**
   * Unique identifier for this normalized record.
   * 
   * Generated internally to track normalized version of external record.
   * Used to correlate with normalization results and issues.
   */
  normalizedRecordId: string;
  
  /**
   * Connector ID that ingested the external record.
   * 
   * Links to FleetConnectorConfig.
   */
  connectorId: string;
  
  /**
   * Fleet identifier from connector context (optional).
   * 
   * May be absent for single-fleet connector configurations.
   */
  fleetId?: string;
  
  /**
   * Tenant identifier for multi-tenant isolation.
   * 
   * Required for access control and data partitioning.
   */
  tenantId: string;
  
  /**
   * External system's reference key for the source record.
   * 
   * This is a provider-generated identifier, NOT a sensitive vehicle identity.
   * 
   * Format varies by provider:
   * - "ERP-VEH-12345" (ERP system)
   * - "FLEET-ABC-00001" (fleet software)
   * - "sonepar.vehicle.xyz123" (B2B platform)
   * 
   * Used for:
   * - Tracing back to external system
   * - Deduplication and update matching
   * - Safe reference in rejection lists
   */
  externalRecordRef: string;
  
  /**
   * Source origin of this normalized record.
   * 
   * Indicates how the record entered the normalization pipeline.
   */
  source: FleetNormalizedVehicleSource;
  
  /**
   * Processing status of this normalized record.
   * 
   * Indicates whether record is safe for use.
   */
  status: FleetNormalizedRecordStatus;
  
  /**
   * Vehicle brand/make (normalized from external source).
   * 
   * Examples: "Volkswagen", "Mercedes", "Renault"
   * May be absent if not provided by external system or normalization rejected it.
   */
  brand?: string;
  
  /**
   * Vehicle model (normalized from external source).
   * 
   * Examples: "Transporter", "Sprinter", "Master"
   * May be absent if not provided by external system or normalization rejected it.
   */
  model?: string;
  
  /**
   * Model year (normalized from external source).
   * 
   * Examples: 2022, 2023, 2024
   * May be absent if not provided by external system or normalization rejected it.
   */
  year?: number;
  
  /**
   * Current mileage/odometer reading in kilometers.
   * 
   * May be absent if not provided by external system or normalization rejected it.
   * Always in kilometers regardless of external source unit.
   */
  currentMileage?: number;
  
  /**
   * Vehicle operational readiness status.
   * 
   * Required. Must be one of the valid ExternalFleetOperationalStatus values.
   * If external system did not provide clear status, normalized to UNKNOWN.
   */
  operationalStatus: string; // ExternalFleetOperationalStatus enum value
  
  /**
   * Rental availability status.
   * 
   * Required. Must be one of the valid ExternalFleetRentalStatus values.
   * If external system did not provide clear status, normalized to UNKNOWN.
   */
  rentalStatus: string; // ExternalFleetRentalStatus enum value
  
  /**
   * Maintenance schedule status.
   * 
   * Required. Must be one of the valid ExternalFleetMaintenanceStatus values.
   * If external system did not provide clear status, normalized to UNKNOWN.
   */
  maintenanceStatus: string; // ExternalFleetMaintenanceStatus enum value
  
  /**
   * ISO 8601 timestamp when this record was normalized.
   * 
   * Caller-provided, not generated locally.
   * Used to track age of normalization.
   * 
   * Format: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+02:00"
   */
  normalizedAt: string;
  
  /**
   * ISO 8601 timestamp of external system's last update to source record.
   * 
   * Caller-provided from external system, not generated locally.
   * Used to detect if external source has newer version.
   * 
   * Format: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+02:00"
   */
  sourceUpdatedAt: string;
  
  /**
   * Internal reference for vehicle matching and correlation.
   * 
   * This is only a reference key for matching against internal records.
   * Used to determine if this external record maps to a known internal vehicle.
   * 
   * Examples:
   * - "internal-ref:12345" (internal identifier)
   * - "match-key:ABC1234" (normalized matching reference)
   * - "fleet-key:VW-2024-001" (fleet-specific key)
   * 
   * Security Note:
   * - Is only a reference/key for internal correlation
   * - Never contains sensitive identifiers or values
   * 
   * May be absent if matching is not enabled for this connector.
   */
  internalOnlyPlateRef?: string;
}
