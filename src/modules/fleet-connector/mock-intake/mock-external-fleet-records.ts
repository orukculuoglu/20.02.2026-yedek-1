/**
 * Mock External Fleet Vehicle Records
 * 
 * Defines exactly 5 realistic fleet vehicle records from external connectors.
 * These records simulate various operational states and edge cases for testing
 * the normalization layer.
 * 
 * These are static mock data only - no dynamic generation.
 */

import {
  ExternalFleetVehicleRecord,
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from '../contracts';

/**
 * Mock external fleet vehicle records for demonstration and testing.
 * 
 * Scenarios covered:
 * 1. Clean operational vehicle (ready)
 * 2. In use but monitor (active with warnings)
 * 3. Blocked for service (maintenance priority)
 * 4. Invalid operational data (data quality issue)
 * 5. Incomplete context (missing required fields)
 */
export const MOCK_EXTERNAL_FLEET_RECORDS: ExternalFleetVehicleRecord[] = [
  {
    // Record 1: Clean operational vehicle - expected ready status
    externalRecordRef: 'EXT-FLEET-REC-001',
    connectorId: 'CONNECTOR-FLEET-DEMO-001',
    providerName: 'Demo Fleet Provider',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    currentMileage: 42000,
    operationalStatus: ExternalFleetOperationalStatus.ACTIVE,
    rentalStatus: ExternalFleetRentalStatus.AVAILABLE,
    maintenanceStatus: ExternalFleetMaintenanceStatus.CLEAR,
    lastUpdatedAt: '2026-06-06T09:00:00Z',
  },

  {
    // Record 2: In use but monitor - expected usable with warnings
    externalRecordRef: 'EXT-FLEET-REC-002',
    connectorId: 'CONNECTOR-FLEET-DEMO-001',
    providerName: 'Demo Fleet Provider',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    currentMileage: 78000,
    operationalStatus: ExternalFleetOperationalStatus.ACTIVE,
    rentalStatus: ExternalFleetRentalStatus.RENTED,
    maintenanceStatus: ExternalFleetMaintenanceStatus.DUE_SOON,
    lastUpdatedAt: '2026-06-06T09:05:00Z',
  },

  {
    // Record 3: Blocked for service - expected maintenance priority
    externalRecordRef: 'EXT-FLEET-REC-003',
    connectorId: 'CONNECTOR-FLEET-DEMO-001',
    providerName: 'Demo Fleet Provider',
    brand: 'Ford',
    model: 'Focus',
    year: 2020,
    currentMileage: 116000,
    operationalStatus: ExternalFleetOperationalStatus.MAINTENANCE,
    rentalStatus: ExternalFleetRentalStatus.BLOCKED,
    maintenanceStatus: ExternalFleetMaintenanceStatus.OVERDUE,
    lastUpdatedAt: '2026-06-06T09:10:00Z',
  },

  {
    // Record 4: Invalid mileage data quality issue
    externalRecordRef: 'EXT-FLEET-REC-004',
    connectorId: 'CONNECTOR-FLEET-DEMO-001',
    providerName: 'Demo Fleet Provider',
    brand: 'Fiat',
    model: 'Egea',
    year: 2019,
    currentMileage: -1,
    operationalStatus: ExternalFleetOperationalStatus.ACTIVE,
    rentalStatus: ExternalFleetRentalStatus.AVAILABLE,
    maintenanceStatus: ExternalFleetMaintenanceStatus.SERVICE_OPEN,
    lastUpdatedAt: '2026-06-06T09:15:00Z',
  },

  {
    // Record 5: Incomplete operational context - missing required fields
    externalRecordRef: 'EXT-FLEET-REC-005',
    connectorId: 'CONNECTOR-FLEET-DEMO-001',
    providerName: 'Demo Fleet Provider',
    operationalStatus: ExternalFleetOperationalStatus.INACTIVE,
    rentalStatus: ExternalFleetRentalStatus.RENTED,
    maintenanceStatus: ExternalFleetMaintenanceStatus.UNKNOWN,
    lastUpdatedAt: '2026-06-06T09:20:00Z',
  },
];
