/**
 * Enumeration of relationship types describing how references relate
 * to the subject being indexed.
 * 
 * - DIRECT: Directly applies to the subject
 * - CONTEXTUAL: Provides context for the subject
 * - DEPENDENCY: Subject depends on or is related to this reference
 * - CAUSATIVE: Is a cause or contributing factor
 * - MITIGATING: Mitigates or reduces impact
 * - COMPARATIVE: Used for comparison/benchmarking
 */
export enum RelationType {
  DIRECT = 'DIRECT',
  CONTEXTUAL = 'CONTEXTUAL',
  DEPENDENCY = 'DEPENDENCY',
  CAUSATIVE = 'CAUSATIVE',
  MITIGATING = 'MITIGATING',
  COMPARATIVE = 'COMPARATIVE',
}
