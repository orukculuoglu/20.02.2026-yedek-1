/**
 * Vehicle Intelligence Module - API Data Provider
 * Uses real backend API for vehicle data
 * STUB: To be implemented when API endpoints are ready
 */

import type { IVehicleDataProvider, DataSourcesResult } from './IVehicleDataProvider';

export class ApiVehicleDataProvider implements IVehicleDataProvider {
  /**
   * Fetch real vehicle data from backend API
   * TODO: Implement actual API calls when endpoints are ready
   */
  async fetchAll(vehicleId: string, vin: string, plate: string): Promise<DataSourcesResult> {
    try {
      // TODO: Import and use apiClient
      // import { apiClient } from '../../../services/apiClient';
      // import { dataService } from '../../../services/dataService';

      // Example API structure (to be implemented):
      // const kmHistory = await apiClient.get(`/api/vehicles/${vehicleId}/km-history`);
      // const obdRecords = await apiClient.get(`/api/vehicles/${vehicleId}/obd-records`);
      // const insuranceRecords = await apiClient.get(`/api/vehicles/${vehicleId}/insurance-records`);
      // const damageRecords = await apiClient.get(`/api/vehicles/${vehicleId}/damage-records`);
      // const serviceRecords = await apiClient.get(`/api/vehicles/${vehicleId}/service-records`);

      // return {
      //   kmHistory,
      //   obdRecords,
      //   insuranceRecords,
      //   damageRecords,
      //   serviceRecords,
      // };

      throw new Error(
        '[ApiVehicleDataProvider] API endpoints not yet implemented. ' +
          'Please implement real API calls when backend is ready.'
      );
    } catch (err) {
      console.error('[ApiVehicleDataProvider] Error fetching vehicle data:', err);
      throw err;
    }
  }
}
