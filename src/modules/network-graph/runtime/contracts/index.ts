/**
 * Graph Runtime Contracts Layer
 * Export surface for graph runtime input contracts.
 * Defines the structural input vocabulary for graph operations.
 */

// Graph assembly input contracts
export type { GraphNodeInputCollection } from "./graph-node-input-collection.contract.ts";
export type { GraphEdgeInputCollection } from "./graph-edge-input-collection.contract.ts";
export type { GraphRelationInputCollection } from "./graph-relation-input-collection.contract.ts";
export type { GraphAssemblyInput } from "./graph-assembly-input.contract.ts";

// Graph runtime state contracts
export type { GraphRuntimeState } from "./graph-runtime-state.contract.ts";

// Graph assembly result contracts
export type { GraphAssemblyResult } from "./graph-assembly-result.contract.ts";

// Graph assembler contracts
export type { NetworkGraphAssembler } from "./network-graph-assembler.contract.ts";

// Graph structural integrity contracts
export { GraphStructuralIntegrityIssueCode } from "./graph-structural-integrity-issue-code.contract.ts";
export { GraphStructuralIntegrityIssueSeverity } from "./graph-structural-integrity-issue-severity.contract.ts";
export type { GraphStructuralIntegrityIssue } from "./graph-structural-integrity-issue.contract.ts";
export type { GraphStructuralIntegrityResult } from "./graph-structural-integrity-result.contract.ts";

// Graph runtime envelope contracts
export { GraphRuntimeEnvelopeStatus } from "./graph-runtime-envelope-status.contract.ts";
export type { GraphRuntimeEnvelope } from "./graph-runtime-envelope.contract.ts";
