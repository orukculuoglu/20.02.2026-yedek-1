/**
 * Data Engine API Client Adapter
 * Routes between real backend API and mock local implementation
 * 
 * Feature Flag: VITE_USE_REAL_API
 * - true: Call real backend: GET /data-engine/indices
 * - false: Use local mock implementation (default)
 * 
 * Design:
 * - Single entry point: fetchDataEngineIndices()
 * - Contract-first: Uses GetDataEngineIndicesRequest/Response
 * - PII-safe: Optional VIN/plate, uses vehicleId as primary ID
 * - No circular imports: Dynamically imports mock implementation
 * - Observability: [DataEngineApiClient] prefix logs (DEV only)
 */

import type {
  GetDataEngineIndicesRequest,
  GetDataEngineIndicesResponse,
  DataEngineIndex,
} from "../contracts/dataEngineApiContract";
import { isRealApiEnabled, createApiConfig, apiGet } from "../../../../services/apiClient";

/**
 * Fetch data engine indices from backend or mock
 * 
 * @param req - Request with domain, vehicleId, and optional vin/plate
 * @returns Response with success flag and data or error
 * 
 * Routing:
 * - If VITE_USE_REAL_API=true: Call GET /data-engine/indices?domain=...&vehicleId=...
 * - Else: Call local mock via dataEngineIndices.getDataEngineIndices()
 * 
 * Note: VIN/plate are NOT sent to API by default (PII safety)
 * Set VITE_INCLUDE_PII_IN_API=true to include them (not recommended)
 */
export async function fetchDataEngineIndices(
  req: GetDataEngineIndicesRequest
): Promise<GetDataEngineIndicesResponse> {
  const useRealApi = isRealApiEnabled();

  if (import.meta.env.DEV) {
    console.debug("[DataEngineApiClient] fetchDataEngineIndices", {
      useRealApi,
      domain: req.domain,
      vehicleId: req.vehicleId,
      hasVin: !!req.vin,
      hasPlate: !!req.plate,
    });
  }

  try {
    if (useRealApi) {
      // Call real backend API
      return await fetchFromRealApi(req);
    } else {
      // Use local mock implementation
      return await fetchFromMockImplementation(req);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (import.meta.env.DEV) {
      console.error("[DataEngineApiClient] Error fetching indices:", {
        error: message,
        request: req,
      });
    }
    return {
      success: false,
      error: {
        code: "FETCH_FAILED",
        message: `Failed to fetch ${req.domain} indices: ${message}`,
      },
    };
  }
}

/**
 * Fetch from real backend API
 * Sends request to GET /data-engine/indices
 * Does NOT include VIN/plate in query by default (PII safety)
 */
async function fetchFromRealApi(
  req: GetDataEngineIndicesRequest
): Promise<GetDataEngineIndicesResponse> {
  const config = createApiConfig();
  const includePii = String(import.meta.env.VITE_INCLUDE_PII_IN_API).toLowerCase() === "true";

  // Build query params (only include safe fields by default)
  const queryParams = new URLSearchParams({
    domain: req.domain,
    vehicleId: req.vehicleId,
  });

  // Optionally include PII if explicitly enabled
  if (includePii) {
    if (req.vin) queryParams.append("vin", req.vin);
    if (req.plate) queryParams.append("plate", req.plate);
  }

  const url = `/data-engine/indices?${queryParams.toString()}`;

  if (import.meta.env.DEV) {
    console.debug("[DataEngineApiClient] Calling backend:", {
      url,
      baseURL: config.baseURL,
      includePii,
    });
  }

  try {
    const response = await apiGet<{ data: DataEngineIndex[] }>(url, {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "application/json",
      },
    });

    if (import.meta.env.DEV) {
      console.debug("[DataEngineApiClient] Backend response success:", {
        count: response.data?.length || 0,
      });
    }

    return {
      success: true,
      data: response.data || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`API call failed: ${message}`);
  }
}

/**
 * Fetch from local mock implementation
 * Dynamically imports dataEngineIndices.getDataEngineIndices
 * Maintains backward compatibility with existing mock logic
 */
async function fetchFromMockImplementation(
  req: GetDataEngineIndicesRequest
): Promise<GetDataEngineIndicesResponse> {
  try {
    // Dynamic import to avoid circular dependencies
    const dataEngineIndicesModule = await import("../../../../services/dataEngineIndices");
    const mockGetIndices = dataEngineIndicesModule.getDataEngineIndices;

    if (import.meta.env.DEV) {
      console.debug("[DataEngineApiClient] Calling mock implementation", {
        domain: req.domain,
        vehicleId: req.vehicleId,
      });
    }

    // Call mock implementation
    const data = await mockGetIndices(req);

    if (import.meta.env.DEV) {
      console.debug("[DataEngineApiClient] Mock implementation response:", {
        count: data?.length || 0,
      });
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Mock implementation failed: ${message}`);
  }
}

/**
 * Health check: Test if API endpoint is reachable
 * DEV-only utility for debugging
 */
export async function testDataEngineApiHealth(): Promise<{
  healthy: boolean;
  mode: "real" | "mock";
  error?: string;
}> {
  const useRealApi = isRealApiEnabled();

  if (!useRealApi) {
    return {
      healthy: true,
      mode: "mock",
    };
  }

  try {
    const config = createApiConfig();
    await apiGet("/data-engine/health", config);
    return {
      healthy: true,
      mode: "real",
    };
  } catch (error) {
    return {
      healthy: false,
      mode: "real",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
