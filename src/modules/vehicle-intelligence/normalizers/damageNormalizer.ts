/**
 * Vehicle Intelligence Module - Damage Records Normalizer
 * Normalizes various damage data formats into standard internal schema
 */

import type { DamageRecord } from '../types';

/**
 * Normalize a single damage record from various API shapes
 * Accepts: {type, date, severity}, {damageType, occurredAt, level}, etc.
 */
export function normalizeDamageRecord(raw: any): DamageRecord | null {
  if (!raw) return null;

  let type: string | null = null;
  let date: string | null = null;
  let severity: 'minor' | 'major' | undefined = undefined;

  // Handle type variants
  if (raw.type && typeof raw.type === 'string') {
    type = raw.type;
  } else if (raw.damageType && typeof raw.damageType === 'string') {
    type = raw.damageType;
  } else if (raw.description && typeof raw.description === 'string') {
    type = raw.description;
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

  // Handle severity variants
  if (raw.severity && typeof raw.severity === 'string') {
    const sev = raw.severity.toLowerCase();
    if (sev.includes('minor') || sev === 'low') severity = 'minor';
    else if (sev.includes('major') || sev === 'high') severity = 'major';
  } else if (raw.level && typeof raw.level === 'string') {
    const level = raw.level.toLowerCase();
    if (level === 'low' || level === '1') severity = 'minor';
    else if (level === 'high' || level === '2') severity = 'major';
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
    severity: severity || 'minor',
    description: type,
  };
}

/**
 * Normalize array of damage records
 * - Filters invalid entries
 * - Sorts by date descending (newest first)
 */
export function normalizeDamageList(rawList: any[]): DamageRecord[] {
  if (!Array.isArray(rawList)) return [];

  const normalized = rawList
    .map((item) => normalizeDamageRecord(item))
    .filter((item): item is DamageRecord => item !== null);

  // Sort by date descending
  return normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
