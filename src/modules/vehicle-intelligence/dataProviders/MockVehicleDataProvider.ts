/**
 * Vehicle Intelligence Module - Mock Data Provider
 * Uses static mock data generators for development/testing
 */

import type { IVehicleDataProvider, DataSourcesResult } from './IVehicleDataProvider';
import {
  getMockKmHistory,
  getMockOBD,
  getMockInsurance,
  getMockDamage,
  getMockService,
} from '../mockDataSources';

export class MockVehicleDataProvider implements IVehicleDataProvider {
  /**
   * Fetch mock data for all vehicle data sources
   * Simulates async API call for consistency with real provider
   */
  async fetchAll(vehicleId: string, vin: string, plate: string): Promise<DataSourcesResult> {
    return {
      kmHistory: getMockKmHistory(vehicleId),
      obdRecords: getMockOBD(vehicleId),
      insuranceRecords: getMockInsurance(vehicleId),
      damageRecords: getMockDamage(vehicleId),
      serviceRecords: getMockService(vehicleId),
    };
  }
}
