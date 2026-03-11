/**
 * Evaluate Identity Binding
 *
 * Entry point for identity binding evaluation.
 * Determines whether a feed's identity context is sufficient for binding to downstream processing.
 */

import type { DataEngineIdentityBindingCandidate } from './DataEngineIdentityBindingCandidate';
import type { DataEngineIdentityBindingPolicy } from './DataEngineIdentityBindingPolicy';
import type { DataEngineIdentityBindingResult } from './DataEngineIdentityBindingResult';
import type { DataEngineBindingIssue } from './DataEngineBindingIssue';
import type { DataEngineBindingStatus } from '../types/DataEngineBindingStatus';
import { DataEngineBindingIssueCode } from '../types/DataEngineBindingIssueCode';
import { defaultBindingPolicy } from './DataEngineIdentityBindingPolicy';

/**
 * Evaluate Identity Binding
 *
 * Deterministically evaluates whether an accepted feed's identity context
 * is sufficient and trustworthy for binding to downstream processing.
 *
 * This function:
 * - Inspects identity context completeness
 * - Assesses issuer/scope/environment compatibility
 * - Validates temporal identity validity
 * - Evaluates trust level and confidence
 * - Applies source-aware binding policy
 * - Produces a complete, auditable binding decision
 *
 * This function does NOT:
 * - Generate identityId
 * - Resolve VIN to identityId
 * - Normalize feed payload
 * - Generate canonical entities
 * - Perform intake validation
 * - Enrich identity context
 * - Persist data
 * - Perform cryptographic verification (that is authorization layer responsibility)
 * - Access external services
 *
 * Input assumption:
 * The provided candidate is from Phase 2 intake, meaning:
 * - The feed has already passed intake structural validation
 * - The feed contains a valid identityId
 * - This phase now evaluates binding quality, not field presence alone
 */
