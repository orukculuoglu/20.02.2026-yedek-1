/**
 * Vehicle Intelligence Module - OBD Records Normalizer
 * Normalizes various OBD fault code formats into standard internal schema
 */

import type { ObdRecord } from '../types';

/**
 * Normalize a single OBD record from various API shapes
 * Accepts: {code, date}, {fault_code, dtc, createdAt}, etc.
 */
export function normalizeObdRecord(raw: any): ObdRecord | null {
  if (!raw) return null;

  let code: string | null = null;
  let date: string | null = null;

  // Handle code variants
  if (raw.code && typeof raw.code === 'string') {
    code = raw.code.toUpperCase();
  } else if (raw.fault_code && typeof raw.fault_code === 'string') {
    code = raw.fault_code.toUpperCase();
  } else if (raw.dtc && typeof raw.dtc === 'string') {
    code = raw.dtc.toUpperCase();
  } else if (raw.faultCode && typeof raw.faultCode === 'string') {
    code = raw.faultCode.toUpperCase();
  }

  // Handle date variants
  if (raw.date && typeof raw.date === 'string') {
    date = raw.date;
  } else if (raw.createdAt && typeof raw.createdAt === 'string') {
    date = raw.createdAt;
  } else if (raw.timestamp && typeof raw.timestamp === 'string') {
    date = raw.timestamp;
  } else if (raw.occurredAt && typeof raw.occurredAt === 'string') {
    date = raw.occurredAt;
  }

  // Validate
  if (!code || code.length === 0 || !date) {
    return null;
  }

  try {
    new Date(date);
  } catch {
    return null;
  }

  return {
    date: new Date(date).toISOString(),
    faultCode: code,
  };
}

/**
 * Normalize array of OBD records
 * - Filters invalid entries
 * - Sorts by date descending (newest first)
 */
export function normalizeObdList(rawList: any[]): ObdRecord[] {
  if (!Array.isArray(rawList)) return [];

  const normalized = rawList
    .map((item) => normalizeObdRecord(item))
    .filter((item): item is ObdRecord => item !== null);

  // Sort by date descending (newest first)
  return normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
