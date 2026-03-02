/**
 * Sanitize Meta Helper
 * Removes/redacts PII from meta objects for safe DEV logging
 * - Redacts field names matching PII patterns
 * - Redacts string values matching VIN/plate patterns
 */

const PII_FIELD_NAMES = [
  'vin',
  'plate',
  'plaka',
  'chassis',
  'imei',
  'identity',
  'tckn',
  'phone',
  'email',
  'address',
  'ssn',
  'credit',
  'card',
  'passport',
  'license',
  'registration'
];

const VIN_PATTERN = /^[A-Z0-9]{17}$/i; // Standard VIN: 17 alphanumeric
const PLATE_PATTERN = /^[A-Z0-9]{2,3}\s?\d{2,4}\s?[A-Z0-9]{1,3}$/i; // TR plate patterns

/**
 * Check if field name looks like PII
 */
function looksLikePII(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return PII_FIELD_NAMES.some(piiKey => lowerKey.includes(piiKey));
}

/**
 * Check if string value looks like PII (VIN, plate, etc)
 */
function looksLikePIIValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  
  // Check VIN pattern (17 alphanumeric)
  if (VIN_PATTERN.test(trimmed)) return true;
  
  // Check plate patterns
  if (PLATE_PATTERN.test(trimmed)) return true;
  
  // Check for common Turkish phone patterns
  if (/^\+?90[0-9]{10}$/.test(trimmed)) return true;
  
  return false;
}

/**
 * Deep clone and sanitize object, removing PII
 */
export function sanitizeMeta(input: unknown): unknown {
  if (input === null || input === undefined) {
    return input;
  }
  
  if (typeof input === 'string') {
    // Check if string value looks like PII
    if (looksLikePIIValue(input)) {
      return '***REDACTED***';
    }
    return input;
  }
  
  if (typeof input !== 'object') {
    // Primitives: number, boolean, etc - safe to return as-is
    return input;
  }
  
  if (Array.isArray(input)) {
    // Recursively sanitize array elements
    return input.map(item => sanitizeMeta(item));
  }
  
  // Object: deep clone and redact PII fields
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (looksLikePII(key)) {
      // Redact entire field if key looks like PII
      sanitized[key] = '***REDACTED***';
    } else {
      // Recursively sanitize value
      sanitized[key] = sanitizeMeta(value);
    }
  }
  
  return sanitized;
}