export function evaluateIdentityBinding(
  candidate: DataEngineIdentityBindingCandidate,
  policy: DataEngineIdentityBindingPolicy = defaultBindingPolicy,
): DataEngineIdentityBindingResult {
  const issues: DataEngineBindingIssue[] = [];
  const evaluatedAt = new Date().toISOString();
  const identityContext = candidate.identityContext;
  const now = new Date();
  const effectivePolicy = applySourceOverrides(policy, candidate.sourceOrigin);

  // ─────────────────────────────────────────────────────────────────────────────
  // IDENTITY CONTEXT PRESENCE CHECK
  // ─────────────────────────────────────────────────────────────────────────────

  // EARLY RETURN: Missing identity context entirely
  if (!identityContext) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.MISSING_IDENTITY_CONTEXT,
      severity: 'BLOCKING',
      message: 'Candidate provides no identity context for binding evaluation',
      remediable: false,
    });
    return buildResult(
      'UNRESOLVED',
      issues,
      candidate,
      effectivePolicy,
      evaluatedAt,
    );
  }

  // Check for required identityId
  if (!identityContext.identityId) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.MISSING_IDENTITY_ID,
      severity: 'BLOCKING',
      message: 'Identity context missing required identityId field',
      fieldReference: 'identityContext.identityId',
      remediable: false,
    });
    return buildResult(
      'UNRESOLVED',
      issues,
      candidate,
      effectivePolicy,
      evaluatedAt,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ISSUER CONTEXT EVALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  let isCriticalContextMissing = false;

  if (!identityContext.issuerId) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.MISSING_ISSUER_CONTEXT,
      severity: 'LIMITING',
      message: 'Identity context missing issuerId; cannot assess issuer trustworthiness',
      fieldReference: 'identityContext.issuerId',
      remediable: true,
    });
    isCriticalContextMissing = true;
  } else {
    // Check for issuer mismatch with source
    const expectedIssuers: Record<string, string[]> = {
      SERVICE: ['SERVICE_CENTER', 'SERVICE_NETWORK', 'AUTHORIZED_DEALERS'],
      INSURANCE: ['INSURANCE_PROVIDER', 'CLAIMS_SYSTEM', 'INSURER'],
      FLEET: ['FLEET_MANAGER', 'FLEET_OPS', 'VEHICLE_FLEET'],
      TELEMATICS: ['TELEMATICS_PROVIDER', 'CONNECTED_CAR', 'OEM_TELEMATICS'],
      PARTS_NETWORK: ['PARTS_SUPPLIER', 'OEM_PARTS', 'PARTS_DISTRIBUTOR'],
      MANUFACTURER: ['OEM_MANUFACTURER', 'VEHICLE_MANUFACTURER'],
      DEALER: ['AUTHORIZED_DEALER', 'DEALERSHIP', 'DEALER_NETWORK'],
      EXPERT_SYSTEM: ['DIAGNOSTIC_SYSTEM', 'EXPERT_ENGINE', 'AI_DIAGNOSTICS'],
      THIRD_PARTY_SERVICE: ['SERVICE_PROVIDER', 'THIRD_PARTY', 'PARTNER_SERVICE'],
      OTHER: [],
    };

    const expectedForSource = expectedIssuers[candidate.sourceOrigin];
    if (expectedForSource && !isIssuerCompatible(identityContext.issuerId, expectedForSource)) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.ISSUER_MISMATCH,
        severity: 'LIMITING',
        message: `Identity issuer '${identityContext.issuerId}' does not match expected issuer type for ${candidate.sourceOrigin}`,
        fieldReference: 'identityContext.issuerId',
        remediable: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCOPE AND ENVIRONMENT EVALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  if (!identityContext.scope) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.MISSING_SCOPE_CONTEXT,
      severity: 'LIMITING',
      message: 'Identity context missing scope; operational boundary undefined',
      fieldReference: 'identityContext.scope',
      remediable: true,
    });
  } else {
    // Check for scope/source mismatch
    const scopeSourceMapping: Record<string, string[]> = {
      'authorized-dealers': ['SERVICE', 'DEALER'],
      'fleet-operations': ['FLEET'],
      'telematics-partners': ['TELEMATICS'],
      'claims-processing': ['INSURANCE'],
      'partner-services': ['THIRD_PARTY_SERVICE'],
      'manufacturer-direct': ['MANUFACTURER'],
    };

    const expectedSourcesForScope = scopeSourceMapping[identityContext.scope];
    if (
      expectedSourcesForScope &&
      !expectedSourcesForScope.includes(candidate.sourceOrigin)
    ) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.SCOPE_MISMATCH,
        severity: 'LIMITING',
        message: `Identity scope '${identityContext.scope}' does not align with source origin '${candidate.sourceOrigin}'`,
        fieldReference: 'identityContext.scope',
        remediable: false,
      });
    }
  }

  if (identityContext.environment) {
    // Check for environment mismatch
    const systemEnvironment = process.env.NODE_ENV || 'production';
    if (identityContext.environment !== systemEnvironment &&
        identityContext.environment !== 'any' &&
        identityContext.environment !== 'all') {
      issues.push({
        issueCode: DataEngineBindingIssueCode.ENVIRONMENT_MISMATCH,
        severity: 'LIMITING',
        message: `Identity environment '${identityContext.environment}' does not match system environment '${systemEnvironment}'`,
        fieldReference: 'identityContext.environment',
        remediable: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TRUST LEVEL EVALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  const trustLevel = identityContext.trustLevel || 'MEDIUM';
  const minimumTrust = effectivePolicy.minimumTrustLevel;

  const trustOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const isBelowMinimumTrust = trustOrder[trustLevel] < trustOrder[minimumTrust];

  if (isBelowMinimumTrust) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.LOW_TRUST_BINDING,
      severity: 'LIMITING',
      message: `Identity trust level '${trustLevel}' is below minimum required '${minimumTrust}'`,
      fieldReference: 'identityContext.trustLevel',
      remediable: false,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPORAL VALIDITY EVALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  // Check revoked status
  if (identityContext.revoked) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.REVOKED_IDENTITY,
      severity: 'BLOCKING',
      message: 'Identity has been revoked; no longer valid for binding',
      fieldReference: 'identityContext.revoked',
      remediable: false,
    });
  }

  // Check issuedAt
  if (identityContext.issuedAt) {
    const issuedTime = new Date(identityContext.issuedAt).getTime();
    if (isNaN(issuedTime)) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.MALFORMED_IDENTITY_CONTEXT,
        severity: 'LIMITING',
        message: `issuedAt '${identityContext.issuedAt}' is not valid ISO 8601 format`,
        fieldReference: 'identityContext.issuedAt',
        remediable: true,
      });
    } else if (issuedTime > now.getTime()) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.IDENTITY_NOT_YET_VALID,
        severity: 'BLOCKING',
        message: `Identity not yet valid; issuedAt '${identityContext.issuedAt}' is in the future`,
        fieldReference: 'identityContext.issuedAt',
        remediable: false,
      });
    }
  }

  // Check expiresAt and handle according to policy
  if (identityContext.expiresAt) {
    const expiresTime = new Date(identityContext.expiresAt).getTime();
    if (isNaN(expiresTime)) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.MALFORMED_IDENTITY_CONTEXT,
        severity: 'LIMITING',
        message: `expiresAt '${identityContext.expiresAt}' is not valid ISO 8601 format`,
        fieldReference: 'identityContext.expiresAt',
        remediable: true,
      });
    } else if (expiresTime < now.getTime()) {
      // Expired identity: severity depends on policy
      const severity = effectivePolicy.expiredIdentityBehavior === 'REJECT' ? 'BLOCKING' : 'LIMITING';
      issues.push({
        issueCode: DataEngineBindingIssueCode.EXPIRED_IDENTITY,
        severity,
        message: `Identity has expired; expiresAt '${identityContext.expiresAt}' is in the past`,
        fieldReference: 'identityContext.expiresAt',
        remediable: false,
      });
    }
  }

  // Check temporal sequence (issuedAt before expiresAt)
  if (identityContext.issuedAt && identityContext.expiresAt) {
    const issuedTime = new Date(identityContext.issuedAt).getTime();
    const expiresTime = new Date(identityContext.expiresAt).getTime();
    if (!isNaN(issuedTime) && !isNaN(expiresTime) && expiresTime <= issuedTime) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.INVALID_IDENTITY_TEMPORAL_SEQUENCE,
        severity: 'BLOCKING',
        message: 'Invalid identity temporal sequence: expiresAt is not after issuedAt',
        remediable: true,
      });
    }
  }

  // Check identity staleness and apply staleIdentityBehavior policy
  if (identityContext.issuedAt && effectivePolicy.maxIdentityAgeMillis > 0) {
    const issuedTime = new Date(identityContext.issuedAt).getTime();
    if (!isNaN(issuedTime)) {
      const age = now.getTime() - issuedTime;
      if (age > effectivePolicy.maxIdentityAgeMillis) {
        // Stale identity: severity depends on policy
        const severity = effectivePolicy.staleIdentityBehavior === 'REJECT' ? 'BLOCKING' : 'LIMITING';
        issues.push({
          issueCode: DataEngineBindingIssueCode.IDENTITY_STALE,
          severity,
          message: `Identity is stale; issued ${Math.floor(age / (365.25 * 24 * 60 * 60 * 1000))} years ago, exceeds maximum age of ${Math.floor(effectivePolicy.maxIdentityAgeMillis / (365.25 * 24 * 60 * 60 * 1000))} years`,
          fieldReference: 'identityContext.issuedAt',
          remediable: false,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FEDERATION CONTEXT EVALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  let federationIsComplete = true;

  if (identityContext.federation) {
    const federation = identityContext.federation;

    // Check federation completeness
    const hasMode = !!federation.mode;
    const hasChain = federation.chain && federation.chain.length > 0;
    const hasIssuer = !!federation.issuedBy || !!federation.delegatedBy;

    if (!hasMode || !hasChain || !hasIssuer) {
      federationIsComplete = false;
      // Check if policy tolerates incomplete federation
      const severity = effectivePolicy.tolerateIncompleteFederationContext ? 'LIMITING' : 'BLOCKING';
      issues.push({
        issueCode: DataEngineBindingIssueCode.INCOMPLETE_FEDERATION_CONTEXT,
        severity,
        message: 'Federation context is incomplete; federated identity chain cannot be fully validated',
        fieldReference: 'identityContext.federation',
        remediable: true,
      });
    }

    // Check for supported federation modes
    const supportedModes = ['SAML2', 'OIDC', 'DIRECT', 'DELEGATED'];
    if (federation.mode && !supportedModes.includes(federation.mode)) {
      issues.push({
        issueCode: DataEngineBindingIssueCode.UNSUPPORTED_FEDERATION_PATH,
        severity: 'LIMITING',
        message: `Federation mode '${federation.mode}' is not supported`,
        fieldReference: 'identityContext.federation.mode',
        remediable: false,
      });
    }
  }

  // Check for ambiguous binding context
  // (contradictory or inconsistent signals that make binding unclear)
  if (
    identityContext.scope &&
    identityContext.environment &&
    !identityContext.federation &&
    isCriticalContextMissing
  ) {
    issues.push({
      issueCode: DataEngineBindingIssueCode.AMBIGUOUS_BINDING_CONTEXT,
      severity: 'LIMITING',
      message: 'Identity context contains partial but contradictory binding signals; federation context missing',
      remediable: true,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BINDING DECISION LOGIC
  // ─────────────────────────────────────────────────────────────────────────────

  // Check for UNRESOLVED condition: critical context missing
  if (isCriticalContextMissing) {
    return buildResult(
      'UNRESOLVED',
      issues,
      candidate,
      effectivePolicy,
      evaluatedAt,
    );
  }

  const blockingIssues = issues.filter((i) => i.severity === 'BLOCKING');
  const limitingIssues = issues.filter((i) => i.severity === 'LIMITING');

  let status: DataEngineBindingStatus;
  let hasLimitations = false;
  let limitationDescription: string | undefined;

  if (blockingIssues.length > 0) {
    // Check which blocking issues and what behavior policy dictates
    const revokedIssues = blockingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.REVOKED_IDENTITY,
    );
    const expiredIssues = blockingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.EXPIRED_IDENTITY,
    );
    const staleIssues = blockingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.IDENTITY_STALE,
    );
    const notYetValidIssues = blockingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.IDENTITY_NOT_YET_VALID,
    );
    const temporalSequenceIssues = blockingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.INVALID_IDENTITY_TEMPORAL_SEQUENCE,
    );
    const federationIssues = blockingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.INCOMPLETE_FEDERATION_CONTEXT,
    );

    // Hard blocks: revoked and not-yet-valid are always blocking
    if (revokedIssues.length > 0) {
      if (effectivePolicy.revokedIdentityBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else {
        status = 'REJECTED';
      }
    } else if (notYetValidIssues.length > 0) {
      status = 'REJECTED';
    } else if (temporalSequenceIssues.length > 0) {
      status = 'REJECTED';
    } else if (expiredIssues.length > 0) {
      // Expired behavior is configurable
      if (effectivePolicy.expiredIdentityBehavior === 'REJECT') {
        status = 'REJECTED';
      } else {
        status = 'QUARANTINED';
      }
    } else if (staleIssues.length > 0) {
      // Stale behavior is configurable
      if (effectivePolicy.staleIdentityBehavior === 'REJECT') {
        status = 'REJECTED';
      } else {
        status = 'QUARANTINED';
      }
    } else if (federationIssues.length > 0) {
      // Incomplete federation marked as blocking
      status = 'REJECTED';
    } else {
      // Other blocking issues
      status = 'REJECTED';
    }
  } else if (limitingIssues.length > 0) {
    // No blocking issues, but limiting issues exist

    // Check for LOW_TRUST_BINDING and apply allowLowTrustBinding policy
    const lowTrustIssues = limitingIssues.filter(
      (i) => i.issueCode === DataEngineBindingIssueCode.LOW_TRUST_BINDING,
    );
    if (lowTrustIssues.length > 0 && !effectivePolicy.allowLowTrustBinding) {
      status = 'REJECTED';
    } else {
      // Continue with other issue checks
      const expiredIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.EXPIRED_IDENTITY,
      );
      const issuerMismatchIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.ISSUER_MISMATCH,
      );
      const envMismatchIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.ENVIRONMENT_MISMATCH,
      );
      const scopeMismatchIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.SCOPE_MISMATCH,
      );
      const ambiguousIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.AMBIGUOUS_BINDING_CONTEXT,
      );
      const staleIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.IDENTITY_STALE,
      );
      const federationIssues = limitingIssues.filter(
        (i) => i.issueCode === DataEngineBindingIssueCode.INCOMPLETE_FEDERATION_CONTEXT,
      );

      // Check if limiting issues require quarantine or rejection
      if (expiredIssues.length > 0 &&
          effectivePolicy.expiredIdentityBehavior === 'REJECT') {
        status = 'REJECTED';
      } else if (expiredIssues.length > 0 &&
          effectivePolicy.expiredIdentityBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else if (issuerMismatchIssues.length > 0 &&
          effectivePolicy.issuerMismatchBehavior === 'REJECT') {
        status = 'REJECTED';
      } else if (issuerMismatchIssues.length > 0 &&
          effectivePolicy.issuerMismatchBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else if (envMismatchIssues.length > 0 &&
          effectivePolicy.environmentMismatchBehavior === 'REJECT') {
        status = 'REJECTED';
      } else if (envMismatchIssues.length > 0 &&
          effectivePolicy.environmentMismatchBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else if (scopeMismatchIssues.length > 0 &&
          effectivePolicy.scopeMismatchBehavior === 'REJECT') {
        status = 'REJECTED';
      } else if (scopeMismatchIssues.length > 0 &&
          effectivePolicy.scopeMismatchBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else if (ambiguousIssues.length > 0 &&
          effectivePolicy.ambiguousContextBehavior === 'REJECT') {
        status = 'REJECTED';
      } else if (ambiguousIssues.length > 0 &&
          effectivePolicy.ambiguousContextBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else if (staleIssues.length > 0 &&
          effectivePolicy.staleIdentityBehavior === 'REJECT') {
        status = 'REJECTED';
      } else if (staleIssues.length > 0 &&
          effectivePolicy.staleIdentityBehavior === 'QUARANTINE') {
        status = 'QUARANTINED';
      } else if (federationIssues.length > 0 &&
          !effectivePolicy.tolerateIncompleteFederationContext) {
        status = 'REJECTED';
      } else {
        // All limiting issues are permitted by policy
        status = 'BOUND_WITH_LIMITATIONS';
        hasLimitations = true;
        limitationDescription = buildLimitationDescription(limitingIssues);
      }
    }
  } else {
    // No issues
    status = 'BOUND';
  }

  // Build identity characteristics for result
  const identityCharacteristics = {
    trustLevel,
    issuer: identityContext.issuerId,
    scope: identityContext.scope,
    environment: identityContext.environment,
    isStale: issues.some((i) => i.issueCode === DataEngineBindingIssueCode.IDENTITY_STALE),
    isExpired: issues.some((i) => i.issueCode === DataEngineBindingIssueCode.EXPIRED_IDENTITY),
    isRevoked: identityContext.revoked || false,
    federationComplete: !issues.some(
      (i) => i.issueCode === DataEngineBindingIssueCode.INCOMPLETE_FEDERATION_CONTEXT,
    ),
  };

  return {
    status,
    issues,
    candidateId: candidate.intakeCandidateId,
    intakeCandidateId: candidate.intakeCandidateId,
    policyApplied: effectivePolicy,
    hasLimitations,
    limitationDescription,
    decisionSummary: buildDecisionSummary(status, issues, hasLimitations),
    evaluatedAt,
    identityCharacteristics,
  };
}

/**
 * Helper: Apply source-specific policy overrides
 */
function applySourceOverrides(
  policy: DataEngineIdentityBindingPolicy,
  sourceOrigin: string,
): DataEngineIdentityBindingPolicy {
  const sourceSpecific = policy.sourceSpecificPolicies?.[sourceOrigin];
  if (!sourceSpecific) {
    return policy;
  }

  return {
    ...policy,
    allowLowTrustBinding: sourceSpecific.allowLowTrustBinding ?? policy.allowLowTrustBinding,
    tolerateIncompleteFederationContext:
      sourceSpecific.tolerateIncompleteFederationContext ??
      policy.tolerateIncompleteFederationContext,
    environmentMismatchBehavior:
      sourceSpecific.environmentMismatchBehavior ?? policy.environmentMismatchBehavior,
    scopeMismatchBehavior: sourceSpecific.scopeMismatchBehavior ?? policy.scopeMismatchBehavior,
    expiredIdentityBehavior:
      sourceSpecific.expiredIdentityBehavior ?? policy.expiredIdentityBehavior,
    revokedIdentityBehavior:
      sourceSpecific.revokedIdentityBehavior ?? policy.revokedIdentityBehavior,
    staleIdentityBehavior: sourceSpecific.staleIdentityBehavior ?? policy.staleIdentityBehavior,
    maxIdentityAgeMillis: sourceSpecific.maxIdentityAgeMillis ?? policy.maxIdentityAgeMillis,
    issuerMismatchBehavior:
      sourceSpecific.issuerMismatchBehavior ?? policy.issuerMismatchBehavior,
    ambiguousContextBehavior:
      sourceSpecific.ambiguousContextBehavior ?? policy.ambiguousContextBehavior,
    minimumTrustLevel: sourceSpecific.minimumTrustLevel ?? policy.minimumTrustLevel,
  };
}

/**
 * Helper: Check if issuer is compatible with source
 */
function isIssuerCompatible(issuer: string, expectedIssuers: string[]): boolean {
  return expectedIssuers.some((exp) => issuer.toUpperCase().includes(exp.toUpperCase()));
}

/**
 * Helper: Build limitation description from issues
 */
function buildLimitationDescription(issues: DataEngineBindingIssue[]): string {
  const descriptions: string[] = [];

  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.INCOMPLETE_FEDERATION_CONTEXT)) {
    descriptions.push('incomplete federation context');
  }
  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.LOW_TRUST_BINDING)) {
    descriptions.push('low-trust identity source');
  }
  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.MISSING_SCOPE_CONTEXT)) {
    descriptions.push('missing scope information');
  }
  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.SCOPE_MISMATCH)) {
    descriptions.push('scope/source mismatch');
  }
  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.IDENTITY_STALE)) {
    descriptions.push('stale identity');
  }
  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.ENVIRONMENT_MISMATCH)) {
    descriptions.push('environment mismatch');
  }
  if (issues.some((i) => i.issueCode === DataEngineBindingIssueCode.AMBIGUOUS_BINDING_CONTEXT)) {
    descriptions.push('ambiguous binding context');
  }

  return descriptions.length > 0
    ? `Binding permitted with limitations: ${descriptions.join(', ')}`
    : 'Binding permitted with limitations';
}

