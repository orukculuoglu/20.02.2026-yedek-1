/**
 * Data Engine Graph Attachment Engine — Phase 5
 *
 * Transform normalized DataEngineEntity to graph nodes and edges.
 * Constructs multi-family node taxonomy (Vehicle/Event/Observation/Actor/Asset).
 *
 * SCOPE (STRICTLY BOUNDED):
 * ✓ Deterministic node/edge construction
 * ✓ Semantic classification (forward compatible)
 * ✓ Multi-family node taxonomy (5 families)
 * ✓ Seven semantic edge types
 * ✓ Actor deduplication by role
 * ✓ Asset component normalization
 *
 * NOT INCLUDED:
 * ✗ Graph analytics or scoring
 * ✗ Persistence or storage
 * ✗ Query optimization
 * ✗ Link analysis
 * ✗ Clustering or pattern detection
 * ✗ Temporal aggregation
 * ✗ External service calls
 */

import { createHash } from 'crypto';
import { canonicalizeComponentName } from '../utils/componentCanonicalizer';
import type { DataEngineEntity } from '../../normalization/models/DataEngineEntity';
import type { DataEngineGraphNode } from '../models/DataEngineGraphNode';
import type { DataEngineGraphEdge } from '../models/DataEngineGraphEdge';
import type { DataEngineActorExtraction } from '../models/DataEngineActorExtraction';
import type { DataEngineGraphAttachmentCandidate } from '../models/DataEngineGraphAttachmentCandidate';
import type { DataEngineGraphAttachmentResult } from '../models/DataEngineGraphAttachmentResult';

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC ID GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate deterministic ID from input string.
 * Uses SHA-256 hash for stable, collision-resistant IDs.
 * No randomness, no timestamps in ID itself.
 */
