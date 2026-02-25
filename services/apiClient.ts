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
