/**
 * Vehicle Intelligence Module - Insurance Records Normalizer
 * Normalizes various insurance data formats into standard internal schema
 */

import type { InsuranceRecord } from '../types';

/**
 * Normalize a single insurance record from various API shapes
 * Accepts: {type, date, amount}, {claimType, occurredAt, cost}, etc.
 */
export function normalizeInsuranceRecord(raw: any): InsuranceRecord | null {
  if (!raw) return null;

  let type: string | null = null;
  let date: string | null = null;

  // Handle type variants: normalize to "claim" or "policy"
  if (raw.type && typeof raw.type === 'string') {
    const t = raw.type.toLowerCase();
    if (t.includes('claim')) type = 'claim';
    else if (t.includes('policy') || t.includes('renewal')) type = 'policy';
    else type = raw.type;
  } else if (raw.claimType && typeof raw.claimType === 'string') {
    type = 'claim';
  } else if (raw.policyType && typeof raw.policyType === 'string') {
    type = 'policy';
  }

  // Handle date variants
  if (raw.date && typeof raw.date === 'string') {
    date = raw.date;
  } else if (raw.occurredAt && typeof raw.occurredAt === 'string') {
    date = raw.occurredAt;
  } else if (raw.createdAt && typeof raw.createdAt === 'string') {
    date = raw.createdAt;
  } else if (raw.timestamp && typeof raw.timestamp === 'string') {
    date = raw.timestamp;
  }

  // Validate
  if (!type || !date) {
    return null;
  }

  try {
    new Date(date);
  } catch {
    return null;
  }

  return {
    date: new Date(date).toISOString(),
    type,
  };
}

/**
 * Normalize array of insurance records
 * - Filters invalid entries
 * - Sorts by date descending (newest first)
 */
export function normalizeInsuranceList(rawList: any[]): InsuranceRecord[] {
  if (!Array.isArray(rawList)) return [];

  const normalized = rawList
    .map((item) => normalizeInsuranceRecord(item))
    .filter((item): item is InsuranceRecord => item !== null);

  // Sort by date descending
  return normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
