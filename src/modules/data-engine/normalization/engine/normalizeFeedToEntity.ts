/**
 * Normalize Feed to Entity
 *
 * Entry point for semantic normalization of accepted feed envelopes.
 * Transforms source-specific feed payloads into canonical Data Engine entities.
 */

import type { DataEngineNormalizationCandidate } from '../models/DataEngineNormalizationCandidate';
import type { DataEngineNormalizationResult } from '../models/DataEngineNormalizationResult';
import type { DataEngineNormalizationIssue } from '../models/DataEngineNormalizationIssue';
import type { DataEngineEntity } from '../models/DataEngineEntity';
import { DataEngineNormalizationIssueCode } from '../types/DataEngineNormalizationIssueCode';

/**
 * Normalize Feed to Entity
 *
 * Deterministically transforms a bound and validated feed into a canonical Data Engine entity.
 *
 * This function:
 * - Validates normalization readiness
 * - Inspects schema version compatibility
 * - Applies source-aware semantic mapping
 * - Transforms payload into normalized attributes
 * - Constructs canonical DataEngineEntity
 * - Produces complete normalization result
 *
 * This function does NOT:
 * - Resolve identity or verify identity
 * - Access or resolve VIN
 * - Call external services
 * - Build graph nodes or relationships
 * - Generate signals or scorecards
 * - Persist data
 * - Create indexes
 *
 * The function is deterministic: same input + same schema = same output.
 */
