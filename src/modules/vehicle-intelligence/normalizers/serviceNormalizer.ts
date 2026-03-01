/**
 * Vehicle Intelligence Module - Service Records Normalizer
 * Normalizes various service data formats into standard internal schema
 */

import type { ServiceRecord } from '../types';

/**
 * Normalize a single service record from various API shapes
 * Accepts: {date, type, items}, {serviceDate, operations}, etc.
 */
export function normalizeServiceRecord(raw: any): ServiceRecord | null {
  if (!raw) return null;

  let date: string | null = null;
  let type: string | null = null;
  let description: string | undefined = undefined;

  // Handle date variants
  if (raw.date && typeof raw.date === 'string') {
    date = raw.date;
  } else if (raw.serviceDate && typeof raw.serviceDate === 'string') {
    date = raw.serviceDate;
  } else if (raw.createdAt && typeof raw.createdAt === 'string') {
    date = raw.createdAt;
  } else if (raw.timestamp && typeof raw.timestamp === 'string') {
    date = raw.timestamp;
  }

  // Handle type variants
  if (raw.type && typeof raw.type === 'string') {
    type = raw.type;
  } else if (raw.serviceType && typeof raw.serviceType === 'string') {
    type = raw.serviceType;
  } else if (raw.category && typeof raw.category === 'string') {
    type = raw.category;
  }

  // Handle description variants
  if (raw.description && typeof raw.description === 'string') {
    description = raw.description;
  } else if (raw.items && Array.isArray(raw.items)) {
    description = raw.items
      .filter((item: any) => typeof item === 'string')
      .join('; ');
  } else if (raw.operations && Array.isArray(raw.operations)) {
    description = raw.operations
      .filter((op: any) => typeof op === 'string')
      .join('; ');
  }

  // Validate
  if (!date || !type) {
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
    description,
  };
}

/**
 * Normalize array of service records
 * - Filters invalid entries
 * - Sorts by date descending (newest first)
 */
export function normalizeServiceList(rawList: any[]): ServiceRecord[] {
  if (!Array.isArray(rawList)) return [];

  const normalized = rawList
    .map((item) => normalizeServiceRecord(item))
    .filter((item): item is ServiceRecord => item !== null);

  // Sort by date descending
  return normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
