/**
 * Vehicle Intelligence Module - Data Normalizer
 * Normalizes all data sources in a DataSourcesResult
 */

import type { DataSourcesResult } from '../dataProviders/IVehicleDataProvider';
import { normalizeKmList } from './kmNormalizer';
import { normalizeObdList } from './obdNormalizer';
import { normalizeInsuranceList } from './insuranceNormalizer';
import { normalizeDamageList } from './damageNormalizer';
import { normalizeServiceList } from './serviceNormalizer';

/**
 * Normalize all data sources in a DataSourcesResult
 * Handles raw API shapes and ensures consistent internal shapes
 */
export function normalizeAllDataSources(raw: Partial<DataSourcesResult>): DataSourcesResult {
  return {
    kmHistory: normalizeKmList(raw.kmHistory || []),
    obdRecords: normalizeObdList(raw.obdRecords || []),
    insuranceRecords: normalizeInsuranceList(raw.insuranceRecords || []),
    damageRecords: normalizeDamageList(raw.damageRecords || []),
    serviceRecords: normalizeServiceList(raw.serviceRecords || []),
  };
}
