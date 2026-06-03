/**
 * Fleet Connector Contracts
 * 
 * Core contract layer for fleet connector system integrations.
 * 
 * Exports all enums and interfaces used for fleet connector integration,
 * synchronization, service routing, and outcome tracking.
 * 
 * This is a contracts-only module with no runtime implementations.
 */

// Fleet Connector Configuration Contracts
export {
  FleetConnectorProviderType,
  FleetConnectorConnectionMode,
  FleetConnectorAccessMode,
  FleetConnectorStatus,
  FleetConnectorScope,
  type FleetConnectorConfig,
} from './fleet-connector-config.contract';

// External Fleet Record Contracts
export {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
  type ExternalFleetVehicleRecord,
} from './fleet-external-record.contract';

// Fleet Synchronization Record Contracts
export {
  FleetSyncDirection,
  FleetSyncStatus,
  FleetSyncErrorCode,
  type FleetExternalSyncRecord,
} from './fleet-sync-record.contract';

// Fleet Service Routing Contracts
export {
  FleetServiceRoutingSource,
  FleetServiceRoutingReasonCode,
  FleetServiceRoutingPriority,
  FleetServiceRoutingStatus,
  FleetServiceTargetType,
  type FleetServiceRoutingRequest,
} from './fleet-service-routing.contract';

// Fleet Service Outcome Contracts
export {
  FleetServiceOutcomeStatus,
  FleetServiceOutcomeResultCode,
  FleetServiceOutcomeNextAction,
  type FleetServiceRoutingOutcome,
} from './fleet-service-outcome.contract';
