/**
 * API Client Layer
 * Centralized HTTP client for real/mock API communication
 * Feature flag: VITE_USE_REAL_API (true = real, false = mock)
 */

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

/**
 * Environment variables - vite/client provides import.meta.env types
 */
interface ImportMetaEnv {
  readonly VITE_USE_REAL_API: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Initialize API client configuration based on feature flag
 */
export function createApiConfig(): ApiClientConfig {
  // Get tenant ID from env or localStorage or use default
  const tenantId = import.meta.env.VITE_TENANT_ID || localStorage.getItem('tenantId') || 'LENT-CORP-DEMO';
  
  // Get auth token if available
  const authToken = localStorage.getItem('authToken');
  
  // Get base URL from env
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  
  console.log('[API] baseURL:', baseURL, '| tenant:', tenantId);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };

  // Add authorization header if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return {
    baseURL,
    timeout: 10000,
    headers,
  };
}

/**
 * Make HTTP GET request with error handling
 */
export async function apiGet<T>(
  endpoint: string,
  config: ApiClientConfig
): Promise<T> {
  const url = `${config.baseURL}${endpoint}`;
  console.log('[API GET]', url, '| timeout:', config.timeout);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url, {
      method: 'GET',
      headers: config.headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw {
        status: response.status,
        message: `HTTP ${response.status}: ${response.statusText}`,
      } as ApiError;
    }

    // Check content-type is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorMsg = `Non-JSON response (${contentType}). Backend route/proxy may be misconfigured.`;
      console.error('[API GET] ' + errorMsg);
      throw {
        status: response.status,
        message: errorMsg,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw {
        status: 0,
        message: 'Network error - API endpoint unreachable',
      } as ApiError;
    }
    throw error;
  }
}

/**
 * Make HTTP POST request with error handling
 */
