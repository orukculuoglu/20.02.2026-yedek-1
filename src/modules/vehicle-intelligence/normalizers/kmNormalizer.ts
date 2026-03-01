/**
 * Vehicle Intelligence Module - KM History Normalizer
 * Normalizes various KM data formats into standard internal schema
 */

import type { KmHistoryRecord } from '../types';

/**
 * Normalize a single KM record from various API shapes
 * Accepts: {date, km}, {timestamp, odometerKm}, {tarih, kilometre}, etc.
 */
export function normalizeKmRecord(raw: any): KmHistoryRecord | null {
  if (!raw) return null;

  let date: string | null = null;
  let km: number | null = null;

  // Handle date/timestamp variants
  if (raw.date && typeof raw.date === 'string') {
    date = raw.date;
  } else if (raw.timestamp && typeof raw.timestamp === 'string') {
    date = raw.timestamp;
  } else if (raw.tarih && typeof raw.tarih === 'string') {
    date = raw.tarih;
  } else if (raw.createdAt && typeof raw.createdAt === 'string') {
    date = raw.createdAt;
  }

  // Handle KM variants
  if (typeof raw.km === 'number') {
    km = raw.km;
  } else if (typeof raw.odometerKm === 'number') {
    km = raw.odometerKm;
  } else if (typeof raw.kilometre === 'number') {
    km = raw.kilometre;
  } else if (typeof raw.odometer === 'number') {
    km = raw.odometer;
  }

  // Validate
  if (!date || km === null || km === undefined || isNaN(km) || km < 0) {
    return null;
  }

  // Ensure date is ISO-like
  try {
    new Date(date);
  } catch {
    return null;
  }

  return {
    date: new Date(date).toISOString(),
    km: Math.round(km),
  };
}

/**
 * Normalize array of KM records
 * - Filters invalid entries
 * - Sorts by date ascending
 * - Removes duplicates
 */
export function normalizeKmList(rawList: any[]): KmHistoryRecord[] {
  if (!Array.isArray(rawList)) return [];

  const normalized = rawList
    .map((item) => normalizeKmRecord(item))
    .filter((item): item is KmHistoryRecord => item !== null);

  // Remove duplicates: keep first occurrence per date
  const seen = new Set<string>();
  const unique = normalized.filter((item) => {
    const key = `${item.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date ascending
  return unique.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
