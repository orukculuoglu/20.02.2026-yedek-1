/**
 * Auto-Expert Module - VIO Store
 * Localstorage persistence for VehicleIntelligenceOutput (VIO)
 */

import type { VehicleIntelligenceOutput } from './vioTypes';

const STORAGE_KEY = 'lent:auto-expert:vio:v1';
const STATUS_KEY = 'lent:auto-expert:vio-status:v1';

interface VIOStatus {
  status: 'ok' | 'failed';
  at: string;
  error?: string;
}

/**
 * Save VIO to localStorage
 */
export function saveVIO(vehicleId: string, vio: VehicleIntelligenceOutput): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || '{}';
    const vioMap: Record<string, VehicleIntelligenceOutput> = JSON.parse(stored);

    vioMap[vehicleId] = vio;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(vioMap));
    console.log(`[VIOStore] ✓ Saved VIO for ${vehicleId}`);
  } catch (err) {
    console.error('[VIOStore] Error saving VIO:', err);
  }
}

/**
 * Load VIO from localStorage
 */
export function getVIO(vehicleId: string): VehicleIntelligenceOutput | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const vioMap: Record<string, VehicleIntelligenceOutput> = JSON.parse(stored);
    const vio = vioMap[vehicleId];

    if (!vio) {
      console.log(`[VIOStore] No VIO found for ${vehicleId}`);
      return null;
    }

    console.log(`[VIOStore] ✓ Loaded VIO for ${vehicleId}`);
    return vio;
  } catch (err) {
    console.error('[VIOStore] Error loading VIO:', err);
    return null;
  }
}

/**
 * Get all VIOs from storage
 */
export function getAllVIOs(): Record<string, VehicleIntelligenceOutput> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const vioMap = JSON.parse(stored) as Record<string, VehicleIntelligenceOutput>;
    console.log(`[VIOStore] ✓ Loaded ${Object.keys(vioMap).length} VIOs`);
    return vioMap;
  } catch (err) {
    console.error('[VIOStore] Error loading all VIOs:', err);
    return {};
  }
}

/**
 * Clear all VIOs from storage
 */
export function clearAllVIOs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[VIOStore] ✓ Cleared all VIOs');
  } catch (err) {
    console.error('[VIOStore] Error clearing VIOs:', err);
  }
}

/**
 * Export store functions as object
 */
export const vioStore = {
  save: saveVIO,
  get: getVIO,
  getAll: getAllVIOs,
  clear: clearAllVIOs,
  
  /**
   * Store VIO generation status (success or failure)
   */
  storeLastStatus(
    vehicleId: string,
    status: 'ok' | 'failed',
    atISO: string,
    error?: string
  ): void {
    try {
      const data = localStorage.getItem(STATUS_KEY);
      const statusMap: Record<string, VIOStatus> = data ? JSON.parse(data) : {};

      statusMap[vehicleId] = {
        status,
        at: atISO,
        error,
      };

      localStorage.setItem(STATUS_KEY, JSON.stringify(statusMap));
      console.log(`[VIOStore] Status stored: ${vehicleId} = ${status}`);
    } catch (err) {
      console.error(`[VIOStore] Error storing status:`, err);
    }
  },

  /**
   * Get last VIO generation status for a vehicle
   */
  getLastStatus(vehicleId: string): VIOStatus | null {
    try {
      const data = localStorage.getItem(STATUS_KEY);
      if (!data) return null;

      const statusMap: Record<string, VIOStatus> = JSON.parse(data);
      return statusMap[vehicleId] || null;
    } catch (err) {
      console.error(`[VIOStore] Error retrieving status:`, err);
      return null;
    }
  },

  /**
   * Get last generation timestamp for a vehicle
   */
  getLastGeneratedAt(vehicleId: string): string | null {
    try {
      const status = this.getLastStatus(vehicleId);
      return status?.at || null;
    } catch (err) {
      console.error(`[VIOStore] Error retrieving timestamp:`, err);
      return null;
    }
  },

  /**
   * Clear all generation statuses (for testing)
   */
  clearAllStatus(): void {
    try {
      localStorage.removeItem(STATUS_KEY);
    } catch (err) {
      console.error(`[VIOStore] Error clearing statuses:`, err);
    }
  },
};