export async function apiPost<T>(
  endpoint: string,
  data: any,
  config: ApiClientConfig
): Promise<T> {
  const url = `${config.baseURL}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw {
        status: response.status,
        message: `HTTP ${response.status}: ${response.statusText}`,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw {
        status: 0,
        message: 'Network error - API endpoint unreachable',
      } as ApiError;
    }
    throw error;
  }
}

/**
 * Wrapper to check if real API is enabled
 */
export function isRealApiEnabled(): boolean {
  const flag = String(import.meta.env.VITE_USE_REAL_API).toLowerCase() === 'true';
  console.log('[API] isRealApiEnabled:', import.meta.env.VITE_USE_REAL_API, '→', flag);
  return flag;
}

/**
 * Error handler for graceful fallback
 */
export function handleApiError(error: any): { message: string; isDemoFallback: boolean } {
  if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
    return {
      message: error.message,
      isDemoFallback: !isRealApiEnabled(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      isDemoFallback: !isRealApiEnabled(),
    };
  }

  return {
    message: 'Unknown error occurred',
    isDemoFallback: !isRealApiEnabled(),
  };
}

// ==================== SUPPLIER OFFERS API ====================

/**
 * GET /api/supplier-offers?partId=...&tenantId=...
 */
export async function getSupplierOffers(partMasterId: string, tenantId: string) {
  const config = createApiConfig();
  const endpoint = `/supplier-offers?partMasterId=${encodeURIComponent(partMasterId)}&tenantId=${encodeURIComponent(tenantId)}`;
  
  if (isRealApiEnabled()) {
    try {
      console.log('[SupplierOffers] Fetching from real API...');
      return await apiGet(endpoint, config);
    } catch (error) {
      console.error('[SupplierOffers] Real API failed, falling back to mock', error);
      return [];
    }
  }
  
  // Demo mode: load mock seed data
  console.log('[SupplierOffers] Demo mode - loading from mock seed');
  const { MOCK_OFFERS } = await import('../src/mocks/offers.seed');
  
  // Filter by partMasterId if provided
  if (partMasterId) {
    const filtered = MOCK_OFFERS.filter(o => o.partMasterId === partMasterId);
    console.log(`[SupplierOffers] Filtered ${filtered.length} offers for part=${partMasterId}`);
    return filtered;
  }
  
  return MOCK_OFFERS;
}

/**
 * POST /api/supplier-offers
 */
export async function createSupplierOffer(offerPayload: any) {
  const config = createApiConfig();
  
  if (isRealApiEnabled()) {
    try {
      console.log('[SupplierOffers] Creating offer on real API...');
      return await apiPost('/supplier-offers', offerPayload, config);
    } catch (error) {
      console.error('[SupplierOffers] Real API failed', error);
      throw error;
    }
  }
  
  throw new Error('Mock API does not support offer creation');
}

/**
 * POST /api/supplier-offers/bulk
 */
export async function bulkImportOffers(offersPayload: any[]) {
  const config = createApiConfig();
  
  if (isRealApiEnabled()) {
    try {
      console.log('[SupplierOffers] Bulk import on real API...');
      return await apiPost('/supplier-offers/bulk', { offers: offersPayload }, config);
    } catch (error) {
      console.error('[SupplierOffers] Real API failed', error);
      throw error;
    }
  }
  
  throw new Error('Mock API does not support bulk import');
}

// ==================== EFFECTIVE OFFERS (COMPUTED) ====================

/**
 * GET /api/effective-offers?partId=...&institutionId=...
 * Returns: best offer + alternatives with scoring
 * 
 * IMPORTANT: Returns null to signal local fallback computation.
 * Server ALWAYS computes - client respects that result.
 */
export async function getEffectiveOffers(
  partMasterId: string,
  institutionId: string
): Promise<OfferRecommendation | null> {
  const config = createApiConfig();
  const endpoint = `/effective-offers?partMasterId=${encodeURIComponent(partMasterId)}&institutionId=${encodeURIComponent(institutionId)}`;
  
  if (isRealApiEnabled()) {
    try {
      console.log('[EffectiveOffers] Attempting server computation via API...');
      const response = await apiGet(endpoint, config);
      
      // ✅ NEW: Validate server response structure
      if (response?.success === true && response?.data) {
        console.log('[EffectiveOffers] ✓ Server computation received successfully');
        return response.data as OfferRecommendation;
      }
      
      console.warn('[EffectiveOffers] Invalid response structure from API, will compute locally');
      return null;
    } catch (error) {
      console.error('[EffectiveOffers] API call failed, will compute locally', error);
      return null;  // ← Signal: Trigger local fallback
    }
  }
  
  // Demo mode: return null to trigger local computation
  console.log('[EffectiveOffers] Demo mode (VITE_USE_REAL_API=false), will compute locally');
  return null;
}

/**
 * GET /api/suppliers
 */
export async function getSuppliers() {
  const config = createApiConfig();
  
  if (isRealApiEnabled()) {
    try {
      console.log('[Suppliers] Fetching from real API...');
      return await apiGet('/suppliers', config);
    } catch (error) {
      console.error('[Suppliers] Real API failed, falling back to mock', error);
      return [];
    }
  }
  
  // Demo mode: load mock seed data
  console.log('[Suppliers] Demo mode - loading from mock seed');
  const { MOCK_SUPPLIERS } = await import('../src/mocks/suppliers.seed');
  return MOCK_SUPPLIERS;
}

/**
 * GET /api/oem-alternatives?oem=...&brand=...
 * OEM ↔ Aftermarket mapping
 */
export async function getOemAlternatives(oemPartNumber: string, brand: string) {
  const config = createApiConfig();
  const endpoint = `/oem-alternatives?oem=${encodeURIComponent(oemPartNumber)}&brand=${encodeURIComponent(brand)}`;
  
  if (isRealApiEnabled()) {
    try {
      console.log('[OemAlternatives] Fetching from real API...');
      return await apiGet(endpoint, config);
    } catch (error) {
      console.error('[OemAlternatives] Real API failed, falling back to mock', error);
      return { success: false, alternatives: [] };
    }
  }
  
  // Demo mode: use mock engine
  console.log('[OemAlternatives] Demo mode - using mock OEM engine');
  const { getAlternativesByOem } = await import('./oemMappingEngine');
  const alternatives = await getAlternativesByOem(oemPartNumber, brand);
  
  return {
    success: true,
    oem: oemPartNumber,
    brand: brand,
    alternatives: alternatives,
    count: alternatives.length,
    timestamp: new Date().toISOString(),
  };
}

