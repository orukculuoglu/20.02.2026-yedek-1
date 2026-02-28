/**
 * Vehicle Intelligence Module - Data Provider Factory
 * Selects appropriate data provider (mock or API) based on environment
 */

import type { IVehicleDataProvider } from './IVehicleDataProvider';
import { MockVehicleDataProvider } from './MockVehicleDataProvider';
import { ApiVehicleDataProvider } from './ApiVehicleDataProvider';

/**
 * Get the appropriate data provider instance
 * Selection based on VITE_VEHICLE_DATA_SOURCE environment variable
 *
 * Environment Variables:
 *   VITE_VEHICLE_DATA_SOURCE=api  -> Use ApiVehicleDataProvider
 *   VITE_VEHICLE_DATA_SOURCE=mock -> Use MockVehicleDataProvider
 *   (default) -> Use MockVehicleDataProvider
 */
export function getVehicleDataProvider(): IVehicleDataProvider {
  const source = import.meta.env.VITE_VEHICLE_DATA_SOURCE || 'mock';

  if (source === 'api') {
    console.log('[getVehicleDataProvider] Using ApiVehicleDataProvider');
    return new ApiVehicleDataProvider();
  }

  console.log('[getVehicleDataProvider] Using MockVehicleDataProvider (default)');
  return new MockVehicleDataProvider();
}
