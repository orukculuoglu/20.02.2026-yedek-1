/**
 * Vehicle Intelligence Module - API Data Provider
 * Uses real backend API for vehicle data
 * STUB: To be implemented when API endpoints are ready
 */

import type { IVehicleDataProvider, DataSourcesResult } from './IVehicleDataProvider';
import { normalizeAllDataSources } from '../normalizers';

export class ApiVehicleDataProvider implements IVehicleDataProvider {
  /**
   * Fetch real vehicle data from backend API
   * Normalizes raw API responses into internal shapes
   * TODO: Implement actual API calls when endpoints are ready
   */
  async fetchAll(vehicleId: string, vin: string, plate: string): Promise<DataSourcesResult> {
    try {
      // TODO: Import and use apiClient
      // import { apiClient } from '../../../services/apiClient';

      // Example API structure (to be implemented):
      // const rawData = {
      //   kmHistory: await apiClient.get(`/api/vehicles/${vehicleId}/km-history`),
      //   obdRecords: await apiClient.get(`/api/vehicles/${vehicleId}/obd-records`),
      //   insuranceRecords: await apiClient.get(`/api/vehicles/${vehicleId}/insurance-records`),
      //   damageRecords: await apiClient.get(`/api/vehicles/${vehicleId}/damage-records`),
      //   serviceRecords: await apiClient.get(`/api/vehicles/${vehicleId}/service-records`),
      // };

      // For now, return empty normalized data (stub)
      const rawData = {
        kmHistory: [],
        obdRecords: [],
        insuranceRecords: [],
        damageRecords: [],
        serviceRecords: [],
      };

      // ALWAYS normalize data (ensures consistent internal shapes)
      return normalizeAllDataSources(rawData);
    } catch (err) {
      console.error('[ApiVehicleDataProvider] Error fetching vehicle data:', err);
      throw err;
    }
  }
}
