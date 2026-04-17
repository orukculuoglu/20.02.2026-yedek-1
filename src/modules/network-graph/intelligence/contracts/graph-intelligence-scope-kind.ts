/**
 * Graph Intelligence Scope Kind Type Language
 * Distinguishes between local and network intelligence observations.
 * Local: observations focused on specific entities or local structure
 * Network: observations about network-wide structure or relationships
 * Pure type vocabulary, no behavioral semantics.
 */

export type GraphIntelligenceScopeKind = "local" | "network";
