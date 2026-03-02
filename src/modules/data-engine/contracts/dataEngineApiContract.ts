/**
 * Data Engine API Contract
 * Backend-ready request/response types for Risk domain indices
 * 
 * Design Principles:
 * - Contract-first: Types define API spec
 * - PII-safe: VIN/plate NOT required (optional, use vehicleId only)
 * - Mock-to-Real ready: Single switch to route calls
 * - Type-safe: Full TypeScript support for both sides
 * - Observability: DEV logs only (no PROD overhead)
 */

/**
 * Supported domains for data engine indices
 */
export type DataEngineDomain = "risk" | "part" | "insurance";

/**
 * Request to fetch data engine indices
 * PII-safe: Uses vehicleId as primary identifier
 * VIN/plate are optional for backwards compatibility
 */
export interface GetDataEngineIndicesRequest {
  domain: DataEngineDomain;
  vehicleId: string;
  // Optional fields (NOT required)
  // These are preserved for backwards compatibility with legacy VIO lookups
  vin?: string;
  plate?: string;
}

/**
 * Single data engine index
 * Represents a normalized, typed business intelligence metric
 */
export interface DataEngineIndex {
  domain: DataEngineDomain;
  key: string;          // e.g., "trustIndex", "reliabilityIndex"
  value: number;        // 0-100 normalized
  confidence: number;   // 0-100 (data quality signal)
  updatedAt: string;    // ISO 8601 timestamp
  meta?: Record<string, any>; // Rich context (must be sanitized in UI)
}

/**
 * Success/error response wrapper
 * Following REST convention for consistency
 */
export interface GetDataEngineIndicesResponse {
  success: boolean;
  data?: DataEngineIndex[];
  error?: {
    code: string;         // e.g., "VEHICLE_NOT_FOUND", "INVALID_DOMAIN"
    message: string;
  };
}

/**
 * API Error details (internal use)
 */
export interface DataEngineApiError {
  status: number;       // HTTP status
  code: string;         // Error code
  message: string;      // User-facing message
}

/**
 * Type guard: Check if response is successful
 */
export function isSuccessResponse(
  res: GetDataEngineIndicesResponse
): res is GetDataEngineIndicesResponse & { data: DataEngineIndex[] } {
  return res.success === true && Array.isArray(res.data);
}

/**
 * Type guard: Check if response is an error
 */
export function isErrorResponse(
  res: GetDataEngineIndicesResponse
): res is GetDataEngineIndicesResponse & { error: { code: string; message: string } } {
  return res.success === false && res.error !== undefined;
}
