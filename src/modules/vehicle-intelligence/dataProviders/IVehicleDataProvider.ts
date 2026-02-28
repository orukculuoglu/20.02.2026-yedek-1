/**
 * Vehicle Intelligence Module - Data Provider Interface
 * Defines the contract for data sources (mock or real API)
 */

import type {
  KmHistoryRecord,
  ObdRecord,
  InsuranceRecord,
  DamageRecord,
  ServiceRecord,
} from '../types';

export interface DataSourcesResult {
  kmHistory: KmHistoryRecord[];
  obdRecords: ObdRecord[];
  insuranceRecords: InsuranceRecord[];
  damageRecords: DamageRecord[];
  serviceRecords: ServiceRecord[];
}

export interface IVehicleDataProvider {
  /**
   * Fetch all vehicle data sources
   * Returns aggregated data from a single source (mock or API)
   */
  fetchAll(vehicleId: string, vin: string, plate: string): Promise<DataSourcesResult>;
}
