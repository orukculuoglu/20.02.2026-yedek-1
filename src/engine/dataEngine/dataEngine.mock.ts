/**
 * src/engine/dataEngine/dataEngine.mock.ts
 * Mock data for Data Engine scoring and simulation suggestions
 */

export type SimulationSuggestion = {
  region: string;        // "İstanbul" / "Ankara"
  district?: string;     // "Maslak" / "Ostim" (V1: opsiyonel)
  partGroup: string;     // "Fren Sistemi"
  changePercent: number; // +20
  confidence: number;    // 0..1
  impact: number;        // 0..100
};

/**
 * Mock strategic recommendations from Data Engine.
 * These are used to match inventory items and apply simulation overrides.
 */
export const mockSuggestions: SimulationSuggestion[] = [
  {
    region: "İstanbul",
    district: "Maslak",
    partGroup: "Fren Sistemi",
    changePercent: 20,
    confidence: 0.85,
    impact: 78,
  },
  {
    region: "Ankara",
    district: "Ostim",
    partGroup: "Fren Sistemi",
    changePercent: 12,
    confidence: 0.72,
    impact: 65,
  },
  {
    region: "İstanbul",
    district: "Maslak",
    partGroup: "Elektrik Sistemi",
    changePercent: -15,
    confidence: 0.68,
    impact: 55,
  },
  {
    region: "Ankara",
    district: "Ostim",
    partGroup: "Motor Parçaları",
    changePercent: 25,
    confidence: 0.79,
    impact: 71,
  },
];
