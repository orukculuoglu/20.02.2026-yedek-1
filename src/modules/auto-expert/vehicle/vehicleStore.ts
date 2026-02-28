/**
 * Vehicle Store - Manages vehicle records with risk scores
 * Uses localStorage for persistence
 */

import type { Vehicle } from './vehicleTypes';

const STORAGE_KEY = 'lent:vehicles:v1';

/**
 * Seed vehicles from Expert Reports
 * Called on initialization to ensure all reported vehicles exist
 */
function createSeedVehicles(): Vehicle[] {
  return [
    {
      id: 'veh_1',
      vin: 'WF0UXXWPFA0012345',
      plate: '34ABC0001',
      model: 'Fiat Egea',
    },
    {
      id: 'veh_2',
      vin: 'WVWZZZ3CZ9E123456',
      plate: '06XYZ0002',
      model: 'Mercedes C200',
    },
    {
      id: 'veh_3',
      vin: 'VSSZZZ3DZ9E654321',
      plate: '08ABC0003',
      model: 'Toyota Corolla',
    },
  ];
}

class VehicleStoreClass {
  /**
   * Load all vehicles from localStorage
   */
  loadAll(): Vehicle[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // First run: seed with vehicles from expert reports
    const seed = createSeedVehicles();
    this.saveAll(seed);
    return seed;
  }

  /**
   * Save all vehicles to localStorage
   */
  saveAll(vehicles: Vehicle[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }

  /**
   * Get vehicle by ID
   */
  getById(vehicleId: string): Vehicle | null {
    const all = this.loadAll();
    return all.find(v => v.id === vehicleId) || null;
  }

  /**
   * Create or update a vehicle
   */
  upsert(vehicle: Vehicle): void {
    const all = this.loadAll();
    const idx = all.findIndex(v => v.id === vehicle.id);
    if (idx >= 0) {
      all[idx] = vehicle;
    } else {
      all.push(vehicle);
    }
    this.saveAll(all);
  }

  /**
   * Update vehicle risk score
   */
  setRiskScore(vehicleId: string, riskScore: number): Vehicle | null {
    const vehicle = this.getById(vehicleId);
    if (!vehicle) return null;

    const updated: Vehicle = {
      ...vehicle,
      riskScore: Math.max(0, Math.min(100, riskScore)), // Clamp 0-100
      updatedAt: new Date().toISOString(),
    };
    this.upsert(updated);
    return updated;
  }

  /**
   * Delete vehicle by ID
   */
  delete(vehicleId: string): void {
    const all = this.loadAll();
    this.saveAll(all.filter(v => v.id !== vehicleId));
  }
}

export const vehicleStore = new VehicleStoreClass();