export function normalizeFeedToEntity(
  candidate: DataEngineNormalizationCandidate,
): DataEngineNormalizationResult {
  const issues: DataEngineNormalizationIssue[] = [];
  const normalizedAt = new Date().toISOString();
  let hasInferredValues = false;
  let entity: DataEngineEntity | undefined;

  // ─────────────────────────────────────────────────────────────────────────────
  // NORMALIZATION READINESS CHECK
  // ─────────────────────────────────────────────────────────────────────────────

  // Verify feed payload exists
  if (!candidate.feedPayload || Object.keys(candidate.feedPayload).length === 0) {
    issues.push({
      issueCode: DataEngineNormalizationIssueCode.EMPTY_PAYLOAD,
      severity: 'BLOCKING',
      message: 'Feed payload is empty; cannot normalize without source data',
      remediable: false,
    });
  }

  // Verify identity is present
  if (!candidate.identityId) {
    issues.push({
      issueCode: DataEngineNormalizationIssueCode.MISSING_CONTEXT_FOR_NORMALIZATION,
      severity: 'BLOCKING',
      message: 'Identity ID is missing; cannot normalize without identity context from Phase 3',
      remediable: false,
    });
  }

  // If blocking issues, return early
  if (issues.filter((i) => i.severity === 'BLOCKING').length > 0) {
    return buildResult(
      'REJECTED',
      undefined,
      issues,
      candidate.bindingResultRef,
      normalizedAt,
      hasInferredValues,
      candidate.feedMetadata.schemaVersion || '1.0',
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCHEMA VERSION COMPATIBILITY CHECK
  // ─────────────────────────────────────────────────────────────────────────────

  const schemaVersion = candidate.feedMetadata.schemaVersion || '1.0';
  const supportedSchemaVersions = ['1.0', '1.1', '2.0', '2.1'];

  if (!supportedSchemaVersions.includes(schemaVersion)) {
    issues.push({
      issueCode: DataEngineNormalizationIssueCode.UNKNOWN_SCHEMA_VERSION,
      severity: 'BLOCKING',
      message: `Schema version '${schemaVersion}' is not supported`,
      fieldReference: 'feedMetadata.schemaVersion',
      remediable: true,
      remediationHint: `Use one of: ${supportedSchemaVersions.join(', ')}`,
    });
  }

  // Check for legacy schemas
  if (['1.0'].includes(schemaVersion)) {
    issues.push({
      issueCode: DataEngineNormalizationIssueCode.LEGACY_SCHEMA_VERSION,
      severity: 'LIMITING',
      message: `Schema version '${schemaVersion}' is legacy; consider upgrading to 2.1`,
      fieldReference: 'feedMetadata.schemaVersion',
      remediable: true,
      remediationHint: 'Migrate payload to schema 2.1 for best compatibility',
    });
  }

  if (issues.filter((i) => i.severity === 'BLOCKING').length > 0) {
    return buildResult(
      'REJECTED',
      undefined,
      issues,
      candidate.bindingResultRef,
      normalizedAt,
      hasInferredValues,
      schemaVersion,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYLOAD STRUCTURE VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────

  const payload = candidate.feedPayload;

  // Check for required fields based on classification
  const classification = candidate.feedMetadata.classification || 'UNKNOWN';
  const requiredFields = getRequiredFieldsForClassification(classification);

  for (const field of requiredFields) {
    if (!(field in payload)) {
      issues.push({
        issueCode: DataEngineNormalizationIssueCode.MISSING_REQUIRED_FIELD,
        severity: 'LIMITING',
        message: `Required field '${field}' missing for classification '${classification}'`,
        fieldReference: `feedPayload.${field}`,
        remediable: true,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SOURCE-AWARE SEMANTIC MAPPING & NORMALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  const normalizedAttributes: Record<string, unknown> = {};
  const entityType = deriveEntityType(classification);

  // Apply source-specific mapping rules
  const mappingResult = mapPayloadToNormalized(
    payload,
    candidate.sourceType,
    schemaVersion,
    classification,
  );

  Object.assign(normalizedAttributes, mappingResult.normalized);
  issues.push(...mappingResult.issues);
  hasInferredValues = hasInferredValues || mappingResult.hasInferred;

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPORAL VALIDATION & NORMALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  let eventDate: string | undefined;
  let eventTimestamp: string | undefined;

  const eventDateResult = extractEventDate(payload, schemaVersion);
  if (eventDateResult.value) {
    eventDate = eventDateResult.value;
  } else if (eventDateResult.issues.length > 0) {
    issues.push(...eventDateResult.issues);
    hasInferredValues = true;
    eventDate = new Date().toISOString().split('T')[0];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ENTITY CONSTRUCTION
  // ─────────────────────────────────────────────────────────────────────────────

  const blockingIssues = issues.filter((i) => i.severity === 'BLOCKING');
  const limitingIssues = issues.filter((i) => i.severity === 'LIMITING');
  const warningIssues = issues.filter((i) => i.severity === 'WARNING');

  // Determine normalization status
  let status: 'NORMALIZED' | 'NORMALIZED_WITH_WARNINGS' | 'REJECTED';

  if (blockingIssues.length > 0) {
    status = 'REJECTED';
  } else if (limitingIssues.length > 0 || warningIssues.length > 0) {
    status = 'NORMALIZED_WITH_WARNINGS';
  } else {
    status = 'NORMALIZED';
  }

  // Build entity only if not rejected
  if (status !== 'REJECTED') {
    entity = {
      entityId: generateEntityId(candidate.identityId, entityType, eventDate),
      identityId: candidate.identityId,
      entityType,
      sourceSystem: candidate.feedMetadata.sourceSystem || candidate.sourceType,
      normalizedAttributes,
      metadata: {
        schemaVersion,
        normalizedAt,
        normalizationSource: 'Phase4',
      },
      temporal: {
        eventDate,
        eventTimestamp,
        recordedDate: candidate.feedTimestamps.intakeAt.split('T')[0],
        recordedTimestamp: candidate.feedTimestamps.intakeAt,
      },
      quality: {
        completeness: calculateCompleteness(normalizedAttributes),
        confidence: limitingIssues.length > 0 ? 'MEDIUM' : 'HIGH',
        hasInferredValues,
        normalizationWarnings: warningIssues.length,
      },
    };
  }

  return buildResult(
    status,
    entity,
    issues,
    candidate.bindingResultRef,
    normalizedAt,
    hasInferredValues,
    schemaVersion,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get required fields for a classification
 */
function getRequiredFieldsForClassification(classification: string): string[] {
  const fieldMap: Record<string, string[]> = {
    MAINTENANCE: ['serviceDate', 'repairCodes'],
    DAMAGE: ['incidentDate', 'damageType'],
    DIAGNOSTIC: ['diagnosticDate', 'diagnosticCodes'],
    DEFAULT: [],
  };

  return fieldMap[classification] || fieldMap['DEFAULT'];
}

/**
 * Derive canonical entity type from feed classification
 */
function deriveEntityType(
  classification: string,
): 'MAINTENANCE_EVENT' | 'DAMAGE_EVENT' | 'DIAGNOSTIC_EVENT' | 'OTHER' {
  const mapping: Record<string, any> = {
    MAINTENANCE: 'MAINTENANCE_EVENT',
    DAMAGE: 'DAMAGE_EVENT',
    ACCIDENT: 'DAMAGE_EVENT',
    DIAGNOSTIC: 'DIAGNOSTIC_EVENT',
    INSURANCE: 'DAMAGE_EVENT',
    CLAIM: 'WARRANTY_CLAIM',
    INSPECTION: 'INSPECTION_RESULT',
  };

  return mapping[classification] || 'OTHER';
}

/**
 * Map payload to normalized attributes using source-aware rules
 */
function mapPayloadToNormalized(
  payload: Record<string, unknown>,
  sourceType: string,
  schemaVersion: string,
  classification: string,
): { normalized: Record<string, unknown>; issues: DataEngineNormalizationIssue[]; hasInferred: boolean } {
  const normalized: Record<string, unknown> = {};
  const issues: DataEngineNormalizationIssue[] = [];
  let hasInferred = false;

  // Source-specific mappings
  if (sourceType === 'SERVICE') {
    // Service center mapping
    if ('repairCodes' in payload && Array.isArray(payload.repairCodes)) {
      const codes = (payload.repairCodes as string[]).map((code) => normalizeRepairCode(code));
      normalized.repairTypes = codes;
    }

    if ('serviceDate' in payload) {
      normalized.eventDate = payload.serviceDate;
    }

    if ('mileage' in payload) {
      normalized.mileageAtService = payload.mileage;
    }

    if ('cost' in payload) {
      normalized.estimatedCost = payload.cost;
    }
  } else if (sourceType === 'INSURANCE') {
    // Insurance claim mapping
    if ('claimType' in payload) {
      normalized.claimType = payload.claimType;
    }

    if ('damageDescription' in payload) {
      normalized.damageDescription = payload.damageDescription;
    }

    if ('claimDate' in payload) {
      normalized.eventDate = payload.claimDate;
    }

    if ('estimatedRepairCost' in payload) {
      normalized.estimatedCost = payload.estimatedRepairCost;
    }
  } else if (sourceType === 'TELEMATICS') {
    // Telematics mapping
    if ('diagnosticCodes' in payload && Array.isArray(payload.diagnosticCodes)) {
      normalized.diagnosticCodes = payload.diagnosticCodes;
    }

    if ('timestamp' in payload) {
      normalized.eventTimestamp = payload.timestamp;
    }

    if ('signalData' in payload) {
      normalized.telemetryData = payload.signalData;
    }
  }

  return { normalized, issues, hasInferred };
}

/**
 * Normalize repair code (simple mapping example)
 */
function normalizeRepairCode(code: string): string {
  // Simple mapping of common codes
  const codeMap: Record<string, string> = {
    '91K000': 'BRAKE_PAD_REPLACEMENT',
    '91Q000': 'TIRE_REPLACEMENT',
    '71B000': 'OIL_CHANGE',
    '71C000': 'FILTER_REPLACEMENT',
  };

  return codeMap[code] || `REPAIR_${code}`;
}

/**
 * Extract and validate event date from payload
 */
function extractEventDate(
  payload: Record<string, unknown>,
  schemaVersion: string,
): {
  value?: string;
  issues: DataEngineNormalizationIssue[];
} {
  const issues: DataEngineNormalizationIssue[] = [];

  // Try common date field names
  const dateFields = ['serviceDate', 'claimDate', 'incidentDate', 'eventDate', 'diagnosticDate'];
  for (const field of dateFields) {
    if (field in payload) {
      const value = payload[field];
      if (typeof value === 'string') {
        if (isValidDateFormat(value)) {
          return { value, issues };
        } else {
          issues.push({
            issueCode: DataEngineNormalizationIssueCode.INVALID_DATE_FORMAT,
            severity: 'LIMITING',
            message: `Date field '${field}' has invalid format: '${value}'`,
            fieldReference: `feedPayload.${field}`,
            remediable: true,
          });
        }
      }
    }
  }

  return { issues };
}

/**
 * Validate ISO 8601 date format
 */
function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?)?$/.test(date);
}

/**
 * Generate deterministic entity ID
 */
function generateEntityId(identityId: string, entityType: string, eventDate?: string): string {
  const timestamp = eventDate ? new Date(eventDate).getTime() : Date.now();
  const hash = generateSimpleHash(`${identityId}__${entityType}__${timestamp}`);
  return `entity_${hash}`;
}

/**
 * Simple hash function for deterministic ID generation
 */
function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Calculate completeness based on normalized attributes
 */
function calculateCompleteness(
  attributes: Record<string, unknown>,
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const keys = Object.keys(attributes);
  if (keys.length === 0) return 'LOW';
  if (keys.length >= 5) return 'HIGH';
  return 'MEDIUM';
}

/**
 * Build normalization result
 */
function buildResult(
  status: 'NORMALIZED' | 'NORMALIZED_WITH_WARNINGS' | 'REJECTED',
  entity: DataEngineEntity | undefined,
  issues: DataEngineNormalizationIssue[],
  candidateRef: string,
  normalizedAt: string,
  hasInferredValues: boolean,
  schemaVersion: string,
): DataEngineNormalizationResult {
  const blockingCount = issues.filter((i) => i.severity === 'BLOCKING').length;
  const limitingCount = issues.filter((i) => i.severity === 'LIMITING').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

  let summary: string;
  switch (status) {
    case 'NORMALIZED':
      summary = 'Feed successfully normalized to canonical entity';
      break;
    case 'NORMALIZED_WITH_WARNINGS':
      summary = `Feed normalized with ${limitingCount + warningCount} concern(s)`;
      break;
    case 'REJECTED':
      summary = `Feed rejected due to ${blockingCount} critical issue(s)`;
      break;
  }

  return {
    status,
    entity,
    issues,
    candidateRef,
    normalizedAt,
    summary,
    issueStats: {
      blocking: blockingCount,
      limiting: limitingCount,
      warnings: warningCount,
    },
    hasInferredValues,
    appliedSchemaVersion: schemaVersion,
  };
}
