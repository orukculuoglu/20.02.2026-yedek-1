/**
 * Fleet Connector Configuration Contract
 * 
 * Defines the contract for fleet connector system integration configuration.
 * 
 * Strategic Context:
 * The platform does not replace external fleet, ERP, service, or B2B systems.
 * The platform connects to existing systems, reads allowed operational data,
 * normalizes it, and produces intelligence inside our system.
 */

/**
 * FleetConnectorProviderType
 * 
 * Types of external fleet systems supported by the connector.
 * Represents the provider category (software, ERP, platform, etc.)
 */
export enum FleetConnectorProviderType {
  /** Fleet software systems (telematics, GPS, vehicle tracking) */
  FLEET_SOFTWARE = 'fleet-software',
  
  /** Enterprise Resource Planning systems */
  ERP = 'erp',
  
  /** Service management / maintenance systems */
  SERVICE_MANAGEMENT = 'service-management',
  
  /** B2B platform connections (vendor networks) */
  B2B_PLATFORM = 'b2b-platform',
  
  /** Parts and supply platform */
  PARTS_PLATFORM = 'parts-platform',
  
  /** Custom API implementations */
  CUSTOM_API = 'custom-api',
  
  /** Legacy file-based integrations */
  LEGACY_FILE = 'legacy-file',
}

/**
 * FleetConnectorConnectionMode
 * 
 * Supported authentication and data transfer mechanisms.
 * Determines HOW the system connects to external services.
 */
export enum FleetConnectorConnectionMode {
  /** API token-based authentication */
  API_TOKEN = 'api-token',
  
  /** OAuth 2.0 flow */
  OAUTH = 'oauth',
  
  /** Service account / mutual TLS */
  SERVICE_ACCOUNT = 'service-account',
  
  /** Webhook-based push updates */
  WEBHOOK = 'webhook',
  
  /** SFTP file transfer */
  SFTP = 'sftp',
  
  /** Scheduled file import (FTP, file share, etc.) */
  SCHEDULED_FILE_IMPORT = 'scheduled-file-import',
  
  /** ERP-specific connector protocol */
  ERP_CONNECTOR = 'erp-connector',
  
  /** Integration suite (MuleSoft, Boomi, etc.) */
  INTEGRATION_SUITE = 'integration-suite',
  
  /** Legacy credential vault integration */
  CREDENTIAL_VAULT_LEGACY = 'credential-vault-legacy',
}

/**
 * FleetConnectorAccessMode
 * 
 * Data access and processing patterns.
 * Determines WHAT the system does with external data.
 */
export enum FleetConnectorAccessMode {
  /** Read-only: ingest external data, no transformation or routing */
  READ_ONLY = 'read-only',
  
  /** Read with internal outcome: ingest, normalize, produce internal intelligence */
  READ_WITH_INTERNAL_OUTCOME = 'read-with-internal-outcome',
  
  /** Read with routing: ingest, evaluate, route to services/operations */
  READ_WITH_ROUTING = 'read-with-routing',
}

/**
 * FleetConnectorStatus
 * 
 * Lifecycle status of a connector configuration.
 * Determines if connector is active and available for use.
 */
export enum FleetConnectorStatus {
  /** Configuration not yet activated */
  DRAFT = 'draft',
  
  /** Connector is actively monitoring/syncing */
  ACTIVE = 'active',
  
  /** Temporarily disabled (no automatic sync) */
  SUSPENDED = 'suspended',
  
  /** Last sync failed (requires intervention) */
  FAILED = 'failed',
  
  /** Connector no longer used (historical data available) */
  ARCHIVED = 'archived',
}

/**
 * FleetConnectorScope
 * 
 * Data access scopes/permissions that the connector can request.
 * Represents granular permission model for external system integration.
 */
export enum FleetConnectorScope {
  /** Read vehicle data (status, attributes) */
  VEHICLE_READ = 'vehicle-read',
  
  /** Read rental contract data */
  CONTRACT_READ = 'contract-read',
  
  /** Read rental availability status (available, rented, reserved) */
  RENTAL_STATUS_READ = 'rental-status-read',
  
  /** Read vehicle mileage / odometer readings */
  MILEAGE_READ = 'mileage-read',
  
  /** Read maintenance status and history */
  MAINTENANCE_READ = 'maintenance-read',
  
  /** Read service request status (open, completed, pending) */
  SERVICE_STATUS_READ = 'service-status-read',
  
  /** Read parts/demand information from ERP */
  PART_DEMAND_READ = 'part-demand-read',
  
  /** Read incident/issue reports */
  INCIDENT_READ = 'incident-read',
  
  /** Track outcomes of service requests and routing decisions */
  OUTCOME_TRACK = 'outcome-track',
}

/**
 * FleetConnectorConfig
 * 
 * Configuration contract for a fleet connector integration.
 * 
 * Security:
 * - No raw secrets (only credentialRef)
 * - No embedded credential fields
 * - Internal-only data retention
 * 
 * Timestamps:
 * - Caller-provided strings (ISO 8601 format expected)
 * - Timestamps supplied externally, not generated
 */
export interface FleetConnectorConfig {
  /** Unique identifier for this connector */
  connectorId: string;
  
  /** Human-readable name of the external provider (e.g., "Sonepar ERP", "Geotab Fleet") */
  providerName: string;
  
  /** Category of the provider */
  providerType: FleetConnectorProviderType;
  
  /** Authentication/transfer mechanism */
  connectionMode: FleetConnectorConnectionMode;
  
  /** Data access and processing pattern */
  accessMode: FleetConnectorAccessMode;
  
  /** Current lifecycle status */
  status: FleetConnectorStatus;
  
  /** List of approved data scopes */
  allowedScopes: FleetConnectorScope[];
  
  /** Base URL for API-based connections (optional, may be null for file-based) */
  baseUrl?: string;
  
  /**
   * Reference to stored credentials.
   * 
   * Examples:
   * - "vault://sonepar-api-token"
   * - "azure-keyvault://fleet-oauth-secret"
   * - "legacy-vault://12345"
   * 
   * The actual secret is stored externally. The connector only holds the reference.
   * No raw secrets are stored in this config.
   */
  credentialRef?: string;
  
  /** Tenant ID for multi-tenant external systems */
  tenantId: string;
  
  /** Fleet ID within our system (optional, for multi-fleet connections) */
  fleetId?: string;
  
  /** ISO 8601 timestamp when config was created (caller-provided) */
  createdAt: string;
  
  /** ISO 8601 timestamp when config was last modified (caller-provided) */
  updatedAt: string;
}