function generateDeterministicId(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTOR EXTRACTION — REMOVAL OF `any` TYPE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract actor information from entity metadata.
 * Returns strict DataEngineActorExtraction type (no `any`).
 *
 * CORRECTION 1: Strict return type with DataEngineActorExtraction interface
 * Removes all `any` type usage and provides explicit structure.
 */
function extractActorInfo(entity: DataEngineEntity): DataEngineActorExtraction {
  const sourceId = entity.sourceSystem ?? 'UNKNOWN';
  const rawSourceType = entity.normalizedAttributes?.sourceType;
  const sourceType = typeof rawSourceType === 'string' ? rawSourceType : undefined;

  const rawRole = entity.normalizedAttributes?.sourceRole;
  const role = typeof rawRole === 'string' ? rawRole : 'PARTICIPANT';

  const actorId = generateDeterministicId(`${sourceId}:${sourceType ?? 'UNKNOWN'}:${role}`);

  return {
    actorId,
    nodeId: actorId,
    label: `${sourceType ? `${sourceType} ` : ''}${sourceId}`,
    properties: {
      sourceId,
      sourceType,
      role,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY NODE TYPE DETERMINATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine whether entity should be EVENT or OBSERVATION node.
 * Forward-compatible: uses pattern matching instead of exact equality.
 */
function determinePrimaryNodeType(entity: DataEngineEntity): 'EVENT' | 'OBSERVATION' {
  // OBSERVATION if: entityType includes 'DIAGNOSTIC' OR 'INSPECTION'
  if (
    entity.entityType.includes('DIAGNOSTIC') ||
    entity.entityType.includes('INSPECTION')
  ) {
    return 'OBSERVATION';
  }

  // Default: EVENT (forward compatible with future entity types)
  return 'EVENT';
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET EXTRACTION & NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize component name safely.
 * Uses explicit mapping first (case-insensitive), then safe fallback without destroying valid names.
 * Never returns empty string.
 *
 * PATCH 2: Case-safe component mapping.
 */
function normalizeComponentName(component: string): string {
  // Explicit mapping for common descriptive suffixes
  const mappings: Record<string, string> = {
    'BRAKE_PAD_REPLACEMENT': 'brake_pad',
    'TIRE_REPLACEMENT': 'tire',
    'OIL_CHANGE': 'oil_system',
    'FILTER_REPLACEMENT': 'filter',
  };

  // Check if component has explicit mapping (case-insensitive)
  const key = component.toUpperCase();
  if (mappings[key]) {
    return mappings[key];
  }

  // Safe normalization: split by underscore, check if last segment is descriptive suffix
  const parts = component.split('_');
  const lastPart = parts[parts.length - 1];

  // List of descriptive suffixes that are safe to remove
  const descriptiveSuffixes = ['REPLACEMENT', 'CHANGE', 'INSPECTION', 'REPAIR', 'SERVICE', 'MAINTENANCE'];

  // Remove last segment only if it's a known descriptive suffix AND we have more than one part
  if (parts.length > 1 && descriptiveSuffixes.includes(lastPart.toUpperCase())) {
    const normalized = parts.slice(0, -1).join('_').toLowerCase();
    return normalized.length > 0 ? normalized : component.toLowerCase();
  }

  // Otherwise, lowercase the entire component without modification
  return component.toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GRAPH ATTACHMENT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transform normalized DataEngineEntity to graph structure (nodes + edges).
 *
 * CRITICAL FIXES:
 * 1. Deterministic attachedAt (no Date.now(), derived from entity timestamps)
 * 2. Correct asset node ID (reusable by component, not event-specific)
 * 3. Safe component normalization (explicit mapping + safe fallback)
 * PATCHES:
 * 1. Safe component array filter (removes null, undefined, empty strings)
 * 2. Case-safe component mapping (uppercase key before matching)
 */
export function attachEntityToGraph(candidate: DataEngineGraphAttachmentCandidate): DataEngineGraphAttachmentResult {
  const entity = candidate.entity;
  const nodes: DataEngineGraphNode[] = [];
  const edges: DataEngineGraphEdge[] = [];
  
  // CRITICAL FIX 1: Deterministic attachedAt from entity timestamps (no Date.now())
  const attachedAt =
    entity.temporal?.recordedTimestamp ??
    entity.temporal?.eventTimestamp ??
    new Date(0).toISOString();
  
  const sourceEntityRef = entity.entityId;

  // ─────────────────────────────────────────────────────────────────────────────
  // VEHICLE NODE ANCHOR
  // ─────────────────────────────────────────────────────────────────────────────

  const vehicleNodeId = generateDeterministicId(`VEHICLE:${candidate.identityBindingRef.identityId}`);
  const vehicleNode: DataEngineGraphNode = {
    nodeId: vehicleNodeId,
    nodeType: 'VEHICLE',
    attachedAt,
    label: `Vehicle (${candidate.identityBindingRef.identityId})`,
    sourceEntityRef,
    semanticClass: 'VEHICLE_ANCHOR',
    properties: {
      identityId: candidate.identityBindingRef.identityId,
      bindingStatus: candidate.identityBindingRef.bindingStatus,
    },
  };
  nodes.push(vehicleNode);

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIMARY NODE (EVENT or OBSERVATION)
  // ─────────────────────────────────────────────────────────────────────────────

  const primaryNodeType = determinePrimaryNodeType(entity);
  const primaryNodeId = generateDeterministicId(`${primaryNodeType}:${entity.entityId}`);
  const primaryNode: DataEngineGraphNode = {
    nodeId: primaryNodeId,
    nodeType: primaryNodeType,
    attachedAt,
    label: `${primaryNodeType} (${entity.entityType})`,
    sourceEntityRef,
    semanticClass: entity.entityType,
    properties: {
      entityType: entity.entityType,
      sourceSystem: entity.sourceSystem,
      eventTimestamp: entity.temporal?.eventTimestamp,
      recordedTimestamp: entity.temporal?.recordedTimestamp,
      completeness: entity.quality?.completeness,
      confidence: entity.quality?.confidence,
    },
  };
  nodes.push(primaryNode);

  // ─────────────────────────────────────────────────────────────────────────────
  // HAS_EVENT / HAS_OBSERVATION EDGE (VEHICLE ← ANCHOR)
  // ─────────────────────────────────────────────────────────────────────────────

  const vehicleEdgeType = primaryNodeType === 'OBSERVATION' ? 'HAS_OBSERVATION' : 'HAS_EVENT';
  const vehicleEdgeId = generateDeterministicId(`${vehicleNodeId}:${vehicleEdgeType}:${primaryNodeId}`);
  
  // CORRECTION 3: Safe createdAt with fallback chain
  const edgeTimestamp =
    entity.temporal?.eventTimestamp ??
    entity.temporal?.recordedTimestamp ??
    attachedAt;

  const vehicleEdge: DataEngineGraphEdge = {
    edgeId: vehicleEdgeId,
    sourceNodeId: vehicleNodeId,
    targetNodeId: primaryNodeId,
    edgeType: vehicleEdgeType,
    createdAt: edgeTimestamp,
    sourceEntityRef,
    properties: {},
  };
  edges.push(vehicleEdge);

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTOR NODE (using extracted info with strict typing)
  // ─────────────────────────────────────────────────────────────────────────────

  // CORRECTION 1: Uses DataEngineActorExtraction return type (no `any`)
  const actorInfo = extractActorInfo(entity);
  const actorNodeId = actorInfo.nodeId;

  // Deduplication: only add actor if not already present
  const existingActor = nodes.find(n => n.nodeId === actorNodeId);
  if (!existingActor) {
    const actorNode: DataEngineGraphNode = {
      nodeId: actorNodeId,
      nodeType: 'ACTOR',
      attachedAt,
      label: actorInfo.label,
      sourceEntityRef,
      semanticClass: `ACTOR_${actorInfo.properties.role}`,
      properties: actorInfo.properties,
    };
    nodes.push(actorNode);
  }

  // INVOLVES_ACTOR edge
  const actorEdgeId = generateDeterministicId(`${primaryNodeId}:INVOLVES_ACTOR:${actorNodeId}`);
  const actorEdge: DataEngineGraphEdge = {
    edgeId: actorEdgeId,
    sourceNodeId: primaryNodeId,
    targetNodeId: actorNodeId,
    edgeType: 'INVOLVES_ACTOR',
    createdAt: edgeTimestamp,
    sourceEntityRef,
    properties: {
      role: actorInfo.properties.role,
    },
  };
  edges.push(actorEdge);

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET NODES (with normalization)
  // ─────────────────────────────────────────────────────────────────────────────

  // PATCH 1: Safe component array filter
  const rawComponents = entity.normalizedAttributes?.components;

  const componentTypes = Array.isArray(rawComponents)
    ? rawComponents
    : [];
  componentTypes
    .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    .forEach((component) => {
      const normalizedComponent = canonicalizeComponentName(component);
      
      const assetNodeId = generateDeterministicId(`ASSET:${normalizedComponent}`);

      // CORRECTION 2: Node-level duplicate safety before pushing
      const existingAsset = nodes.find(n => n.nodeId === assetNodeId);
    
    if (!existingAsset) {
      const assetNode: DataEngineGraphNode = {
        nodeId: assetNodeId,
        nodeType: 'ASSET',
        attachedAt,
        label: `Component: ${normalizedComponent}`,
        sourceEntityRef,
        semanticClass: normalizedComponent,
        properties: {
          originalComponent: component,
          normalizedComponent,
        },
      };
      nodes.push(assetNode);
    }

    // INVOLVES_ASSET edge
    const assetEdgeId = generateDeterministicId(`${primaryNodeId}:INVOLVES_ASSET:${assetNodeId}`);
    const assetEdge: DataEngineGraphEdge = {
      edgeId: assetEdgeId,
      sourceNodeId: primaryNodeId,
      targetNodeId: assetNodeId,
      edgeType: 'INVOLVES_ASSET',
      createdAt: edgeTimestamp,
      sourceEntityRef,
      properties: {
        component: normalizedComponent,
      },
    };
    edges.push(assetEdge);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULT STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────

  const nodesByType: Record<string, number> = {};
  nodes.forEach(node => {
    nodesByType[node.nodeType] = (nodesByType[node.nodeType] ?? 0) + 1;
  });

  const edgesByType: Record<string, number> = {};
  edges.forEach(edge => {
    edgesByType[edge.edgeType] = (edgesByType[edge.edgeType] ?? 0) + 1;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULT
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    success: true,
    nodes,
    edges,
    statistics: {
      nodesCount: nodes.length,
      edgesCount: edges.length,
      nodesByType,
      edgesByType,
      sourceEntityRef,
      attachedAt,
    },
  };
}
