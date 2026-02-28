/**
 * Vehicle Intelligence Module - Mock Data Sources
 * Generates realistic mock data for different vehicle data sources
 */

import type {
  KmHistoryRecord,
  ObdRecord,
  InsuranceRecord,
  DamageRecord,
  ServiceRecord,
} from './types';

/**
 * Generate mock km history for a vehicle
 * Simulates realistic odometer progression with occasional anomalies
 */
export function getMockKmHistory(vehicleId: string): KmHistoryRecord[] {
  const seed = vehicleId.charCodeAt(0);
  const baseKm = 50000 + (seed * 1000) % 150000;
  const monthlyIncrease = 1000 + (seed * 500) % 2000;

  const records: KmHistoryRecord[] = [];
  const now = new Date();

  // Last 12 months of km history
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const normalKm = baseKm + monthlyIncrease * (12 - i);

    // 5% chance of monthly anomaly (big jump = odometer reset/manipulation)
    const anomaly = Math.random() < 0.05;
    const km = anomaly ? normalKm - 20000 : normalKm;

    records.push({
      date: date.toISOString().split('T')[0],
      km: Math.max(0, km),
    });
  }

  return records;
}

/**
 * Generate mock OBD fault codes
 * Simulates vehicle diagnostic trouble codes
 */
export function getMockOBD(vehicleId: string): ObdRecord[] {
  const seed = vehicleId.charCodeAt(0);
  const faultCodes = ['P0300', 'P0101', 'P0420', 'P0172', 'P0401', 'P0011'];

  const records: ObdRecord[] = [];
  const now = new Date();
  const numFaults = (seed % 4) + 1; // 1-4 faults

  for (let i = 0; i < numFaults; i++) {
    const date = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Last 6 months
    const code = faultCodes[Math.floor(Math.random() * faultCodes.length)];

    records.push({
      date: date.toISOString().split('T')[0],
      faultCode: code,
    });
  }

  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Generate mock insurance records
 * Simulates insurance claims, renewals, and lapses
 */
export function getMockInsurance(vehicleId: string): InsuranceRecord[] {
  const seed = vehicleId.charCodeAt(0);
  const records: InsuranceRecord[] = [];
  const now = new Date();

  // Insurance history over 3 years
  const types: Array<'claim' | 'renewal' | 'lapse' | 'inquiry'> = [
    'renewal',
    'renewal',
    'claim',
    'inquiry',
    'lapse',
  ];

  for (let i = 0; i < 8; i++) {
    const date = new Date(now.getTime() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000);
    const type = types[Math.floor(Math.random() * types.length)];

    records.push({
      date: date.toISOString().split('T')[0],
      type,
    });
  }

  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Generate mock damage records
 * Simulates accident/damage history
 */
export function getMockDamage(vehicleId: string): DamageRecord[] {
  const seed = vehicleId.charCodeAt(0);
  const records: DamageRecord[] = [];
  const now = new Date();

  // 60% chance of having any damage records
  if (Math.random() < 0.6) {
    const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 damage events

    for (let i = 0; i < numEvents; i++) {
      const date = new Date(now.getTime() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000);
      const severity = Math.random() < 0.7 ? 'minor' : 'major';

      records.push({
        date: date.toISOString().split('T')[0],
        severity,
        description: severity === 'minor' ? 'Dent/scratch' : 'Structural damage',
      });
    }
  }

  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Generate mock service records
 * Simulates maintenance and repair history
 */
export function getMockService(vehicleId: string): ServiceRecord[] {
  const seed = vehicleId.charCodeAt(0);
  const records: ServiceRecord[] = [];
  const now = new Date();

  const serviceTypes: ServiceRecord['type'][] = [
    'routine',
    'maintenance',
    'repair',
    'recall',
  ];

  // Typically 6-12 service records over 3 years
  const numServices = Math.floor(Math.random() * 7) + 6;

  for (let i = 0; i < numServices; i++) {
    const date = new Date(now.getTime() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000);
    const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];

    const descriptions: Record<ServiceRecord['type'], string[]> = {
      routine: [
        'Oil change',
        'Filter replacement',
        'Tire rotation',
        'Brake inspection',
      ],
      maintenance: [
        'Battery replacement',
        'Brake pad replacement',
        'Coolant flush',
        'Transmission fluid',
      ],
      repair: ['Engine repair', 'Transmission repair', 'Electrical repair', 'Suspension repair'],
      recall: ['Software update', 'Component replacement', 'Safety check'],
    };

    records.push({
      date: date.toISOString().split('T')[0],
      type,
      description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
    });
  }

  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
