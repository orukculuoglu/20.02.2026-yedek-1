/**
 * Market Valuation Mock Data Builder
 * Constructs ValuationInput from vehicle profiles and risk indices
 * 
 * Safe fallbacks ensure no crashes from missing data
 */

import type { AftermarketProductCard, VehicleProfile } from "../../../types";
import type { ValuationInput } from "./types";

/**
 * Build valuation input from vehicle profile
 * Pulls brand, model, year, mileage
 * Optionally adds risk indicators if available
 */
export function buildValuationInputFromVehicle(
  vehicle: VehicleProfile,
  options?: {
    trustIndex?: number;
    reliabilityIndex?: number;
    structuralRisk?: number;
    insuranceRisk?: number;
  }
): ValuationInput {
  // Extract year from model if available
  let year: number | undefined;
  if (vehicle.year) {
    year = vehicle.year;
  }

  return {
    vehicleId: vehicle.vehicle_id,
    brand: vehicle.brand,
    model: vehicle.model,
    year,
    mileageKm: vehicle.mileage ? vehicle.mileage : undefined,
    trustIndex: options?.trustIndex,
    reliabilityIndex: options?.reliabilityIndex,
    structuralRisk: options?.structuralRisk,
    insuranceRisk: options?.insuranceRisk,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Build sample valuation input for demo/testing
 */
export function getSampleValuationInput(vehicleId: string): ValuationInput {
  return {
    vehicleId,
    brand: "Toyota",
    model: "Corolla",
    year: 2019,
    mileageKm: 85_000,
    trustIndex: 72,
    reliabilityIndex: 78,
    structuralRisk: 25,
    insuranceRisk: 35,
    generatedAt: new Date().toISOString(),
  };
}