/**
 * Helper: Build decision summary
 */
function buildDecisionSummary(
  status: DataEngineBindingStatus,
  issues: DataEngineBindingIssue[],
  hasLimitations: boolean,
): string {
  switch (status) {
    case 'BOUND':
      return 'Feed bound; identity context is complete and trustworthy for downstream use';
    case 'BOUND_WITH_LIMITATIONS':
      const limitCount = issues.length;
      return `Feed bound with limitations; ${limitCount} identity context concern(s) noted but does not prevent binding`;
    case 'REJECTED':
      const blockingCount = issues.filter((i) => i.severity === 'BLOCKING').length;
      return `Feed rejected; ${blockingCount} critical binding issue(s) prevent safe identity binding`;
    case 'QUARANTINED':
      return 'Feed quarantined; identity context contains ambiguous or suspicious characteristics requiring manual review';
    case 'UNRESOLVED':
      return 'Feed identity context cannot be resolved; insufficient identity context fields for binding evaluation';
  }
}

/**
 * Helper: Build result object
 */
function buildResult(
  status: DataEngineBindingStatus,
  issues: DataEngineBindingIssue[],
  candidate: DataEngineIdentityBindingCandidate,
  policy: DataEngineIdentityBindingPolicy,
  evaluatedAt: string,
): DataEngineIdentityBindingResult {
  const hasLimitations = status === 'BOUND_WITH_LIMITATIONS';
  return {
    status,
    issues,
    candidateId: candidate.intakeCandidateId,
    intakeCandidateId: candidate.intakeCandidateId,
    policyApplied: policy,
    hasLimitations,
    decisionSummary: buildDecisionSummary(status, issues, hasLimitations),
    evaluatedAt,
  };
}
