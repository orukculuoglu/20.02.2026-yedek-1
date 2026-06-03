/**
 * Fleet External Record Contract
 * 
 * Defines the contract for normalized external fleet operational data.
 * 
 * This contract represents vehicle and operational data ingested from
 * external fleet systems after normalization and safety filtering.
 * 
 * Safety:
 * - No direct sensitive vehicle identity fields
 * - No customer information
 * - Only safe operational references and statuses
 * - Timestamps from external source, as-is
 */

/**
 * ExternalFleetOperationalStatus
 * 
 * Vehicle operational readiness status as reported by external system.
 */
export enum ExternalFleetOperationalStatus {
  /** Vehicle is operational and available */
  ACTIVE = 'active',
  
  /** Vehicle is not operational */
  INACTIVE = 'inactive',
  
  /** Vehicle is in scheduled maintenance */
  MAINTENANCE = 'maintenance',
  
  /** Vehicle is out of service (other reason) */
  OUT_OF_SERVICE = 'out-of-service',
  
  /** Status unknown or not reported */
  UNKNOWN = 'unknown',
}

/**
 * ExternalFleetRentalStatus
 * 
 * Rental availability status as reported by external system.
 */
export enum ExternalFleetRentalStatus {
  /** Vehicle is available for rental */
  AVAILABLE = 'available',
  
  /** Vehicle is currently rented */
  RENTED = 'rented',
  
  /** Vehicle is reserved (not yet active rental) */
  RESERVED = 'reserved',
  
  /** Vehicle is blocked (cannot be rented) */
  BLOCKED = 'blocked',
  
  /** Status unknown or not reported */
  UNKNOWN = 'unknown',
}

/**
 * ExternalFleetMaintenanceStatus
 * 
 * Maintenance schedule status as reported by external system.
 */
export enum ExternalFleetMaintenanceStatus {
  /** No maintenance due */
  CLEAR = 'clear',
  
  /** Maintenance due soon (within allowed threshold) */
  DUE_SOON = 'due-soon',
  
  /** Maintenance is overdue */
  OVERDUE = 'overdue',
  
  /** Service request is already open */
  SERVICE_OPEN = 'service-open',
  
  /** Status unknown or not reported */
  UNKNOWN = 'unknown',
}

/**
 * ExternalFleetVehicleRecord
 * 
 * Normalized external fleet vehicle data.
 * 
 * This represents a vehicle as reported by an external fleet management system,
 * normalized to a safe, standardized format for internal processing.
 * 
 * Security:
 * - No direct sensitive vehicle identity fields
 * - No customer information
 * - No raw external payload
 * - internalOnlyPlateRef is a reference only, not a direct value
 * 
 * Timestamps:
 * - lastUpdatedAt: when external system last updated this record
 */
export interface ExternalFleetVehicleRecord {
  /**
   * External system's unique identifier for this vehicle record.
   * 
   * Format varies by provider:
   * - "ERP-VEH-12345" (ERP system)
   * - "FLEET-ABC-00001" (fleet software)
   * - "sonepar.vehicle.xyz123" (B2B platform)
   */
  externalRecordRef: string;
  
  /** Connector ID that provided this record */
  connectorId: string;
  
  /** Human-readable provider name */
  providerName: string;
  
  /** Vehicle brand/make (e.g., "Volkswagen", "Mercedes", "Renault") */
  brand?: string;
  
  /** Vehicle model (e.g., "Transporter", "Sprinter", "Master") */
  model?: string;
  
  /** Model year (e.g., 2022) */
  year?: number;
  
  /** Current mileage/odometer reading (kilometers) */
  currentMileage?: number;
  
  /** Vehicle operational readiness status */
  operationalStatus: ExternalFleetOperationalStatus;
  
  /** Rental availability status */
  rentalStatus: ExternalFleetRentalStatus;
  
  /** Maintenance schedule status */
  maintenanceStatus: ExternalFleetMaintenanceStatus;
  
  /**
   * ISO 8601 timestamp of last update in external system.
   * Caller-provided, not generated locally.
   */
  lastUpdatedAt: string;
  
  /**
   * Internal reference for plate matching purposes only.
   * 
   * This is NOT the plate value itself, only a reference key
   * for matching against our internal fleet vehicle records.
   * 
   * Used to determine if external record maps to a known internal vehicle.
   * 
   * Examples:
   * - "internal-plate-ref:12345" (internal identifier)
   * - "match-key:ABC1234" (normalized matching reference)
   * 
   * Never contains actual plate value.
   */
  internalOnlyPlateRef?: string;
}
