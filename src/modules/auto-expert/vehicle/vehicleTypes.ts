/**
 * Vehicle Types - Data models for vehicles tracked in Auto Expert module
 */

export interface Vehicle {
  id: string; // vehicleId
  vin: string;
  plate: string;
  model?: string; // e.g. "Fiat Egea"
  riskScore?: number; // 0-100, calculated by Risk Engine
  updatedAt?: string; // ISO timestamp of last riskScore update
}
