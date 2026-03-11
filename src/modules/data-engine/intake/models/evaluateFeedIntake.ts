/**
 * Evaluate Feed Intake
 *
 * Entry point for intake evaluation.
 * Determines whether a feed candidate can proceed through the Data Engine pipeline.
 */

import type { DataEngineFeedCandidate } from '../types/DataEngineFeedCandidate';
import type { DataEngineIntakePolicy } from './DataEngineIntakePolicy';
import type { DataEngineIntakeResult } from './DataEngineIntakeResult';
import type { DataEngineIntakeIssue } from './DataEngineIntakeIssue';
import { defaultIntakePolicy } from './DataEngineIntakePolicy';
import type { DataSourceType } from '../../types/DataSourceType';

/**
 * Evaluate Feed Intake
 *
 * Deterministically evaluates an incoming feed candidate against intake requirements and policy.
 *
 * This function:
 * - Checks critical structural requirements
 * - Validates field presence and format
 * - Applies source-aware policy
 * - Produces a complete, auditable decision
 *
 * This function does NOT:
 * - Normalize payload
 * - Generate canonical entities
 * - Resolve identity
 * - Persist data
 * - Call external services
 */
export function evaluateFeedIntake(
  candidate: DataEngineFeedCandidate,
  policy: DataEngineIntakePolicy = defaultIntakePolicy,
): DataEngineIntakeResult {
  const issues: DataEngineIntakeIssue[] = [];
  const evaluatedAt = new Date().toISOString();

  // ───────────────────────────────────────────────────────────────────────────────
  // CRITICAL REQUIREMENT: Identity Linkage
  // ───────────────────────────────────────────────────────────────────────────────

  if (!candidate.identityId) {
    issues.push({
      issueCode: 'MISSING_IDENTITY_ID',
      severity: 'BLOCKING',
      message: 'Feed provides no identityId; cannot link to vehicle identity',
      remediable: false,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CRITICAL REQUIREMENT: Source Type
  // ───────────────────────────────────────────────────────────────────────────────

  const validSourceTypes: DataSourceType[] = [
    'SERVICE',
    'INSURANCE',
    'FLEET',
    'EXPERT_SYSTEM',
    'PARTS_NETWORK',
    'TELEMATICS',
    'MANUFACTURER',
    'DEALER',
    'THIRD_PARTY_SERVICE',
    'OTHER',
  ];

  if (!validSourceTypes.includes(candidate.sourceOrigin)) {
    issues.push({
      issueCode: 'INVALID_SOURCE_TYPE',
      severity: 'BLOCKING',
      fieldReference: 'sourceOrigin',
      message: `Source type '${candidate.sourceOrigin}' is not recognized`,
      remediable: false,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CRITICAL REQUIREMENT: Payload Presence
  // ───────────────────────────────────────────────────────────────────────────────

  if (!candidate.candidatePayload) {
    issues.push({
      issueCode: 'MISSING_FEED_PAYLOAD',
      severity: 'BLOCKING',
      fieldReference: 'candidatePayload',
      message: 'Feed provides no payload data',
      remediable: false,
    });
  } else if (Object.keys(candidate.candidatePayload).length === 0) {
    issues.push({
      issueCode: 'EMPTY_PAYLOAD',
      severity: 'BLOCKING',
      fieldReference: 'candidatePayload',
      message: 'Feed payload is empty (no intelligence data)',
      remediable: false,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CRITICAL REQUIREMENT: Metadata Presence
  // ───────────────────────────────────────────────────────────────────────────────

  if (!candidate.metadata) {
    issues.push({
      issueCode: 'MISSING_FEED_METADATA',
      severity: 'BLOCKING',
      fieldReference: 'metadata',
      message: 'Feed provides no metadata structure',
      remediable: false,
    });
  } else {
    // Check metadata completeness
    const metadata = candidate.metadata;

    if (!metadata.sourceId) {
      issues.push({
        issueCode: 'MISSING_FEED_METADATA',
        severity: 'BLOCKING',
        fieldReference: 'metadata.sourceId',
        message: 'Metadata is missing required sourceId',
        remediable: false,
      });
    }

    if (!metadata.schemaVersion) {
      issues.push({
        issueCode: 'MISSING_FEED_METADATA',
        severity: 'BLOCKING',
        fieldReference: 'metadata.schemaVersion',
        message: 'Metadata is missing required schemaVersion',
        remediable: false,
      });
    }

    // Schema version compatibility check (example: accept 1.x, 2.x; reject 3.x+)
    if (metadata.schemaVersion) {
      const majorVersion = parseInt(metadata.schemaVersion.split('.')[0], 10);
      if (majorVersion > 2) {
        issues.push({
          issueCode: 'UNSUPPORTED_SCHEMA_VERSION',
          severity: 'BLOCKING',
          fieldReference: 'metadata.schemaVersion',
          message: `Schema version '${metadata.schemaVersion}' is not supported; upgrade Data Engine`,
          remediable: false,
        });
      } else if (majorVersion === 1) {
        // Legacy conformance warning
        issues.push({
          issueCode: 'LEGACY_CONFORMANCE_WARNING',
          severity: 'WARNING',
          fieldReference: 'metadata.schemaVersion',
          message: `Feed uses legacy schema version '${metadata.schemaVersion}'; compatibility maintained`,
          remediable: false,
        });
      }
    }

    // Optional metadata completeness
    const optionalMetadataFields = ['regionCode', 'issuerContext', 'feedType'];
    const missingOptionalFields = optionalMetadataFields.filter(
      (field) => !(field in metadata),
    );

    if (
      missingOptionalFields.length > 0 &&
      !policy.tolerateMissingOptionalMetadata
    ) {
      issues.push({
        issueCode: 'INCOMPLETE_OPTIONAL_METADATA',
        severity: 'WARNING',
        message: `Metadata is missing optional fields: ${missingOptionalFields.join(', ')}`,
        remediable: true,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // CRITICAL REQUIREMENT: Timestamps Presence and Validity
  // ───────────────────────────────────────────────────────────────────────────────

  if (!candidate.timestamps) {
    issues.push({
      issueCode: 'MISSING_FEED_TIMESTAMPS',
      severity: 'BLOCKING',
      fieldReference: 'timestamps',
      message: 'Feed provides no timestamp structure',
      remediable: false,
    });
  } else {
    const timestamps = candidate.timestamps;

    // Check timestamp field presence
    if (!timestamps.eventTimestamp) {
      issues.push({
        issueCode: 'MISSING_FEED_TIMESTAMPS',
        severity: 'BLOCKING',
        fieldReference: 'timestamps.eventTimestamp',
        message: 'Timestamps missing required eventTimestamp',
        remediable: false,
      });
    }

    if (!timestamps.observedTimestamp) {
      issues.push({
        issueCode: 'MISSING_FEED_TIMESTAMPS',
        severity: 'BLOCKING',
        fieldReference: 'timestamps.observedTimestamp',
        message: 'Timestamps missing required observedTimestamp',
        remediable: false,
      });
    }

    if (!timestamps.ingestedTimestamp) {
      issues.push({
        issueCode: 'MISSING_FEED_TIMESTAMPS',
        severity: 'BLOCKING',
        fieldReference: 'timestamps.ingestedTimestamp',
        message: 'Timestamps missing required ingestedTimestamp',
        remediable: false,
      });
    }

    // Validate timestamp format and values
    const now = new Date();
    const maxFutureAge = 24 * 60 * 60 * 1000; // 24 hours in the future is tolerable
    const maxPastAge = 10 * 365.25 * 24 * 60 * 60 * 1000; // 10 years in the past

    const timestampFields = [
      { field: 'eventTimestamp', value: timestamps.eventTimestamp },
      { field: 'observedTimestamp', value: timestamps.observedTimestamp },
      { field: 'ingestedTimestamp', value: timestamps.ingestedTimestamp },
    ];

    for (const { field, value } of timestampFields) {
      if (!value) continue;

      // Check ISO 8601 format
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        const behavior = policy.malformedTimestampBehavior;
        issues.push({
          issueCode: 'MALFORMED_TIMESTAMP',
          severity: behavior === 'WARN' ? 'WARNING' : 'BLOCKING',
          fieldReference: `timestamps.${field}`,
          message: `Timestamp '${value}' is not valid ISO 8601 format`,
          remediable: true,
        });
        continue;
      }

      // Check temporal bounds
      const age = now.getTime() - parsed.getTime();
      if (age > maxFutureAge || age < -maxPastAge) {
        const behavior = policy.malformedTimestampBehavior;
        issues.push({
          issueCode: 'TIMESTAMP_OUT_OF_RANGE',
          severity: behavior === 'WARN' ? 'WARNING' : 'BLOCKING',
          fieldReference: `timestamps.${field}`,
          message: `Timestamp '${value}' is far outside expected range`,
          remediable: true,
        });
      }
    }

    // Check temporal sequence (event → observed → ingested)
    if (
      timestamps.eventTimestamp &&
      timestamps.observedTimestamp &&
      timestamps.ingestedTimestamp
    ) {
      const eventTime = new Date(timestamps.eventTimestamp).getTime();
      const observedTime = new Date(timestamps.observedTimestamp).getTime();
      const ingestedTime = new Date(timestamps.ingestedTimestamp).getTime();

      if (!isNaN(eventTime) && !isNaN(observedTime) && !isNaN(ingestedTime)) {
        if (observedTime < eventTime || ingestedTime < observedTime) {
          issues.push({
            issueCode: 'INVALID_TIMESTAMP_SEQUENCE',
            severity: 'WARNING',
            message:
              'Temporal sequence violated: observed < event or ingested < observed',
            remediable: true,
          });
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // DECISION LOGIC
  // ───────────────────────────────────────────────────────────────────────────────

  // Check for blocking issues
  const blockingIssues = issues.filter((issue) => issue.severity === 'BLOCKING');
  const warningIssues = issues.filter((issue) => issue.severity === 'WARNING');

  // Apply source-specific policy overrides
  const sourceSpecific = policy.sourceSpecificPolicies?.[candidate.sourceOrigin];
  const effectivePolicy = { ...policy, ...sourceSpecific };

  // Determine status
  let status: 'ACCEPTED' | 'ACCEPTED_WITH_WARNINGS' | 'REJECTED' | 'QUARANTINED';

  if (blockingIssues.length > 0) {
    // Hard blocking issues found
    // Check if any relate to malformed timestamps (which may be quarantined instead)
    const malformedTimestampIssues = blockingIssues.filter(
      (issue) => issue.issueCode === 'MALFORMED_TIMESTAMP',
    );

    if (
      malformedTimestampIssues.length > 0 &&
      effectivePolicy.malformedTimestampBehavior === 'QUARANTINE'
    ) {
      // Quarantine instead of reject
      status = 'QUARANTINED';
    } else {
      status = 'REJECTED';
    }
  } else if (warningIssues.length > 0) {
    if (effectivePolicy.allowWarnings) {
      status = 'ACCEPTED_WITH_WARNINGS';
    } else {
      status = 'REJECTED';
    }
  } else {
    status = 'ACCEPTED';
  }

  // Build decision summary
  let decisionSummary: string;
  switch (status) {
    case 'ACCEPTED':
      decisionSummary = 'Feed accepted; all requirements satisfied';
      break;
    case 'ACCEPTED_WITH_WARNINGS':
      decisionSummary = `Feed accepted with ${warningIssues.length} warning(s); issues noted for observation`;
      break;
    case 'REJECTED':
      decisionSummary = `Feed rejected; ${blockingIssues.length} critical issue(s) prevent acceptance`;
      break;
    case 'QUARANTINED':
      decisionSummary = `Feed quarantined; malformed data requires manual review before proceeding`;
      break;
  }

  return {
    status,
    issues,
    candidateId: candidate.candidateId,
    policyApplied: effectivePolicy as DataEngineIntakePolicy,
    decisionSummary,
    evaluatedAt,
  };
}
